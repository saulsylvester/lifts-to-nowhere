import {project,type Point} from './core';

export const PLANT_ENCOUNTER_DURATION=6.4;
export type PlantEncounterPhase='growing'|'grabbing'|'swallowing'|'chewing'|'burst'|'aftermath';
export type PlantEncounterOptions={
  plant:Point;origin:Point;age:number;time:number;reducedMotion:boolean;
  avatarId:string;avatarColors?:string[];
};
export type PlantExplorerPose={position:Point;scale:number;rotation:number;visible:boolean};
const INK='#12283a',GREEN='#439c56',LIGHT='#8cd764',LEAF='#267b4b',RED='#c62f4c',BLOOD='#d12d40',PALE='#fff2c0';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;

/** The waiting seedling is only about 23 native pixels high, smaller than Andy. */
export function plantGrowthScale(age:number):number {return mix(.23,1,ease(age/.85));}

export function plantEncounterPhase(age:number):PlantEncounterPhase {
  if(age<.85)return 'growing';if(age<1.35)return 'grabbing';if(age<2.05)return 'swallowing';
  if(age<3.55)return 'chewing';if(age<5.3)return 'burst';return 'aftermath';
}

function geometry(plant:Point,age:number,reducedMotion:boolean){
  const ground=project(plant),growth=ease(age/.85),phase=plantEncounterPhase(age);
  const chewing=phase==='chewing',chew=reducedMotion?0:chewing?Math.sin((age-2.05)*22):0;
  const sway=reducedMotion?0:Math.sin(age*3)*growth*2;
  // Keep even the fully open crown below the HUD while its roots engulf the room.
  const head={x:ground.x+sway,y:Math.max(96,ground.y-mix(58,86,growth))};
  let gap=phase==='growing'?mix(8,15,growth):phase==='grabbing'?mix(15,39,ease((age-.85)/.5)):
    phase==='swallowing'?mix(39,8,ease((age-1.72)/.33)):chewing?9+(chew+1)*5:
    phase==='burst'?mix(28,12,ease((age-3.55)/1.3)):10;
  if(reducedMotion&&chewing)gap=12;
  return {ground,head,growth,gap,chew,width:mix(30,44,growth)+(chewing?Math.abs(chew)*2:0)};
}

/** Screen-space pose; the caller draws its actual selected avatar at this pose. */
export function plantExplorerPose(origin:Point,plant:Point,age:number,reducedMotion:boolean):PlantExplorerPose {
  const start=project(origin),{head}=geometry(plant,age,reducedMotion),pull=ease((age-1.25)/.7);
  // Anchor the explorer's middle at the mouth, then let the lips cover it.
  const position={x:mix(start.x,head.x,pull),y:mix(start.y,head.y+12,pull)};
  return {position,scale:mix(1,.55,ease((age-1.55)/.4)),rotation:reducedMotion?0:mix(0,-.72,pull),visible:age<1.95};
}

