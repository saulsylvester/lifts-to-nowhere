import {project,type Point} from './core';

export const FLOOD_FLOOR=4;
const WIDTH=12,HEIGHT=10,CEILING=58;
const WATER='#8ed7ff',LIGHT='#a5e5ff',FOAM='#e4f8ff';

/** A complete room-height flood per visit; the final water level persists. */
export function floodLevel(age:number):number {
  const t=Number.isNaN(age)?0:Math.max(0,Math.min(1,age/6));
  return t*t*(3-2*t);
}

/** Pixel height above the floor, shared with the swimming presentation. */
export function waterHeight(age:number):number {return floodLevel(age)*CEILING;}

// Rasterize every edge on the native pixel grid, including the water's silhouette.
function polygon(ctx:CanvasRenderingContext2D,points:Point[],colour:string):void {
  if(points.length<3)return;
  ctx.fillStyle=colour;
  const top=Math.floor(Math.min(...points.map(p=>p.y))),bottom=Math.ceil(Math.max(...points.map(p=>p.y)));
  for(let y=top;y<bottom;y++){
    const hits:number[]=[];
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length],scan=y+.5;
      if((a.y<=scan&&b.y>scan)||(b.y<=scan&&a.y>scan))hits.push(a.x+(scan-a.y)*(b.x-a.x)/(b.y-a.y));
    }
    hits.sort((a,b)=>a-b);
    for(let i=0;i+1<hits.length;i+=2){const x=Math.round(hits[i]);ctx.fillRect(x,y,Math.round(hits[i+1])-x,1);}
  }
}

function line(ctx:CanvasRenderingContext2D,a:Point,b:Point,colour:string):void {
  let x=Math.round(a.x),y=Math.round(a.y);
  const bx=Math.round(b.x),by=Math.round(b.y),dx=Math.abs(bx-x),dy=-Math.abs(by-y),sx=x<bx?1:-1,sy=y<by?1:-1;
  let error=dx+dy;
  ctx.fillStyle=colour;
  for(;;){
    ctx.fillRect(x,y,1,1);if(x===bx&&y===by)break;
    const twice=2*error;if(twice>=dy){error+=dy;x+=sx;}if(twice<=dx){error+=dx;y+=sy;}
  }
}

const ripples:Point[]=[
  {x:1.4,y:1.8},{x:4.1,y:1.2},{x:7.7,y:.9},{x:10.2,y:1.8},
  {x:2.1,y:3.8},{x:6.4,y:3.2},{x:9.9,y:4.2},{x:.9,y:6},
  {x:4.2,y:6.4},{x:7.4,y:6.8},{x:10.5,y:7.4},
  {x:1.8,y:8.5},{x:5.9,y:8.9},{x:9.1,y:8.8},
];

/**
 * Draw base after architecture and before sprites; draw surface after sprites.
 * The top and two front faces tile the projected volume without overlapping.
 * Their translucent colour keeps every explorer, prop and floor tile visible
 * inside the water, including when its surface reaches the room's ceiling.
 */
