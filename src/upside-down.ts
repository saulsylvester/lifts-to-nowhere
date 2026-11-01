import type {Point} from './core';

export const FLIP_FLOOR=69;
export const FLIP_DELAY=.45;
export const FLIP_DURATION=.65;
// Bounds include wall trim and the ten-pixel front lip below the floor tiles.
export const FLIP_ROOM_BOUNDS={left:62,top:43,right:418,bottom:292} as const;
export const FLIP_VIEW_BOUNDS={left:16,top:38,right:464,bottom:287} as const;
export type FlipView={
  angle:number;scale:number;center:Point;sourceCenter:Point;
  matrix:[number,number,number,number,number,number];
};

function clamp(n:number){return Math.max(0,Math.min(1,n));}
function clean(n:number){return Math.abs(n)<1e-10?0:n;}
function trig(angle:number):{cos:number;sin:number}{
  return {cos:clean(Math.cos(angle)),sin:clean(Math.sin(angle))};
}

/** Clockwise roll, independent of the bakery's repeatable discovery effect. */
export function flipAngle(age:number,reducedMotion=false):number {
  if(Number.isNaN(age)||age<FLIP_DELAY)return 0;
  if(reducedMotion)return Math.PI;
  const t=clamp((age-FLIP_DELAY)/FLIP_DURATION);
  return Math.PI*t*t*(3-2*t);
}

export function flipInProgress(age:number,reducedMotion=false):boolean {
  return !reducedMotion&&age>=FLIP_DELAY&&age<FLIP_DELAY+FLIP_DURATION;
}

/** Rotate a keyboard direction back into the room's original screen axes. */
export function screenToRoomInput(point:Point,angle:number):Point {
  const {cos,sin}=trig(angle);
  return {x:clean(point.x*cos+point.y*sin),y:clean(-point.x*sin+point.y*cos)};
}

/** Fit every rotated world corner between the upright HUD and interaction bar. */
export function flipView(age:number,reducedMotion=false):FlipView {
  const angle=flipAngle(age,reducedMotion),{cos,sin}=trig(angle);
  const width=FLIP_ROOM_BOUNDS.right-FLIP_ROOM_BOUNDS.left,height=FLIP_ROOM_BOUNDS.bottom-FLIP_ROOM_BOUNDS.top;
  const rotatedWidth=width*Math.abs(cos)+height*Math.abs(sin),rotatedHeight=width*Math.abs(sin)+height*Math.abs(cos);
  const scale=Math.min(1,(FLIP_VIEW_BOUNDS.right-FLIP_VIEW_BOUNDS.left)/rotatedWidth,(FLIP_VIEW_BOUNDS.bottom-FLIP_VIEW_BOUNDS.top)/rotatedHeight);
  const center={x:(FLIP_VIEW_BOUNDS.left+FLIP_VIEW_BOUNDS.right)/2,y:(FLIP_VIEW_BOUNDS.top+FLIP_VIEW_BOUNDS.bottom)/2};
  const sourceCenter={x:(FLIP_ROOM_BOUNDS.left+FLIP_ROOM_BOUNDS.right)/2,y:(FLIP_ROOM_BOUNDS.top+FLIP_ROOM_BOUNDS.bottom)/2};
  const a=clean(scale*cos),b=clean(scale*sin),c=clean(-scale*sin),d=clean(scale*cos);
  // The endpoint matrices are exact integer translations/reflections, preserving
  // the native pixel grid once upright or fully upside down.
  const matrix:[number,number,number,number,number,number]=[a,b,c,d,center.x-a*sourceCenter.x-c*sourceCenter.y,center.y-b*sourceCenter.x-d*sourceCenter.y];
  return {angle,scale,center,sourceCenter,matrix};
}

function viewFor(ageOrView:number|FlipView,reducedMotion:boolean):FlipView {
  return typeof ageOrView==='number'?flipView(ageOrView,reducedMotion):ageOrView;
}

/** Map an already-projected room point to the visible canvas, including fitting. */
export function roomToViewPoint(point:Point,ageOrView:number|FlipView,reducedMotion=false):Point {
  const [a,b,c,d,e,f]=viewFor(ageOrView,reducedMotion).matrix;
  return {x:a*point.x+c*point.y+e,y:b*point.x+d*point.y+f};
}

/** Inverse of roomToViewPoint, useful for inspector picks and geometry checks. */
export function viewToRoomPoint(point:Point,ageOrView:number|FlipView,reducedMotion=false):Point {
  const [a,b,c,d,e,f]=viewFor(ageOrView,reducedMotion).matrix,det=a*d-b*c;
  const x=point.x-e,y=point.y-f;
  return {x:(d*x-c*y)/det,y:(-b*x+a*y)/det};
}