function rect(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,c:string){
  ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
function poly(ctx:CanvasRenderingContext2D,points:Point[],c:string){
  ctx.fillStyle=c;
  for(let y=Math.floor(Math.min(...points.map(p=>p.y)));y<Math.ceil(Math.max(...points.map(p=>p.y)));y++){
    const hits:number[]=[];
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length],scan=y+.5;
      if((a.y<=scan&&b.y>scan)||(b.y<=scan&&a.y>scan))hits.push(a.x+(scan-a.y)*(b.x-a.x)/(b.y-a.y));
    }
    hits.sort((a,b)=>a-b);
    for(let i=0;i+1<hits.length;i+=2)ctx.fillRect(Math.round(hits[i]),y,Math.max(1,Math.round(hits[i+1])-Math.round(hits[i])),1);
  }
}
function ellipse(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,c:string){
  ctx.fillStyle=c;
  for(let dy=-Math.ceil(ry);dy<=ry;dy++){
    const half=Math.round(rx*Math.sqrt(Math.max(0,1-dy*dy/(ry*ry))));
    if(half)ctx.fillRect(Math.round(x)-half,Math.round(y)+dy,half*2,1);
  }
}
function chain(ctx:CanvasRenderingContext2D,points:Point[],width:number,c:string){
  for(let i=0;i<points.length-1;i++){
    const a=points[i],b=points[i+1],steps=Math.max(1,Math.ceil(Math.max(Math.abs(b.x-a.x),Math.abs(b.y-a.y))));
    for(let j=0;j<=steps;j++){const t=j/steps;rect(ctx,mix(a.x,b.x,t)-width/2,mix(a.y,b.y,t)-width/2,width,width,c);}
  }
}
function leaf(ctx:CanvasRenderingContext2D,origin:Point,tip:Point,width:number){
  const dx=tip.x-origin.x,dy=tip.y-origin.y,length=Math.max(1,Math.hypot(dx,dy)),nx=-dy/length,ny=dx/length;
  const shape=(w:number,inset:number)=>[
    {x:origin.x,y:origin.y},
    {x:mix(origin.x,tip.x,.45)+nx*w,y:mix(origin.y,tip.y,.45)+ny*w},
    {x:tip.x-dx/length*inset,y:tip.y-dy/length*inset},
    {x:mix(origin.x,tip.x,.58)-nx*w*.7,y:mix(origin.y,tip.y,.58)-ny*w*.7},
  ];
  poly(ctx,shape(width,0),INK);poly(ctx,shape(Math.max(2,width-3),3),LEAF);
  chain(ctx,[origin,{x:mix(origin.x,tip.x,.86),y:mix(origin.y,tip.y,.86)}],2,LIGHT);
}
function jaw(ctx:CanvasRenderingContext2D,head:Point,width:number,gap:number,lower:boolean){
  const y=head.y+(lower?gap/2:-gap/2),sign=lower?1:-1,height=lower?22:37;
  const points=[{x:head.x-width,y},{x:head.x-width+3,y:y+sign*height*.56},{x:head.x-width*.55,y:y+sign*height*.92},
    {x:head.x+width*.08,y:y+sign*height},{x:head.x+width*.68,y:y+sign*height*.82},{x:head.x+width,y:y+sign*height*.3},{x:head.x+width,y}];
  poly(ctx,points,INK);
  poly(ctx,points.map(p=>({x:mix(head.x,p.x,.9),y:mix(y+sign*3,p.y,.84)})),lower?GREEN:LIGHT);
  if(!lower){
    ellipse(ctx,head.x-14,y-22,5,3,'#d7eb82');ellipse(ctx,head.x+18,y-20,6,3,'#c5e471');
    rect(ctx,head.x-29,y-12,4,3,GREEN);rect(ctx,head.x+29,y-10,5,4,GREEN);
  }
  rect(ctx,head.x-width+3,y-1,width*2-6,4,RED);
  for(let i=0;i<7;i++){
    const x=head.x-width+7+i*(width*2-15)/7,tooth=lower?7+(i%2)*2:10+(i%2)*2;
    poly(ctx,[{x,y:y+sign},{x:x+8,y:y+sign},{x:x+4,y:y-sign*tooth}],INK);
    poly(ctx,[{x:x+1,y:y-sign},{x:x+7,y:y-sign},{x:x+4,y:y-sign*(tooth-2)}],PALE);
  }
}

