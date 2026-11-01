import {project,type Point} from './core';
import type {Prop} from './rooms';

const INK='#10213d',GOLD='#edb94e',CREAM='#fff0bf';
type Vertex=Point&{z:number};
type Material={top:string;front:string;side:string};

// Scanline fills and Bresenham edges keep every diagonal on the native pixel grid.
function polygon(ctx:CanvasRenderingContext2D,vertices:Vertex[],colour:string,outline=false){
 const points=vertices.map(p=>project(p,p.z));ctx.fillStyle=colour;
 const top=Math.floor(Math.min(...points.map(p=>p.y))),bottom=Math.ceil(Math.max(...points.map(p=>p.y)));
 for(let y=top;y<bottom;y++){
  const crossings:number[]=[];
  for(let i=0;i<points.length;i++){
   const a=points[i],b=points[(i+1)%points.length],scan=y+.5;
   if((a.y<=scan&&b.y>scan)||(b.y<=scan&&a.y>scan))crossings.push(a.x+(scan-a.y)*(b.x-a.x)/(b.y-a.y));
  }
  crossings.sort((a,b)=>a-b);
  for(let i=0;i+1<crossings.length;i+=2){const x=Math.round(crossings[i]);ctx.fillRect(x,y,Math.round(crossings[i+1])-x,1);}
 }
 if(outline)for(let i=0;i<vertices.length;i++)line(ctx,vertices[i],vertices[(i+1)%vertices.length],INK);
}
function line(ctx:CanvasRenderingContext2D,a:Vertex,b:Vertex,colour:string){
 const from=project(a,a.z),to=project(b,b.z);let x=Math.round(from.x),y=Math.round(from.y);
 const bx=Math.round(to.x),by=Math.round(to.y),dx=Math.abs(bx-x),dy=-Math.abs(by-y),sx=x<bx?1:-1,sy=y<by?1:-1;let error=dx+dy;
 ctx.fillStyle=colour;
 for(;;){ctx.fillRect(x,y,1,1);if(x===bx&&y===by)break;const twice=2*error;if(twice>=dy){error+=dy;x+=sx;}if(twice<=dx){error+=dx;y+=sy;}}
}
function cuboid(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,d:number,z:number,h:number,m:Material){
 const a={x,y,z},b={x:x+w,y,z},c={x:x+w,y:y+d,z},e={x,y:y+d,z};
 const up=(p:Vertex)=>({...p,z:z+h});
 polygon(ctx,[e,c,up(c),up(e)],m.front,true);
 polygon(ctx,[b,c,up(c),up(b)],m.side,true);
 polygon(ctx,[up(a),up(b),up(c),up(e)],m.top,true);
}
function front(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,bottom:number,top:number,colour:string,outline=false){
 polygon(ctx,[{x,y,z:bottom},{x:x+w,y,z:bottom},{x:x+w,y,z:top},{x,y,z:top}],colour,outline);
}

function shelf(ctx:CanvasRenderingContext2D,p:Prop){
 const w=p.w,d=p.h,x=p.x-w/2,y=p.y-d/2,f=y+d;
 const wood={top:'#e5b467',front:'#bc7841',side:'#865137'};
 // Assemble from the ground up. The cabinet hides the rear of the plinth's
 // top face, leaving only its narrow front and side overhang visible.
 cuboid(ctx,x-.02,y-.02,w+.04,d+.04,0,3,wood);
 cuboid(ctx,x+.08,y+.06,w-.16,d-.12,3,44,wood);
 // Deep openings, three thick shelf boards, and visible side grain.
 front(ctx,x+.19,f,w-.38,5,44,'#3c3140');
 front(ctx,x+.26,f-.015,w-.52,7,43,'#5b3e3c');
 const colours=['#e67c49','#5fc2b6','#efd075','#6c9dd3','#c84457','#ae95ce','#66b27b'];
 for(let row=0;row<3;row++){
  const z=7+row*12;
  // Books sit on the shelf; its rear top face belongs behind their spines.
  cuboid(ctx,x+.11,f-.15,w-.22,.2,z-2,2,wood);
  let at=x+.29;
  for(let book=0;at<x+w-.3;book++){
   const bw=Math.min(.16+(book+row)%3*.055,x+w-.27-at),bh=7+(book*3+row)%4;
   front(ctx,at,f+.005,bw,z,z+bh,colours[(book+row*3)%colours.length]);
   line(ctx,{x:at,y:f+.01,z},{x:at,y:f+.01,z:z+bh},INK);
   if(bw>.16)front(ctx,at+.045,f+.012,bw-.07,z+bh-2,z+bh-1,CREAM);
   at+=bw+.025;
  }
 }
 cuboid(ctx,x-.03,y-.03,w+.06,d+.06,47,3,wood);
 front(ctx,x+.07,f+.03,.12,4,47,'#edb974');front(ctx,x+w-.19,f+.03,.12,4,47,'#a9683a');
 line(ctx,{x:x+w-.03,y:y+.12,z:8},{x:x+w-.03,y:f-.12,z:8},'#ba7d42');
 line(ctx,{x:x+w-.03,y:y+.12,z:39},{x:x+w-.03,y:f-.12,z:39},'#ba7d42');
}

