// Quick probe: journey health, horizontal overflow culprits and console errors at one viewport.
// Usage: node scripts/v2-probe.mjs 390x844 3:0.5
import { chromium } from 'playwright'
const url = process.env.QA_BASE_URL ?? 'http://127.0.0.1:5181'
const [w, h] = (process.argv[2] ?? '390x844').split('x').map(Number)
const target = process.argv[3]?.split(':').map(Number)
const weights = [2, 3, 4, 4, 4, 6], total = 23
const browser = await chromium.launch({ channel: process.env.QA_CHANNEL ?? 'msedge', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: w, height: h }, ...(w <= 430 ? { isMobile: true, hasTouch: true } : {}) })
page.on('console', m => m.type() === 'error' && console.log('console', m.text().slice(0, 300)))
page.on('pageerror', e => console.log('pageerror', String(e).slice(0, 300)))
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180_000 })
await page.waitForFunction(() => document.querySelector('canvas')?.dataset.progress !== undefined, null, { timeout: 300_000 })
if (target) {
  const p = (weights.slice(0, target[0]).reduce((a, b) => a + b, 0) + target[1] * weights[target[0]]) / total
  await page.evaluate(t => {
    const j = document.querySelector('section[aria-label="Continuous inspection story"]')
    window.scrollTo({ top: j.offsetTop + (j.offsetHeight - innerHeight) * t, behavior: 'instant' })
  }, p)
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(2000)
    const s = await page.evaluate(() => ({ progress: document.querySelector('canvas')?.dataset.progress, journey: !!document.querySelector('section[aria-label="Continuous inspection story"]'), y: scrollY }))
    console.log('target', p.toFixed(4), JSON.stringify(s))
    if (Math.abs(Number(s.progress) - p) < .002 || !s.journey) break
  }
}
console.log(JSON.stringify(await page.evaluate(() => ({
  innerWidth, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
  wide: [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
    .slice(0, 12).map(e => `${e.tagName}.${String(e.className?.baseVal ?? e.className).slice(0, 30)} r=${Math.round(e.getBoundingClientRect().right)}`),
})), null, 1))
await page.screenshot({ path: 'scripts/.probe.png' })
await browser.close()
