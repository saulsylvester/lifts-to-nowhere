import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';

await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.goto('http://127.0.0.1:5173/?dev=1');
 await page.locator('#loading').waitFor({state:'hidden'});
 await page.locator('#start-button').click();
 const images=await page.evaluate(()=>{
  const lobby=document.querySelector('#game');
  const closeup=document.createElement('canvas');closeup.width=420;closeup.height=500;
  const ctx=closeup.getContext('2d');ctx.imageSmoothingEnabled=false;
  ctx.drawImage(lobby,218,54,84,100,0,0,420,500);
  return {lobby:lobby.toDataURL().split(',')[1],closeup:closeup.toDataURL().split(',')[1]};
 });
 const before=process.argv.includes('--before');
 await writeFile(`artifacts/bookshelf-${before?'before':'fixed'}.png`,Buffer.from(images.closeup,'base64'));
 await writeFile(`artifacts/bookshelf-lobby${before?'-before':''}.png`,Buffer.from(images.lobby,'base64'));
 console.log(`Saved actual canvas bookshelf ${before?'before':'fixed'} close-up and lobby.`);
}finally{await browser.close();}
