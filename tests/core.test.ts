import {describe,it,expect} from 'vitest';
import {parseFloor,readProgress,saveProgress,collect,project,unproject,screenMovement,driftMovement,canStand,SAVE_KEY} from '../src/core';
import {floors,ROOM_ENTRY,EXIT,DOOR,LIFT_DOOR,ROOM_DOOR,PANEL,LIFT_ENTRY,LOBBY_LIFT_ENTRY,sceneLayout,exitDoor,obstacles} from '../src/rooms';
import {propKinds,effectKinds} from '../src/catalogue-art';
import {validateSheetShape,animationRow} from '../src/avatars';
import {SPACE_FLOOR,spacePlanets,spacePlanetsAt,spaceCanStand,resolveSpaceOverlap} from '../src/space';
import {plantExplorerPose} from '../src/plant-encounter';
import {FLIP_DELAY,FLIP_DURATION,FLIP_ROOM_BOUNDS,FLIP_VIEW_BOUNDS,flipAngle,flipInProgress,flipView,roomToViewPoint,viewToRoomPoint,screenToRoomInput} from '../src/upside-down';
import {dentistPose,DENTIST_POSITION} from '../src/dentist';
describe('authored building',()=>{
 it('preserves all 101 stories, 135 props and 94 effects',()=>{expect(floors).toHaveLength(101);expect(new Set(floors.map(f=>f.name)).size).toBe(101);expect(new Set(floors.flatMap(f=>f.props.map(p=>p.kind))).size).toBe(135);expect(effectKinds.size).toBe(94);for(const f of floors){expect(effectKinds.has(f.effect)).toBe(true);for(const p of f.props)expect(propKinds.has(p.kind)).toBe(true);expect(canStand(ROOM_ENTRY,obstacles('room',f))).toBe(true);expect(canStand(EXIT,obstacles('room',f))).toBe(true);expect(canStand(f.focus,obstacles('room',f))).toBe(true);}});
 it('every room has a connected walkable route from entry to discovery and exit',()=>{for(const f of floors){const obs=obstacles('room',f),queue=[ROOM_ENTRY],seen=new Set<string>();let found=false,exit=false;while(queue.length){const p=queue.shift()!,key=`${p.x.toFixed(1)},${p.y.toFixed(1)}`;if(seen.has(key)||!canStand(p,obs))continue;seen.add(key);if(Math.hypot(p.x-f.focus.x,p.y-f.focus.y)<.5)found=true;if(Math.hypot(p.x-EXIT.x,p.y-EXIT.y)<.5)exit=true;for(const [x,y]of[[.25,0],[-.25,0],[0,.25],[0,-.25]]){const q={x:p.x+x,y:p.y+y};if(q.x>=.3&&q.x<=11.7&&q.y>=.3&&q.y<=9.7)queue.push(q);}}expect(found,`floor ${f.id}: discovery`).toBe(true);expect(exit,`floor ${f.id}: exit`).toBe(true);}});

 it('uses a smaller lift cabin with door-adjacent walkable arrivals',()=>{
  const room=sceneLayout('room'),lobby=sceneLayout('lobby'),lift=sceneLayout('elevator');
  expect(lobby).toEqual(room);expect(lift.width*lift.height).toBeLessThanOrEqual(room.width*room.height/3);expect(sceneLayout('travel')).toEqual(lift);expect(exitDoor('elevator')).toEqual(LIFT_DOOR);expect(exitDoor('room')).toEqual(ROOM_DOOR);expect(exitDoor('landing')).toBeNull();
  for(const [spawn,door,layout]of [[LIFT_ENTRY,LIFT_DOOR,lift],[LOBBY_LIFT_ENTRY,DOOR,lobby],[ROOM_ENTRY,ROOM_DOOR,room]] as const){
   expect(canStand(spawn,[],layout.width,layout.height)).toBe(true);expect(Math.hypot(spawn.x-door.x,spawn.y-door.y)).toBeLessThan(1.5);expect(door.x===0||door.y===0).toBe(true);
  }
  expect(PANEL.y).toBe(0);expect(PANEL.x).toBeLessThan(lift.width);expect(canStand({x:6.1,y:2},[],lift.width,lift.height)).toBe(false);expect(canStand({x:3,y:5.1},[],lift.width,lift.height)).toBe(false);
 });
 it('keeps the rear wall apex and room floor between the HUD and prompt',()=>{
  const rear=project({x:0,y:0},64),front=project({x:12,y:10});
  expect(rear.y).toBeGreaterThan(320*.102+4);expect(front.y+4).toBeLessThan(320*(1-.09));
 });
 it('keeps the floating doorway connected to the jellybean discovery around round planets',()=>{
  const room=floors[SPACE_FLOOR-1];for(const planet of spacePlanets)expect(spaceCanStand(planet)).toBe(false);expect(spaceCanStand(ROOM_ENTRY)).toBe(true);expect(spaceCanStand(room.focus)).toBe(true);
  const queue=[ROOM_ENTRY],seen=new Set<string>();let found=false,exit=false;
  while(queue.length){const p=queue.shift()!,key=`${p.x.toFixed(2)},${p.y.toFixed(2)}`;if(seen.has(key)||!canStand(p)||!spaceCanStand(p))continue;seen.add(key);if(Math.hypot(p.x-room.focus.x,p.y-room.focus.y)<.5)found=true;if(Math.hypot(p.x-EXIT.x,p.y-EXIT.y)<.5)exit=true;for(const [x,y]of[[.25,0],[-.25,0],[0,.25],[0,-.25]]){const q={x:p.x+x,y:p.y+y};if(q.x>=.3&&q.x<=11.7&&q.y>=.3&&q.y<=9.7)queue.push(q);}}
  expect(found).toBe(true);expect(exit).toBe(true);
 });
 it('moves the pushed planets continuously and uses their current centers for collision and overlap recovery',()=>{
  expect(spacePlanetsAt(null)).toEqual(spacePlanets);expect(spacePlanetsAt(0)).toEqual(spacePlanets);expect(spacePlanetsAt(4)).not.toEqual(spacePlanetsAt(8));expect(spacePlanetsAt(8)).not.toEqual(spacePlanetsAt(12));
  for(const age of [0,.5,2,4,8,12,20,30]){expect(spaceCanStand(EXIT,age)).toBe(true);for(const planet of spacePlanetsAt(age)){expect(spaceCanStand(planet,age)).toBe(false);const recovered=resolveSpaceOverlap(planet,age);expect(spaceCanStand(recovered,age)).toBe(true);expect(canStand(recovered)).toBe(true);}}
  expect(spacePlanetsAt(2,true)).toEqual(spacePlanetsAt(20,true));
 });
 it('keeps the bonus floor deadly and non-collectible',()=>{expect(floors[100].deadly).toBe(true);const p=readProgress(null);expect(collect(p,101)).toBe(false);});
});
describe('simulation and progress',()=>{
 it('clamps positive whole floors above 100 to 101 without accepting fractional or exponent input',()=>{for(const value of ['1','07','100','101',' 42 '])expect(parseFloor(value)).not.toBeNull();expect(parseFloor('100')).toBe(100);expect(parseFloor('0007')).toBe(7);for(const value of ['102','9999',' 123456789 ','9'.repeat(1000)])expect(parseFloor(value)).toBe(101);for(const value of ['','0','0000','1e2','1.0','-1','0x10','NaN','Infinity'])expect(parseFloor(value)).toBeNull();});
 it('round-trips projection and normalizes diagonal screen movement',()=>{for(const point of [{x:0,y:0},{x:5.3,y:7.7},{x:12,y:10}]){const restored=unproject(project(point));expect(restored.x).toBeCloseTo(point.x);expect(restored.y).toBeCloseTo(point.y);}const origin=project({x:0,y:0});const straight=project(screenMovement(1,0,1)),diagonal=project(screenMovement(1,1,1));expect(Math.hypot(straight.x-origin.x,straight.y-origin.y)).toBeCloseTo(Math.hypot(diagonal.x-origin.x,diagonal.y-origin.y));});
 it.each(['swim','float'] as const)('%s movement normalizes diagonals and gently coasts to rest',mode=>{
  const simulate=(input:{x:number;y:number})=>{let velocity={x:0,y:0};for(let i=0;i<60;i++)velocity=driftMovement(velocity,input,1/60,mode).velocity;return velocity;};
  const straight=simulate({x:1,y:0}),diagonal=simulate({x:1,y:1});expect(Math.hypot(straight.x,straight.y)).toBeCloseTo(Math.hypot(diagonal.x,diagonal.y));expect(straight.x).toBeGreaterThan(40);expect(straight.x).toBeLessThan(67);
  const coast=driftMovement(straight,{x:0,y:0},1/60,mode);expect(coast.velocity.x).toBeGreaterThan(0);expect(coast.velocity.x).toBeLessThan(straight.x);expect(coast.delta.x).toBeGreaterThan(0);let velocity=coast.velocity;for(let i=0;i<120;i++)velocity=driftMovement(velocity,{x:0,y:0},1/60,mode).velocity;expect(velocity).toEqual({x:0,y:0});
 });
 it('blocks footprints and floor boundaries',()=>{expect(canStand({x:-1,y:3})).toBe(false);expect(canStand({x:4,y:4},[{x:4,y:4,w:1,h:1}])).toBe(false);expect(canStand({x:5,y:4},[{x:4,y:4,w:1,h:1}])).toBe(true);});
 it('reads legacy saves, deduplicates discoveries and survives broken storage',()=>{const m=new Map<string,string>();const s={getItem:(k:string)=>m.get(k)??null,setItem:(k:string,v:string)=>{m.set(k,v);}};s.setItem(SAVE_KEY,JSON.stringify({collected:[1,1,101,'4',7],visited:[101],muted:true}));const p=readProgress(s);expect([...p.collected]).toEqual([1,7]);expect(p.visited.has(7)).toBe(true);expect(collect(p,7)).toBe(false);expect(collect(p,100)).toBe(true);expect(saveProgress(s,p)).toBe(true);expect(readProgress(s).collected.size).toBe(3);expect(readProgress(null).collected.size).toBe(0);expect(saveProgress(null,p)).toBe(false);s.setItem(SAVE_KEY,'broken');expect(readProgress(s).collected.size).toBe(0);});
});
describe('pet format adapter',()=>{
 it('accepts both pet formats and rejects invalid inputs',()=>{expect(validateSheetShape('image/png',1000,1536,1872)).toBe(1);expect(validateSheetShape('image/webp',1000,1536,2288)).toBe(2);expect(()=>validateSheetShape('image/jpeg',1000,1536,1872)).toThrow('PNG');expect(()=>validateSheetShape('image/png',21*1024*1024,1536,1872)).toThrow('20 MiB');expect(()=>validateSheetShape('image/png',1000,512,512)).toThrow('1536');});
 it('uses actual locomotion rows and keeps look rows out of walking',()=>{expect(animationRow('right')).toBe(1);expect(animationRow('left')).toBe(2);expect(animationRow('up')).toBe(0);expect(animationRow('celebrate')).toBe(4);expect(animationRow('failed')).toBe(5);});
});

