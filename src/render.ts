import {project,type Point} from './core';
import {drawProp,roomEffect,transformProp} from './catalogue-art';
import {drawAvatar,loadImage,type AvatarDefinition,type AnimationName,type Frame} from './avatars';
import {lobbyProps,DOOR,LIFT_DOOR,ROOM_DOOR,PANEL,sceneLayout,type RoomDefinition,type Prop} from './rooms';
import {drawFlood,floodLevel} from './flood';
import {drawIsometricProp} from './isometric-props';
import {SPACE_FLOOR,spacePlanetsAt,drawSpaceBackdrop,drawSpacePlanet} from './space';
import {drawPlantEncounter,plantExplorerPose,plantEncounterPhase} from './plant-encounter';
import {FLIP_FLOOR,flipView} from './upside-down';
import {DENTIST_FLOOR,dentistPose,drawDentist} from './dentist';
import {BLACK_HOLE_FLOOR,drawBlackHoleCutscene} from './black-hole';
export type GameState='lobby'|'elevator'|'travel'|'room'|'gameover';
export type Model={state:GameState;floor:number;room:RoomDefinition|null;player:Point;facing:AnimationName;moving:boolean;walkDistance?:number;roomEnteredAt?:number;spaceStart?:number|null;locomotion:'walk'|'swim'|'float';velocity:Point;started:boolean;effect:{start:number;deadly?:boolean;rewarded?:boolean;origin:Point}|null;floodStart:number|null;flipStart?:number|null;travelStart:number;destination:number;reducedMotion:boolean;celebration:number;avatar:AvatarDefinition;collected:Set<number>};
const INK='#10213d',GOLD='#edb94e',CREAM='#fff0bf';
export const themes:Record<string,{wall:string;panel:string;floor:string;tile:string;trim:string}>={
 plum:{wall:'#f5dba5',panel:'#2d8898',floor:'#fff0c9',tile:'#65b9ba',trim:'#ad7141'},
 ember:{wall:'#ffdb95',panel:'#b73d45',floor:'#ffe1a1',tile:'#dd8a4f',trim:'#9b4a35'},
 moss:{wall:'#e0eaa1',panel:'#28764f',floor:'#fff1c5',tile:'#77ba70',trim:'#957343'},
 ocean:{wall:'#76b6ce',panel:'#20549b',floor:'#76d5d6',tile:'#2c91af',trim:'#d59d45'},
 paper:{wall:'#f4ddb1',panel:'#bb7450',floor:'#ffeecd',tile:'#d6ad78',trim:'#975634'},
 night:{wall:'#8a96c7',panel:'#343d82',floor:'#b2b5dc',tile:'#596bae',trim:'#e4ab4b'},
 sky:{wall:'#f7e7ad',panel:'#3b84ae',floor:'#fff5d6',tile:'#88cbd9',trim:'#b17c40'},
 rose:{wall:'#ffcfb5',panel:'#b44872',floor:'#ffe5c7',tile:'#e797ad',trim:'#b47b49'},
 stone:{wall:'#d3d9c1',panel:'#51798a',floor:'#ece6c7',tile:'#8dadae',trim:'#ad8750'},
 mint:{wall:'#d6edb9',panel:'#259c91',floor:'#edf1c5',tile:'#8acbb0',trim:'#bc9350'},
 sand:{wall:'#ffe5a0',panel:'#b57f45',floor:'#fff0bf',tile:'#e7bb68',trim:'#9e653b'},
};
let ctx:CanvasRenderingContext2D;
const rect=(x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function poly(p:Point[],color:string){ctx.fillStyle=color;ctx.beginPath();p.forEach((a,i)=>i?ctx.lineTo(Math.round(a.x),Math.round(a.y)):ctx.moveTo(Math.round(a.x),Math.round(a.y)));ctx.closePath();ctx.fill();}
function line(a:Point,b:Point,color:string,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(Math.round(a.x)+.5,Math.round(a.y)+.5);ctx.lineTo(Math.round(b.x)+.5,Math.round(b.y)+.5);ctx.stroke();}
function text(s:string,x:number,y:number,c=CREAM,size=7,align:CanvasTextAlign='center'){ctx.font=`${size}px Silkscreen, monospace`;ctx.textAlign=align;ctx.fillStyle=c;ctx.fillText(s,Math.round(x),Math.round(y));}
function diamond(p:Point,w:number,h:number,c:string){poly([{x:p.x,y:p.y-h},{x:p.x+w,y:p.y},{x:p.x,y:p.y+h},{x:p.x-w,y:p.y}],c);}
function spark(x:number,y:number,c=GOLD){rect(x-1,y-4,2,8,c);rect(x-4,y-1,8,2,c);rect(x-2,y-2,4,4,CREAM);}
function plane(u:number,v:number,w:number,h:number,z:number,c:string){poly([project({x:u,y:v},z),project({x:u+w,y:v},z),project({x:u+w,y:v+h},z),project({x:u,y:v+h},z)],c);}
type Art={image:HTMLImageElement;frames:Frame[]};
const art:Record<string,Art>={};
export async function loadArt(){
 await Promise.all(['furniture','heroes'].map(async name=>{
   const source=await loadImage(`/art/${name}.png`),c=document.createElement('canvas');c.width=source.width;c.height=source.height;const g=c.getContext('2d',{willReadFrequently:true})!;g.drawImage(source,0,0);const pixels=g.getImageData(0,0,c.width,c.height);
   // Generated sprite sources include soft alpha fringes: threshold for the game's hard pixel grid.
   for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]<180?0:255;
   g.putImageData(pixels,0,0);const image=await loadImage(c.toDataURL());const frames:Frame[]=[];
   for(let row=0;row<2;row++)for(let col=0;col<2;col++){
     let left=Infinity,top=Infinity,right=-1,bottom=-1;const x0=col*c.width/2,y0=row*c.height/2;
     for(let y=y0;y<y0+c.height/2;y++)for(let x=x0;x<x0+c.width/2;x++)if(pixels.data[(y*c.width+x)*4+3]){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
     frames.push({x:left,y:top,w:right-left+1,h:bottom-top+1});
   }
   art[name]={image,frames};
 }));
}
function asset(name:string,index:number,x:number,y:number,w:number,h?:number){const a=art[name];if(!a)return;const f=a.frames[index];const height=h??Math.round(w*f.h/f.w);ctx.drawImage(a.image,f.x,f.y,f.w,f.h,Math.round(x-w/2),Math.round(y-height),Math.round(w),Math.round(height));}
function shadow(x:number,y:number,w=13){diamond({x,y},w,4,'#244b6070');}
const spriteCache=new Map<string,HTMLCanvasElement>();
const encounterPalettes=new WeakMap<AvatarDefinition,string[]>();
function explorerFragmentColors(avatar:AvatarDefinition):string[]{
 const cached=encounterPalettes.get(avatar);if(cached)return cached;
 const colors:string[]=[];
 try{
  const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;
  const c=canvas.getContext('2d',{willReadFrequently:true})!,f=avatar.portrait;c.imageSmoothingEnabled=false;c.drawImage(avatar.image,f.x,f.y,f.w,f.h,0,0,32,32);
  const pixels=c.getImageData(0,0,32,32).data,histogram=new Map<string,{rgb:number[];count:number}>();
  for(let i=0;i<pixels.length;i+=4){
   if(pixels[i+3]<200)continue;
   const rgb=[pixels[i],pixels[i+1],pixels[i+2]].map(v=>Math.min(255,Math.round(v/24)*24));
   if(Math.max(...rgb)<55)continue;
   const key=rgb.join(',');histogram.set(key,{rgb,count:(histogram.get(key)?.count??0)+1});
  }
  const chosen:number[][]=[];
  for(const {rgb} of [...histogram.values()].sort((a,b)=>b.count-a.count)){
   if(chosen.some(other=>Math.hypot(...rgb.map((v,i)=>v-other[i]))<60))continue;
   chosen.push(rgb);colors.push(`#${rgb.map(v=>v.toString(16).padStart(2,'0')).join('')}`);if(colors.length===5)break;
  }
 }catch{/* Unusual imported image sources still receive a visible fragment palette. */}
 if(!colors.length)colors.push('#edb94e','#ef6655','#65b9ba');
 encounterPalettes.set(avatar,colors);return colors;
}
function catalogueSprite(kind:string,t:number,active=false,progress=0,variant=0){
 const key=`${kind}/${Math.floor(t*6)%36}/${active?1:0}/${Math.floor(progress*12)}/${variant}`;
 let canvas=spriteCache.get(key);if(canvas)return canvas;
 canvas=document.createElement('canvas');canvas.width=120;canvas.height=128;const c=canvas.getContext('2d',{willReadFrequently:true})!;c.imageSmoothingEnabled=false;
 drawProp(c,{kind,x:60,y:118,variant},Math.floor(t*6)/6,active,progress);
 const data=c.getImageData(0,0,120,128),copy=new Uint8ClampedArray(data.data);
 for(let y=1;y<127;y++)for(let x=1;x<119;x++){
   const i=(y*120+x)*4;
   if(copy[i+3]<150){data.data[i+3]=0;const adjacent=[i-4,i+4,i-480,i+480].some(k=>copy[k+3]>=200);if(adjacent){data.data[i]=16;data.data[i+1]=33;data.data[i+2]=61;data.data[i+3]=255;}}
   else data.data[i+3]=255;
 }
 c.putImageData(data,0,0);if(spriteCache.size>700)spriteCache.clear();spriteCache.set(key,canvas);return canvas;
}
function prop(p:Prop,t:number,active=false,progress=0){
 const a=project(p);shadow(a.x,a.y,p.w*10);
 if(drawIsometricProp(ctx,p))return;
 if(p.kind==='sofa')asset('furniture',0,a.x,a.y,69);
 else if(p.kind==='plant')asset('furniture',2,a.x,a.y,34);
 else if(p.kind==='cloud'&&p.variant===9)asset('heroes',0,a.x,a.y+(active?Math.round(Math.sin(t*3)*3):0),63);
 else if(p.kind==='jellyfish')asset('heroes',1,a.x,a.y+(active?-8:0)+Math.round(Math.sin(t*2)*2),p.variant===9?74:39);
 else if(p.kind==='carnivore')asset('heroes',2,a.x,a.y,active?99+Math.round(Math.sin(t*8)*3):96);
 else {const sprite=catalogueSprite(p.kind,t,active,progress,p.variant);ctx.drawImage(sprite,Math.round(a.x)-60,Math.round(a.y)-118);}
}
type WallSide=0|1;
function wallPoint(side:WallSide,k:number,z:number){return project(side===0?{x:k,y:0}:{x:0,y:k},z);}
function wallPanel(side:WallSide,from:number,to:number,bottom:number,top:number,color:string){
 poly([wallPoint(side,from,bottom),wallPoint(side,to,bottom),wallPoint(side,to,top),wallPoint(side,from,top)],color);
}
function wallLabel(side:WallSide,k:number,z:number,label:string,color=GOLD,size=6){
 const at=wallPoint(side,k,z);ctx.save();ctx.transform(1,side===0?.5:-.5,0,1,Math.round(at.x),Math.round(at.y));text(label,0,0,color,size);ctx.restore();
}
function fixtureSpans(kind:string,side:WallSide):[number,number][]{
 const spans:[number,number][]=[];
 if(side===0){
  if(kind==='lobby')spans.push([.85,3.65]); // Bookcase is fitted against this wall.
  if(kind==='lobby')spans.push([DOOR.x-1.55,DOOR.x+1.55]);
  if(kind==='room'||kind==='gameover')spans.push([ROOM_DOOR.x-1.55,ROOM_DOOR.x+1.55]);
  if(kind==='elevator'||kind==='travel')spans.push([LIFT_DOOR.x-1.5,LIFT_DOOR.x+1.5],[PANEL.x-.45,PANEL.x+.45]);
 }
 return spans;
}
function architecture(p:typeof themes.plum,kind:string){
 const {width,height}=sceneLayout(kind),cabin=kind==='elevator'||kind==='travel';
 const corners=[project({x:0,y:0}),project({x:width,y:0}),project({x:width,y:height}),project({x:0,y:height})];
 poly(corners.map(a=>({x:a.x,y:a.y+10})),INK);
 for(let v=0;v<height;v++)for(let u=0;u<width;u++){
   plane(u,v,1,1,0,(u+v)%2?p.tile:p.floor);
   const a=project({x:u,y:v});line(a,project({x:u+1,y:v}),'#fff4c44a');
   if(kind==='room'&&p===themes.ocean&&u%3===1&&v%3===1){const at=project({x:u+.5,y:v+.5});rect(at.x,at.y-1,1,3,GOLD);rect(at.x-1,at.y,3,1,GOLD);}
 }
 // Every fixture shares the wall's ground coordinate and 2:1 slope.
 for(const side of [0,1] as WallSide[]){
   const length=side===0?width:height,spans=fixtureSpans(kind,side);
   const occupied=(from:number,to:number)=>spans.some(([a,b])=>from<b&&to>a);
   for(let k=0;k<length;k++){
     wallPanel(side,k,k+1,0,58,p.wall);
     wallPanel(side,k,k+1,0,16,p.panel);
     line(wallPoint(side,k,17),wallPoint(side,k+1,17),GOLD,2);
     line(wallPoint(side,k,1),wallPoint(side,k+1,1),p.trim,2);
     line(wallPoint(side,k,58),wallPoint(side,k+1,58),INK,6);
     line(wallPoint(side,k,60),wallPoint(side,k+1,60),p.trim,4);
     line(wallPoint(side,k,62),wallPoint(side,k+1,62),CREAM,1);
     line(wallPoint(side,k,4),wallPoint(side,k,14),'#fff0bf55');
     if(k%3===0&&!occupied(k-.15,k+.15)){line(wallPoint(side,k,2),wallPoint(side,k,57),p.trim,4);line(wallPoint(side,k,3),wallPoint(side,k,56),GOLD,1);}
     if(k%3===1&&!occupied(k+.15,k+.85)){
      wallPanel(side,k+.33,k+.67,27,35,GOLD);wallPanel(side,k+.4,k+.6,29,34,CREAM);
      line(wallPoint(side,k+.5,26),wallPoint(side,k+.5,23),p.trim);
     }
   }
   if(cabin){
    // A narrow cabin with inlaid brass panelling and a continuous handrail.
    for(let k=.35;k<length-.4;k+=1.35)if(!occupied(k,k+.85)){
     wallPanel(side,k,k+.85,24,48,p.trim);wallPanel(side,k+.08,k+.77,25,47,'#d6b46c');wallPanel(side,k+.16,k+.69,27,45,'#e9cf89');
    }
    if(side===1){line(wallPoint(side,.3,22),wallPoint(side,length-.3,22),INK,4);line(wallPoint(side,.3,23),wallPoint(side,length-.3,23),GOLD,2);}
    continue;
   }
   for(const k of [2.1,6.5]){
     if(k+1.8>length||occupied(k-.2,k+1.8))continue;
     wallPanel(side,k,k+1.6,21,51,INK);wallPanel(side,k+.08,k+1.52,22,50,GOLD);wallPanel(side,k+.22,k+1.38,24,48,'#2688c4');
     wallPanel(side,k+.23,k+1.37,24,29,'#66c8db');wallPanel(side,k+.23,k+.7,34,38,'#fff7d8');wallPanel(side,k+.55,k+1.15,35,40,'#fff7d8');
     wallPanel(side,k+.8,k+.88,23,49,p.trim);line(wallPoint(side,k+.15,33),wallPoint(side,k+1.45,33),GOLD,1);
     wallPanel(side,k-.12,k+.05,20,51,'#b63850');wallPanel(side,k-.12,k-.03,21,50,'#ef6870');wallPanel(side,k+1.55,k+1.72,20,51,'#b63850');
     line(wallPoint(side,k-.18,52),wallPoint(side,k+1.78,52),p.trim,3);line(wallPoint(side,k-.18,53),wallPoint(side,k+1.78,53),GOLD,1);
   }
 }
 // Low foreground skirting keeps the explorer visible.
 line(corners[1],corners[2],p.trim,3);line(corners[2],corners[3],p.trim,3);
}
function carpet(cabin=false){
 const x=cabin?2.3:5.3,y=.3,length=cabin?3.8:7.7;
 plane(x,y,1.4,length,1,'#982f51');plane(x+.12,y+.12,1.16,length-.24,2,'#df4b60');
 for(let v=.9;v<length;v+=1.15){const a=project({x:x+.7,y:v},3);diamond(a,4,2,GOLD);}
}
function wallDoor(at:Point,side:WallSide,open:boolean,label:string){
 const k=side===0?at.x:at.y,half=1.35;
 const panel=(from:number,to:number,bottom:number,top:number,c:string)=>wallPanel(side,k+from,k+to,bottom,top,c);
 const edge=(from:number,to:number,z:number,c:string,w=1)=>line(wallPoint(side,k+from,z),wallPoint(side,k+to,z),c,w);
 // All room exits are the same brass lift doors, mounted on the floor seam.
 if(side===0)plane(k-half,.02,half*2,.32,.6,'#9b6841');else plane(.02,k-half,.32,half*2,.6,'#9b6841');
 panel(-half-.12,half+.12,0,56,INK);panel(-half,half,1,55,GOLD);panel(-half+.16,half-.16,2,51,'#8c4f31');
 const inner=half-.28;
 panel(-inner,inner,3,49,open?'#13263d':'#c58b27');
 // Recessed brass leaves, relief strips, red pilasters and a small display.
 panel(-half,-half+.16,4,51,'#9d3048');panel(half-.16,half,4,51,'#9d3048');
 for(const sign of [-1,1]){
  const lo=sign<0?-inner+.07:open?inner-.33:.06,hi=sign<0?(open?-inner+.33:-.06):inner-.07;
  panel(lo,hi,4,48,'#e4b43b');panel(lo+.07,hi-.07,6,46,'#f3ca5d');
  if(!open){panel(lo+.15,hi-.15,8,44,'#d5a236');for(let z=13;z<42;z+=7)panel(lo+.18,hi-.18,z,z+2,'#e9bd48');}
  edge(lo+.12,hi-.12,44,CREAM);edge(lo+.12,hi-.12,8,'#a1692f');
 }
 if(!open)line(wallPoint(side,k,3),wallPoint(side,k,49),INK);
 const displayHalf=label.length>2?.62:.44;
 panel(-displayHalf,displayHalf,51,58,INK);panel(-displayHalf+.08,displayHalf-.08,52,57,'#26384b');wallLabel(side,k,52.5,label,CREAM,5);
 edge(-half-.08,half+.08,58,GOLD,3);edge(-half-.1,half+.1,59,CREAM);
 for(const sign of [-1,1]){panel(sign*half-.12,sign*half+.12,0,5,GOLD);panel(sign*half-.12,sign*half+.12,51,56,GOLD);}
 edge(-half,half,1,CREAM);
}
function keypad(floor:number,travelling:boolean){
 const k=PANEL.x;
 wallPanel(0,k-.42,k+.42,18,42,INK);wallPanel(0,k-.35,k+.35,19,41,GOLD);wallPanel(0,k-.29,k+.29,20,40,'#f5d173');
 wallPanel(0,k-.24,k+.24,32,38,INK);wallLabel(0,k,33,travelling?'^':String(floor||'G'),CREAM,4);
 for(let row=0;row<3;row++)for(let col=0;col<2;col++){
  const x=k-.22+col*.27,z=23+row*3.2;wallPanel(0,x,x+.15,z,z+2,INK);wallPanel(0,x+.025,x+.125,z+.4,z+1.7,row===0?'#b83d50':'#fff0bf');
 }
}
function roomExtras(room:RoomDefinition,t:number){
 const p=themes[room.palette];
 for(const at of [{x:1.1,y:8.4},{x:10.5,y:3.5}])prop({...at,kind:'plant',w:.7,h:.7,solid:false,variant:0},t);
 if(room.id===7){for(const at of [{x:1.8,y:3},{x:8.7,y:1.3},{x:1.6,y:6.7}])drawIsometricProp(ctx,{...at,kind:'shelf',w:1.6,h:.55,solid:false,variant:0});}
 if(room.id===73){const a=project({x:2,y:5});asset('furniture',0,a.x,a.y,50);}
 const plaque=project({x:0,y:4},28);rect(plaque.x-14,plaque.y-10,28,15,p.trim);rect(plaque.x-12,plaque.y-8,24,11,INK);text(String(room.id).padStart(3,'0'),plaque.x,plaque.y,GOLD,6);
}
/** A tiny mechanical shudder in native pixels, isolated from the fixed HUD. */
export function travelOffset(time:number,start:number,reducedMotion:boolean):number {
 return reducedMotion?0:[0,-1,1,-2,1,0,2,-1][Math.floor(Math.max(0,time-start)*14)%8];
}
export function render(context:CanvasRenderingContext2D,model:Model,time:number){
 ctx=context;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,480,320);
 const t=model.reducedMotion?0:time;
 rect(0,0,480,320,'#122b49');
 for(let i=0;i<55;i++){const x=(i*83+11)%480,y=(i*53+9)%320;rect(x,y,1,1,i%3?'#24445e':'#577575');}
 const room=model.room,theme=themes[(model.state==='room'||model.state==='gameover')&&room?room.palette:'plum'];
 const cabin=model.state==='elevator'||model.state==='travel';
 const space=(model.state==='room'||model.state==='gameover')&&room?.id===SPACE_FLOOR;
 const planets=space?spacePlanetsAt(model.spaceStart==null?null:Math.max(0,time-model.spaceStart),model.reducedMotion):[];
 const flooded=(model.state==='room'||model.state==='gameover')&&room?.id===4&&model.floodStart!==null;
 const floodAge=flooded?Math.max(0,time-model.floodStart!):0;
 const age=model.effect?time-model.effect.start:null;
 const blackHole=model.state==='room'&&room?.id===BLACK_HOLE_FLOOR&&age!==null?{origin:model.effect!.origin,hole:room.props[0],age,time,reducedMotion:model.reducedMotion,avatar:model.avatar}:null;
 const plantEncounter=model.effect?.deadly&&room&&age!==null?{plant:room.props[0],origin:model.effect.origin,age,time,reducedMotion:model.reducedMotion,avatarId:model.avatar.id,avatarColors:explorerFragmentColors(model.avatar)}:null;
 const idlePlant=!plantEncounter&&room?.id===101&&(model.state==='room'||model.state==='gameover')?{plant:room.props[0],origin:model.player,age:0,time,reducedMotion:model.reducedMotion,avatarId:model.avatar.id}:null;
 const nearDoor=(at:Point)=>Math.hypot(model.player.x-at.x,model.player.y-at.y)<1.65;
 ctx.save();if(cabin)ctx.translate(8,30+(model.state==='travel'?travelOffset(time,model.travelStart,model.reducedMotion):0));
 // Everything physically in the bakery shares one view transform, including
 // doors, collisions' visual anchors, shadows and active discovery artwork.
 if((model.state==='room'||model.state==='gameover')&&room?.id===FLIP_FLOOR&&model.flipStart!=null){
  ctx.transform(...flipView(Math.max(0,time-model.flipStart),model.reducedMotion).matrix);
 }
 if(plantEncounter&&!model.reducedMotion){const phase=plantEncounterPhase(plantEncounter.age);if(phase==='swallowing'||phase==='burst')ctx.translate([0,1,-1,0][Math.floor(plantEncounter.age*18)%4],0);}
 if(space)drawSpaceBackdrop(ctx,time,model.reducedMotion);else architecture(theme,model.state);
 if(flooded)drawFlood(ctx,time,floodAge,model.reducedMotion,'base');
 if(model.state==='lobby'||cabin)carpet(cabin);
 if(model.state==='lobby')wallDoor(DOOR,0,nearDoor(DOOR),'G');
 if(cabin){wallDoor(LIFT_DOOR,0,model.state!=='travel'&&nearDoor(LIFT_DOOR),String(model.floor||'G'));keypad(model.floor,model.state==='travel');}
 if(model.state==='room'||model.state==='gameover')wallDoor(ROOM_DOOR,0,nearDoor(ROOM_DOOR),'LIFT');
 if(plantEncounter)drawPlantEncounter(ctx,plantEncounter,'back');
 else if(idlePlant)drawPlantEncounter(ctx,idlePlant,'back');
 if((model.state==='room'||model.state==='gameover')&&room&&!space)roomExtras(room,t);
 const props=model.state==='lobby'?lobbyProps:!space&&(model.state==='room'||model.state==='gameover')&&room?room.props:[];
 const sprites:{depth:number;draw:()=>void}[]=props.map((p,i)=>({depth:p.x+p.y,draw:()=>{
  if(model.state==='lobby'&&p.kind==='table'){const a=project(p);asset('furniture',1,a.x,a.y,67);return;}
  if(plantEncounter){if(p.kind==='carnivore')drawPlantEncounter(ctx,plantEncounter,'plant');else prop(p,t);return;}
  if(idlePlant&&p.kind==='carnivore'){drawPlantEncounter(ctx,idlePlant,'plant');return;}
  let point={...p};let scale=1;
  if(age!==null&&room&&!model.reducedMotion){const a=project(p);const legacy={...room,props:room.props.map(q=>({...q,...project(q)}))};const tr=transformProp({...p,...a},i,{room:legacy},t,age);const dx=tr.x-a.x,dy=tr.y-a.y;ctx.save();ctx.translate(dx,dy);scale=tr.scale;const origin=project(p);ctx.translate(origin.x,origin.y);ctx.scale(scale,scale);ctx.translate(-origin.x,-origin.y);prop(point,t,true,age/2.6);ctx.restore();}
  else prop(point,t,age!==null,age===null?0:age/2.6);
 }}));
 if(space)for(const planet of planets)sprites.push({depth:planet.x+planet.y,draw:()=>drawSpacePlanet(ctx,planet,time,model.reducedMotion,age!==null)});
 if(space&&room)for(const p of room.props.filter(p=>p.kind!=='planet'))sprites.push({depth:p.x+p.y,draw:()=>{const at=project(p,18);ctx.drawImage(catalogueSprite(p.kind,t,age!==null,age===null?0:age/2.6,p.variant),Math.round(at.x)-60,Math.round(at.y)-118);}});
 if((model.state==='room'||model.state==='gameover')&&room?.id===DENTIST_FLOOR){
  const entryAge=model.roomEnteredAt==null?Infinity:Math.max(0,time-model.roomEnteredAt),pose=dentistPose(age,model.reducedMotion,entryAge);
  sprites.push({depth:pose.position.x+pose.position.y,draw:()=>drawDentist(ctx,{age,time:t,reducedMotion:model.reducedMotion,entryAge})});
 }
 let animation=(model.moving||model.avatar.id==='andy')?model.facing:'idle';if(age!==null&&!model.effect?.deadly)animation='celebrate';
 let player=project(model.player),playerScale=1,playerRotation=0,visible=!blackHole;
 if(plantEncounter){const pose=plantExplorerPose(plantEncounter.origin,plantEncounter.plant,plantEncounter.age,model.reducedMotion);player=pose.position;playerScale=pose.scale;playerRotation=pose.rotation;visible=pose.visible;animation='failed';}
 const playerPoint=player;
 sprites.push({depth:model.player.x+model.player.y+.01,draw:()=>{if(visible){
  if(plantEncounter){if(plantEncounter.age<1.25)shadow(playerPoint.x,playerPoint.y,8);ctx.save();ctx.translate(Math.round(playerPoint.x),Math.round(playerPoint.y));ctx.rotate(playerRotation);drawAvatar(ctx,model.avatar,0,0,t,'failed',false,model.reducedMotion,playerScale);ctx.restore();return;}
  const aquatic=model.locomotion==='swim'&&flooded,weightless=model.locomotion==='float'&&space;
  const airborne=(aquatic||weightless)&&!model.effect?.deadly;
  if(!airborne){shadow(playerPoint.x,playerPoint.y,8);drawAvatar(ctx,model.avatar,playerPoint.x,playerPoint.y,t,animation as AnimationName,model.moving,model.reducedMotion,playerScale,model.walkDistance);return;}
  const speed=Math.hypot(model.velocity.x,model.velocity.y),direction=model.velocity.x<-.5?-1:model.velocity.x>.5?1:model.facing==='left'?-1:1;
  // In space the body centre shares the planets' 18px plane, matching collision.
  const elevation=aquatic?18*floodLevel(floodAge):4;
  const bob=model.reducedMotion?0:Math.round(Math.sin(t*(aquatic?2.5:1.8))*2);
  const pivot={x:Math.round(playerPoint.x),y:Math.round(playerPoint.y-elevation-14+bob)};
  const tilt=model.reducedMotion?0:(aquatic?direction*.32:direction*.1)+Math.max(-.12,Math.min(.12,model.velocity.y*.0015));
  // Whole-body paddling and drifting; the explorer never stands on the water.
  if(speed>2||aquatic)for(let i=0;i<3;i++){
   const nx=speed>2?model.velocity.x/speed:direction,ny=speed>2?model.velocity.y/speed:0;
   const distance=12+i*7,rise=model.reducedMotion?i:Math.floor(t*4+i*2)%5;
   const x=Math.round(pivot.x-nx*distance),y=Math.round(pivot.y-ny*distance+5-rise);
   if(aquatic){rect(x,y,3,1,'#d1f4e0');rect(x-1,y+1,1,2,'#83dcd4');rect(x+3,y+1,1,2,'#83dcd4');rect(x,y+3,3,1,'#48b9c4');}
   else{rect(x,y,2,2,i===0?'#fff0bf':'#69b9d0');if(i===0){rect(x-1,y+1,4,1,'#fff0bf');}}
  }
  ctx.save();ctx.translate(pivot.x,pivot.y);ctx.rotate(tilt);
  const pose=age!==null?animation:direction<0?'left':'right';
  drawAvatar(ctx,model.avatar,0,14,t,pose as AnimationName,false,model.reducedMotion,playerScale);ctx.restore();
 }}});
 sprites.sort((a,b)=>a.depth-b.depth).forEach(s=>s.draw());
 if(plantEncounter)drawPlantEncounter(ctx,plantEncounter,'front');
 if(flooded)drawFlood(ctx,time,floodAge,model.reducedMotion,'surface');
 if((model.state==='room'||model.state==='gameover')&&room){
  if(age!==null&&!plantEncounter&&!blackHole){let planetIndex=0;const mapped={...room,props:room.props.map(p=>{const at=space&&p.kind==='planet'?planets[planetIndex++]:p;return {...p,...project(at)};})};const c=project(model.player);roomEffect(ctx,{room:mapped,andy:c,effect:model.effect,reducedMotion:model.reducedMotion,explorerName:model.avatar.name,drawExplorer:(x:number,y:number)=>drawAvatar(ctx,model.avatar,x,y,t,'idle',false,model.reducedMotion)},t,model.reducedMotion?1.2:age);}
  else if(age===null&&!model.collected.has(room.id)&&!room.deadly){const a=project(space?planets[0]:room.props[0]);spark(a.x,a.y-(space?planets[0].z+planets[0].radius+7:room.id===7?86:room.id===73?86:56)+Math.round(Math.sin(t*3)*2));}
 }
 ctx.restore();
 if(blackHole)drawBlackHoleCutscene(ctx,blackHole);
 if((model.state==='room'||model.state==='gameover')&&room&&model.collected.has(room.id)&&!blackHole)text('✦ DISCOVERED',240,287,GOLD,7);
 if(model.state==='travel'){text('BETWEEN HERE & ELSEWHERE',240,284,GOLD,7);for(let i=0;i<6;i++)rect(201+i*14,295,9,3,(time-model.travelStart)*3>i?GOLD:'#37556c');}
 if(model.celebration>time&&!model.reducedMotion)for(let i=0;i<48;i++)rect((i*71)%480,(time*32+i*17)%320,2,3,['#ffd85b','#f0708a','#60c9b7'][i%3]);
}
