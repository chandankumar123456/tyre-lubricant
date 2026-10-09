import { test, expect, type Page, type TestInfo } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const weights = [2, 3, 4, 4, 4, 6]
const ids = ['arrival', 'inspection', 'canonical', 'normal', 'process', 'intelligence']
const total = weights.reduce((a, b) => a + b, 0)
const globalAt = (index: number, local: number) =>
  (weights.slice(0, index).reduce((a, b) => a + b, 0) + local * weights[index]) / total

async function seek(page: Page, index: number, local: number) {
  const progress = globalAt(index, local)
  await page.evaluate((p) => {
    const journey = document.querySelector('section[aria-label="Continuous inspection story"]') as HTMLElement
    window.scrollTo({ top: journey.offsetTop + (journey.offsetHeight - innerHeight) * p, behavior: 'instant' })
  }, progress)
  await expect.poll(async () => Number(await page.locator('canvas').getAttribute('data-progress')), { timeout: 20_000 })
    .toBeGreaterThan(progress - .002)
  await expect.poll(async () => Number(await page.locator('canvas').getAttribute('data-progress')), { timeout: 20_000 })
    .toBeLessThan(progress + .002)
  await expect(page.locator('canvas')).toHaveAttribute('data-scene', ids[index])
}

test('first slice: persistent canvas, hero and surface through forward and reverse', async ({ page }, info) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('/')
  const canvas = page.locator('canvas')
  await expect(canvas).toHaveAttribute('data-hero', /.+/)
  const hero = await canvas.getAttribute('data-hero')
  const surface = await canvas.getAttribute('data-surface')
  await page.evaluate(() => { (window as unknown as { qaCanvas: Element | null }).qaCanvas = document.querySelector('canvas') })
  const points: [number, number, string][] = [
    [0, .01, 'arrival-opening'], [0, .5, 'arrival-hero'], [0, .99, 'arrival-exit'],
    [1, .01, 'inspection-entry'], [1, .25, 'head-deploy'], [1, .34, 'head-lock'],
    [1, .41, 'illumination'], [1, .55, 'rotation-encoder'], [1, .7, 'acquisition'],
    [1, .91, 'coverage'], [1, .99, 'inspection-exit'], [2, .01, 'canonical-entry'],
    [2, .27, 'theta'], [2, .36, 'profile'], [2, .51, 'grid'], [2, .65, 'mid-unroll'],
    [2, .75, 'flat-map'], [2, .86, 'observation'], [2, .91, 'confidence'],
    [2, .95, 'validity'], [2, .99, 'traceability'],
  ]
  for (const [index, local, name] of points) {
    await seek(page, index, local)
    await expect(canvas).toHaveAttribute('data-hero', hero!)
    if (surface) await expect(canvas).toHaveAttribute('data-surface', surface)
    expect.soft(await page.evaluate(() => (window as unknown as { qaCanvas: Element }).qaCanvas === document.querySelector('canvas'))).toBe(true)
    await page.screenshot({ path: info.outputPath(`forward-${name}.png`) })
  }
  expect(Number(await canvas.getAttribute('data-unwrap'))).toBeGreaterThan(.99)
  for (const [index, local, name] of [...points].reverse()) {
    await seek(page, index, local)
    await expect(canvas).toHaveAttribute('data-hero', hero!)
    if (surface) await expect(canvas).toHaveAttribute('data-surface', surface)
    if (['mid-unroll', 'inspection-entry', 'arrival-opening'].includes(name))
      await page.screenshot({ path: info.outputPath(`reverse-${name}.png`) })
  }
  expect(Number(await canvas.getAttribute('data-unwrap'))).toBeLessThan(.001)
  expect(errors).toEqual([])
})

test('first slice: accessibility, resize and direct reload retain meaningful content', async ({ page }, info) => {
  await page.goto('/')
  await expect(page.locator('canvas')).toHaveAttribute('data-hero', /.+/)
  await seek(page, 2, .65)
  const hero = await page.locator('canvas').getAttribute('data-hero')
  await page.setViewportSize(info.project.name === 'mobile' ? { width: 740, height: 390 } : { width: 1100, height: 760 })
  await seek(page, 2, .65)
  await expect(page.locator('canvas')).toHaveAttribute('data-hero', hero!)
  await page.reload()
  await expect(page.locator('canvas')).toHaveAttribute('data-hero', hero!)
  await seek(page, 1, .55)
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(result.violations.map(v => ({ id: v.id, description: v.description, nodes: v.nodes.map(n => n.target) }))).toEqual([])
})

