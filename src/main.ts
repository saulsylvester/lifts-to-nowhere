import './style.css';
import {readProgress,saveProgress,collect,parseFloor,pad,project,distance,canStand,screenMovement,driftMovement,APPEARANCE_KEY,type Point,type StorageLike} from './core';
import {floors,floorById,ENTRY,DOOR,PANEL,LIFT_ENTRY,LIFT_PANEL_ENTRY,LOBBY_LIFT_ENTRY,ROOM_ENTRY,sceneLayout,exitDoor,obstacles,type RoomDefinition} from './rooms';
import {FLOOD_FLOOR,floodLevel} from './flood';
import {SPACE_FLOOR,spaceCanStand,spacePlanetsAt,resolveSpaceOverlap} from './space';
import {ANDY_STRIDE} from './andy-walk';
import {FLIP_FLOOR,FLIP_DELAY,flipAngle,flipInProgress,flipView,screenToRoomInput,roomToViewPoint} from './upside-down';
import {bundledAvatar,drawPortrait,drawAvatar,importAvatar,cleanName,readPet,savePet,type AvatarDefinition} from './avatars';
import {render,loadArt,type Model,type GameState} from './render';
import {Sound} from './audio';
import {PLANT_ENCOUNTER_DURATION,plantEncounterPhase,type PlantEncounterPhase} from './plant-encounter';
import {BLACK_HOLE_FLOOR,BLACK_HOLE_DURATION,BLACK_HOLE_CAPTURE_RADIUS,blackHolePhase} from './black-hole';
const $=<T extends HTMLElement=HTMLElement>(selector:string)=>document.querySelector<T>(selector)!;
const canvas=$<HTMLCanvasElement>('#game'),context=canvas.getContext('2d')!;
const panel=$<HTMLDialogElement>('#panel-dialog'),journal=$<HTMLDialogElement>('#journal-dialog'),picker=$<HTMLDialogElement>('#avatar-dialog'),gameover=$<HTMLDialogElement>('#gameover-dialog');
let storage:StorageLike=null;try{storage=localStorage;}catch{/* Session-only progress remains playable. */}
const progress=readProgress(storage),sound=new Sound(progress.muted),keys=new Set<string>();
const avatars=new Map<string,AvatarDefinition>();
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let model:Model,time=0,previous=performance.now(),toastUntil=0,saveAvailable=true,enteredAt=0,pendingPet:{avatar:AvatarDefinition;blob:Blob}|null=null;
const PLANT_APPROACH_DISTANCE=24;
let approachDistance=0,plantCuePhase:PlantEncounterPhase|null=null,flipCuePlayed=false;
const roomFlipAge=()=>model.state==='room'&&model.floor===FLIP_FLOOR&&model.flipStart!=null?Math.max(0,time-model.flipStart):null;
const roomAngle=()=>{const age=roomFlipAge();return age===null?0:flipAngle(age,model.reducedMotion);};
const spaceAge=()=>model.state==='room'&&model.floor===SPACE_FLOOR&&model.spaceStart!=null?Math.max(0,time-model.spaceStart):null;
const blackHoleAge=()=>model.state==='room'&&model.floor===BLACK_HOLE_FLOOR&&model.effect?Math.max(0,time-model.effect.start):null;
const discoveryPoint=()=>{if(model.floor!==SPACE_FLOOR)return model.room!.focus;const p=spacePlanetsAt(spaceAge(),model.reducedMotion)[0];return {x:p.x+2.3,y:p.y+1.2};};
const flipping=()=>{const age=roomFlipAge();return age!==null&&flipInProgress(age,model.reducedMotion);};
function cuePlantEncounter(age:number){const phase=plantEncounterPhase(age);if(phase!==plantCuePhase){plantCuePhase=phase;sound.play(`plant-${phase}`);}}
const overlay=()=>panel.open||journal.open||picker.open||gameover.open||!model.started;
const busy=()=>model.state==='travel'||model.state==='gameover'||!!model.effect||flipping();
const playerText=(s:string)=>s.replace(/Andy/g,model.avatar.name).replace(/ANDY/g,model.avatar.name.toUpperCase());
function persist(){saveAvailable=saveProgress(storage,progress);}
function notify(message:string,label='',duration=3,placement:'overlay'|'caption'='overlay'){const node=$('#toast');node.classList.toggle('toast--caption',placement==='caption');node.replaceChildren();if(label){const strong=document.createElement('strong');strong.textContent=label;node.append(strong);}node.append(document.createTextNode(playerText(message)));node.hidden=false;toastUntil=time+duration;}
function clearMovement(){keys.clear();model.moving=false;model.velocity={x:0,y:0};}
function close(dialog:HTMLDialogElement){dialog.close();clearMovement();canvas.focus();}
function closePanels(){for(const d of [panel,journal,picker])if(d.open)d.close();clearMovement();canvas.focus();}
function updateSound(){sound.muted=progress.muted;$('#sound-button').textContent=progress.muted?'♩':'♫';$('#sound-button').setAttribute('aria-label',progress.muted?'Unmute sound':'Mute sound');$('#sound-button').setAttribute('aria-pressed',String(progress.muted));}
function toggleMute(){sound.unlock();progress.muted=!progress.muted;updateSound();persist();}
function selectAvatar(avatar:AvatarDefinition){model.avatar=avatar;if(avatar.id!=='andy'&&model.facing!=='left'&&model.facing!=='right')model.facing='right';drawPortrait($<HTMLCanvasElement>('#portrait'),avatar);$('#avatar-name').textContent=avatar.name.toUpperCase();$('#panel-heading').textContent=`Where to, ${avatar.name}?`;$('#journal-heading').textContent=`${avatar.name}’s discoveries`;try{storage?.setItem(APPEARANCE_KEY,avatar.id);}catch{/* This selection lasts for the session. */}renderChoices();if(journal.open)renderJournal();}
function characterButton(avatar:AvatarDefinition,start=false){
 const b=document.createElement('button');b.type='button';b.className=`${start?'start-choice':'avatar-card'}${model.avatar.id===avatar.id?' selected':''}`;b.setAttribute('aria-pressed',String(model.avatar.id===avatar.id));b.setAttribute('aria-label',`Explore as ${avatar.name}`);
 const c=document.createElement('canvas');c.width=40;c.height=44;drawPortrait(c,avatar);const name=document.createElement('strong');name.textContent=avatar.name;b.append(c,name);
 if(!start){const tag=document.createElement('small');tag.textContent=avatar.id==='andy'?'THE ORIGINAL EXPLORER':avatar.id==='ding'?'A BELL WITH PLACES TO BE':'YOUR OWN LITTLE ELSEWHERE';b.append(tag);}
 b.onclick=()=>{if(busy())return;selectAvatar(avatar);sound.play('button');if(picker.open)close(picker);};return b;
}
function renderChoices(){const start=$('#start-avatars'),options=$('#avatar-options');start.replaceChildren();options.replaceChildren();for(const avatar of avatars.values()){start.append(characterButton(avatar,true));options.append(characterButton(avatar));}const add=document.createElement('button');add.className='start-choice';add.textContent='＋ MY PET';add.onclick=openPicker;start.append(add);}
function openPicker(){if(busy()||panel.open||journal.open)return;clearMovement();$('#import-error').textContent='';$('#import-preview').hidden=true;pendingPet=null;picker.showModal();sound.play('button');}
function renderJournal(){
 $('#journal-summary').textContent=`${progress.collected.size} discoveries collected · ${progress.visited.size} floors explored`;
 $('#save-note').textContent=saveAvailable?'Your discoveries are saved on this device.':'Saving is unavailable. Your discoveries will last for this visit.';
 const entries=floors.map(f=>{const found=progress.collected.has(f.id),visited=progress.visited.has(f.id),n=document.createElement('div');n.className=`journal-entry${found?' found':visited?' visited':''}`;const number=document.createElement('span');number.textContent=pad(f.id);const symbol=document.createElement('span');symbol.className='symbol';symbol.textContent=found?'★':visited?'○':'·';const name=document.createElement('strong');name.textContent=visited?f.name:'Unexplored';n.append(number,symbol,name);if(found||(visited&&f.deadly)){const small=document.createElement('small');small.textContent=f.deadly?'NO STAMP · DO NOT FEED':playerText(f.stamp);n.append(small);}return n;});$('#journal-grid').replaceChildren(...entries);
}
function openJournal(){if(!model.started||model.state==='travel'||model.state==='gameover'||model.effect?.deadly||blackHoleAge()!==null||flipping()||panel.open||picker.open)return;if(journal.open){close(journal);return;}clearMovement();renderJournal();journal.showModal();sound.play('button');}
function start(){if(model.started)return;model.started=true;$('#welcome').hidden=true;sound.unlock();sound.play('arrival');clearMovement();canvas.focus();}
function enter(state:GameState,position:Point){model.state=state;model.player={...position};model.effect=null;model.walkDistance=0;model.roomEnteredAt=time;model.spaceStart=state==='room'&&model.floor===SPACE_FLOOR&&progress.collected.has(SPACE_FLOOR)?time:null;approachDistance=0;plantCuePhase=null;flipCuePlayed=false;model.flipStart=state==='room'&&model.floor===FLIP_FLOOR?time:null;model.floodStart=state==='room'&&model.floor===FLOOD_FLOOR?time:null;model.locomotion=state==='room'&&model.floor===SPACE_FLOOR?'float':'walk';enteredAt=time;clearMovement();if(state==='room'){progress.visited.add(model.floor);persist();if(model.floodStart!==null){sound.play('effect',FLOOD_FLOOR);notify('The tide has let itself in. Swim for the lighthouse!','FLOOR 04 · INCOMING TIDE',3);}else if(model.floor===SPACE_FLOOR){sound.play('effect',SPACE_FLOOR);notify('The door opens onto a whole solar system of questionable nutrition.','FLOOR 87 · MIND THE GRAVITY',3);}}updateHUD();}
function openPanel(){clearMovement();$<HTMLInputElement>('#floor-input').value='';$('#floor-error').textContent='';$<HTMLInputElement>('#floor-input').removeAttribute('aria-invalid');panel.showModal();$<HTMLInputElement>('#floor-input').focus();sound.play('button');}
function depart(value:unknown){const id=parseFloor(value);if(id===null){$('#floor-error').textContent='A whole number of 1 or more, please.';$<HTMLInputElement>('#floor-input').setAttribute('aria-invalid','true');return false;}if(model.state!=='elevator')return false;closePanels();model.destination=id;model.travelStart=time;model.state='travel';clearMovement();sound.play('travel');return true;}
type Action={type:'enter'|'panel'|'discover'|'exit'|'orbit';label:string};
function interaction():Action|null{
 if(overlay()||model.state==='travel'||model.state==='gameover'||model.effect||flipping())return null;
 if(model.state==='lobby'&&distance(model.player,DOOR)<26)return {type:'enter',label:'ENTER THE LIFT'};
 if(model.state==='elevator'&&distance(model.player,PANEL)<22)return {type:'panel',label:'CHOOSE A FLOOR'};
 if(model.state==='room'&&model.room&&distance(model.player,discoveryPoint())<28)return {type:'discover',label:playerText(model.room.action).toUpperCase()};
 const exit=exitDoor(model.state);if(exit&&distance(model.player,exit)<26)return {type:'exit',label:model.state==='room'?'RETURN TO THE LIFT':model.floor?'STEP INTO THE ROOM':'STEP INTO THE LOBBY'};
 if(model.state==='room'&&model.floor===SPACE_FLOOR&&model.spaceStart==null)return {type:'orbit',label:'SET THE PLANETS IN MOTION'};
 return null;
}
function leave(){sound.play('door');if(model.state==='elevator')enter(model.floor?'room':'lobby',model.floor?ROOM_ENTRY:LOBBY_LIFT_ENTRY);else if(model.state==='room')enter('elevator',LIFT_ENTRY);}
function trigger(){
 if(model.state!=='room'||!model.room||model.effect||flipping())return;
 if(model.floor===SPACE_FLOOR&&model.spaceStart==null)model.spaceStart=time;
 model.effect={start:time,origin:{...model.player},deadly:!!model.room.deadly};clearMovement();
 if(model.room.deadly){closePanels();plantCuePhase=null;cuePlantEncounter(0);notify(`“FEED ME, ${model.avatar.name.toUpperCase()}.”`,'THAT IS NOT A HOUSEPLANT',2.5,'caption');}
 else if(model.floor===BLACK_HOLE_FLOOR){closePanels();sound.play('black-hole');notify('The biscuit was an invitation.','GOING DOWN…',BLACK_HOLE_DURATION,'caption');}
 else{sound.play('effect',model.floor);notify(model.room.caption,'A PECULIAR DISCOVERY',2.3);}
}
function interact(){const a=interaction();if(!a)return;sound.unlock();if(a.type==='enter'){sound.play('door');enter('elevator',LIFT_ENTRY);}else if(a.type==='panel')openPanel();else if(a.type==='discover')trigger();else if(a.type==='orbit'){model.spaceStart=time;sound.play('effect',SPACE_FLOOR);notify('One little push. An entire solar system gets carried away.','THE PLANETS ARE IN MOTION',2);}else leave();}
function resetToLift(){if(!model.started)return;const floor=model.state==='travel'?model.destination:model.floor;closePanels();if(gameover.open)gameover.close();pendingPet=null;model.floor=floor;model.destination=floor;model.travelStart=0;model.room=floor?floorById.get(floor)!:null;model.celebration=0;$('#toast').hidden=true;toastUntil=0;enter('elevator',LIFT_PANEL_ENTRY);model.facing=model.avatar.id==='andy'?'up':'right';sound.play('door');canvas.focus();}
function rewardDiscovery(room:RoomDefinition,placement:'overlay'|'caption'='overlay'){
 if(!collect(progress,room.id))return false;
 persist();sound.play('discovery');notify(room.stamp,`STAMP ${pad(progress.collected.size)} / 100`,3,placement);
 if(progress.collected.size===100){model.celebration=time+7;notify('One hundred discoveries. The building is proud of you.','YOU FOUND EVERY LITTLE ELSEWHERE',7,placement);sound.play('complete');}
 if(journal.open)renderJournal();return true;
}
function restart(){if(model.state!=='gameover')return;gameover.close();model.floor=0;model.room=null;$('#toast').hidden=true;toastUntil=0;enter('lobby',ENTRY);sound.play('arrival');canvas.focus();}
function update(dt:number){
 model.moving=false;if(toastUntil&&time>toastUntil){$('#toast').hidden=true;toastUntil=0;}
 const locomotion=model.state==='room'&&model.floor===SPACE_FLOOR?'float':model.state==='room'&&model.floodStart!==null&&floodLevel(time-model.floodStart)>.25?'swim':'walk';
 if(model.locomotion!==locomotion){model.locomotion=locomotion;model.velocity={x:0,y:0};}
 if(model.state==='room'&&model.floor===SPACE_FLOOR)model.player=resolveSpaceOverlap(model.player,spaceAge(),model.reducedMotion);
 const flipAge=roomFlipAge();if(flipAge!==null&&flipAge>=FLIP_DELAY&&!flipCuePlayed){flipCuePlayed=true;sound.play('room-flip');}
 if(model.state==='gameover')return;
 if(model.state==='travel'){if(time-model.travelStart>=2.15){model.floor=model.destination;model.room=floorById.get(model.floor)!;enter('elevator',model.player);sound.play('arrival');notify(model.room.name,`ARRIVED · FLOOR ${pad(model.floor)}`,2);}return;}
 if(model.effect){const age=time-model.effect.start;
  if(model.floor===BLACK_HOLE_FLOOR){if(age>=BLACK_HOLE_DURATION){const room=model.room!;resetToLift();if(!rewardDiscovery(room,'caption'))notify('The lift catches you. Again.','BACK FROM THE BLACK HOLE',2,'caption');}return;}
  if(model.effect.deadly){cuePlantEncounter(age);if(age>=PLANT_ENCOUNTER_DURATION){model.state='gameover';clearMovement();$('#toast').hidden=true;$('#gameover-copy').textContent=`${model.avatar.name} was delicious. The plant would like to see the dessert menu.`;$('#restart-button').textContent=`ANOTHER ${model.avatar.name.toUpperCase()}, PLEASE ↻`;gameover.showModal();$('#restart-button').focus();sound.play('gameover');}return;}
  if(age>=2.1&&!model.effect.rewarded){model.effect.rewarded=true;rewardDiscovery(model.room!);}
  if(age>=2.7)model.effect=null;return;
 }
 if(overlay()||flipping())return;
 const dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
 if(!dx&&!dy&&model.locomotion==='walk')return;
 const input=screenToRoomInput({x:dx,y:dy},roomAngle());
 const drifting=model.locomotion!=='walk',motion=drifting?driftMovement(model.velocity,input,dt,model.locomotion as 'swim'|'float'):null;
 const delta=motion?.delta??screenMovement(input.x,input.y,dt);if(motion)model.velocity=motion.velocity;
 const obs=drifting?[]:obstacles(model.state,model.room),old={...model.player},{width,height}=sceneLayout(model.state);
 const traversable=(p:Point)=>canStand(p,obs,width,height)&&(model.locomotion!=='float'||spaceCanStand(p,spaceAge(),model.reducedMotion));
 const x={x:model.player.x+delta.x,y:model.player.y};if(traversable(x))model.player.x=x.x;
 const y={x:model.player.x,y:model.player.y+delta.y};if(traversable(y))model.player.y=y.y;
 model.moving=old.x!==model.player.x||old.y!==model.player.y;
 const previousWalkDistance=model.walkDistance??0;if(model.moving&&!drifting)model.walkDistance=previousWalkDistance+distance(old,model.player);
 if(model.moving&&model.state==='room'&&model.floor===BLACK_HOLE_FLOOR&&distance(model.player,model.room!.props[0])<BLACK_HOLE_CAPTURE_RADIUS){trigger();return;}
 // Only successful movement counts: waiting or pushing a wall never feeds the plant.
 if(model.moving&&model.state==='room'&&model.room?.deadly){approachDistance+=distance(old,model.player);if(approachDistance>=PLANT_APPROACH_DISTANCE){trigger();return;}}
 if(input.x)model.facing=input.x>0?'right':'left';else if(model.avatar.id==='andy')model.facing=input.y<0?'up':'idle';
 if(model.moving){if(!drifting&&Math.floor(previousWalkDistance/(ANDY_STRIDE/2))!==Math.floor(model.walkDistance!/(ANDY_STRIDE/2)))sound.play('step');if(time-enteredAt>.35){const exit=exitDoor(model.state);if(model.state==='lobby'&&distance(model.player,DOOR)<10){sound.play('door');enter('elevator',LIFT_ENTRY);}else if(exit&&distance(model.player,exit)<10)leave();}}
}
function updateHUD(){
 let name=model.state==='lobby'?'THE LOBBY':model.state==='elevator'?'NOWHERE TRANSIT':model.state==='travel'?'IN TRANSIT':model.room?.name??'';
 $('#location').textContent=name.toUpperCase();$('#location-tag').textContent=model.floor?`FLOOR ${pad(model.floor)}`:'GROUND FLOOR';$('#floor-number').textContent=model.floor?pad(model.floor):'G';$('#discovery-count').textContent=`${pad(progress.collected.size)}/100`;
 $<HTMLButtonElement>('#avatar-button').disabled=busy();$<HTMLButtonElement>('#journal-button').disabled=model.state==='travel'||model.state==='gameover'||!!model.effect?.deadly||blackHoleAge()!==null||flipping()||!model.started;
 const action=interaction(),hint=$('#interaction-hint');hint.replaceChildren();const k=document.createElement('kbd');k.textContent=action?'E':'↑';hint.append(k);
 let message=action?.label??(model.state==='lobby'?'FOLLOW THE RED RUNNER TO THE LIFT':model.state==='elevator'?'BRASS WALL PANEL TO TRAVEL · DOORS TO LEAVE':model.state==='travel'?'PLEASE HOLD ON TO YOUR REALITY':model.state==='gameover'?'THE PLANT SENDS ITS COMPLIMENTS':model.room?.deadly?'THE HOUSEPLANT IS WATCHING YOUR FIRST STEPS':progress.collected.has(model.floor)?'DISCOVERED · RETURN THROUGH THE LIFT DOORS':model.locomotion==='float'?'FLOAT AMONG THE PLANETS · E TO GIVE ONE A PUSH':model.locomotion==='swim'?'SWIM TO THE LIGHTHOUSE · E TO LIGHT IT':model.floodStart!==null?'THE ROOM IS FILLING · GET READY TO SWIM':'FIND THE SPARKLE · GET CLOSE AND PRESS E');
 if(flipping())message='THE BAKERY IS TURNING OVER · HOLD ON';
 if(model.effect)message=model.effect.deadly?'YOU SEEM TO BE ON THE MENU':blackHoleAge()!==null?'FALLING BETWEEN HERE AND ELSEWHERE':'A MOMENT OF PERFECT NONSENSE';hint.append(document.createTextNode(message));
}
function resize(){const width=innerWidth-54,height=innerHeight-200;const scale=Math.max(1,Math.min(Math.floor(width/480),Math.floor(height/320),3));const screen=$('#screen');screen.style.width=`${480*scale}px`;screen.style.height=`${320*scale}px`;document.documentElement.dataset.scale=String(scale);}
function bind(){
 $('#start-button').onclick=start;$('#avatar-button').onclick=openPicker;$('#journal-button').onclick=openJournal;$('#sound-button').onclick=toggleMute;$('#restart-button').onclick=restart;
 document.querySelectorAll<HTMLElement>('[data-close]').forEach(b=>b.onclick=()=>close(b.closest('dialog')!));
 // Close events are queued: synchronous close handlers already clear movement.
 // A late event must not cancel a fresh keypress or steal focus from a new panel.
 for(const d of [picker,journal,panel])d.addEventListener('close',()=>{if(!overlayDialogs())canvas.focus();});
 gameover.addEventListener('cancel',e=>e.preventDefault());
 $('#floor-form').onsubmit=e=>{e.preventDefault();depart($<HTMLInputElement>('#floor-input').value);};
 document.querySelectorAll<HTMLElement>('[data-floor]').forEach(b=>b.onclick=()=>depart(b.dataset.floor));
 $('#import-button').onclick=()=>$<HTMLInputElement>('#pet-file').click();
 $<HTMLInputElement>('#pet-file').onchange=async e=>{
  const input=e.target as HTMLInputElement,file=input.files?.[0];if(!file)return;$('#import-error').textContent='Checking your little traveller…';$('#import-preview').hidden=true;pendingPet=null;
  try{const name=file.name.replace(/\.(png|webp)$/i,'').replace(/[-_]/g,' ');const avatar=await importAvatar(file,name);pendingPet={avatar,blob:file};$<HTMLInputElement>('#pet-name').value=avatar.name;$('#import-error').textContent='';$('#import-preview').hidden=false;}
  catch(error){$('#import-error').textContent=error instanceof Error?error.message:'This pet could not be imported.';}finally{input.value='';}
 };
 $('#confirm-pet').onclick=async()=>{if(!pendingPet)return;const {avatar,blob}=pendingPet;avatar.name=cleanName($<HTMLInputElement>('#pet-name').value);avatars.set('custom',avatar);selectAvatar(avatar);pendingPet=null;close(picker);const saved=await savePet({blob,name:avatar.name});notify(saved?'Your pet is ready to explore.':'Your pet is ready. Storage is unavailable, so it will stay for this visit.',`HELLO, ${avatar.name.toUpperCase()}`);};
 window.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();if(e.target instanceof HTMLInputElement)return;if(key==='enter'&&(e.target instanceof HTMLButtonElement||e.target instanceof HTMLAnchorElement))return;
  if(key==='r'&&!e.repeat&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();resetToLift();return;}
  if(key==='m'&&!e.repeat){e.preventDefault();toggleMute();return;}
  if(gameover.open){if(['escape','w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e','j'].includes(key))e.preventDefault();return;}
  if(key==='escape'){e.preventDefault();closePanels();return;}
  if(key==='j'&&!e.repeat){e.preventDefault();openJournal();return;}
  if(key==='enter'&&!model.started&&!overlayDialogs()){e.preventDefault();start();return;}
  if(overlay())return;
  if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','e'].includes(key))e.preventDefault();
  if(key==='e'&&!e.repeat)interact();else keys.add(key);
 });
 window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',clearMovement);
 document.addEventListener('visibilitychange',()=>{clearMovement();previous=performance.now();});
 motion.addEventListener('change',e=>{model.reducedMotion=e.matches;});window.addEventListener('resize',resize);resize();
}
const overlayDialogs=()=>panel.open||journal.open||picker.open||gameover.open;
function inspector(){
 if(!import.meta.env.DEV||new URLSearchParams(location.search).get('dev')!=='1')return;
 const visit=(id:number)=>{const room=floorById.get(id);if(!room)return false;closePanels();if(gameover.open)gameover.close();start();model.floor=id;model.room=room;enter('room',ROOM_ENTRY);return true;};
 const renderPlant=(age:number,avatarId=model.avatar.id,reducedMotion=false)=>{const room=floorById.get(101)!,avatar=avatars.get(avatarId)??model.avatar,c=document.createElement('canvas');c.width=480;c.height=320;render(c.getContext('2d')!,{...model,state:'room',floor:101,room,avatar,player:ROOM_ENTRY,facing:'left',moving:false,locomotion:'walk',velocity:{x:0,y:0},effect:{start:0,origin:ROOM_ENTRY,deadly:true},floodStart:null,celebration:0,reducedMotion},Math.max(0,age));return c.toDataURL();};
 const renderUpsideDown=(age:number,avatarId=model.avatar.id,reducedMotion=false)=>{const room=floorById.get(FLIP_FLOOR)!,avatar=avatars.get(avatarId)??model.avatar,c=document.createElement('canvas');c.width=480;c.height=320;render(c.getContext('2d')!,{...model,state:'room',floor:FLIP_FLOOR,room,avatar,player:ROOM_ENTRY,facing:'left',moving:false,locomotion:'walk',velocity:{x:0,y:0},effect:null,floodStart:null,flipStart:0,celebration:0,collected:new Set(),reducedMotion},Math.max(0,age));return c.toDataURL();};
 const renderDentist=(age:number,active=false,reducedMotion=false)=>{const room=floorById.get(43)!,c=document.createElement('canvas');c.width=480;c.height=320;render(c.getContext('2d')!,{...model,state:'room',floor:43,room,player:ROOM_ENTRY,facing:'left',moving:false,locomotion:'walk',velocity:{x:0,y:0},effect:active?{start:0,origin:ROOM_ENTRY}:null,floodStart:null,flipStart:null,spaceStart:null,roomEnteredAt:0,walkDistance:0,celebration:0,collected:new Set(),reducedMotion},Math.max(0,age));return c.toDataURL();};
 const renderSpace=(age:number,active=true,reducedMotion=false)=>{const room=floorById.get(SPACE_FLOOR)!,c=document.createElement('canvas');c.width=480;c.height=320;render(c.getContext('2d')!,{...model,state:'room',floor:SPACE_FLOOR,room,player:ROOM_ENTRY,facing:'left',moving:false,locomotion:'float',velocity:{x:0,y:0},effect:null,floodStart:null,flipStart:null,spaceStart:active?0:null,walkDistance:0,celebration:0,collected:new Set(),reducedMotion},Math.max(0,age));return c.toDataURL();};
 const renderBlackHole=(age:number,avatarId=model.avatar.id,reducedMotion=false)=>{const room=floorById.get(BLACK_HOLE_FLOOR)!,avatar=avatars.get(avatarId)??model.avatar,c=document.createElement('canvas');c.width=480;c.height=320;render(c.getContext('2d')!,{...model,state:'room',floor:BLACK_HOLE_FLOOR,room,avatar,player:room.focus,facing:'left',moving:false,locomotion:'walk',velocity:{x:0,y:0},effect:{start:0,origin:room.focus},floodStart:null,flipStart:null,spaceStart:null,celebration:0,collected:new Set(),reducedMotion},Math.max(0,age));return c.toDataURL();};
 const api={renderPlant,renderUpsideDown,renderDentist,renderSpace,renderBlackHole,snapshot:()=>({state:model.state,floor:model.floor,player:{...model.player},walkDistance:model.walkDistance??0,blackHoleAge:blackHoleAge(),blackHolePhase:blackHoleAge()===null?null:blackHolePhase(blackHoleAge()!),spaceMotionAge:spaceAge(),spacePlanets:model.floor===SPACE_FLOOR?spacePlanetsAt(spaceAge(),model.reducedMotion):[],roomAngle:roomAngle(),roomScale:roomFlipAge()===null?1:flipView(roomFlipAge()!,model.reducedMotion).scale,playerScreen:roomFlipAge()===null?project(model.player):roomToViewPoint(project(model.player),roomFlipAge()!,model.reducedMotion),flipAge:roomFlipAge(),flipping:flipping(),inverted:roomAngle()===Math.PI,facing:model.facing,avatar:model.avatar.id,avatarName:model.avatar.name,collected:[...progress.collected],visited:[...progress.visited],muted:progress.muted,effect:!!model.effect,approachDistance,encounterAge:model.effect?.deadly?time-model.effect.start:null,encounterPhase:model.effect?.deadly?plantEncounterPhase(time-model.effect.start):null,reducedMotion:model.reducedMotion,layout:sceneLayout(model.state),flooded:model.floodStart!==null,floodAge:model.floodStart===null?0:time-model.floodStart,floodLevel:model.floodStart===null?0:floodLevel(time-model.floodStart),locomotion:model.locomotion,velocity:{...model.velocity}}),visit,trigger:()=>{if(model.room){model.player={...discoveryPoint()};trigger();}},setPosition:(x:number,y:number)=>{if(Number.isFinite(x)&&Number.isFinite(y))model.player={x,y};},renderScene:(state:GameState,at=1.2,reducedMotion=false)=>{const c=document.createElement('canvas');c.width=480;c.height=320;render(c.getContext('2d')!,{...model,state,room:null,floor:0,player:{x:3,y:2.5},facing:'right',moving:false,locomotion:'walk',velocity:{x:0,y:0},effect:null,floodStart:null,flipStart:null,spaceStart:null,walkDistance:0,travelStart:0,celebration:0,reducedMotion},at);return c.toDataURL();},chooseAvatar:(id:string)=>{if(!busy()&&avatars.has(id))selectAvatar(avatars.get(id)!);},unlockForCompletionTest:()=>{for(let i=1;i<100;i++){progress.collected.add(i);progress.visited.add(i);}},renderFloor:(id:number,active=false)=>{const room=floorById.get(id);if(!room)throw Error('Unknown room');const c=document.createElement('canvas');c.width=480;c.height=320;render(c.getContext('2d')!,{...model,state:'room',room,floor:id,player:ROOM_ENTRY,locomotion:id===SPACE_FLOOR?'float':id===FLOOD_FLOOR&&active?'swim':'walk',velocity:{x:0,y:0},roomEnteredAt:0,walkDistance:0,spaceStart:id===SPACE_FLOOR&&active?0:null,floodStart:id===FLOOD_FLOOR&&active?-4:null,flipStart:id===FLIP_FLOOR?(active?0:1.2):null,effect:active?{start:0,origin:ENTRY,deadly:!!room.deadly}:null,collected:new Set()},1.2);return c.toDataURL();}};
 (window as unknown as {__nowhere:typeof api}).__nowhere=api;
 const toolbar=$('#dev-controls');toolbar.hidden=false;toolbar.innerHTML='<span>ROOM INSPECTOR</span><input aria-label="Inspect floor" id="dev-floor" value="7"><button id="dev-go">Go</button><button id="dev-play">Interact</button><button id="dev-next">Next →</button><a href="/art/lobby-concept.png" target="_blank">Art reference ↗</a>';
 $('#dev-go').onclick=()=>{const id=parseFloor($<HTMLInputElement>('#dev-floor').value);if(id)visit(id);};$('#dev-play').onclick=api.trigger;$('#dev-next').onclick=()=>{const id=model.floor%101+1;visit(id);$<HTMLInputElement>('#dev-floor').value=String(id);};
}
async function init(){
 try{
  const [andy,ding]=await Promise.all([bundledAvatar('andy'),bundledAvatar('ding'),loadArt()]);avatars.set('andy',andy);avatars.set('ding',ding);
  model={state:'lobby',floor:0,room:null,player:{...ENTRY},facing:'up',moving:false,locomotion:'walk',velocity:{x:0,y:0},started:false,effect:null,floodStart:null,flipStart:null,spaceStart:null,walkDistance:0,roomEnteredAt:0,travelStart:0,destination:0,reducedMotion:motion.matches,celebration:0,avatar:andy,collected:progress.collected};
  const stored=await readPet();if(stored){try{avatars.set('custom',await importAvatar(stored.blob,stored.name));}catch{/* A broken saved image does not block Andy. */}}
  let selected='andy';try{selected=storage?.getItem(APPEARANCE_KEY)??'andy';}catch{}selectAvatar(avatars.get(selected)??andy);updateSound();bind();inspector();$('#loading').hidden=true;
  function frame(now:number){const dt=document.hidden?0:Math.min(.035,Math.max(0,(now-previous)/1000));previous=now;time+=dt;update(dt);render(context,model,time);updateHUD();if(pendingPet&&picker.open){const c=$<HTMLCanvasElement>('#pet-preview'),g=c.getContext('2d')!;g.clearRect(0,0,80,80);drawAvatar(g,pendingPet.avatar,40,71,time,'idle',false,model.reducedMotion,1.7);}requestAnimationFrame(frame);}requestAnimationFrame(frame);
 }catch(error){$('#loading').textContent=`Could not open the lift: ${error instanceof Error?error.message:'please reload'}`;console.error(error);}
}
void init();
