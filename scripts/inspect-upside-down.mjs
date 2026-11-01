import {chromium} from '@playwright/test';
import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.goto('http://127.0.0.1:5173/?dev=1');
  await page.locator('#loading').waitFor({state:'hidden'});await page.locator('#start-button').click();
  const images=await page.evaluate(async()=>{
    const stages=[['ARRIVAL',0,false],['ROLL START',.55,false],['MID ROLL',.775,false],['INVERTED',1.1,false],['SETTLED',2,false],['REDUCED MOTION',.46,true]];
    const c=document.createElement('canvas');c.width=1440;c.height=1408;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#0b1b31';g.fillRect(0,0,c.width,c.height);
    const singles={};
    for(const [avatarIndex,avatar] of ['andy','ding'].entries())for(const [i,[label,age,reduced]] of stages.entries()){
      const image=new Image();image.src=window.__nowhere.renderUpsideDown(age,avatar,reduced);await image.decode();
      const x=i%3*480,y=(Math.floor(i/3)+avatarIndex*2)*352;
      g.drawImage(image,x,y);g.font='bold 14px monospace';g.fillStyle='#fff0bf';
      g.fillText(`${avatar.toUpperCase()} · ${label} · ${age.toFixed(3)}s`,x+10,y+340);
      if(avatar==='andy'&&(label==='ARRIVAL'||label==='MID ROLL'||label==='SETTLED'))singles[label.toLowerCase().replace(' ','-')]=image.src.split(',')[1];
    }
    return {sheet:c.toDataURL().split(',')[1],singles};
  });
  await writeFile('artifacts/upside-down-stages.png',Buffer.from(images.sheet,'base64'));
  for(const [name,data] of Object.entries(images.singles))await writeFile(`artifacts/upside-down-${name}.png`,Buffer.from(data,'base64'));
  await page.evaluate(()=>window.__nowhere.visit(69));
  await page.waitForFunction(()=>window.__nowhere.snapshot().inverted);
  await page.locator('.cabinet').screenshot({path:'artifacts/upside-down-room.png'});
  console.log('Saved actual-render inversion stages and upright HUD capture.');
  if(process.argv.includes('--gif')){
    const frames=await page.evaluate(async()=>{
      const c=document.createElement('canvas');c.width=960;c.height=344;
      const g=c.getContext('2d');g.imageSmoothingEnabled=false;const frames=[];
      for(let i=0;i<84;i++){
        const age=Math.max(0,i/24-.3);g.fillStyle='#0b1b31';g.fillRect(0,0,960,344);
        for(const [col,avatar] of ['andy','ding'].entries()){
          const image=new Image();image.src=window.__nowhere.renderUpsideDown(age,avatar);await image.decode();
          g.drawImage(image,col*480,0);g.font='bold 13px monospace';g.fillStyle='#fff0bf';
          g.fillText(`${avatar.toUpperCase()} · FLOOR 69 · UPSIDE-DOWN BAKERY`,col*480+10,336);
        }
        frames.push(c.toDataURL().split(',')[1]);
      }
      return frames;
    });
    const folder=await mkdtemp(join(tmpdir(),'lift-flip-frames-'));
    for(const [i,data] of frames.entries())await writeFile(join(folder,`${String(i).padStart(3,'0')}.png`),Buffer.from(data,'base64'));
    const result=spawnSync('/opt/homebrew/bin/ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate','24','-i',join(folder,'%03d.png'),'-filter_complex','split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4','-loop','0','artifacts/upside-down-room.gif'],{stdio:'inherit'});
    if(result.status!==0)throw Error('GIF encoding failed.');
    console.log('Saved artifacts/upside-down-room.gif.');
  }
}finally{await browser.close();}