type Missile={start:number;duration:number;target:Point;floor:Point;side:0|1;seed:number};
function missiles():Missile[]{
  return Array.from({length:18},(_,i)=>{
    const side=(i%2) as 0|1,k=1.8+(i*1.37)%7.2,z=17+(i*7)%30;
    const p=side===0?{x:k,y:0}:{x:0,y:k};
    return {start:3.55+(i%6)*.045,duration:.35+(i%4)*.07,target:project(p,z),
      floor:project(side===0?{x:k+.35,y:.75+(i%3)*.45}:{x:.65+(i%3)*.45,y:k+.2}),side,seed:i};
  });
}
const splat=(ctx:CanvasRenderingContext2D,p:Point,seed:number,wall:boolean)=>{
  const size=wall?5+seed%4:3+seed%3;
  const spray=Array.from({length:12},(_,i)=>{
    const angle=i/12*Math.PI*2,radius=size*(i%2?.48:1+(i+seed)%3*.16);
    return {x:p.x+Math.cos(angle)*radius,y:p.y+Math.sin(angle)*radius*(wall?.85:.4)};
  });
  poly(ctx,spray,'#762337');poly(ctx,spray.map(a=>({x:mix(p.x,a.x,.8),y:mix(p.y,a.y,.8)})),BLOOD);
  rect(ctx,p.x-2,p.y-2,3,2,'#ee5260');
  for(let i=0;i<3;i++){
    const dx=((seed*7+i*11)%15)-7,dy=((seed*3+i*5)%9)-4;
    rect(ctx,p.x+dx,p.y+dy,2,2,BLOOD);
    if(wall)rect(ctx,p.x+dx,p.y+dy+2,1,3+(seed+i)%7,'#b22438');
  }
};

function fragment(ctx:CanvasRenderingContext2D,p:Point,i:number,colors:string[],time:number,reducedMotion:boolean,avatarId:string){
  const color=colors[i%colors.length],turn=reducedMotion?0:Math.floor(time*12+i)%4;
  const x=p.x,y=p.y,w=turn%2?4:6,h=turn%2?6:4;
  if(avatarId==='andy'||avatarId==='ding'){
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(turn>=2?-1:1,1);
    if(avatarId==='andy'){
      if(i%3===0){
        // Black cap, with its flat brim still unmistakable as it tumbles away.
        rect(ctx,-5,-4,10,6,INK);rect(ctx,-4,-5,7,4,'#29384c');rect(ctx,-4,-3,8,3,'#23334c');
        rect(ctx,2,0,7,2,'#0c1b30');rect(ctx,-3,-4,3,1,'#657486');
      }else if(i%3===1){
        // A brown boot with a torn blue trouser cuff.
        rect(ctx,-3,-6,6,11,INK);rect(ctx,-2,-5,4,4,'#477fb0');rect(ctx,-2,-1,4,4,'#99653e');
        rect(ctx,-2,2,8,3,INK);rect(ctx,-1,2,6,2,'#a87546');rect(ctx,0,1,3,1,'#d7a267');
      }else{
        // The orange lanyard and little cream badge survive as a recognisable pair.
        rect(ctx,-2,-7,1,7,'#ed973e');rect(ctx,2,-6,1,6,'#ed973e');
        rect(ctx,-3,-1,7,6,INK);rect(ctx,-2,0,5,4,'#f3e6b8');rect(ctx,-1,1,2,2,'#428aab');
      }
    }else if(i%3===0){
      rect(ctx,-6,-4,11,6,INK);rect(ctx,-5,-4,9,4,'#d8444f');rect(ctx,-3,-5,5,1,'#ef6970');
      rect(ctx,-7,1,14,2,INK);rect(ctx,-5,0,10,2,'#edb54c');
    }else if(i%3===1){
      rect(ctx,-3,-5,6,9,INK);rect(ctx,-2,-4,4,6,'#42aaa7');rect(ctx,-2,1,9,4,INK);
      rect(ctx,-1,1,7,3,'#4db8b0');rect(ctx,0,1,4,1,'#94ddc4');
    }else{
      ellipse(ctx,0,0,7,5,INK);ellipse(ctx,0,-1,5,3,'#dfa83b');
      rect(ctx,-4,-3,5,1,'#fff0a0');rect(ctx,-6,2,12,2,'#bc7d28');rect(ctx,3,-4,3,4,INK);
    }
    // A few red pixels tie the recognizable belongings to the exaggerated burst.
    rect(ctx,-4,3,2,2,BLOOD);ctx.restore();return;
  }
  poly(ctx,[{x:x-w,y:y-h},{x:x+w-1,y:y-h+1},{x:x+w,y:y+h},{x:x-2,y:y+h-1},{x:x-w,y:y+1}],INK);
  poly(ctx,[{x:x-w+1,y:y-h+1},{x:x+w-2,y:y-h+2},{x:x+w-1,y:y+h-1},{x:x-2,y:y+h-2}],color);
  rect(ctx,x-1,y-1,2,2,colors[(i+1)%colors.length]);
}

