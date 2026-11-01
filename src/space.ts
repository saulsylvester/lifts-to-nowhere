import {project,unproject,type Point} from './core';

export const SPACE_FLOOR=87;
export type SpacePlanet=Point & {radius:number;z:number;kind:'jellybean'|'mint'|'ringed'|'peach';colors:[string,string,string]};
export const spacePlanets:SpacePlanet[]=[
 {x:4.7,y:3.6,radius:24,z:18,kind:'jellybean',colors:['#683858','#bd5d99','#f6b0bd']},
 {x:2,y:6.4,radius:16,z:18,kind:'mint',colors:['#246c81','#57b6af','#c8f0b6']},
 {x:7.5,y:7.8,radius:22,z:18,kind:'ringed',colors:['#8c597b','#bf819c','#ffe3b6']},
 {x:7.5,y:1.5,radius:13,z:18,kind:'peach',colors:['#9d4b47','#e18b58','#ffe49d']},
];

const smooth=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};

/**
 * The first push starts an ongoing, gentle current through the solar system.
 * Core planets share an ellipse so their already-close bodies cannot collide;
 * the two outer planets have smaller independent drifts along the same axis.
 * All offsets start at zero and keep the lift threshold and room bounds clear.
 */
export function spacePlanetsAt(age:number|null,reducedMotion=false):SpacePlanet[] {
 if(age===null||!Number.isFinite(age)||age<=0)return spacePlanets.map(p=>({...p}));
 const phase=age*.55;
 const x=reducedMotion?18*smooth(age/1.2):24*Math.sin(phase);
 const y=reducedMotion?12*smooth(age/1.2):12*Math.sin(phase)+6.5*(1-Math.cos(phase));
 return spacePlanets.map((p,i)=>{
  const local=reducedMotion?0:i===1?4*Math.sin(phase*.8):i===3?-4*Math.sin(phase*1.1):0;
  const at=project(p),position=unproject({x:at.x+x+local,y:at.y+y+local*.5});
  return {...p,...position};
 });
}

/** Planets are round in the same screen plane in which the explorer drifts. */
export function spaceCanStand(point:Point,age:number|null=null,reducedMotion=false):boolean {
 const at=project(point);
 return spacePlanetsAt(age,reducedMotion).every(p=>{const c=project(p);return Math.hypot(at.x-c.x,at.y-c.y)>p.radius+6;});
}

/** A moving planet gently carries a stationary explorer out of its solid body. */
export function resolveSpaceOverlap(point:Point,age:number|null=null,reducedMotion=false):Point {
 const planets=spacePlanetsAt(age,reducedMotion),original=project(point);
 let current={...point};
 const inBounds=(p:Point)=>p.x>=.3&&p.x<=11.7&&p.y>=.3&&p.y<=9.7;
 const clear=(p:Point)=>{
  const at=project(p);return inBounds(p)&&planets.every(planet=>{const center=project(planet);return Math.hypot(at.x-center.x,at.y-center.y)>planet.radius+6;});
 };
 for(let pass=0;pass<8;pass++){
  let touched=false;
  for(const [i,planet] of planets.entries()){
   const at=project(current),center=project(planet),dx=at.x-center.x,dy=at.y-center.y,distance=Math.hypot(dx,dy),radius=planet.radius+6.35;
   if(distance>=radius)continue;
   const direction=distance>.001?{x:dx/distance,y:dy/distance}:{x:Math.cos(i*2.399),y:Math.sin(i*2.399)};
   const pushed=unproject({x:center.x+direction.x*radius,y:center.y+direction.y*radius});
   current={x:Math.max(.3,Math.min(11.7,pushed.x)),y:Math.max(.3,Math.min(9.7,pushed.y))};touched=true;
  }
  if(!touched||clear(current))return current;
 }
 // This is only needed for pathological starting positions pressed into a corner.
 // Searching outward chooses the nearest free location instead of trapping Andy.
 for(let radius=4;radius<=96;radius+=4)for(let i=0;i<32;i++){
  const angle=i*Math.PI/16,candidate=unproject({x:original.x+Math.cos(angle)*radius,y:original.y+Math.sin(angle)*radius});
  if(clear(candidate))return candidate;
 }
 return current;
}

