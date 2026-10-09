// V2 layout QA: overlay collision + clipping across viewports and scene beats.
// Usage: node scripts/v2-layout-qa.mjs
//   QA_BASE_URL (default http://127.0.0.1:5181)
//   QA_OUT (default docs/qa/v2-layout)
//   QA_VIEWPORTS="1440x900,768x1024" to limit viewports
//   QA_INJECT=0 to skip the decision/reasons/lineage contract-markup robustness pass
//   QA_SHOTS=0 to skip screenshots, QA_EXTRAS=0 to skip fallback / reduced-motion pages
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:5181'
const outDir = process.env.QA_OUT ?? 'docs/qa/v2-layout'
const inject = process.env.QA_INJECT !== '0'
const shots = process.env.QA_SHOTS !== '0'
const extras = process.env.QA_EXTRAS !== '0'
const weights = [2, 3, 4, 4, 4, 6]
const total = weights.reduce((a, b) => a + b, 0)
const allViewports = [[1920, 1080], [1440, 900], [1280, 800], [1024, 768], [900, 1100], [768, 1024], [430, 932], [390, 844], [360, 740]]
const viewports = process.env.QA_VIEWPORTS
  ? process.env.QA_VIEWPORTS.split(',').map(v => v.split('x').map(Number))
  : allViewports
const checkpoints = [
  [0, .5], [1, .6], [2, .75], [2, .95],
  ...[.12, .5, .66, .76, .88, .94, .96].map(l => [3, l]),
  ...[.1, .35, .5, .67, .82, .88, .93].map(l => [4, l]),
  ...[.08, .17, .25, .34, .47, .54, .7, .77, .82, .9, .995].map(l => [5, l]),
]
const globalProgress = (scene, local) => (weights.slice(0, scene).reduce((a, b) => a + b, 0) + local * weights[scene]) / total

async function seek(page, p) {
  await page.evaluate(target => {
    const journey = document.querySelector('section[aria-label="Continuous inspection story"]')
    window.scrollTo({ top: journey.offsetTop + (journey.offsetHeight - innerHeight) * target, behavior: 'instant' })
  }, p)
  await page.waitForFunction(target => Math.abs(Number(document.querySelector('canvas')?.dataset.progress) - target) < .002, p, { timeout: 30_000 })
  await page.waitForTimeout(500)
}