let growthCanvas:HTMLCanvasElement|null=null;
/** Layers are respectively behind all sprites, at the plant's depth, and over sprites. */
export function drawPlantEncounter(ctx:CanvasRenderingContext2D,options:PlantEncounterOptions,layer:'back'|'plant'|'front'):void {
  const scale=plantGrowthScale(options.age);
  if(scale<1&&layer!=='front'){
    // Rasterize the independently growing parts first, then resize whole pixels.
    // Scaling individual canvas polygons would blur a 23px seedling's outline.
    if(!growthCanvas){growthCanvas=document.createElement('canvas');growthCanvas.width=224;growthCanvas.height=176;}
    const g=growthCanvas.getContext('2d')!,ground=project(options.plant),anchor={x:112,y:152};
    g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,224,176);g.save();
    g.translate(anchor.x-Math.round(ground.x),anchor.y-Math.round(ground.y));
    drawPlantEncounterNative(g,options,layer);g.restore();
    ctx.save();ctx.imageSmoothingEnabled=false;
    ctx.drawImage(growthCanvas,Math.round(ground.x)-Math.round(anchor.x*scale),Math.round(ground.y)-Math.round(anchor.y*scale),Math.round(224*scale),Math.round(176*scale));
    ctx.restore();return;
  }
  drawPlantEncounterNative(ctx,options,layer);
}