test('reduced motion and WebGL fallback preserve all engineering meaning', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.getByText('NO DATA ≠ NO LUBRICANT.', { exact: true })).toBeVisible()
  await expect(page.getByText('ONE DEFECT IS NOT A TREND.', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'ENGINEER REVIEW.' })).toBeVisible()
  for (const id of ids) await expect(page.locator(`#static-${id}`).getByRole('img').first()).toBeVisible()
  await expect(page.getByText('Final prototype disposition (unvalidated policy)')).toBeVisible()
  await expect(page.getByText('Example: incomplete acquisition: measurement validity first')).toBeVisible()
  await expect(page.getByText(/Illustrative process health indicator/)).toBeVisible()
  const reducedAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(reducedAxe.violations.map(v => v.id)).toEqual([])
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/?fallback')
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.getByText(/complete engineering story, available without WebGL/)).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to engineering reality' })).toBeFocused()
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(result.violations.map(v => v.id)).toEqual([])
})

function enableFull() {
  test.skip(process.env.FULL_JOURNEY_QA !== '1', 'Full visual QA is enabled only against an approved stable build.')
}

function runtimeDiagnostics(page: Page) {
  const messages: string[] = []
  page.on('pageerror', error => messages.push(`pageerror: ${error.message}`))
  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') messages.push(`${message.type()}: ${message.text()}`)
  })
  return messages
}

async function snapshot(page: Page, info: TestInfo, name: string, records: unknown[]) {
  records.push(await page.locator('canvas').evaluate(canvas => ({
    name: '', scene: canvas.dataset.scene, progress: canvas.dataset.progress,
    beat: canvas.dataset.beat, hero: canvas.dataset.hero, surface: canvas.dataset.surface,
    unwrap: canvas.dataset.unwrap, theta: canvas.dataset.theta,
    observationHash: canvas.dataset.observationHash,
  })).then(state => ({ ...state, name })))
  await page.screenshot({ path: info.outputPath(`${name}.png`) })
}

async function assertCopyAndEvidenceDoNotOverlap(page: Page, checkpoint: string) {
  const evidence = page.getByRole('complementary', { name: 'Illustrative technical evidence' })
  if (!await evidence.count() || !await evidence.isVisible()) return
  const copies = await page.locator('h1').evaluate(heading => {
    const walker = document.createTreeWalker(heading.parentElement!, NodeFilter.SHOW_TEXT)
    const boxes: { left: number, right: number, top: number, bottom: number }[] = []
    while (walker.nextNode()) {
      const node = walker.currentNode
      if (!node.textContent?.trim()) continue
      const parent = node.parentElement!
      const style = getComputedStyle(parent)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const rect of range.getClientRects()) if (rect.width && rect.height) boxes.push({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom })
    }
    return boxes
  })
  const rect = await evidence.boundingBox()
  if (!rect) return
  const collision = copies.some(copy => Math.min(copy.right, rect.x + rect.width) - Math.max(copy.left, rect.x) > 2 && Math.min(copy.bottom, rect.y + rect.height) - Math.max(copy.top, rect.y) > 2)
  expect.soft(collision, `${checkpoint}: visible story text overlaps the evidence strip`).toBe(false)
  const article = await page.locator('h1').evaluate(heading => {
    const bounds = heading.parentElement!.getBoundingClientRect()
    return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom }
  })
  const articleCollision = Math.min(article.right, rect.x + rect.width) - Math.max(article.left, rect.x) > 2 && Math.min(article.bottom, rect.y + rect.height) - Math.max(article.top, rect.y) > 2
  expect.soft(articleCollision, `${checkpoint}: story article spacing overlaps the evidence strip`).toBe(false)
}

