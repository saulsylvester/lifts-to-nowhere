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
 const images=await page.evaluate(async()=>{
  const {bundledAvatar,drawAvatar}=await import('/src/avatars.ts');
  const avatar=await bundledAvatar('andy'),directions=['idle','right','left','up'];
  const atlas=document.createElement('canvas');atlas.width=452;atlas.height=252;
  const a=atlas.getContext('2d');a.imageSmoothingEnabled=false;a.fillStyle='#122b49';a.fillRect(0,0,452,252);
  a.font='7px monospace';a.fillStyle='#fff0bf';a.fillText('ACTUAL ANDY ATLAS · 8 DISTANCE POSES + DIRECTIONAL REST',8,12);
  for(const [row,direction] of directions.entries()){
   const y=26+row*56;a.fillStyle='#fff0bf';a.fillText(direction==='idle'?'DOWN':direction.toUpperCase(),4,y+26);
   for(let frame=0;frame<9;frame++){
    const x=56+frame*44;a.fillStyle='#1d3a56';a.fillRect(x,y,43,53);a.fillStyle='#446572';a.fillRect(x+3,y+46,37,1);
    a.fillStyle='#a2b8bd';a.fillText(frame===8?'REST':String(frame),x+4,y+8);
    drawAvatar(a,avatar,x+22,y+46,0,direction,frame<8,false,1,frame*4);
   }
  }
  const large=document.createElement('canvas');large.width=1356;large.height=756;const l=large.getContext('2d');l.imageSmoothingEnabled=false;l.drawImage(atlas,0,0,1356,756);
  const native=document.createElement('canvas');native.width=480;native.height=400;const n=native.getContext('2d');n.imageSmoothingEnabled=false;
  const movie=document.createElement('canvas');movie.width=960;movie.height=800;const g=movie.getContext('2d');g.imageSmoothingEnabled=false;
  const frames=[];
  for(let frame=0;frame<90;frame++){
   const time=frame/30,distance=Math.max(0,Math.min(2,time-.4))*66,moving=time>=.4&&time<2.4;
   n.fillStyle='#122b49';n.fillRect(0,0,480,400);n.font='8px monospace';
   for(let quadrant=0;quadrant<4;quadrant++){
    const ox=quadrant%2*240,oy=Math.floor(quadrant/2)*200;
    n.fillStyle='#24415b';for(let x=ox+16;x<ox+240;x+=16)n.fillRect(x,oy+24,1,168);
    for(let y=oy+32;y<oy+200;y+=16)n.fillRect(ox+8,y,224,1);
    n.fillStyle='#fff0bf';n.fillText(['RIGHT','LEFT','DOWN','UP'][quadrant]+' · 66 PX/S',ox+12,oy+14);
   }
   const positions=[{x:48+distance,y:118,d:'right'},{x:432-distance,y:118,d:'left'},{x:120,y:254+distance,d:'idle'},{x:360,y:386-distance,d:'up'}];
   for(const p of positions){n.fillStyle='#081b2c';n.fillRect(Math.round(p.x)-8,Math.round(p.y),16,2);drawAvatar(n,avatar,p.x,p.y,time,p.d,moving,false,1,distance);}
   n.fillStyle='#edb94e';n.fillText(moving?'WALKING':'DIRECTIONAL REST',12,392);
   g.drawImage(native,0,0,960,800);frames.push(movie.toDataURL().split(',')[1]);
  }
  return {atlas:large.toDataURL().split(',')[1],frames};
 });
 await writeFile('artifacts/andy-articulated-walk-reviewed.png',Buffer.from(images.atlas,'base64'));
 const folder=await mkdtemp(join(tmpdir(),'lift-walk-review-'));
 for(const [i,data] of images.frames.entries())await writeFile(join(folder,`${String(i).padStart(3,'0')}.png`),Buffer.from(data,'base64'));
 const result=spawnSync('/opt/homebrew/bin/ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate','30','-i',join(folder,'%03d.png'),'-filter_complex','split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse=dither=none','-loop','0','artifacts/andy-walk-reviewed.gif'],{stdio:'inherit'});
 if(result.status!==0)throw Error('GIF encoding failed.');
 console.log('Saved current actual atlas and stationary-camera 66px/s gait GIF.');
}finally{await browser.close();}