/** Appends the decision / reasons / lineage contract markup using the real CSS-module class names. */
function injectContract() {
  const names = {}
  for (const sheet of document.styleSheets) {
    let rules
    try { rules = sheet.cssRules } catch { continue }
    const walk = list => {
      for (const rule of list) {
        if (rule.cssRules) walk(rule.cssRules)
        if (!rule.selectorText) continue
        for (const m of rule.selectorText.matchAll(/\.(_?(statusRow|decisionLabel|decisionValue|decisionNote|decision|reasons|lineage)_[A-Za-z0-9_-]+)/g)) {
          names[m[2]] ??= m[1]
        }
      }
    }
    walk(rules)
  }
  const strip = document.querySelector('aside[aria-label="Illustrative technical evidence"]')
  if (!strip) return { injected: false, names }
  strip.querySelectorAll('[data-qa-injected]').forEach(n => n.remove())
  const c = k => names[k] ?? k
  const block = document.createElement('div')
  block.dataset.qaInjected = '1'
  block.innerHTML = `
    <div class="${c('statusRow')}">
      <div class="${c('decision')}" data-kind="tyre">
        <span class="${c('decisionLabel')}">TYRE DISPOSITION · PROTOTYPE</span>
        <strong class="${c('decisionValue')}" data-state="FAIL">FAIL</strong>
        <small class="${c('decisionNote')}">Known pattern · high severity under unvalidated policy</small>
      </div>
      <div class="${c('decision')}" data-kind="process">
        <span class="${c('decisionLabel')}">PROCESS STATUS</span>
        <strong class="${c('decisionValue')}" data-state="WARNING">WARNING</strong>
        <small class="${c('decisionNote')}">Illustrative process-health indicator</small>
      </div>
    </div>
    <ul class="${c('reasons')}">
      <li>Lower-bead excess beyond population variation</li>
      <li>Residual remains after process expectation</li>
      <li>Same patch recurs across recent records</li>
      <li>Severity limit not yet validated</li>
    </ul>
    <dl class="${c('lineage')}">
      <div><dt>Tyre</dt><dd>TYR-1012</dd></div>
      <div><dt>Variant</dt><dd>VAR-A · 205/55</dd></div>
      <div><dt>Station</dt><dd>Spray cell 2</dd></div>
      <div><dt>Recorded</dt><dd>Shift B · t+04:12</dd></div>
      <div><dt>Model</dt><dd>Prototype v0</dd></div>
      <div><dt>Evidence</dt><dd>O · C · M aligned</dd></div>
    </dl>`
  strip.append(block)
  return { injected: true, names }
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
  const textRects = root => {
    const rects = []
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim() || effectiveOpacity(n.parentElement) < .05) continue
      const range = document.createRange()
      range.selectNodeContents(n)
      for (const r of range.getClientRects()) if (r.width > 0 && r.height > 0) rects.push(toRect(r))
    }
    return rects
  }
  const items = []
  const add = (name, el, rects) => {
    if (!el) return
    const op = effectiveOpacity(el)
    const box = el.getBoundingClientRect()
    if (op < .05 || box.width < 1 || box.height < 1) return
    rects = rects ?? [toRect(box)]
    if (!rects.length) return
    items.push({ name, box: toRect(box), rects })
  }
  const article = [...document.querySelectorAll('article')].find(a => a.querySelector('h1'))
  if (article) add('copy-text', article, textRects(article))
  add('evidence', document.querySelector('aside[aria-label="Illustrative technical evidence"]'))
  const tech = document.querySelector('aside[aria-label="Technical evidence"]')
  if (tech && tech.textContent.trim()) add('technical', tech)
  const footer = [...document.querySelectorAll('div')].filter(d => d.textContent.includes('One tyre. One surface. One data lineage.'))
    .find(d => ![...d.querySelectorAll('div')].some(c => c.textContent.includes('One tyre. One surface. One data lineage.')))
  if (footer) add('context', footer, textRects(footer))
  add('rail', document.querySelector('nav[aria-label="Journey chapters"]'))
  const header = document.querySelector('header')
  if (header) add('header', header, [...header.querySelectorAll('a, button')].filter(e => effectiveOpacity(e) > .05).map(e => toRect(e.getBoundingClientRect())).filter(r => r.w > 0))
  const hint = [...document.querySelectorAll('div')].find(d => d.textContent.trim().startsWith('Scroll to follow the tyre') && d.children.length <= 1)
  if (hint) add('scroll-hint', hint, textRects(hint))
  for (const c of document.querySelectorAll('[id^="caption-"]')) add(`#${c.id}`, c, textRects(c))
  const legend = document.getElementById('deviation-legend')
  if (legend) add('#deviation-legend', legend)

  const overlap = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.x, b.x)) > 2 && Math.max(0, Math.min(a.b, b.b) - Math.max(a.y, b.y)) > 2
    ? (Math.min(a.r, b.r) - Math.max(a.x, b.x)) * (Math.min(a.b, b.b) - Math.max(a.y, b.y)) : 0
  const collisions = []
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const A = items[i], B = items[j]
    let area = 0
    for (const a of A.rects) for (const b of B.rects) area += overlap(a, b)
    if (area > 0) collisions.push({ a: A.name, b: B.name, overlapPx: area })
  }
  const clipping = []
  for (const it of items) {
    for (const r of it.rects) {
      const out = { left: Math.max(0, -r.x), top: Math.max(0, -r.y), right: Math.max(0, r.r - vw), bottom: Math.max(0, r.b - vh) }
      if (Object.values(out).some(v => v > 1)) { clipping.push({ el: it.name, rect: r, outside: out }); break }
    }
  }
  const strip = document.querySelector('aside[aria-label="Illustrative technical evidence"]')
  const scrollable = strip ? strip.scrollHeight - strip.clientHeight : 0
  return { elements: items.map(i => ({ name: i.name, box: i.box })), collisions, clipping, evidenceOverflowPx: scrollable }
}

const launchArgs = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }
const browser = await chromium.launch({ ...launchArgs, channel: process.env.QA_CHANNEL || undefined })
  .catch(() => chromium.launch({ ...launchArgs, channel: 'msedge' }))
const report = { baseURL, generatedAt: new Date().toISOString(), viewports: {}, extras: {} }
const contextOptions = (w, h, more = {}) => ({ viewport: { width: w, height: h }, deviceScaleFactor: 1, ...(w <= 430 ? { isMobile: true, hasTouch: true } : {}), ...more })
const attachConsole = (page, sink) => {
  page.on('console', m => { if (m.type() === 'error') sink.push(m.text().slice(0, 300)) })
  page.on('pageerror', e => sink.push(String(e).slice(0, 300)))
}