async function assertProjectedLabelsStayClear(page: Page, checkpoint: string) {
  const copy = await page.locator('h1').evaluate(heading => {
    const rect = heading.parentElement!.getBoundingClientRect()
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
  })
  const labels = page.locator('[id^="caption-"]')
  for (const label of await labels.all()) {
    if (!await label.isVisible()) continue
    const rect = await label.boundingBox()
    if (!rect) continue
    const horizontalOverlap = Math.min(copy.right, rect.x + rect.width) - Math.max(copy.left, rect.x)
    const verticalOverlap = Math.min(copy.bottom, rect.y + rect.height) - Math.max(copy.top, rect.y)
    expect.soft(horizontalOverlap > 2 && verticalOverlap > 2, `${checkpoint}: projected caption overlaps story copy`).toBe(false)
  }
  const legend = page.locator('#deviation-legend')
  if (!await legend.count() || !await legend.isVisible()) return
  const rect = await legend.boundingBox(), viewport = page.viewportSize()!
  if (!rect) return
  expect.soft(rect.x, `${checkpoint}: legend left clips`).toBeGreaterThanOrEqual(-1)
  expect.soft(rect.x + rect.width, `${checkpoint}: legend right clips`).toBeLessThanOrEqual(viewport.width + 1)
  const evidence = page.getByRole('complementary', { name: 'Illustrative technical evidence' })
  const aside = await evidence.boundingBox()
  if (aside) {
    const horizontalOverlap = Math.min(rect.x + rect.width, aside.x + aside.width) - Math.max(rect.x, aside.x)
    const verticalOverlap = Math.min(rect.y + rect.height, aside.y + aside.height) - Math.max(rect.y, aside.y)
    expect.soft(horizontalOverlap > 2 && verticalOverlap > 2, `${checkpoint}: legend overlaps evidence`).toBe(false)
  }
}

const analyticalCheckpoints: [number, string, number][] = [
  [3, 'current-tyre', .01], [3, 'accepted-population', .12], [3, 'natural-variation', .22],
  [3, 'variant-selection', .32], [3, 'aligned-population', .43], [3, 'expected-mean', .50],
  [3, 'variation-field', .59], [3, 'fingerprint', .66], [3, 'controlled-update', .70],
  [3, 'hero-comparison', .76], [3, 'spatial-comparison', .83], [3, 'deviation', .88],
  [3, 'localized-anomaly', .91], [3, 'known-pattern', .94], [3, 'unknown-path', .96], [3, 'process-handoff', .99],
  [4, 'normal-deviation-carryover', .01], [4, 'process-context', .10], [4, 'time-alignment', .18],
  [4, 'process-geometry', .27], [4, 'available-inputs', .35], [4, 'process-state', .43],
  [4, 'physical-and-learned-relationships', .50], [4, 'expected-surface', .59], [4, 'two-expectations', .67],
  [4, 'observed-vs-expected', .74], [4, 'unexplained-residual', .82], [4, 'support-envelope', .88],
  [4, 'combined-evidence', .93], [4, 'complete-record', .96], [4, 'history-handoff', .99],
  [5, 'single-record', .01], [5, 'history-expands', .08], [5, 'isolated-event', .17],
  [5, 'operating-envelope', .25], [5, 'persistent-change', .34], [5, 'early-warning', .41],
  [5, 'multiscale', .47], [5, 'spatial-drift', .54], [5, 'aligned-process-history', .63],
  [5, 'associated-factors', .70], [5, 'what-if', .77], [5, 'engineer-review', .82],
  [5, 'unknown-signature', .86], [5, 'preventive-intelligence', .90], [5, 'three-ideas', .94],
  [5, 'timeline-conveyor', .97], [5, 'physical-finale', .995],
]