export function drawFlood(ctx:CanvasRenderingContext2D,time:number,age:number,reducedMotion:boolean,layer:'base'|'surface'):void {
  const level=floodLevel(age);if(level<=0)return;
  const z=Math.max(1,Math.round(waterHeight(age)));
  const corners:Point[]=[{x:0,y:0},{x:WIDTH,y:0},{x:WIDTH,y:HEIGHT},{x:0,y:HEIGHT}];
  const floor=corners.map(p=>project(p)),surface=corners.map(p=>project(p,z));
  const tick=reducedMotion?0:Math.floor(time*5),seconds=tick/5;
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(layer==='base'){
    // This is a wash over the original tile and wall artwork, never an opaque
    // replacement floor. The rear wall bands rise to exactly the room ceiling.
    ctx.globalAlpha=.1;polygon(ctx,floor,WATER);
    ctx.globalAlpha=.16;
    for(const side of [1,3]){
      polygon(ctx,[floor[0],floor[side],surface[side],surface[0]],WATER);
    }
    // Little angular caustics are registered to the floor beneath the water.
    ctx.globalAlpha=.35;
    for(const [i,p] of ripples.entries()){
      const a=project(p),shift=reducedMotion?0:(Math.floor(seconds+i)%3)-1;
      const x=Math.round(a.x)+shift,y=Math.round(a.y);
      ctx.fillStyle=LIGHT;ctx.fillRect(x-5,y,8,1);ctx.fillRect(x+3,y-1,4,1);
      if(i%2===0)ctx.fillRect(x-2,y+2,5,1);
    }
  }else{
    // These three faces form a complete cuboid, so water is visible above and
    // in front of the furniture instead of appearing as a raised floor plane.
    ctx.globalAlpha=.2;polygon(ctx,surface,WATER);
    ctx.globalAlpha=.24;polygon(ctx,[surface[1],surface[2],floor[2],floor[1]],'#80cefa');
    ctx.globalAlpha=.28;polygon(ctx,[surface[3],surface[2],floor[2],floor[3]],'#9adeff');

    // All four top edges track the growing height, ending at the wall cornice.
    ctx.globalAlpha=.8;
    for(let i=0;i<4;i++)line(ctx,surface[i],surface[(i+1)%4],i===0||i===3?LIGHT:FOAM);
    ctx.globalAlpha=.4;
    for(const i of [1,2,3])line(ctx,surface[i],floor[i],LIGHT);
    line(ctx,floor[1],floor[2],LIGHT);line(ctx,floor[2],floor[3],LIGHT);

    ctx.globalAlpha=.6;
    for(const [i,p] of ripples.entries()){
      const a=project(p,z),phase=(tick+i*3)%8;
      const width=reducedMotion?7:5+Math.min(phase,7-phase);
      const x=Math.round(a.x-width/2),y=Math.round(a.y);
      ctx.fillStyle=i%3===0?FOAM:LIGHT;ctx.fillRect(x,y,width,1);
      ctx.fillRect(x+width,y-1,2,1);
      if(i%3===0){ctx.fillStyle=LIGHT;ctx.fillRect(x-3,y+2,4,1);}
    }

    // Bubbles occupy different depths inside the cuboid and stop just beneath
    // the surface. Reduced motion fixes their positions as well as the ripples.
    if(z>8){
      ctx.globalAlpha=.8;
      for(let i=0;i<9;i++){
        const p={x:1.1+(i*2.7)%9.8,y:1.2+(i*3.1)%7.8};
        const rise=3+((seconds*5+i*11)%(z-5));
        const a=project(p,rise),x=Math.round(a.x),y=Math.round(a.y);
        ctx.fillStyle=FOAM;
        if(i%3===0){ctx.fillRect(x,y-2,2,1);ctx.fillRect(x-1,y-1,1,2);ctx.fillRect(x+2,y-1,1,2);ctx.fillRect(x,y+1,2,1);}
        else {ctx.fillRect(x,y,1,2);ctx.fillRect(x+1,y-1,1,1);}
      }
    }

    // The emergency life ring remains on the rising surface, well above the
    // submerged furniture once the lighthouse has become its own little sea.
    if(level>.15){
      ctx.globalAlpha=1;
      const at=project({x:8.3,y:7.8},z),bob=reducedMotion?0:Math.floor(seconds*2)%2;
      const x=Math.round(at.x),y=Math.round(at.y)-bob;
      ctx.fillStyle=LIGHT;ctx.fillRect(x-7,y+3,14,1);
      ctx.fillStyle='#123750';ctx.fillRect(x-5,y-3,10,6);ctx.fillRect(x-7,y-1,14,3);
      ctx.fillStyle='#ffd489';ctx.fillRect(x-5,y-3,10,2);ctx.fillRect(x-5,y+1,10,2);
      ctx.fillStyle='#ef7850';ctx.fillRect(x-6,y-1,3,3);ctx.fillRect(x+3,y-1,3,3);
      ctx.fillStyle='#87c8e5';ctx.fillRect(x-2,y-1,4,2);
      ctx.fillStyle=FOAM;ctx.fillRect(x-4,y-3,3,1);
    }
  }
  ctx.restore();
}