function suitcase(ctx:CanvasRenderingContext2D,p:Prop){
 const w=1,d=.48,x=p.x-w/2,y=p.y-d/2,f=y+d;
 const leather={top:'#eab177',front:'#bd7149',side:'#874c39'};
 cuboid(ctx,x,y,w,d,1,14,leather);
 // The lid seam, leather straps and brass latches follow the front plane.
 line(ctx,{x:x+.025,y:f,z:11},{x:x+w-.025,y:f,z:11},'#6f4236');
 for(const at of [x+.18,x+.73]){
  front(ctx,at,f+.01,.11,2,14,'#753e38');
  polygon(ctx,[{x:at,y,z:15},{x:at+.11,y,z:15},{x:at+.11,y:f,z:15},{x:at,y:f,z:15}],'#a05e3b');
  front(ctx,at-.015,f+.02,.14,9,12,GOLD);front(ctx,at+.025,f+.025,.06,10,11,INK);
 }
 for(const at of [x+.025,x+w-.13]){front(ctx,at,f+.02,.105,2,4,GOLD);front(ctx,at,f+.02,.105,12,14,GOLD);}
 const handleY=y+d*.48;
 line(ctx,{x:p.x-.18,y:handleY,z:15},{x:p.x-.18,y:handleY,z:19},INK);
 line(ctx,{x:p.x-.18,y:handleY,z:19},{x:p.x+.18,y:handleY,z:19},INK);
 line(ctx,{x:p.x+.18,y:handleY,z:19},{x:p.x+.18,y:handleY,z:15},INK);
 line(ctx,{x:p.x-.13,y:handleY,z:18},{x:p.x+.13,y:handleY,z:18},GOLD);
 // A cream paper tag tied to the handle makes the luggage readable at demo scale.
 line(ctx,{x:p.x+.18,y:handleY,z:16},{x:p.x+.35,y:f,z:12},CREAM);
 front(ctx,p.x+.3,f+.025,.23,6,11,CREAM,true);
 front(ctx,p.x+.35,f+.035,.13,8,9,'#b77842');
}

function lamp(ctx:CanvasRenderingContext2D,p:Prop){
 const brass={top:'#f6d379',front:'#c9953c',side:'#926339'};
 cuboid(ctx,p.x-.35,p.y-.35,.7,.7,0,2,brass);
 cuboid(ctx,p.x-.16,p.y-.16,.32,.32,2,3,brass);
 const rod=project(p),top=project(p,36);
 ctx.fillStyle=INK;ctx.fillRect(Math.round(rod.x)-2,Math.round(top.y),5,Math.round(rod.y-top.y)-3);
 ctx.fillStyle=GOLD;ctx.fillRect(Math.round(rod.x)-1,Math.round(top.y),2,Math.round(rod.y-top.y)-4);
 ctx.fillStyle=CREAM;ctx.fillRect(Math.round(rod.x)-1,Math.round(top.y)+1,1,Math.round(rod.y-top.y)-6);
 const lower=.7,upper=.34,low=33,high=47;
 const vertex=(dx:number,dy:number,z:number):Vertex=>({x:p.x+dx,y:p.y+dy,z});
 // A square tapered shade uses the same pair of floor axes as its brass base.
 polygon(ctx,[vertex(-lower,lower,low),vertex(lower,lower,low),vertex(upper,upper,high),vertex(-upper,upper,high)],'#f2cc7b',true);
 polygon(ctx,[vertex(lower,-lower,low),vertex(lower,lower,low),vertex(upper,upper,high),vertex(upper,-upper,high)],'#c38e49',true);
 for(const a of [-.55,0,.55]){
  line(ctx,vertex(a*lower,lower,low+1),vertex(a*upper,upper,high-1),a===0?'#fff0bf':'#dfb166');
  line(ctx,vertex(lower,a*lower,low+1),vertex(upper,a*upper,high-1),'#dea852');
 }
 polygon(ctx,[vertex(-upper,-upper,high),vertex(upper,-upper,high),vertex(upper,upper,high),vertex(-upper,upper,high)],'#fff0bf',true);
 line(ctx,vertex(-lower,lower,low),vertex(lower,lower,low),GOLD);
 line(ctx,vertex(lower,-lower,low),vertex(lower,lower,low),'#a87436');
 cuboid(ctx,p.x-.08,p.y-.08,.16,.16,47,3,brass);
}

/** Returns false for props that continue to use the authored sprite catalogue. */
export function drawIsometricProp(ctx:CanvasRenderingContext2D,p:Prop):boolean {
 if(p.kind==='shelf')shelf(ctx,p);
 else if(p.kind==='suitcase')suitcase(ctx,p);
 else if(p.kind==='lamp')lamp(ctx,p);
 else return false;
 return true;
}