for (const index of [3, 4, 5]) {
  test(`full scene ${index}: technical beats and reverse reconstruction @full`, async ({ page }, info) => {
    enableFull()
    const diagnostics = runtimeDiagnostics(page)
    await page.goto('/')
    const canvas = page.locator('canvas')
    await expect(canvas).toHaveAttribute('data-surface', /.+/)
    await expect(canvas).toHaveAttribute('data-observation-hash', /.+/)
    const initial = await canvas.evaluate(element => ({ hero: element.dataset.hero, surface: element.dataset.surface, observationHash: element.dataset.observationHash }))
    await page.evaluate(() => { (window as unknown as { qaCanvas: Element | null }).qaCanvas = document.querySelector('canvas') })
    const records: unknown[] = []
    for (const [scene, name, local] of analyticalCheckpoints.filter(point => point[0] === index)) {
      await seek(page, scene, local)
      await expect(canvas).toHaveAttribute('data-hero', initial.hero!)
      await expect(canvas).toHaveAttribute('data-surface', initial.surface!)
      await expect(canvas).toHaveAttribute('data-observation-hash', initial.observationHash!)
      expect(await page.evaluate(() => (window as unknown as { qaCanvas: Element }).qaCanvas === document.querySelector('canvas'))).toBe(true)
      await assertCopyAndEvidenceDoNotOverlap(page, `${ids[index]}-${name}`)
      await assertProjectedLabelsStayClear(page, `${ids[index]}-${name}`)
      await snapshot(page, info, name, records)
    }
    for (const local of [.94, .74, .54, .34, .01]) {
      await seek(page, index, local)
      if (local === .54 || local === .01) await snapshot(page, info, `reverse-${local}`, records)
    }
    await info.attach('checkpoint-metadata', { body: JSON.stringify(records, null, 2), contentType: 'application/json' })
    expect(diagnostics).toEqual([])
  })
}

test('all boundaries: close samples forward and reverse @boundaries', async ({ page }, info) => {
  enableFull()
  test.setTimeout(600_000)
  const diagnostics = runtimeDiagnostics(page)
  await page.goto('/')
  await expect(page.locator('canvas')).toHaveAttribute('data-surface', /.+/)
  await expect(page.locator('canvas')).toHaveAttribute('data-observation-hash', /.+/)
  const hash = await page.locator('canvas').getAttribute('data-observation-hash')
  const records: unknown[] = []
  const boundaries: [number, number][] = []
  for (let index = 0; index < 5; index++) {
    for (const local of [.92, .96, .99]) boundaries.push([index, local])
    for (const local of [.01, .04, .08]) boundaries.push([index + 1, local])
  }
  for (const direction of ['forward', 'reverse']) {
    for (const [index, local] of direction === 'forward' ? boundaries : [...boundaries].reverse()) {
      await seek(page, index, local)
      await expect(page.locator('canvas')).toHaveAttribute('data-observation-hash', hash!)
      await snapshot(page, info, `${direction}-${index}-${local}`, records)
    }
  }
  await info.attach('boundary-metadata', { body: JSON.stringify(records, null, 2), contentType: 'application/json' })
  expect(diagnostics).toEqual([])
})

