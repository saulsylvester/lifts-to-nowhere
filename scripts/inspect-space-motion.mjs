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
  const {render}=await import('/src/render.ts'),{bundledAvatar}=await import('/src/avatars.ts'),{floorById}=await import('/src/rooms.ts');
  const {spacePlanets,spacePlanetsAt,spaceCanStand,resolveSpaceOverlap}=await import('/src/space.ts'),{project}=await import('/src/core.ts');
  const avatar=await bundledAvatar('andy');
  const frame=(age)=>{
   const c=document.createElement('canvas');c.width=480;c.height=320;
   render(c.getContext('2d'),{state:'room',floor:87,room:floorById.get(87),avatar,player:{x:9.7,y:1.3},facing:'left',moving:false,locomotion:'float',velocity:{x:0,y:0},started:true,effect:null,floodStart:null,flipStart:null,spaceStart:age===null?null:0,travelStart:0,destination:0,reducedMotion:false,celebration:0,collected:new Set(age===null?[]:[87])},age??0);
   return c;
  };
  window.captureSpaceFrame=age=>frame(age).toDataURL();
  const c=document.createElement('canvas');c.width=1440;c.height=704;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#0b1b31';g.fillRect(0,0,c.width,c.height);
  for(const [i,age] of [null,2.6,5,8,12,18].entries()){
   const x=i%3*480,y=Math.floor(i/3)*352;g.drawImage(frame(age),x,y);g.font='bold 14px monospace';g.fillStyle='#fff0bf';g.fillText(age===null?'BEFORE THE FIRST PUSH':`CONTINUING ORBIT · ${age}s`,x+10,y+338);
  }
  let minBodyGap=Infinity,minDoorGap=Infinity,minLiftEntryGap=Infinity,maxExcursion=0,pushoutFailures=0;
  const doorway=project({x:9.7,y:.45}),entry=project({x:9.7,y:1.3});
  for(let age=0;age<=120;age+=.1){
   const planets=spacePlanetsAt(age);
   for(const [i,p] of planets.entries()){
    const at=project(p),origin=project(spacePlanets[i]);maxExcursion=Math.max(maxExcursion,Math.hypot(at.x-origin.x,at.y-origin.y));
    minDoorGap=Math.min(minDoorGap,Math.hypot(at.x-doorway.x,at.y-doorway.y)-p.radius-6);
    minLiftEntryGap=Math.min(minLiftEntryGap,Math.hypot(at.x-entry.x,at.y-entry.y)-p.radius-6);
    if(!spaceCanStand(resolveSpaceOverlap(p,age),age))pushoutFailures++;
    for(let j=i+1;j<planets.length;j++){const b=project(planets[j]);minBodyGap=Math.min(minBodyGap,Math.hypot(at.x-b.x,at.y-b.y)-p.radius-planets[j].radius);}
   }
  }
  const dentist={};
  if(window.__nowhere.renderDentist)for(const age of [0,1.1,2.3])dentist[age]=window.__nowhere.renderDentist(age,'andy').split(',')[1];
  return {image:c.toDataURL().split(',')[1],metrics:{minBodyGap,minDoorGap,minLiftEntryGap,maxExcursion,pushoutFailures},dentist};
 });
 await writeFile('artifacts/space-motion-stages.png',Buffer.from(result.image,'base64'));
 for(const [age,data] of Object.entries(result.dentist))await writeFile(`artifacts/dentist-review-${age}.png`,Buffer.from(data,'base64'));
 console.log(JSON.stringify(result.metrics,null,2));
 if(process.argv.includes('--gif')){
  const frames=await page.evaluate(async()=>{
   const frames=[];for(let i=0;i<180;i++)frames.push(window.captureSpaceFrame(i/12).split(',')[1]);return frames;
  });
  const folder=await mkdtemp(join(tmpdir(),'lift-space-frames-'));
  for(const [i,data] of frames.entries())await writeFile(join(folder,`${String(i).padStart(3,'0')}.png`),Buffer.from(data,'base64'));
  const result=spawnSync('/opt/homebrew/bin/ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate','12','-i',join(folder,'%03d.png'),'-filter_complex','split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4','-loop','0','artifacts/space-motion.gif'],{stdio:'inherit'});
  if(result.status!==0)throw Error('GIF encoding failed.');
  console.log('Saved artifacts/space-motion.gif.');
 }
}finally{await browser.close();}
