import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'

const out = 'docs/qa/v2-final-layout'
const baseURL = 'http://127.0.0.1:5183'
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const report = {}
try {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const page = await context.newPage()
  const logs = []
  page.on('console', message => { if (['warning', 'error'].includes(message.type())) logs.push({ type: message.type(), text: message.text() }) })
  page.on('pageerror', error => logs.push({ type: 'pageerror', text: String(error) }))
  await page.addInitScript(() => {
    window.__contextEvents = []
    document.addEventListener('webglcontextlost', event => window.__contextEvents.push({ type: event.type, time: performance.now() }), true)
    document.addEventListener('webglcontextrestored', event => window.__contextEvents.push({ type: event.type, time: performance.now() }), true)
  })
  await page.goto(baseURL, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.progress !== undefined)
  const p = (2 + .6 * 3) / 23
  await page.evaluate(target => {
    const j = document.querySelector('section[aria-label="Continuous inspection story"]')
    window.scrollTo({ top: j.offsetTop + (j.offsetHeight - innerHeight) * target, behavior: 'instant' })
  }, p)
  await page.waitForFunction(target => Math.abs(Number(document.querySelector('canvas')?.dataset.progress) - target) < .002, p, { timeout: 60_000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${out}/1920x1080/s1-0.6-recheck.png` })
  report.inspectionRecheck = await page.evaluate(() => ({ hasCanvas: !!document.querySelector('canvas'), beat: document.querySelector('canvas')?.dataset.beat, contextEvents: window.__contextEvents }))
  report.inspectionRecheck.logs = logs
  await context.close()
  const tablet = await browser.newContext({ viewport: { width: 768, height: 1024 }, reducedMotion: 'reduce' })
  const tabletPage = await tablet.newPage()
  await tabletPage.goto(baseURL, { waitUntil: 'networkidle' })
  report.tabletStatic = await tabletPage.evaluate(() => ({ columns: getComputedStyle(document.querySelector('[class*="engineeringGrid"]')).gridTemplateColumns.split(' ').length, staticSections: document.querySelectorAll('[id^="static-"]').length, overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth) }))
  await tabletPage.locator('#engineering').scrollIntoViewIfNeeded()
  await tabletPage.screenshot({ path: `${out}/engineering-768x1024.png` })
  await tablet.close()
} finally {
  await browser.close()
  await writeFile(`${out}/recheck.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
}
