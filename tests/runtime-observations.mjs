import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4173'
const points = [['arrival', .5, 1 / 23], ['canonical', .75, 8 / 23], ['normal', .88, (9 + 4 * .88) / 23], ['intelligence', .995, (17 + 6 * .995) / 23]]
const output = {
  environment: 'Headless Chromium using SwiftShader software WebGL',
  limitation: 'Frame samples are browser-session observations, not hardware or mobile-device FPS benchmarks.',
  baseURL, samples: [],
}
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
for (const profile of ['desktop', 'mobile']) {
  const context = await browser.newContext(profile === 'desktop'
    ? { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
    : { ...devices['Pixel 7'], deviceScaleFactor: 1 })
  const page = await context.newPage()
  await page.goto(baseURL)
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.hero)
  for (const [scene, local, progress] of points) {
    await page.evaluate(p => {
      const journey = document.querySelector('section[aria-label="Continuous inspection story"]')
      window.scrollTo({ top: journey.offsetTop + (journey.offsetHeight - innerHeight) * p, behavior: 'instant' })
    }, progress)
    await page.waitForFunction(p => Math.abs(Number(document.querySelector('canvas')?.dataset.progress) - p) < .001, progress)
    await page.waitForTimeout(1500)
    output.samples.push({ profile, scene, localProgress: local, viewport: page.viewportSize(), dataset: await page.locator('canvas').evaluate(canvas => ({ ...canvas.dataset })) })
  }
  await context.close()
}
await browser.close()
await mkdir('docs/qa', { recursive: true })
await writeFile('docs/qa/runtime-observations.json', JSON.stringify(output, null, 2))
console.log(`Saved ${output.samples.length} runtime samples`)
