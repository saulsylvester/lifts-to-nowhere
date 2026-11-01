export const SAVE_KEY = 'andy-nowhere-v1';
export const APPEARANCE_KEY = 'nowhere-explorer-v1';
export const MAX_FLOOR = 101;
export type Point = {x:number; y:number};
export type Progress = {collected:Set<number>; visited:Set<number>; muted:boolean};
export type StorageLike = Pick<Storage,'getItem'|'setItem'> | null;
export function parseFloor(value:unknown):number|null {
  const text=String(value).trim();
  if(!/^\d+$/.test(text))return null;
  // The lift has one answer for every destination beyond its hundred ordinary floors.
  const n=Number(text);return n>=1?Math.min(n,MAX_FLOOR):null;
}
export function readProgress(storage:StorageLike):Progress {
  try {
    const v=JSON.parse(storage?.getItem(SAVE_KEY)??'null');
    const valid=(a:unknown,max:number)=>new Set<number>(Array.isArray(a)?a.filter(n=>Number.isInteger(n)&&n>=1&&n<=max):[]);
    const collected=valid(v?.collected,100),visited=valid(v?.visited,101);
    collected.forEach(n=>visited.add(n));return {collected,visited,muted:v?.muted===true};
  }catch{return {collected:new Set(),visited:new Set(),muted:false};}
}
export function saveProgress(storage:StorageLike,p:Progress):boolean {
  try {if(!storage)return false;storage.setItem(SAVE_KEY,JSON.stringify({collected:[...p.collected],visited:[...p.visited],muted:p.muted}));return true;}catch{return false;}
}
export function collect(p:Progress,id:number):boolean {
  if(!Number.isInteger(id)||id<1||id>100||p.collected.has(id))return false;
  p.collected.add(id);p.visited.add(id);return true;
}
// Reserve the top 34 pixels for the HUD and the bottom 29 for the prompt.
export function project(p:Point,z=0):Point{return {x:224+(p.x-p.y)*16,y:106+(p.x+p.y)*8-z};}
export function unproject(p:Point):Point{const x=(p.x-224)/16,y=(p.y-106)/8;return {x:(x+y)/2,y:(y-x)/2};}
export function screenMovement(x:number,y:number,dt:number):Point {
  const n=Math.hypot(x,y);if(!n)return {x:0,y:0};
  const sx=x/n*66*dt,sy=y/n*66*dt;return {x:sx/32+sy/16,y:sy/16-sx/32};
}
export type Locomotion='walk'|'swim'|'float';
/** Free movement retains a little momentum, equally for every avatar. */
export function driftMovement(velocity:Point,input:Point,dt:number,mode:'swim'|'float'):{velocity:Point;delta:Point}{
 const length=Math.hypot(input.x,input.y),speed=mode==='swim'?52:62;
 const response=length?(mode==='swim'?.12:.2):(mode==='swim'?.1:.18),blend=1-Math.exp(-dt/response);
 const target=length?{x:input.x/length*speed,y:input.y/length*speed}:{x:0,y:0};
 const next={x:velocity.x+(target.x-velocity.x)*blend,y:velocity.y+(target.y-velocity.y)*blend};
 if(!length&&Math.hypot(next.x,next.y)<.3)next.x=next.y=0;
 const sx=next.x*dt,sy=next.y*dt;
 return {velocity:next,delta:{x:sx/32+sy/16,y:sy/16-sx/32}};
}
export type Footprint = {x:number;y:number;w:number;h:number};
export function canStand(p:Point,obstacles:Footprint[]=[],width=12,height=10):boolean {
  const r=.19;
  return p.x>=.3&&p.y>=.3&&p.x<=width-.3&&p.y<=height-.3&&!obstacles.some(o=>p.x+r>o.x-o.w/2&&p.x-r<o.x+o.w/2&&p.y+r>o.y-o.h/2&&p.y-r<o.y+o.h/2);
}
export const distance=(a:Point,b:Point)=>Math.hypot(project(a).x-project(b).x,project(a).y-project(b).y);
export const pad=(n:number)=>String(n).padStart(2,'0');