function drawPlantEncounterNative(ctx:CanvasRenderingContext2D,options:PlantEncounterOptions,layer:'back'|'plant'|'front'):void {
  const {plant,origin,age,time,reducedMotion,avatarId}=options;
  const phase=plantEncounterPhase(age),g=geometry(plant,age,reducedMotion),{ground,head,growth,gap,width}=g;
  const motion=reducedMotion?0:Math.floor(time*12)/12;
  const colors=options.avatarColors?.length?options.avatarColors:avatarId==='ding'?['#e9b84c','#e55155','#3eafaa']:
    avatarId==='andy'?['#244d84','#69bceb','#e8d1ac']:['#66c8be','#a78bd7','#f1cc73'];
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(layer==='back'){
    // Permanent impact stains appear on the actual rear wall planes.
    for(const m of missiles())if(age>=m.start+m.duration)splat(ctx,m.target,m.seed,true);
    const rootReach=mix(17,73,growth);
    for(let i=0;i<5;i++){
      const direction=(i%2?1:-1),length=rootReach*(.5+i*.11),wave=reducedMotion?0:Math.sin(age*5+i)*5;
      const points=[ground,{x:ground.x+direction*length*.4,y:ground.y-5-i*2},
        {x:ground.x+direction*length*.78,y:ground.y+7+wave},{x:ground.x+direction*length,y:ground.y+1+wave}];
      chain(ctx,points,6,INK);chain(ctx,points,3,i%2?GREEN:LEAF);
      rect(ctx,points[2].x,points[2].y-4,2,4,LIGHT);
    }
    // Two tendrils visibly reach out and pull the chosen explorer toward the jaw.
    if(age>.85&&age<2.05){
      const explorer=plantExplorerPose(origin,plant,age,reducedMotion).position,reach=ease((age-.85)/.5);
      for(const side of [-1,1]){
        const base={x:ground.x+side*15,y:ground.y-29},tip={x:mix(base.x,explorer.x+side*7,reach),y:mix(base.y,explorer.y-10,reach)};
        const points=[base,{x:mix(base.x,tip.x,.45)+side*17,y:mix(base.y,tip.y,.45)-13},tip];
        chain(ctx,points,7,INK);chain(ctx,points,4,GREEN);rect(ctx,tip.x-3,tip.y-3,6,5,LIGHT);
      }
    }
  }else if(layer==='plant'){
    // Separate stem segments flex beneath the heavy, independently moving jaws.
    const stem=[ground,{x:ground.x-8-growth*4,y:ground.y-28},{x:head.x+7,y:ground.y-52},{x:head.x,y:head.y+18}];
    chain(ctx,stem,18+growth*3,INK);chain(ctx,stem,12+growth*3,GREEN);
    chain(ctx,stem.map(p=>({x:p.x-3,y:p.y})),3,LIGHT);
    for(const side of [-1,1]){
      const flutter=reducedMotion?0:Math.sin(age*7+side)*5;
      leaf(ctx,{x:ground.x,y:ground.y-17},{x:ground.x+side*mix(28,69,growth),y:ground.y-25-flutter},13+growth*4);
      leaf(ctx,{x:ground.x+4,y:ground.y-44},{x:ground.x+side*mix(19,48,growth),y:ground.y-64+flutter},11+growth*3);
    }
    ellipse(ctx,ground.x,ground.y,27,7,INK);ellipse(ctx,ground.x,ground.y-2,23,6,LEAF);
    ellipse(ctx,head.x,head.y,width-3,gap/2+5,INK);
    ellipse(ctx,head.x+2,head.y+gap/2-3,width*.56,5,'#8f2d4e');
    jaw(ctx,head,width,gap,false);jaw(ctx,head,width,gap,true);
    if(phase==='chewing'){
      // Cheek bulges alternate rather than scaling or bobbing the whole plant.
      const side=g.chew>=0?1:-1;
      ellipse(ctx,head.x+side*(width-3),head.y+6,7+Math.abs(g.chew)*3,9,INK);
      ellipse(ctx,head.x+side*(width-3),head.y+5,5+Math.abs(g.chew)*3,7,GREEN);
      rect(ctx,head.x+side*(width-3)-2,head.y+2,3,3,LIGHT);
    }
  }else{
    // Front lip and teeth pass in front of the actual explorer as it is swallowed.
    if(phase==='swallowing'&&age>1.82)jaw(ctx,head,width,gap,true);
    for(const m of missiles()){
      const elapsed=age-m.start;if(elapsed<0)continue;
      const progress=clamp(elapsed/m.duration),source={x:head.x,y:head.y+5};
      const position={x:mix(source.x,m.target.x,progress),y:mix(source.y,m.target.y,progress)-Math.sin(progress*Math.PI)*(13+m.seed%4*4)};
      if(progress<1){
        // Comically oversized crimson droplets, with a short segmented trail.
        for(let trail=2;trail>=0;trail--){
          const k=clamp(progress-trail*.055),p={x:mix(source.x,m.target.x,k),y:mix(source.y,m.target.y,k)-Math.sin(k*Math.PI)*(13+m.seed%4*4)};
          rect(ctx,p.x-2,p.y-2,trail===0?5:3,trail===0?5:3,trail===0?'#ef4c60':BLOOD);
        }
        if(m.seed%2===0)fragment(ctx,{x:position.x+4,y:position.y+3},m.seed,colors,motion,reducedMotion,avatarId);
        else {ellipse(ctx,position.x,position.y,4,3,'#752138');rect(ctx,position.x-2,position.y-2,4,3,BLOOD);}
      }else{
        const fall=clamp((elapsed-m.duration)/(.5+m.seed%3*.1));
        const p={x:mix(m.target.x,m.floor.x,fall),y:mix(m.target.y,m.floor.y,fall*fall)};
        if(fall===1)splat(ctx,m.floor,m.seed,false);
        if(m.seed%2===0)fragment(ctx,p,m.seed,colors,fall===1?m.seed:motion,reducedMotion||fall===1,avatarId);
      }
    }
    if(phase==='aftermath'){
      // A slow final crimson drip leaves a clear, readable aftermath frame.
      rect(ctx,head.x+12,head.y+gap/2+4,2,7,'#bc304c');
      rect(ctx,head.x+11,head.y+gap/2+10,4,3,'#ef4c60');
    }
  }
  ctx.restore();
}
