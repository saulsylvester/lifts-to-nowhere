import type {AnimationName,Frame} from './avatars';

/** Two planted steps cover 32 native screen pixels. */
export const ANDY_STRIDE=32;
export const ANDY_WALK_FRAMES=8;
export type AndyDirection='idle'|'right'|'left'|'up';
const INK='#10213d',BLUE='#175bca',LIGHT='#3988e6',DARK='#173e83',SKIN='#ffc68d';
const rect=(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
function limb(c:CanvasRenderingContext2D,points:number[][],color:string,width=4){
 for(let i=0;i<points.length-1;i++){
  const [x,y]=points[i],b=points[i+1],steps=Math.max(Math.abs(b[0]-x),Math.abs(b[1]-y),1);
  for(let j=0;j<=steps;j++){const t=j/steps;rect(c,x+(b[0]-x)*t-width/2,y+(b[1]-y)*t-width/2,width,width,INK);}
 }
 for(let i=0;i<points.length-1;i++){
  const [x,y]=points[i],b=points[i+1],steps=Math.max(Math.abs(b[0]-x),Math.abs(b[1]-y),1);
  for(let j=0;j<=steps;j++){const t=j/steps;rect(c,x+(b[0]-x)*t-(width-2)/2,y+(b[1]-y)*t-(width-2)/2,width-2,width-2,color);}
 }
}
function boot(c:CanvasRenderingContext2D,x:number,y:number,side:boolean,far=false){
 const width=side?6:5;
 rect(c,x-2,y-3,width,3,INK);rect(c,x-1,y-3,width-2,2,far?'#654638':'#8b624b');
 if(!far)rect(c,x,y-3,2,1,'#bb8b62');
}

/** Pixel joints are authored at game resolution, so every footfall reads at 1×. */
function pose(c:CanvasRenderingContext2D,headImage:HTMLImageElement,head:Frame,direction:AndyDirection,frame:number){
 const side=direction==='left'||direction==='right',back=direction==='up',rest=frame===8;
 const phase=rest?0:frame,other=(phase+4)%8;
 const stride=[7,3,-1,-5,-7,-3,1,5],lift=[0,0,0,0,1,4,5,2];
 const bob=!rest&&[1,2,5,6].includes(phase)?-1:0;
 c.save();c.translate(20,40);if(direction==='left')c.scale(-1,1);
 if(side){
  const leg=(index:number,far:boolean)=>{
   const foot=rest?(far?-2:2):stride[index],rise=rest?0:lift[index];
   const hip={x:far?-1:1,y:-10+bob},knee={x:Math.round(foot*.45)+(rise>0?3:0),y:-5+bob-Math.round(rise*.3)};
   limb(c,[[hip.x,hip.y],[knee.x,knee.y],[foot,-rise-3]],far?DARK:LIGHT,far?4:5);
   boot(c,foot,-rise,true,far);
  };
  const arm=(far:boolean)=>{
   const swing=rest?0:Math.round(stride[far?phase:other]*.65),x=far?-1:2,y=-16+bob;
   limb(c,[[x,y],[x+swing*.5,y+3],[x+swing,y+5]],far?DARK:BLUE,far?4:5);
   rect(c,x+swing-1,y+4,3,3,INK);rect(c,x+swing,y+4,2,2,SKIN);
  };
  leg(other,true);arm(true);
  // Backpack, hood and torso retain the blue-hoodie silhouette.
  rect(c,-7,-18+bob,5,10,INK);rect(c,-6,-17+bob,4,8,DARK);rect(c,-5,-15+bob,2,4,LIGHT);
  rect(c,-4,-20+bob,9,12,INK);rect(c,-3,-19+bob,7,10,BLUE);rect(c,-2,-18+bob,3,7,LIGHT);
  rect(c,-4,-20+bob,7,3,DARK);rect(c,-3,-20+bob,5,1,LIGHT);
  rect(c,3,-18+bob,2,6,'#ff941f');rect(c,2,-13+bob,4,4,INK);rect(c,3,-12+bob,2,2,'#fff0bf');
  leg(phase,false);arm(false);
 }else{
  // The planted boot travels through floor depth as Andy passes over it.
  // The returning leg shortens and bends; reversing depth gives the rear view.
  const fore=back?[-6,-4,-2,0,-1,-3,-6,-7]:[0,-2,-4,-6,-7,-6,-3,-1];
  for(const [index,x] of [[phase,-3],[other,3]]){
   const step=rest?0:fore[index],rise=rest?0:lift[index],kneeY=Math.round((-10+bob+step-2)/2)-Math.round(rise*.25);
   limb(c,[[x,-10+bob],[x+(rise?Math.sign(x):0),kneeY],[x,step-2]],index<4?BLUE:LIGHT,4);
   boot(c,x,step,false,index<4);
  }
  rect(c,-6,-20+bob,12,12,INK);rect(c,-5,-19+bob,10,10,BLUE);rect(c,-4,-18+bob,3,7,LIGHT);
  rect(c,-5,-20+bob,10,3,DARK);rect(c,-3,-20+bob,6,1,LIGHT);
  if(back){rect(c,-4,-17+bob,8,8,INK);rect(c,-3,-16+bob,6,6,'#236dbc');rect(c,-2,-16+bob,4,2,LIGHT);rect(c,0,-13+bob,2,2,'#dda063');}
  else{for(let i=0;i<3;i++){rect(c,-4+i,-18+i+bob,2,2,'#ff941f');rect(c,2-i,-18+i+bob,2,2,'#ff941f');}rect(c,-2,-13+bob,5,4,INK);rect(c,-1,-12+bob,3,2,'#fff0bf');}
  for(const [index,sign] of [[phase,-1],[other,1]]){
   const swing=rest?0:Math.round(stride[index]*.35),x=sign*6,y=-17+bob;
   limb(c,[[x,y],[x+sign,y+3],[x+sign,y+6+swing]],BLUE,4);
   rect(c,x+sign-1,y+5+swing,3,3,INK);rect(c,x+sign,y+5+swing,2,2,SKIN);
  }
 }
 // The original cap/face keeps Andy's identity, while all limb motion is explicit.
 const h=17,w=Math.round(head.w/head.h*h);
 // A mirrored right-facing rig uses the matching right head, avoiding two flips.
 c.drawImage(headImage,head.x,head.y,head.w,head.h,-Math.floor(w/2),-33+bob,w,h);
 c.restore();
}

export function createAndyWalkAtlas(image:HTMLImageElement,heads:Record<AndyDirection,Frame>):HTMLCanvasElement {
 const atlas=document.createElement('canvas');atlas.width=40*9;atlas.height=40*4;
 const c=atlas.getContext('2d')!;c.imageSmoothingEnabled=false;
 for(const [row,direction] of (['idle','right','left','up'] as const).entries())for(let frame=0;frame<9;frame++){
  c.save();c.translate(frame*40,row*40);c.beginPath();c.rect(0,0,40,40);c.clip();
  pose(c,image,heads[direction==='left'?'right':direction],direction,frame);c.restore();
 }
 return atlas;
}

export const isAndyDirection=(name:AnimationName):name is AndyDirection=>['idle','right','left','up'].includes(name);
