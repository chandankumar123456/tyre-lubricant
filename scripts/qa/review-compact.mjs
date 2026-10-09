import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
await mkdir('docs/qa/revised', { recursive: true });
const weights = [2,3,4,4,4,6];
for (const [profile, width, height] of [['tablet',900,1100],['mobile',412,915]]) {
  const page = await browser.newPage({ viewport: { width,height }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error(e));
  page.on('console', m => { if(m.type()==='error') console.error(m.text()); });
  await page.goto('http://127.0.0.1:4173');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.hero);
  for (const [scene, local, name] of [[2,.98,'trace'],[3,.85,'deviation'],[4,.67,'two-expectations'],[4,.83,'residual'],[5,.54,'spatial-drift'],[5,.77,'what-if']]) {
    const progress = (weights.slice(0,scene).reduce((a,b)=>a+b,0)+weights[scene]*local)/23;
    await page.evaluate(p => { const journey=document.querySelector('section[aria-label="Continuous inspection story"]'); window.scrollTo({top:journey.offsetTop+(journey.offsetHeight-innerHeight)*p,behavior:'instant'}); },progress);
    await page.waitForFunction(p => Math.abs(Number(document.querySelector('canvas')?.dataset.progress)-p)<.001,progress);
    await page.screenshot({path:`docs/qa/revised/${profile}-${name}.png`});
  }
  await page.close();
}
await browser.close();
