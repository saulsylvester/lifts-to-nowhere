import {floors as authored} from './catalogue';
import type {Point,Footprint} from './core';
import {SPACE_FLOOR,spacePlanets} from './space';
import {BLACK_HOLE_FLOOR} from './black-hole';
export type Prop = Point & {kind:string;variant:number;w:number;h:number;solid:boolean};
export type RoomDefinition = {id:number;name:string;action:string;caption:string;stamp:string;palette:string;effect:string;deadly?:boolean;props:Prop[];focus:Point};
const flat=new Set('rug puddle letter sock shoe map rope bone ticket scarf paint baton rainbow jellyfish cloud star balloon'.split(' '));
const wide=new Set('table bench sofa tank bridge carousel shelf bed belt'.split(' '));
// Fixed floor-space staging: authored hero, paired side displays, then foreground details.
const slots:Point[]=[{x:4.7,y:3.6},{x:2.3,y:5.8},{x:8.7,y:2.5},{x:3.1,y:8.2},{x:9.6,y:5.2},{x:7.1,y:1.4}];
export const floors:RoomDefinition[]=authored.map((f:any)=>{
 const props=f.props.map((p:any,i:number)=>({...slots[i%slots.length],kind:p.kind,variant:i===0&&(p.kind==='jellyfish'||f.id===7&&p.kind==='cloud')?9:p.variant,w:p.kind==='carnivore'?2.2:wide.has(p.kind)?2.3:.8,h:p.kind==='carnivore'?1.6:wide.has(p.kind)?1.4:.75,solid:!flat.has(p.kind)&&!(f.id===BLACK_HOLE_FLOOR&&p.kind==='hole')}));
 if(f.id===SPACE_FLOOR)return {...f,props:[...spacePlanets.map(p=>({x:p.x,y:p.y,kind:'planet',variant:0,w:p.radius/11,h:p.radius/11,solid:true})),...props.slice(1).map((p:Prop,i:number)=>({...p,...[{x:1.7,y:2},{x:9,y:6},{x:4.8,y:8.6}][i],solid:false}))],focus:{x:7,y:4.8}};
 return {...f,props,focus:{x:props[0].x+.9,y:props[0].y+1.05}};
});
export const floorById=new Map(floors.map(f=>[f.id,f]));
export const ENTRY={x:9.5,y:7.5};
// Door anchors live exactly on a rear wall. Arrival positions sit just inside
// that same threshold, far enough away to prevent an immediate return trip.
export const DOOR={x:6,y:0},LIFT_DOOR={x:3,y:0},ROOM_DOOR={x:9.7,y:0},PANEL={x:4.8,y:0};
export const LIFT_ENTRY={x:3,y:1.3},LOBBY_LIFT_ENTRY={x:6,y:1.3},ROOM_ENTRY={x:9.7,y:1.3};
// Shortcut returns face the wall panel, safely away from the exit threshold.
export const LIFT_PANEL_ENTRY={x:PANEL.x,y:.85};
export const EXIT={x:ROOM_DOOR.x,y:.45};
export function sceneLayout(state:string){return state==='elevator'||state==='travel'?{width:6,height:5}:{width:12,height:10};}
export function exitDoor(state:string):Point|null{return state==='elevator'?LIFT_DOOR:state==='room'?ROOM_DOOR:null;}
export const lobbyProps:Prop[]=[
 {kind:'sofa',x:3,y:7,w:2.3,h:1.4,solid:true,variant:0},
 {kind:'plant',x:1.2,y:3,w:.7,h:.7,solid:true,variant:0},
 {kind:'plant',x:10.5,y:1.5,w:.7,h:.7,solid:true,variant:0},
 {kind:'table',x:8.9,y:5.8,w:2.5,h:1.4,solid:true,variant:0},
 {kind:'suitcase',x:4.8,y:8.5,w:.7,h:.7,solid:true,variant:0},
 {kind:'lamp',x:1.4,y:8.5,w:.7,h:.7,solid:true,variant:0},
 {kind:'shelf',x:2.25,y:.4,w:2.5,h:.8,solid:true,variant:0},
];
export function obstacles(state:string,room:RoomDefinition|null):Footprint[]{
 const props=state==='lobby'?lobbyProps:state==='room'?room?.props??[]:[];
 return props.filter(p=>p.solid).map(({x,y,w,h})=>({x,y,w,h}));
}
