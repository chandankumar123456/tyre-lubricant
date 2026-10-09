import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4173'
const outDir = process.env.QA_OUT ?? 'docs/qa/viewports'
const extras = process.env.QA_EXTRAS !== '0'
const weights = [2, 3, 4, 4, 4, 6]
const total = weights.reduce((a, b) => a + b, 0)
const viewports = [[1920, 1080], [1440, 900], [1280, 800], [1024, 768], [900, 1100], [768, 1024], [430, 932], [390, 844], [360, 740]]
const checkpoints = [[0, .5], [1, .6], [2, .75], [2, .95], [3, .12], [3, .5], [3, .88], [3, .94], [4, .35], [4, .67], [4, .82], [4, .88], [5, .17], [5, .47], [5, .70], [5, .77], [5, .995]]
const globalProgress = (scene, local) => (weights.slice(0, scene).reduce((a, b) => a + b, 0) + local * weights[scene]) / total

async function seek(page, p) {
  await page.evaluate(target => {
    const journey = document.querySelector('section[aria-label="Continuous inspection story"]')
    window.scrollTo({ top: journey.offsetTop + (journey.offsetHeight - innerHeight) * target, behavior: 'instant' })
  }, p)
  await page.waitForFunction(target => Math.abs(Number(document.querySelector('canvas')?.dataset.progress) - target) < .002, p, { timeout: 30_000 })
  await page.waitForTimeout(600)
}

function measure() {
  const vw = innerWidth, vh = innerHeight
  const effectiveOpacity = el => {
    let o = 1
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0
      o *= Number(cs.opacity)
    }
    return o
  }
  const toRect = r => ({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(r.right), b: Math.round(r.bottom) })
  const items = []
  const add = (name, el, extraRects) => {
    if (!el) return
    const op = effectiveOpacity(el)
    const box = el.getBoundingClientRect()
    if (op < .05 || box.width < 1 || box.height < 1) return
    items.push({ name, opacity: +op.toFixed(2), rects: extraRects ?? [toRect(box)] })
  }
  const article = [...document.querySelectorAll('article')].find(a => a.querySelector('h1'))
  if (article) {
    add('copy-box', article)
    const textRects = []
    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim() || effectiveOpacity(n.parentElement) < .05) continue
      const range = document.createRange()
      range.selectNodeContents(n)
      for (const r of range.getClientRects()) if (r.width > 0 && r.height > 0) textRects.push(toRect(r))
    }
    if (textRects.length) add('copy-text', article, textRects)
  }
  add('intelligence', document.querySelector('aside[aria-label="Illustrative technical evidence"]'))
  add('technical', document.querySelector('aside[aria-label="Technical evidence"]'))
  const footer = [...document.querySelectorAll('div')].filter(d => d.textContent.includes('One tyre. One surface. One data lineage.'))
    .find(d => ![...d.querySelectorAll('div')].some(c => c.textContent.includes('One tyre. One surface. One data lineage.')))
  add('context-footer', footer)
  add('rail', document.querySelector('nav[aria-label="Journey chapters"]'))
  for (const c of document.querySelectorAll('[id^="caption-"]')) add(`#${c.id}`, c)
  add('#deviation-legend', document.getElementById('deviation-legend'))

  const overlap = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.y, b.y))
  const collisions = []
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const A = items[i], B = items[j]
    if ([A.name, B.name].includes('copy-box') && [A.name, B.name].includes('copy-text')) continue
    let area = 0
    for (const a of A.rects) for (const b of B.rects) area += overlap(a, b)
    if (area > 4) collisions.push({ a: A.name, b: B.name, overlapPx: area })
  }
  const clipping = []
  for (const it of items) {
    if (it.name === 'copy-text') continue
    const r = it.rects[0]
    const out = { left: Math.max(0, -r.x), top: Math.max(0, -r.y), right: Math.max(0, r.r - vw), bottom: Math.max(0, r.b - vh) }
    if (Object.values(out).some(v => v > 1)) clipping.push({ el: it.name, rect: r, outside: out })
  }
  return { elements: items.map(i => ({ name: i.name, opacity: i.opacity, rect: i.name === 'copy-text' ? `${i.rects.length} text rects` : i.rects[0] })), collisions, clipping }
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const report = { baseURL, generatedAt: new Date().toISOString(), viewports: {}, extras: {} }

