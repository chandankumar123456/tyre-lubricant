import { chromium } from 'playwright';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
await mkdir('docs/qa/opening-review',{recursive:true});
for(const [name,width,height] of [['desktop',1440,900],['tablet',900,1100],['mobile',412,839]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:4173');
 await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.hero);
 await page.screenshot({path:`docs/qa/opening-review/${name}.png`});
 await page.close();
}
await browser.close();
