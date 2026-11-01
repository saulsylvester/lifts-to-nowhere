import {createAndyWalkAtlas,ANDY_STRIDE,ANDY_WALK_FRAMES,isAndyDirection,type AndyDirection} from './andy-walk';
export type AnimationName='idle'|'left'|'right'|'up'|'celebrate'|'failed';
export type Frame={x:number;y:number;w:number;h:number;image?:HTMLImageElement;scale?:number};
export type AvatarDefinition={id:string;name:string;image:HTMLImageElement;portrait:Frame;animations:Record<AnimationName,Frame[]>;walkFront?:Frame[];rest?:Partial<Record<AnimationName,Frame>>;scale:number;anchor:{x:number;y:number};builtin:boolean};
export const CELL_W=192,CELL_H=208;
export const REQUIRED_FRAMES=[6,8,8,4,5,8,6,6,6];
export function validateSheetShape(type:string,size:number,w:number,h:number):1|2 {
 if(!['image/png','image/webp'].includes(type))throw Error('Choose a PNG or WebP sprite sheet.');
 if(size<=0||size>20*1024*1024)throw Error('Your pet must be smaller than 20 MiB.');
 if(w!==1536||![1872,2288].includes(h))throw Error('Use a Codex pet sheet: 1536 × 1872 (v1) or 1536 × 2288 (v2).');
 return h===1872?1:2;
}
export function animationRow(name:AnimationName):number{return {idle:0,right:1,left:2,up:0,celebrate:4,failed:5}[name];}
export async function loadImage(src:string):Promise<HTMLImageElement>{
 return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('That image could not be opened.'));image.src=src;});
}
type Bounds={left:number;top:number;right:number;bottom:number};
function bounds(data:Uint8ClampedArray,width:number,frame:Frame):Bounds|null{
 let left=Infinity,top=Infinity,right=-1,bottom=-1;
 for(let y=frame.y;y<frame.y+frame.h;y++)for(let x=frame.x;x<frame.x+frame.w;x++)if(data[(y*width+x)*4+3]>24){left=Math.min(left,x-frame.x);right=Math.max(right,x-frame.x);top=Math.min(top,y-frame.y);bottom=Math.max(bottom,y-frame.y);}
 return right<0?null:{left,top,right,bottom};
}
function pixels(image:HTMLImageElement){const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(image,0,0);return ctx.getImageData(0,0,c.width,c.height).data;}
export async function bundledAvatar(id:'andy'|'ding'):Promise<AvatarDefinition>{
 const image=await loadImage(`/art/${id==='andy'?'andy-blue-hoodie':'ding'}.png`),data=pixels(image),frames:Frame[]=[];
 for(let i=0;i<4;i++){const slot={x:Math.floor(i*image.width/4),y:0,w:Math.floor(image.width/4),h:image.height};const b=bounds(data,image.width,slot);if(!b)throw Error(`Missing ${id} sprite`);frames.push({x:slot.x+b.left,y:b.top,w:b.right-b.left+1,h:b.bottom-b.top+1});}
 const maxH=Math.max(...frames.map(f=>f.h)),maxW=Math.max(...frames.map(f=>f.w));
 const scale=Math.min((id==='andy'?32:27)/maxH,32/maxW);
 const avatar:AvatarDefinition={id,name:id==='andy'?'Andy':'Ding',image,portrait:frames[0],animations:{idle:[frames[0]],right:[frames[1]],left:[frames[2]],up:[frames[id==='andy'?3:0]],celebrate:[frames[id==='ding'?3:0]],failed:[frames[0]]},scale,anchor:{x:0,y:0},builtin:true};
 if(id==='andy'){
  const heads={} as Record<AndyDirection,Frame>;
  for(const [i,direction] of (['idle','right','left','up'] as const).entries()){
   const f=frames[i],slot={...f,h:Math.round(f.h*.47)},b=bounds(data,image.width,slot)!;
   heads[direction]={x:f.x+b.left,y:f.y+b.top,w:b.right-b.left+1,h:b.bottom-b.top+1};
  }
  const walk=await loadImage(createAndyWalkAtlas(image,heads).toDataURL());
  const frame=(row:number,col:number):Frame=>({x:col*40,y:row*40,w:40,h:40,image:walk,scale:1/scale});
  const rows=Array.from({length:4},(_,row)=>Array.from({length:ANDY_WALK_FRAMES},(_,col)=>frame(row,col)));
  avatar.walkFront=rows[0];avatar.animations.right=rows[1];avatar.animations.left=rows[2];avatar.animations.up=rows[3];
  avatar.rest={idle:frame(0,8),right:frame(1,8),left:frame(2,8),up:frame(3,8)};
  avatar.animations.idle=[avatar.rest.idle!];avatar.animations.failed=[avatar.rest.idle!];avatar.animations.celebrate=[avatar.rest.idle!];
 }
 return avatar;
}
export async function importAvatar(file:Blob & {name?:string},name:string):Promise<AvatarDefinition>{
 if(!['image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)validateSheetShape(file.type,file.size,0,0);
 const url=URL.createObjectURL(file);let image:HTMLImageElement;
 try{image=await loadImage(url);}finally{URL.revokeObjectURL(url);}
 const version=validateSheetShape(file.type,file.size,image.width,image.height),data=pixels(image);
 let transparent=false;for(let i=3;i<data.length;i+=4)if(data[i]===0){transparent=true;break;}
 if(!transparent)throw Error('The sprite sheet needs a transparent background.');
 let left=Infinity,top=Infinity,right=-1,bottom=-1;const rows=version===2?[...REQUIRED_FRAMES,8,8]:REQUIRED_FRAMES;
 for(let row=0;row<rows.length;row++)for(let col=0;col<8;col++){
   const f={x:col*CELL_W,y:row*CELL_H,w:CELL_W,h:CELL_H},b=bounds(data,image.width,f);
   if(col<rows[row]&&!b)throw Error(`Missing pet pose in row ${row+1}, frame ${col+1}.`);
   if(col>=rows[row]&&b)throw Error(`Unused cells in row ${row+1} must be transparent.`);
   if(b&&row<9){left=Math.min(left,b.left);top=Math.min(top,b.top);right=Math.max(right,b.right);bottom=Math.max(bottom,b.bottom);}
 }
 // One shared crop and transform: jumping frames keep their authored vertical displacement.
 const frame=(row:number,col:number):Frame=>({x:col*CELL_W+left,y:row*CELL_H+top,w:right-left+1,h:bottom-top+1});
 const animations={} as Record<AnimationName,Frame[]>;
 for(const key of ['idle','left','right','up','celebrate','failed'] as AnimationName[]){const row=animationRow(key);animations[key]=Array.from({length:REQUIRED_FRAMES[row]},(_,i)=>frame(row,i));}
 return {id:'custom',name:cleanName(name),image,portrait:frame(0,0),animations,scale:Math.min(34/(bottom-top+1),32/(right-left+1)),anchor:{x:0,y:0},builtin:false};
}
export function cleanName(name:string):string{return name.trim().slice(0,24)||'My pet';}
export function drawAvatar(ctx:CanvasRenderingContext2D,avatar:AvatarDefinition,x:number,y:number,t:number,animation:AnimationName,moving=false,reduced=false,scale=1,walkDistance?:number){
 const walking=moving&&['idle','left','right','up'].includes(animation);
 const frames=walking&&animation==='idle'&&avatar.walkFront?avatar.walkFront:avatar.animations[animation];
 const phase=walking&&avatar.id==='andy'&&walkDistance!==undefined?Math.floor(walkDistance/ANDY_STRIDE*ANDY_WALK_FRAMES):Math.floor((reduced?0:t)*(walking?12:animation==='idle'?5:9));
 const f=avatar.id==='andy'&&!walking&&isAndyDirection(animation)?avatar.rest?.[animation]??frames[0]:frames[phase%frames.length];
 const s=avatar.scale*(f.scale??1)*scale,w=Math.round(f.w*s),h=Math.round(f.h*s);
 const bob=!reduced&&avatar.builtin?(animation==='celebrate'?Math.round(Math.abs(Math.sin(t*8))*5):moving&&avatar.id!=='andy'?Math.round(Math.abs(Math.sin(t*12))*2):0):0;
 ctx.imageSmoothingEnabled=false;ctx.drawImage(f.image??avatar.image,f.x,f.y,f.w,f.h,Math.round(x-w/2),Math.round(y-h-bob),w,h);
}
export function drawPortrait(canvas:HTMLCanvasElement,avatar:AvatarDefinition){const c=canvas.getContext('2d')!;c.clearRect(0,0,canvas.width,canvas.height);const f={...avatar.portrait};if(avatar.id==='andy')f.h=Math.round(f.h*.68);c.imageSmoothingEnabled=false;const s=Math.min((canvas.width-4)/f.w,(canvas.height-3)/f.h);c.drawImage(avatar.image,f.x,f.y,f.w,f.h,Math.round((canvas.width-f.w*s)/2),Math.round(canvas.height-f.h*s),Math.round(f.w*s),Math.round(f.h*s));}
type StoredPet={blob:Blob;name:string};
function db():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{let expired=false;const timer=setTimeout(()=>{expired=true;reject(Error('Pet storage is unavailable.'));},2500);let r:IDBOpenDBRequest;try{r=indexedDB.open('nowhere-pets',1);}catch(error){clearTimeout(timer);reject(error);return;}r.onupgradeneeded=()=>r.result.createObjectStore('pets');r.onsuccess=()=>{clearTimeout(timer);if(expired)r.result.close();else resolve(r.result);};r.onerror=()=>{clearTimeout(timer);reject(r.error);};r.onblocked=()=>{clearTimeout(timer);expired=true;reject(Error('Pet storage is blocked.'));};});}
export async function savePet(value:StoredPet):Promise<boolean>{try{const d=await db();await new Promise<void>((resolve,reject)=>{const tx=d.transaction('pets','readwrite');tx.objectStore('pets').put(value,'custom');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});d.close();return true;}catch{return false;}}
export async function readPet():Promise<StoredPet|null>{try{const d=await db();const v=await new Promise<StoredPet|undefined>((resolve,reject)=>{const r=d.transaction('pets').objectStore('pets').get('custom');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});d.close();return v??null;}catch{return null;}}
