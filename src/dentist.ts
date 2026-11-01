import {project,type Point} from './core';

export const DENTIST_FLOOR=43;
export const DENTIST_POSITION:Point={x:3.4,y:4.7};
export type DentistPose={position:Point;stage:'waiting'|'approach'|'examine'|'approve';toolRaised:boolean;toolOffset:number};
export type DentistOptions={age:number|null;time:number;reducedMotion:boolean;entryAge?:number};

/** The dentist waits by the chair, then steps toward the zipper for its checkup. */
export function dentistPose(age:number|null,reducedMotion=false,entryAge=Infinity):DentistPose {
 if(age===null){const arrival=reducedMotion?1:Math.max(0,Math.min(1,entryAge/.45));return {position:{x:DENTIST_POSITION.x-.35*(1-arrival),y:DENTIST_POSITION.y+.3*(1-arrival)},stage:'waiting',toolRaised:false,toolOffset:0};}
 const a=Math.max(0,age),step=reducedMotion?1:Math.min(1,a/.55),ease=step*step*(3-2*step);
 const stage=a<.55?'approach':a<2?'examine':'approve';
 return {position:{x:DENTIST_POSITION.x+1.05*ease,y:DENTIST_POSITION.y-.35*ease},stage,toolRaised:stage!=='approach',toolOffset:stage==='approve'?-4:reducedMotion?0:Math.floor(a*8)%2};
}

const INK='#10213d',WHITE='#fff6dc',SHADE='#b3d2d0',TEAL='#399c9d',GLOVE='#6bd0c1',SKIN='#dfaa79',LIGHT='#f7d6a0';
function rect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
function polygon(c:CanvasRenderingContext2D,points:Point[],color:string){
 c.fillStyle=color;
 for(let y=Math.floor(Math.min(...points.map(p=>p.y)));y<Math.ceil(Math.max(...points.map(p=>p.y)));y++){
  const hits:number[]=[];
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],scan=y+.5;if((a.y<=scan&&b.y>scan)||(b.y<=scan&&a.y>scan))hits.push(a.x+(scan-a.y)*(b.x-a.x)/(b.y-a.y));}
  hits.sort((a,b)=>a-b);for(let i=0;i+1<hits.length;i+=2){const x=Math.round(hits[i]);c.fillRect(x,y,Math.round(hits[i+1])-x,1);}
 }
}