const summary = []
for (const [w, h] of viewports) {
  const key = `${w}x${h}`
  const dir = path.join(outDir, key)
  await mkdir(dir, { recursive: true })
  const context = await browser.newContext(contextOptions(w, h))
  const errors = []
  const page = await context.newPage()
  attachConsole(page, errors)
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 180_000 })
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.progress !== undefined, null, { timeout: 300_000 })
  const vp = { checkpoints: {}, errors }
  // Persist measurements incrementally so a long software-WebGL run is still
  // reviewable if interrupted between viewports.
  report.viewports[key] = vp
  let flagged = 0, injectedFlagged = 0, overflowBeats = 0
  const recover = async () => {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 180_000 })
    await page.waitForFunction(() => document.querySelector('canvas')?.dataset.progress !== undefined, null, { timeout: 300_000 })
  }
  for (const [scene, local] of checkpoints) {
    const id = `s${scene}-${local}`
    const p = globalProgress(scene, local)
    try {
      try {
        await seek(page, p)
      } catch {
        // concurrent HMR edits can drop the WebGL journey; reload and retry once
        await recover()
        await seek(page, p)
      }
      if (shots) await page.screenshot({ path: path.join(dir, `${id}.png`) })
      const beat = await page.locator('canvas').evaluate(c => c.dataset.beat)
      const base = await page.evaluate(measure)
      const entry = { progress: +p.toFixed(4), beat, ...base }
      if (base.collisions.length || base.clipping.length) flagged++
      if (base.evidenceOverflowPx > 1) overflowBeats++
      if (inject && scene >= 3) {
        const inj = await page.evaluate(injectContract)
        if (inj.injected) {
          await page.waitForTimeout(60)
          const m = await page.evaluate(measure)
          entry.injected = { collisions: m.collisions, clipping: m.clipping, evidenceOverflowPx: m.evidenceOverflowPx, evidence: m.elements.find(e => e.name === 'evidence')?.box }
          if (m.collisions.length || m.clipping.length) injectedFlagged++
          if (shots && [.5, .88, .94, .25, .47, .77].includes(local)) await page.screenshot({ path: path.join(dir, `${id}-injected.png`) })
          await page.evaluate(() => document.querySelectorAll('[data-qa-injected]').forEach(n => n.remove()))
        }
      }
      vp.checkpoints[id] = entry
    } catch (error) {
      vp.checkpoints[id] = { progress: +p.toFixed(4), error: String(error).slice(0, 300) }
      flagged++
    }
    await writeFile(path.join(outDir, process.env.QA_REPORT ?? 'report.json'), JSON.stringify(report, null, 2))
  }
  report.viewports[key] = vp
  await context.close()
  const line = `${key}: ${flagged} flagged / ${checkpoints.length}; injected flagged ${injectedFlagged}; evidence-scroll beats ${overflowBeats}; errors ${errors.length}`
  summary.push(line)
  console.log(line)
  for (const [id, c] of Object.entries(vp.checkpoints)) {
    const parts = []
    if (c.error) parts.push('ERROR ' + c.error)
    if (c.collisions?.length) parts.push('collide ' + c.collisions.map(x => `${x.a}×${x.b}(${x.overlapPx})`).join(', '))
    if (c.clipping?.length) parts.push('clip ' + c.clipping.map(x => x.el).join(', '))
    if (c.injected?.collisions.length) parts.push('INJ collide ' + c.injected.collisions.map(x => `${x.a}×${x.b}(${x.overlapPx})`).join(', '))
    if (c.injected?.clipping.length) parts.push('INJ clip ' + c.injected.clipping.map(x => x.el).join(', '))
    if (parts.length) console.log(`   ${id} [${c.beat}] ${parts.join(' | ')}`)
  }
}

if (extras) {
  for (const [w, h, query, more, name] of [
    [1440, 900, '?fallback', {}, 'fallback-1440x900'],
    [390, 844, '?fallback', {}, 'fallback-390x844'],
    [1440, 900, '', { reducedMotion: 'reduce' }, 'reduced-motion-1440x900'],
    [390, 844, '', { reducedMotion: 'reduce' }, 'reduced-motion-390x844'],
  ]) {
    const context = await browser.newContext(contextOptions(w, h, more))
    const errors = []
    const page = await context.newPage()
    attachConsole(page, errors)
    await page.goto(baseURL + query, { waitUntil: 'domcontentloaded', timeout: 180_000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true })
    const staticLayout = await page.evaluate(() => {
      const grid = document.querySelector('[class*="engineeringGrid"]')
      const columns = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0
      return { engineeringColumns: columns, horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth) }
    })
    report.extras[name] = { errors, hasCanvas: await page.locator('canvas').count() > 0, staticSections: await page.locator('[id^="static-"]').count(), ...staticLayout }
    console.log(name, JSON.stringify(report.extras[name]))
    await context.close()
  }
}

await browser.close()
await mkdir(outDir, { recursive: true })
report.summary = summary
await writeFile(path.join(outDir, process.env.QA_REPORT ?? 'report.json'), JSON.stringify(report, null, 2))
console.log(`Saved ${path.join(outDir, process.env.QA_REPORT ?? 'report.json')}`)
