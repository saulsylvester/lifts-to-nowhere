import {project,type Point} from './core';
import {drawAvatar,type AvatarDefinition} from './avatars';

export const BLACK_HOLE_FLOOR=26;
export const BLACK_HOLE_DURATION=1.25;
export const BLACK_HOLE_PULL_DURATION=.38;
export const BLACK_HOLE_CAPTURE_RADIUS=13;
const TOP=35,BOTTOM=291;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
export type BlackHolePhase='pull'|'fall'|'fade';
export function blackHolePhase(age:number):BlackHolePhase{return age<BLACK_HOLE_PULL_DURATION?'pull':age<1.1?'fall':'fade';}
export function blackHolePose(origin:Point,hole:Point,age:number,reducedMotion=false){
 const a=Math.max(0,age),phase=blackHolePhase(a);
 if(phase==='pull'){
  const q=ease(a/BLACK_HOLE_PULL_DURATION),from=project(origin),to=project(hole);
  return {phase,position:{x:from.x+(to.x-from.x)*q,y:from.y-16+(to.y-11-(from.y-16))*q},scale:1-q*.68,rotation:reducedMotion?0:q*.85,fade:0};
 }
 const q=clamp((a-BLACK_HOLE_PULL_DURATION)/(BLACK_HOLE_DURATION-BLACK_HOLE_PULL_DURATION));
 return {phase,position:{x:240+(reducedMotion?0:Math.sin(q*Math.PI*2)*12),y:76+Math.pow(q,1.5)*220},scale:2.2-q*1.35,rotation:reducedMotion?0:-.25+q*1.65,fade:ease((a-1.1)/.15)};
}

function rect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
/** Hard-edged scanlines keep tunnel rings on the same pixel grid as the room. */
function ring(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string,thickness=2,frontOnly=false){
 for(let dy=frontOnly?0:-Math.ceil(ry);dy<=ry;dy++){
  const outer=Math.floor(rx*Math.sqrt(Math.max(0,1-dy*dy/(ry*ry))));
  const iy=ry-thickness,ix=rx-thickness;
  const inner=Math.abs(dy)<iy?Math.floor(ix*Math.sqrt(Math.max(0,1-dy*dy/(iy*iy)))):0;
  rect(c,x-outer,y+dy,Math.max(1,outer-inner),1,color);rect(c,x+inner,y+dy,Math.max(1,outer-inner+1),1,color);
 }
}
type Options={origin:Point;hole:Point;age:number;time:number;reducedMotion:boolean;avatar:AvatarDefinition};

/** A short pull into the floor aperture, followed by an unmistakable downward fall. */
export function drawBlackHoleCutscene(c:CanvasRenderingContext2D,options:Options){
 const {origin,hole,age,time,reducedMotion,avatar}=options,pose=blackHolePose(origin,hole,age,reducedMotion);
 c.save();c.imageSmoothingEnabled=false;c.beginPath();c.rect(0,TOP,480,BOTTOM-TOP);c.clip();
 if(pose.phase!=='pull'){
  rect(c,0,TOP,480,BOTTOM-TOP,'#080f23');
  // Purple tunnel walls frame a deep central shaft. Everything streams upward.
  for(let i=0;i<5;i++){
   const x=18+i*18;rect(c,x,TOP,12,BOTTOM-TOP,i%2?'#151b39':'#11162e');rect(c,480-x-12,TOP,12,BOTTOM-TOP,i%2?'#151b39':'#11162e');
  }
  ring(c,240,52,66,15,'#34335b',3);ring(c,240,52,58,11,'#bc9350',2);
  for(let i=0;i<5;i++){
   const y=reducedMotion?83+i*53:TOP+((i*63-age*160)%300+300)%300;
   ring(c,240,y,112+(y-TOP)*.28,17,'#222443',2);
  }
  for(let i=0;i<42;i++){
   const x=111+(i*67)%258,y=reducedMotion?TOP+(i*47)%256:TOP+((i*47-age*(105+i%5*18))%256+256)%256;
   rect(c,x,y,1,reducedMotion?1:3+i%7,i%4?'#455776':'#e4bd6a');
  }
 }else if(!reducedMotion){
  const at=project(hole),q=clamp(age/BLACK_HOLE_PULL_DURATION);
  for(let i=0;i<9;i++){
   const angle=i*Math.PI*2/9+age*5,radius=(1-q)*35+8;
   rect(c,at.x+Math.cos(angle)*radius,at.y-11+Math.sin(angle)*radius*.45,2,2,i%2?'#edb94e':'#a29dd4');
  }
 }
 // Rotate around the explorer's centre, rather than making its feet orbit it.
 c.save();c.translate(Math.round(pose.position.x),Math.round(pose.position.y));c.rotate(pose.rotation);
 drawAvatar(c,avatar,0,16*pose.scale,time,'failed',false,reducedMotion,pose.scale);c.restore();
 if(pose.phase==='pull'&&age>.22){const at=project(hole);ring(c,at.x,at.y-11,21,10,'#edb94e',2,true);}
 if(pose.fade>0){c.globalAlpha=Math.ceil(pose.fade*5)/5;rect(c,0,TOP,480,BOTTOM-TOP,'#080f23');}
 c.restore();
}