/** A dedicated 39px professional sprite; all anatomy and tools stay on the pixel grid. */
export function drawDentist(c:CanvasRenderingContext2D,options:DentistOptions):void {
 const pose=dentistPose(options.age,options.reducedMotion,options.entryAge),at=project(pose.position);
 c.save();c.translate(Math.round(at.x),Math.round(at.y));c.imageSmoothingEnabled=false;
 polygon(c,[{x:-12,y:1},{x:0,y:-3},{x:12,y:1},{x:0,y:5}],'#28546766');
 // Navy trousers, planted shoes and the split hem keep the silhouette human.
 rect(c,-7,-10,6,9,INK);rect(c,2,-10,6,9,INK);rect(c,-6,-9,3,6,'#486f86');rect(c,3,-9,3,6,'#486f86');
 rect(c,-9,-3,8,3,INK);rect(c,2,-3,9,3,INK);rect(c,-8,-3,4,1,SHADE);rect(c,4,-3,4,1,SHADE);
 polygon(c,[{x:-9,y:-25},{x:7,y:-25},{x:10,y:-21},{x:10,y:-7},{x:1,y:-6},{x:0,y:-10},{x:-2,y:-6},{x:-10,y:-8},{x:-10,y:-20}],INK);
 polygon(c,[{x:-8,y:-24},{x:6,y:-24},{x:8,y:-20},{x:8,y:-8},{x:2,y:-8},{x:0,y:-13},{x:-3,y:-8},{x:-8,y:-9}],WHITE);
 rect(c,-8,-22,3,13,SHADE);rect(c,6,-20,2,12,'#d7e4cf');
 // Shirt, white lapels, buttons, breast pocket and a tiny pen.
 rect(c,-3,-24,7,8,TEAL);polygon(c,[{x:-5,y:-24},{x:-1,y:-21},{x:0,y:-17},{x:-5,y:-20}],WHITE);
 polygon(c,[{x:5,y:-24},{x:1,y:-21},{x:0,y:-17},{x:5,y:-20}],WHITE);
 rect(c,0,-15,1,1,INK);rect(c,0,-11,1,1,INK);rect(c,3,-16,4,3,SHADE);rect(c,4,-18,1,4,'#dc6655');
 // One hand carries a patient chart; the other holds the dental mirror.
 rect(c,-12,-22,5,11,INK);rect(c,-11,-21,3,7,WHITE);rect(c,-12,-14,5,5,TEAL);rect(c,-11,-14,3,3,GLOVE);
 rect(c,-15,-18,5,10,INK);rect(c,-14,-17,3,8,'#dfa858');rect(c,-14,-16,3,6,WHITE);rect(c,-13,-15,2,1,TEAL);rect(c,-13,-12,2,1,TEAL);
 const handY=pose.toolRaised?-24+pose.toolOffset:-13;
 rect(c,7,-23,5,11,INK);rect(c,8,-22,3,9,WHITE);
 if(pose.toolRaised){rect(c,10,handY+1,7,5,INK);rect(c,10,handY+2,5,3,WHITE);}else{rect(c,10,-16,4,5,INK);rect(c,10,-15,3,3,WHITE);}
 const handX=pose.toolRaised?15:11;
 rect(c,handX,handY,5,5,TEAL);rect(c,handX+1,handY,3,3,GLOVE);rect(c,handX+4,handY+1,2,2,GLOVE);
 const tipX=handX+7,tipY=handY-6;
 for(let i=0;i<6;i++)rect(c,handX+3+Math.floor(i*.7),handY+1-i,2,1,SHADE);
 rect(c,tipX-1,tipY,5,5,INK);rect(c,tipX,tipY,3,4,WHITE);rect(c,tipX+1,tipY+1,2,2,'#91c9d9');
 // Warm face, silver hair and a teal surgical mask with visible ear straps.
 rect(c,-6,-35,12,12,INK);rect(c,-5,-34,10,10,SKIN);rect(c,-4,-33,8,7,LIGHT);rect(c,5,-30,2,4,SKIN);
 rect(c,-6,-35,9,3,'#c0d2ca');rect(c,-5,-36,6,2,WHITE);rect(c,-6,-32,3,5,'#92aeac');
 const blink=!options.reducedMotion&&Math.floor(options.time*2)%17===15;
 rect(c,-1,-31,2,blink?1:2,INK);rect(c,3,-31,2,blink?1:2,INK);rect(c,-1,-33,2,1,'#816746');
 rect(c,-3,-28,9,5,TEAL);rect(c,-2,-28,7,2,GLOVE);rect(c,-2,-24,7,1,'#277e8b');rect(c,-5,-28,2,1,WHITE);rect(c,6,-28,1,1,WHITE);
 // Head mirror: broad silver band and a round, bright reflector.
 rect(c,-5,-34,11,2,'#467487');rect(c,1,-38,5,7,INK);rect(c,0,-37,7,5,INK);rect(c,1,-37,5,5,SHADE);rect(c,2,-38,3,7,SHADE);rect(c,2,-36,3,3,WHITE);rect(c,3,-35,1,1,'#5d91a4');
 if(pose.stage==='approve'){
  // A pleased mirror glint punctuates the successful inspection.
  rect(c,11,-37,1,5,'#edb94e');rect(c,9,-35,5,1,'#edb94e');rect(c,11,-35,1,1,WHITE);
 }
 c.restore();
}