test('full interaction: fast jumps, partial reverse, keyboard, orientation and what-if @full', async ({ page }, info) => {
  enableFull()
  const diagnostics = runtimeDiagnostics(page)
  await page.goto('/')
  const canvas = page.locator('canvas')
  await expect(canvas).toHaveAttribute('data-surface', /.+/)
  await expect(canvas).toHaveAttribute('data-observation-hash', /.+/)
  const hero = await canvas.getAttribute('data-hero'), surface = await canvas.getAttribute('data-surface')
  const observationHash = await canvas.getAttribute('data-observation-hash')
  await seek(page, 1, .5)
  const slowStart = Number(await canvas.getAttribute('data-progress'))
  for (let step = 0; step < 8; step++) {
    await page.mouse.wheel(0, 30)
    await page.waitForTimeout(120)
  }
  await expect.poll(async () => Number(await canvas.getAttribute('data-progress'))).toBeGreaterThan(slowStart)
  await expect(canvas).toHaveAttribute('data-hero', hero!)
  for (const [index, local] of [[5, .77], [1, .6], [4, .82], [2, .65], [3, .88]] as [number, number][]) await seek(page, index, local)
  const viewport = page.viewportSize()!
  await page.setViewportSize({ width: viewport.height, height: viewport.width })
  await seek(page, 3, .88)
  await page.setViewportSize(viewport)
  await seek(page, 5, .77)
  await expect(canvas).toHaveAttribute('data-hero', hero!)
  await expect(canvas).toHaveAttribute('data-surface', surface!)
  await expect(canvas).toHaveAttribute('data-observation-hash', observationHash!)
  const rail = page.getByRole('navigation', { name: 'Journey chapters' })
  const canonicalButton = rail.getByRole('button', { name: /Canonical surface/ })
  await canonicalButton.focus()
  await page.keyboard.press('Enter')
  await expect(canvas).toHaveAttribute('data-scene', 'canonical')
  await expect(canonicalButton).toBeFocused()
  await expect(canonicalButton).toHaveAttribute('aria-current', 'step')
  // Reverse before the damped unroll transition has settled, then reconstruct its start.
  await seek(page, 2, .6)
  const target = globalAt(2, .9)
  await page.evaluate(p => {
    const journey = document.querySelector('section[aria-label="Continuous inspection story"]') as HTMLElement
    window.scrollTo({ top: journey.offsetTop + (journey.offsetHeight - innerHeight) * p, behavior: 'instant' })
  }, target)
  await expect.poll(async () => Number(await canvas.getAttribute('data-progress'))).toBeGreaterThan(globalAt(2, .65))
  await seek(page, 2, .6)
  await expect(canvas).toHaveAttribute('data-observation-hash', observationHash!)
  await seek(page, 5, .47)
  const windows = page.getByRole('group', { name: 'History aggregation window' })
  for (const [label, count] of [['short', 4], ['medium', 8], ['long', 13]] as const) {
    const button = windows.getByRole('button', { name: label, exact: true })
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('img', { name: new RegExp(`^${count} illustrative tyre records;`) })).toBeVisible()
  }
  await seek(page, 5, .77)
  const candidate = page.locator('#candidate-nozzle')
  await expect(candidate).toBeVisible()
  await expect(page.locator('#candidate-flow')).toBeVisible()
  {
    await candidate.first().focus()
    await page.keyboard.press('Home')
    await expect(canvas).toHaveAttribute('data-observation-hash', observationHash!)
    await page.keyboard.press('End')
    await expect(canvas).toHaveAttribute('data-observation-hash', observationHash!)
  }
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([])
  await page.screenshot({ path: info.outputPath('whatif-after-interaction.png') })
  expect(diagnostics).toEqual([])
})

test('decision, process health and what-if stay distinct on the evidence strip', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('canvas')).toHaveAttribute('data-hero', 'TYR-1012')
  await seek(page, 3, 0.94)
  const evidence = page.getByRole('complementary', { name: 'Illustrative technical evidence' })
  await expect(evidence.getByText('Abnormality evidence')).toBeVisible()
  await expect(evidence.getByText('Final prototype disposition')).toBeVisible()
  await expect(evidence.getByText('FAIL', { exact: true })).toBeVisible()
  await seek(page, 3, 0.96)
  await expect(evidence.getByText('REVIEW', { exact: true })).toBeVisible()
  await seek(page, 2, 0.95)
  await expect(page.getByText(/INVALID/)).toBeVisible()
  await seek(page, 4, 0.88)
  await expect(evidence.getByText('trace-conditioned', { exact: true })).toBeVisible()
  await expect(evidence.getByText(/partly explained|mostly explained|largely unexplained/)).toBeVisible()
  await seek(page, 5, 0.41)
  await expect(evidence.getByText('This tyre')).toBeVisible()
  await expect(evidence.getByText('Process health', { exact: true })).toBeVisible()
  await expect(evidence.getByText('CRITICAL', { exact: true })).toBeVisible()
  await seek(page, 5, 0.77)
  const before = await evidence.locator('p').filter({ hasText: 'Peak unexplained residual' }).innerText()
  await page.locator('#candidate-flow').fill('0.7')
  await expect.poll(async () => evidence.locator('p').filter({ hasText: 'Peak unexplained residual' }).innerText()).not.toBe(before)
})

test('actual WebGL context loss recovers to complete accessible static story @recovery', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('canvas')).toHaveAttribute('data-hero', /.+/)
  const lost = await page.locator('canvas').evaluate(canvas => {
    const gl = canvas.getContext('webgl2')
    const extension = gl?.getExtension('WEBGL_lose_context')
    if (!extension) return false
    extension.loseContext()
    return true
  })
  expect(lost, 'The test renderer must support explicit context loss').toBe(true)
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.getByText(/complete engineering story, available without WebGL/)).toBeVisible()
  for (const id of ids) await expect(page.locator(`#static-${id}`).getByRole('img').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'ENGINEER REVIEW.' })).toBeVisible()
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(result.violations.map(v => v.id)).toEqual([])
})
