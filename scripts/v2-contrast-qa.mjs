// Measures WCAG contrast of small overlay text against the actual rendered stage pixels behind it.
// For each beat: record text colours/rects, hide overlay text, screenshot, sample background in each rect.
// Reports the worst (lightest-background) ratio and the 90th-percentile ratio per element class.
// Usage: node scripts/v2-contrast-qa.mjs   (QA_BASE_URL, QA_VIEWPORTS, QA_OUT)
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:5181'
const outDir = process.env.QA_OUT ?? 'docs/qa/v2-layout'
const weights = [2, 3, 4, 4, 4, 6]
const total = weights.reduce((a, b) => a + b, 0)
const viewports = (process.env.QA_VIEWPORTS ?? '1440x900,768x1024,390x844').split(',').map(v => v.split('x').map(Number))
const beats = [[1, .6], [2, .95], [3, .5], [3, .88], [4, .67], [4, .88], [5, .25], [5, .47], [5, .7], [5, .77]]
const gp = (s, l) => (weights.slice(0, s).reduce((a, b) => a + b, 0) + l * weights[s]) / total

async function seek(page, p) {
  await page.evaluate(t => {
    const j = document.querySelector('section[aria-label="Continuous inspection story"]')
    window.scrollTo({ top: j.offsetTop + (j.offsetHeight - innerHeight) * t, behavior: 'instant' })
  }, p)
  await page.waitForFunction(t => Math.abs(Number(document.querySelector('canvas')?.dataset.progress) - t) < .002, p, { timeout: 60_000 })
  await page.waitForTimeout(500)
}

function collect() {
  const visible = el => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < .05) return false
    }
    return true
  }
  const out = []
  const stage = document.querySelector('section[aria-label="Continuous inspection story"]')
  const roots = [...stage.querySelectorAll('article, aside, nav, [aria-label="Surface evidence labels"]'),
    ...[...stage.querySelectorAll('div')].filter(d => d.textContent.includes('One tyre. One surface') && d.children.length === 2)]
  const seen = new Set()
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement
      if (!n.textContent.trim() || seen.has(el) || !visible(el)) continue
      seen.add(el)
      const cs = getComputedStyle(el)
      const size = parseFloat(cs.fontSize)
      if (size >= 18) continue
      const range = document.createRange()
      range.selectNodeContents(el)
      const r = range.getBoundingClientRect()
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) continue
      const isSvg = el instanceof SVGElement
      const label = (el.className?.baseVal ?? el.className ?? '').toString().split(' ')[0] || el.tagName.toLowerCase()
      out.push({
        label: `${root.tagName.toLowerCase()}${root.getAttribute('aria-label') ? '[' + root.getAttribute('aria-label').slice(0, 18) + ']' : ''} ${el.tagName.toLowerCase()}.${label}`,
        text: n.textContent.trim().slice(0, 40), size, weight: cs.fontWeight,
        color: isSvg ? cs.fill : cs.color, opacity: Number(cs.opacity),
        rect: { x: Math.max(0, r.left), y: Math.max(0, r.top), w: Math.min(innerWidth, r.right) - Math.max(0, r.left), h: Math.min(innerHeight, r.bottom) - Math.max(0, r.top) },
      })
    }
  }
  return out
}

function analyse({ dataURL, items }) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.width; c.height = img.height
      const g = c.getContext('2d')
      g.drawImage(img, 0, 0)
      const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4 }
      const lum = (r, gg, b) => .2126 * lin(r) + .7152 * lin(gg) + .0722 * lin(b)
      const parse = s => (s.match(/[\d.]+/g) ?? []).map(Number)
      resolve(items.map(it => {
        const [r, gg, b, a = 1] = parse(it.color)
        const { x, y, w, h } = it.rect
        const data = g.getImageData(Math.floor(x), Math.floor(y), Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h))).data
        const ls = []
        for (let i = 0; i < data.length; i += 4) ls.push(lum(data[i], data[i + 1], data[i + 2]))
        ls.sort((p, q) => p - q)
        const alpha = a * it.opacity
        // Composite text colour over the measured background (alpha) for each sample
        const ratio = bl => {
          const bgs = [bl]
          const tl = alpha >= 1 ? lum(r, gg, b) : lum(r, gg, b) * alpha + bl * (1 - alpha)
          const hi = Math.max(tl, bgs[0]), lo = Math.min(tl, bgs[0])
          return (hi + .05) / (lo + .05)
        }
        const worst = ls[ls.length - 1], p90 = ls[Math.floor(ls.length * .9)]
        return { ...it, worstRatio: +ratio(worst).toFixed(2), p90Ratio: +ratio(p90).toFixed(2), medianRatio: +ratio(ls[Math.floor(ls.length / 2)]).toFixed(2) }
      }))
    }
    img.src = dataURL
  })
}

const browser = await chromium.launch({ channel: process.env.QA_CHANNEL ?? 'msedge', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const report = {}
for (const [w, h] of viewports) {
  const key = `${w}x${h}`
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, ...(w <= 430 ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 180_000 })
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.progress !== undefined, null, { timeout: 300_000 })
  const rows = []
  for (const [s, l] of beats) {
    await seek(page, gp(s, l))
    const items = await page.evaluate(collect)
    await page.addStyleTag({ content: 'section[aria-label="Continuous inspection story"] *:not(canvas):not([class*="stage"]):not([class*="shade"]) { color: transparent !important; fill: transparent !important; stroke: transparent !important; text-shadow: none !important; border-color: transparent !important; background: transparent !important; } section[aria-label="Continuous inspection story"] [class*="shade"] { visibility: visible !important }' }).then(h => page.evaluate(el => el.id = 'qa-hide', h))
    await page.waitForTimeout(80)
    const shot = await page.screenshot()
    await page.evaluate(() => document.getElementById('qa-hide')?.remove())
    const res = await page.evaluate(analyse, { dataURL: 'data:image/png;base64,' + shot.toString('base64'), items })
    for (const r of res) rows.push({ beat: `s${s}@${l}`, ...r })
  }
  // Aggregate by label: worst over all beats
  const agg = {}
  for (const r of rows) {
    const a = agg[r.label] ??= { label: r.label, size: r.size, color: r.color, worst: Infinity, p90: Infinity, at: '', text: r.text }
    if (r.p90Ratio < a.p90) { a.p90 = r.p90Ratio; a.at = r.beat; a.text = r.text }
    a.worst = Math.min(a.worst, r.worstRatio)
    a.size = Math.min(a.size, r.size)
  }
  report[key] = Object.values(agg).sort((p, q) => p.p90 - q.p90)
  console.log(`\n${key}`)
  for (const a of report[key]) console.log(`  ${a.p90 < 4.5 ? 'FAIL' : ' ok '} p90 ${a.p90.toFixed(2)} worst ${a.worst.toFixed(2)}  ${a.size}px ${a.color}  ${a.label}  "${a.text}" @${a.at}`)
  await ctx.close()
}
await browser.close()
await mkdir(outDir, { recursive: true })
await writeFile(path.join(outDir, process.env.QA_REPORT ?? 'contrast.json'), JSON.stringify(report, null, 2))
