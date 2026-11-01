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
  await page.locator('#loading').waitFor({state:'hidden'});
  await page.locator('#start-button').click();
  const images=await page.evaluate(async()=>{
    const phases=[['IDLE',null],['GROWTH',.4],['GRAB',1.2],['SWALLOW',1.7],['CHEW',2.65],['SPRAY',3.95],['IMPACTS',4.7],['AFTERMATH',6.2]];
    const c=document.createElement('canvas');c.width=1920;c.height=1408;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#0b1b31';g.fillRect(0,0,c.width,c.height);
    const singles={};
    for(const [avatarIndex,avatar] of ['andy','ding'].entries()){
      window.__nowhere.chooseAvatar(avatar);
      for(const [i,[label,age]] of phases.entries()){
        const image=new Image();image.src=age===null?window.__nowhere.renderFloor(101,false):window.__nowhere.renderPlant(age,avatar);
        await image.decode();
        const x=i%4*480,y=(Math.floor(i/4)+avatarIndex*2)*352;
        g.drawImage(image,x,y,480,320);g.font='bold 14px monospace';g.fillStyle='#fff0bf';
        g.fillText(`${avatar.toUpperCase()} · ${label}${age===null?'':` · ${age.toFixed(2)}s`}`,x+12,y+340);
        if(avatar==='andy'&&(label==='GRAB'||label==='SWALLOW'||label==='SPRAY'||label==='AFTERMATH'))singles[label.toLowerCase()]=image.src.split(',')[1];
      }
    }
    return {sheet:c.toDataURL().split(',')[1],singles};
  });
  await writeFile('artifacts/plant-encounter-stages.png',Buffer.from(images.sheet,'base64'));
  for(const [name,data] of Object.entries(images.singles))await writeFile(`artifacts/plant-${name}.png`,Buffer.from(data,'base64'));
  console.log('Saved actual-render Andy/Ding encounter stages and four inspection frames.');
  if(process.argv.includes('--gif')){
    const frames=await page.evaluate(async()=>{
      const c=document.createElement('canvas');c.width=960;c.height=344;
      const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      const frames=[],idle={};
      for(const avatar of ['andy','ding']){window.__nowhere.chooseAvatar(avatar);idle[avatar]=window.__nowhere.renderFloor(101,false);}
      for(let i=0;i<96;i++){
        const age=i/12-.5;
        g.fillStyle='#0b1b31';g.fillRect(0,0,960,344);
        for(const [col,avatar] of ['andy','ding'].entries()){
          const image=new Image();image.src=age<0?idle[avatar]:window.__nowhere.renderPlant(age,avatar);await image.decode();
          g.drawImage(image,col*480,0);g.font='bold 13px monospace';g.fillStyle='#fff0bf';
          g.fillText(`${avatar.toUpperCase()} · THE LAST SUPPER CLUB`,col*480+12,336);
        }
        frames.push(c.toDataURL().split(',')[1]);
      }
      return frames;
    });
    const folder=await mkdtemp(join(tmpdir(),'lift-plant-frames-'));
    for(const [i,data] of frames.entries())await writeFile(join(folder,`${String(i).padStart(3,'0')}.png`),Buffer.from(data,'base64'));
    const result=spawnSync('/opt/homebrew/bin/ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate','12','-i',join(folder,'%03d.png'),'-filter_complex','split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4','-loop','0','artifacts/plant-encounter.gif'],{stdio:'inherit'});
    if(result.status!==0)throw Error('GIF encoding failed.');
    console.log('Saved artifacts/plant-encounter.gif.');
  }
}finally{await browser.close();}