describe('plant encounter',()=>{
 it('pulls the explorer into the mouth and disables spinning with reduced motion',()=>{
  const plant=floors[100].props[0],start=plantExplorerPose(ROOM_ENTRY,plant,0,false),grab=plantExplorerPose(ROOM_ENTRY,plant,1.7,false),still=plantExplorerPose(ROOM_ENTRY,plant,1.7,true);
  expect(start.position).toEqual(project(ROOM_ENTRY));expect(start.visible).toBe(true);expect(grab.position).not.toEqual(start.position);expect(grab.scale).toBeLessThan(start.scale);expect(grab.rotation).not.toBe(0);expect(still.rotation).toBe(0);expect(still.visible).toBe(true);expect(plantExplorerPose(ROOM_ENTRY,plant,2.1,false).visible).toBe(false);
 });
});
describe('zipper dentist',()=>{
 it('arrives beside the chair, approaches the zipper and raises the mirror to examine and approve',()=>{
  const arriving=dentistPose(null,false,0),waiting=dentistPose(null,false,1),approach=dentistPose(.2),examine=dentistPose(1),approve=dentistPose(2.2);
  expect(arriving.position).not.toEqual(waiting.position);expect(waiting.position).toEqual(DENTIST_POSITION);expect(waiting.stage).toBe('waiting');expect(waiting.toolRaised).toBe(false);expect(approach.stage).toBe('approach');expect(approach.position).not.toEqual(waiting.position);expect(examine.stage).toBe('examine');expect(examine.toolRaised).toBe(true);expect(approve.stage).toBe('approve');expect(approve.toolOffset).not.toBe(examine.toolOffset);expect(dentistPose(null,true,0).position).toEqual(DENTIST_POSITION);expect(dentistPose(1,true).toolOffset).toBe(dentistPose(1.5,true).toolOffset);
 });
});
describe('upside-down room',()=>{
 it('rolls after a short delay and snaps directly when reduced motion is enabled',()=>{
  expect(flipAngle(0,false)).toBe(0);expect(flipAngle(FLIP_DELAY-.01,false)).toBe(0);expect(flipInProgress(FLIP_DELAY+FLIP_DURATION/2)).toBe(true);expect(flipAngle(FLIP_DELAY+FLIP_DURATION/2,false)).toBeCloseTo(Math.PI/2);expect(flipAngle(FLIP_DELAY+FLIP_DURATION,false)).toBe(Math.PI);expect(flipInProgress(FLIP_DELAY+FLIP_DURATION+.01)).toBe(false);
  for(let age=0;age<2;age+=.025){expect([0,Math.PI]).toContain(flipAngle(age,true));expect(flipInProgress(age,true)).toBe(false);}
 });
 it('keeps the whole room visible during rotation and round-trips door and player coordinates',()=>{
  const {left,top,right,bottom}=FLIP_ROOM_BOUNDS,corners:{x:number;y:number}[]=[{x:left,y:top},{x:right,y:top},{x:left,y:bottom},{x:right,y:bottom}];
  for(let age=0;age<1.5;age+=.025){const view=flipView(age,false);for(const point of [...corners,project(ROOM_DOOR),project(ROOM_ENTRY)]){const transformed=roomToViewPoint(point,view),restored=viewToRoomPoint(transformed,view);expect(restored.x).toBeCloseTo(point.x);expect(restored.y).toBeCloseTo(point.y);if(corners.includes(point)){expect(transformed.x).toBeGreaterThanOrEqual(FLIP_VIEW_BOUNDS.left-.001);expect(transformed.x).toBeLessThanOrEqual(FLIP_VIEW_BOUNDS.right+.001);expect(transformed.y).toBeGreaterThanOrEqual(FLIP_VIEW_BOUNDS.top-.001);expect(transformed.y).toBeLessThanOrEqual(FLIP_VIEW_BOUNDS.bottom+.001);}}}
 });
 it('inverse-transforms keyboard directions so visible movement stays screen-relative',()=>{
  for(const age of [0,FLIP_DELAY+FLIP_DURATION*.25,FLIP_DELAY+FLIP_DURATION*.5,1.5])for(const input of [{x:1,y:0},{x:0,y:1},{x:-1,y:-1}]){const view=flipView(age,false),local=screenToRoomInput(input,view.angle),delta=screenMovement(local.x,local.y,1/60),start={x:6,y:5},end={x:start.x+delta.x,y:start.y+delta.y},a=roomToViewPoint(project(start),view),b=roomToViewPoint(project(end),view),length=Math.hypot(b.x-a.x,b.y-a.y),inputLength=Math.hypot(input.x,input.y);expect((b.x-a.x)/length).toBeCloseTo(input.x/inputLength);expect((b.y-a.y)/length).toBeCloseTo(input.y/inputLength);expect(length).toBeCloseTo(66/60*view.scale);}
 });
});
