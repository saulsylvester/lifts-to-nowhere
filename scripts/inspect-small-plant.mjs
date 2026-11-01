import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';

await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 await page.goto('http://127.0.0.1:5173/?dev=1');await page.locator('#loading').waitFor({state:'hidden'});await page.locator('#start-button').click();
 const result=await page.evaluate(async()=>{
  const {drawPlantEncounter}=await import('/src/plant-encounter.ts');
  const ages=[0,.2,.4,.65,.85],c=document.createElement('canvas');c.width=2400;c.height=352;
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#0b1b31';g.fillRect(0,0,c.width,c.height);const bounds=[];
  for(const [i,age] of ages.entries()){
   const image=new Image();image.src=window.__nowhere.renderPlant(age,'andy');await image.decode();g.drawImage(image,i*480,0);
   g.font='bold 14px monospace';g.fillStyle='#fff0bf';g.fillText(`GROWTH · ${age.toFixed(2)}s`,i*480+12,339);
   const isolated=document.createElement('canvas');isolated.width=480;isolated.height=320;const ctx=isolated.getContext('2d',{willReadFrequently:true});
   const options={plant:{x:4.7,y:3.6},origin:{x:9.7,y:1.3},age,time:age,reducedMotion:false,avatarId:'andy'};
   drawPlantEncounter(ctx,options,'back');drawPlantEncounter(ctx,options,'plant');
   const data=ctx.getImageData(0,0,480,320).data;let left=480,right=-1,top=320,bottom=-1,soft=0;
   for(let y=0;y<320;y++)for(let x=0;x<480;x++){
    const a=data[(y*480+x)*4+3];if(a){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);if(a!==255)soft++;}
   }
   bounds.push({age,width:right-left+1,height:bottom-top+1,left,right,top,bottom,softPixels:soft});
  }
  return {image:c.toDataURL().split(',')[1],bounds};
 });
 await writeFile('artifacts/plant-growth-stages.png',Buffer.from(result.image,'base64'));
 console.log(JSON.stringify(result.bounds,null,2));
}finally{await browser.close();}
