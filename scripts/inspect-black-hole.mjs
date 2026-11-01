import {chromium} from '@playwright/test';
import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.goto('http://127.0.0.1:5173/?dev=1');await page.locator('#loading').waitFor({state:'hidden'});await page.locator('#start-button').click();
 const result=await page.evaluate(async()=>{
  const ages=[0,.25,.4,.7,1,1.2],sheet=document.createElement('canvas');sheet.width=480*6;sheet.height=352*2;
  const g=sheet.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#0b1b31';g.fillRect(0,0,sheet.width,sheet.height);
  for(const [row,avatar] of ['andy','ding'].entries())for(const [col,age] of ages.entries()){
   const image=new Image();image.src=window.__nowhere.renderBlackHole(age,avatar);await image.decode();g.drawImage(image,col*480,row*352);g.font='bold 12px monospace';g.fillStyle='#fff0bf';g.fillText(`${avatar.toUpperCase()} · ${age.toFixed(2)}s`,col*480+12,row*352+340);
  }
  const frames=[];for(let i=0;i<38;i++)frames.push(window.__nowhere.renderBlackHole(i/30,'andy').split(',')[1]);
  return {sheet:sheet.toDataURL().split(',')[1],frames};
 });
 await writeFile('artifacts/black-hole-stages.png',Buffer.from(result.sheet,'base64'));
 await page.evaluate(()=>{window.__nowhere.visit(26);window.__nowhere.trigger();});await page.waitForFunction(()=>window.__nowhere.snapshot().state==='elevator');
 await page.locator('#screen').screenshot({path:'artifacts/black-hole-lift-return.png'});const end=(await page.locator('#game').evaluate(c=>c.toDataURL())).split(',')[1];
 if(process.argv.includes('--gif')){
  const folder=await mkdtemp(join(tmpdir(),'lift-black-hole-')),frames=[...result.frames,...Array(20).fill(end)];
  for(const [i,data] of frames.entries())await writeFile(join(folder,`${String(i).padStart(3,'0')}.png`),Buffer.from(data,'base64'));
  const encoded=spawnSync('/opt/homebrew/bin/ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate','30','-i',join(folder,'%03d.png'),'-filter_complex','scale=960:640:flags=neighbor,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse=dither=none','-loop','0','artifacts/black-hole.gif'],{stdio:'inherit'});
  if(encoded.status!==0)throw Error('GIF encoding failed.');
 }
 console.log('Saved both explorers’ falling stages and actual lift return.');
}finally{await browser.close();}
