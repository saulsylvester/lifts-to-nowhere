import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.goto('http://127.0.0.1:5173/?dev=1');await page.locator('#loading').waitFor({state:'hidden'});await page.locator('#start-button').click();
 for(const active of [false,true]){
  for(let batch=0;batch<4;batch++){
   const data=await page.evaluate(async({active,batch})=>{
    const start=batch*30+1,end=Math.min(101,start+29),columns=5,rows=Math.ceil((end-start+1)/columns),c=document.createElement('canvas');c.width=columns*240;c.height=rows*176;const g=c.getContext('2d');g.fillStyle='#0b1b31';g.fillRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;
    for(let id=start;id<=end;id++){const image=new Image();image.src=window.__nowhere.renderFloor(id,active);await image.decode();const i=id-start,x=i%columns*240,y=Math.floor(i/columns)*176;g.drawImage(image,x,y,240,160);g.font='10px monospace';g.fillStyle='#fff0bf';g.fillText(`${String(id).padStart(3,'0')} · ${active?'ACTIVE':'IDLE'}`,x+8,y+171);}
    return c.toDataURL().split(',')[1];
   },{active,batch});await writeFile(`artifacts/rooms-${active?'active':'idle'}-${batch+1}.png`,Buffer.from(data,'base64'));
  }
 }
 for(const avatar of ['andy','ding']){
  await page.evaluate(id=>window.__nowhere.chooseAvatar(id),avatar);
  for(const floor of [7,73,101]){await page.evaluate(id=>window.__nowhere.visit(id),floor);await page.waitForTimeout(100);await page.locator('.cabinet').screenshot({path:`artifacts/${avatar}-floor-${floor}.png`});}
 }
 await page.reload();await page.locator('#loading').waitFor({state:'hidden'});await page.locator('#start-button').click();await page.locator('.cabinet').screenshot({path:'artifacts/lobby.png'});
 console.log('Saved eight room contact sheets and seven playable reference frames to artifacts/.');
}finally{await browser.close();}