function pixel(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function disk(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string){
 ctx.fillStyle=color;for(let dy=-r;dy<=r;dy++){const dx=Math.floor(Math.sqrt(r*r-dy*dy));ctx.fillRect(Math.round(x)-dx,Math.round(y)+dy,dx*2+1,1);}
}

export function drawSpaceBackdrop(ctx:CanvasRenderingContext2D,time:number,reducedMotion:boolean){
 ctx.save();ctx.beginPath();ctx.rect(0,35,480,254);ctx.clip();
 pixel(ctx,0,35,480,254,'#081629');
 // Discrete, very quiet nebula bands behind the stars; no room walls or tiles.
 for(let band=0;band<6;band++){
  const y=65+band*31;
  for(let i=0;i<18;i++){const x=i*28+(band%2)*11,dy=Math.round(Math.sin(i*.7+band)*15);pixel(ctx,x,y+dy,27,7,band%2?'#101d38':'#111d35');}
 }
 for(let i=0;i<140;i++){
  const x=(i*83+29)%476+2,y=40+(i*47+17)%240;
  const twinkle=reducedMotion?false:Math.floor(time*.8+i)%7===0;
  pixel(ctx,x,y,i%11===0?2:1,1,twinkle?'#fff0c5':i%3?'#6c91ad':'#bdced1');
  if(i%17===0){pixel(ctx,x-2,y,5,1,'#bcdbe0');pixel(ctx,x,y-2,1,5,'#bcdbe0');}
 }
 // A distant spiral galaxy and small constellations make the void feel inhabited.
 for(let i=0;i<28;i++){const angle=i*.8,r=i*.56;pixel(ctx,88+Math.cos(angle)*r*1.8,89+Math.sin(angle)*r*.45,2,1,i%2?'#6c799c':'#a6b7c4');}
 for(let i=0;i<5;i++)pixel(ctx,376+i*9,65+Math.round(Math.sin(i)*7),2,2,'#d4d5c1');
 ctx.restore();
}

export function drawSpacePlanet(ctx:CanvasRenderingContext2D,planet:SpacePlanet,time:number,reducedMotion:boolean,active=false){
 const at=project(planet,planet.z),r=planet.radius,x=Math.round(at.x),y=Math.round(at.y);
 const phase=reducedMotion?0:Math.floor(time*2)%16;
 ctx.save();
 const ring=(front:boolean)=>{
  for(let i=0;i<160;i++){
   const a=i/160*Math.PI*2,dx=Math.cos(a)*(r+12),dy=Math.sin(a)*7+dx*.3;
   if((dy>0)!==front)continue;
   pixel(ctx,x+dx,y+dy,3,2,i%3?'#d6bd8c':'#fff1c7');
  }
 };
 if(planet.kind==='ringed')ring(false);
 disk(ctx,x,y,r+1,'#10213d');
 // Scanline colour ramps keep spheres crisp and clearly separate from the void.
 for(let dy=-r;dy<=r;dy++){
  const span=Math.floor(Math.sqrt(r*r-dy*dy));
  for(let dx=-span;dx<=span;dx++){
   const lit=(-dx-dy*.65)/r,color=lit>.45?planet.colors[2]:lit>-.5?planet.colors[1]:planet.colors[0];
   pixel(ctx,x+dx,y+dy,1,1,color);
  }
 }
 if(planet.kind==='jellybean'){
  // Sugar islands drift a few pixels across the lavender confectionery globe.
  for(const [i,p] of [{x:-10,y:-8},{x:5,y:5},{x:-7,y:13},{x:11,y:-11}].entries()){
   const dx=p.x+(phase>8?1:0);pixel(ctx,x+dx-3,y+p.y-2,6,5,i%2?'#f3d879':'#78c7ba');pixel(ctx,x+dx-1,y+p.y-3,4,7,i%2?'#f3d879':'#78c7ba');
  }
 }else if(planet.kind==='mint'){
  pixel(ctx,x-8,y-7,9,3,'#b7e6a6');pixel(ctx,x-4,y-4,7,5,'#b7e6a6');pixel(ctx,x+3,y+6,7,3,'#31988c');
 }else if(planet.kind==='peach'){
  pixel(ctx,x-7,y-5,6,2,'#f6b86b');pixel(ctx,x-1,y+5,9,2,'#c96c4a');
 }
 if(planet.kind==='ringed')ring(true);
 if(active&&planet.kind==='jellybean'){
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7+(reducedMotion?0:time*.7),px=x+Math.cos(a)*(r+13),py=y+Math.sin(a)*(r+8);pixel(ctx,px,py,3,3,['#f5d477','#79ddd0','#ec7e9d'][i%3]);}
 }
 ctx.restore();
}