function contextOptions(w, h, more = {}) {
  return { viewport: { width: w, height: h }, deviceScaleFactor: 1, ...(w <= 430 ? { isMobile: true, hasTouch: true } : {}), ...more }
}
function attachConsole(page, sink) {
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) sink.push({ type: m.type(), text: m.text().slice(0, 500) }) })
  page.on('pageerror', e => sink.push({ type: 'pageerror', text: String(e).slice(0, 500) }))
}
async function openJourney(context, sink, query = '') {
  const page = await context.newPage()
  attachConsole(page, sink)
  await page.goto(baseURL + query)
  return page
}

for (const [w, h] of viewports) {
  const key = `${w}x${h}`
  const dir = path.join(outDir, key)
  await mkdir(dir, { recursive: true })
  const context = await browser.newContext(contextOptions(w, h))
  const consoleMessages = []
  const page = await openJourney(context, consoleMessages)
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.progress !== undefined, null, { timeout: 60_000 })
  const vp = { checkpoints: {}, console: consoleMessages }
  for (const [scene, local] of checkpoints) {
    const id = `s${scene}-${local}`
    const p = globalProgress(scene, local)
    try {
      await seek(page, p)
      await page.screenshot({ path: path.join(dir, `${id}.png`) })
      const dataset = await page.locator('canvas').evaluate(c => ({ ...c.dataset }))
      vp.checkpoints[id] = { progress: +p.toFixed(4), dataset, ...(await page.evaluate(measure)) }
    } catch (error) {
      vp.checkpoints[id] = { progress: +p.toFixed(4), error: String(error).slice(0, 300) }
    }
  }
  report.viewports[key] = vp
  await context.close()
  console.log(`${key}: ${Object.values(vp.checkpoints).filter(c => c.collisions?.length || c.clipping?.length).length} flagged checkpoints, ${consoleMessages.length} console messages`)
}

if (extras) {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const context = await browser.newContext(contextOptions(w, h))
    const sink = []
    const page = await openJourney(context, sink, '?fallback')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, `fallback-${w}x${h}.png`), fullPage: true })
    report.extras[`fallback-${w}x${h}`] = { console: sink, hasCanvas: await page.locator('canvas').count() > 0 }
    await context.close()
  }
  {
    const context = await browser.newContext(contextOptions(1440, 900, { reducedMotion: 'reduce' }))
    const sink = []
    const page = await openJourney(context, sink)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, 'reduced-motion-1440x900.png'), fullPage: true })
    report.extras['reduced-motion-1440x900'] = { console: sink, hasCanvas: await page.locator('canvas').count() > 0 }
    await context.close()
  }
  {
    const context = await browser.newContext(contextOptions(1440, 900))
    const sink = []
    const page = await openJourney(context, sink)
    await page.waitForFunction(() => document.querySelector('canvas')?.dataset.progress !== undefined, null, { timeout: 60_000 })
    const pick = () => page.locator('canvas').evaluate(c => ({ scene: c.dataset.scene, beat: c.dataset.beat, theta: c.dataset.theta, unwrap: c.dataset.unwrap, progress: c.dataset.progress }))
    const results = []
    for (const [[ts, tl], [fs, fl]] of [[[2, .65], [3, .5]], [[5, .97], [5, .5]]]) {
      const target = globalProgress(ts, tl)
      await seek(page, 0)
      await seek(page, target)
      const forward = await pick()
      await seek(page, globalProgress(fs, fl))
      await seek(page, target)
      const reverse = await pick()
      const keys = ['scene', 'beat', 'theta', 'unwrap']
      results.push({ target: `s${ts}@${tl}`, from: `s${fs}@${fl}`, forward, reverse, equal: keys.every(k => forward[k] === reverse[k]), diffs: keys.filter(k => forward[k] !== reverse[k]) })
    }
    report.extras.forwardReverse = { results, console: sink }
    await context.close()
  }
}

await browser.close()
await mkdir(outDir, { recursive: true })
await writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
console.log(`Saved ${path.join(outDir, 'report.json')}`)
