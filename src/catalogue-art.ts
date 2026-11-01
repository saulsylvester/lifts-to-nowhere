// @ts-nocheck
// Authored prop and encounter artwork adapted from Lift to Nowhere.
export const palettes = {
  plum: {wall:'#69516c',floor:'#3c334d',tile:'#463b56',trim:'#ba8b78',accent:'#ddb080'},
  ember:{wall:'#855a57',floor:'#513d48',tile:'#59434b',trim:'#c79672',accent:'#edb370'},
  moss: {wall:'#506658',floor:'#303f3d',tile:'#384943',trim:'#9ba37b',accent:'#d1c587'},
  ocean:{wall:'#465e78',floor:'#2a3e51',tile:'#30475a',trim:'#88aaa4',accent:'#e1b988'},
  paper:{wall:'#8b7869',floor:'#52454a',tile:'#5c4e50',trim:'#c7ac85',accent:'#eed29a'},
  night:{wall:'#4f486c',floor:'#302e4a',tile:'#363451',trim:'#9d86ac',accent:'#d6bd93'},
  sky:  {wall:'#637c88',floor:'#3c505f',tile:'#445b68',trim:'#a2bbc0',accent:'#f1d2a0'},
  rose: {wall:'#876075',floor:'#533c52',tile:'#5e445d',trim:'#c59699',accent:'#e8bd94'},
  stone:{wall:'#6a6c77',floor:'#41414f',tile:'#494955',trim:'#a4a0a4',accent:'#d9bc8c'},
  mint: {wall:'#59817d',floor:'#344c50',tile:'#3d585a',trim:'#a0b8a6',accent:'#e6c79d'},
  sand: {wall:'#8b7560',floor:'#59484a',tile:'#62504c',trim:'#c4a077',accent:'#efc786'},
};

export const propKinds = new Set('anchor apple bag balloon basket baton bed bell belt bench bird boat bone book bowl box bread bridge bucket building cactus cake calendar can candle candy car carousel case castle chair chest clock cloud coat coin comet compass cone cookie cup disco door dragon dresser easel egg fireplace fish flag flower frame fridge gear ghost gift globe glove hat hatch hole horn horse ice jar jellyfish key keyhole kite ladder lamp letter lever lighthouse machine mailbox map mirror moon mountain mushroom nest oven paint pan pedestal phone piano planet plant projector puddle rabbit rack radio rainbow rock rocket rope rug scarf scissors screen scroll shelf shell shoe sign skull snail snowman sock sofa sponge spoon stamp star suitcase sun table tank telescope thermometer ticket traffic train tree umbrella vending volcano washer weight window zipper'.split(' '));

const C={ink:'#10213d',shadow:'#0a1630',cream:'#fff0be',white:'#fff7dc',gold:'#f5bd4a',pink:'#f48fa8',red:'#dc4356',blue:'#3984d6',teal:'#45c6bd',green:'#429d49',purple:'#b48ae5',wood:'#ad703d'};
let ctx;
propKinds.add('carnivore');
const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));};
function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;for(let yy=-Math.round(ry);yy<=ry;yy++){const xx=Math.sqrt(Math.max(0,1-yy*yy/(ry*ry)))*rx;ctx.fillRect(Math.round(x-xx),Math.round(y+yy),Math.max(1,Math.round(xx*2)),1);}}
function line(x1,y1,x2,y2,c,w=1){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);ctx.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);ctx.stroke();}
function poly(points,c){ctx.fillStyle=c;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function txt(s,x,y,c=C.cream,size=6,align='center'){ctx.fillStyle=c;ctx.font=`${size}px monospace`;ctx.textAlign=align;ctx.fillText(s,Math.round(x),Math.round(y));}
function star(x,y,r=4,c=C.cream){rect(x-1,y-r,2,r*2,c);rect(x-r,y-1,r*2,2,c);rect(x-2,y-2,4,4,c);}
function heart(x,y,c=C.pink){rect(x-3,y-3,3,3,c);rect(x+1,y-3,3,3,c);rect(x-4,y,9,2,c);rect(x-2,y+2,5,2,c);rect(x,y+4,1,1,c);}
function notes(x,y,t){rect(x,y-7,1,8,C.cream);rect(x,y-7,4,2,C.cream);ellipse(x-2,y+1,3,2,C.cream);if(t>.5)star(x+7,y-8,2,C.gold);}
function shadow(){}
function pot(x,y){rect(x-6,y-7,12,7,C.wood);rect(x-7,y-8,14,2,C.gold);rect(x-4,y-1,8,2,'#704e50');}
function flower(x,y,v=0){line(x,y,x,y-14,C.green,2);ellipse(x-3,y-7,4,2,C.teal);ellipse(x+4,y-9,4,2,C.green);const c=[C.pink,C.gold,C.purple][v%3];ellipse(x,y-17,5,5,c);rect(x-2,y-19,4,4,C.cream);}

export function drawAndy(context,x,y,t,moving=false,facing='down',options={}){
  ctx=context; x=Math.round(x);y=Math.round(y);
  const walk=moving?Math.sin(t*15):0, bounce=moving?Math.abs(Math.round(walk)):0;
  if(!options.noShadow)shadow(x,y,7);
  const yy=y-bounce;
  // Little red beanie, striped yellow jumper, indigo trousers, excellent shoes.
  rect(x-5,yy-10,10,8,'#eeab3c');rect(x-6,yy-9,12,3,'#ffd85b');
  rect(x-7,yy-9+walk,2,6,'#e2b88b');rect(x+5,yy-9-walk,2,6,'#e2b88b');
  rect(x-4,yy-4,3,5+Math.max(0,walk),'#28568d');rect(x+1,yy-4,3,5+Math.max(0,-walk),'#28568d');
  rect(x-5,yy+Math.max(0,walk),4,2,C.ink);rect(x+1,yy+Math.max(0,-walk),4,2,C.ink);
  rect(x-5,yy-19,10,10,'#e7ba93');rect(x-6,yy-17,2,5,'#b78477');
  rect(x-5,yy-21,10,4,'#ba234a');rect(x-3,yy-23,6,3,'#ef455c');rect(x-6,yy-18,12,3,'#ff6670');
  if(facing==='up'){rect(x-5,yy-15,10,4,'#6d4750');rect(x-5,yy-11,2,3,'#6d4750');rect(x+3,yy-11,2,3,'#6d4750');}
  else if(facing==='left'){rect(x-5,yy-13,2,2,C.ink);rect(x-7,yy-12,2,2,'#e7ba93');}
  else if(facing==='right'){rect(x+3,yy-13,2,2,C.ink);rect(x+5,yy-12,2,2,'#e7ba93');}
  else{rect(x-3,yy-13,1,2,C.ink);rect(x+2,yy-13,1,2,C.ink);rect(x,yy-10,2,1,'#bd817b');}
}

export function drawProp(context,p,t=0,active=false,progress=0){
  ctx=context;const x=Math.round(p.x),y=Math.round(p.y),v=p.variant||0;
  const s=Math.sin(t*2+x), b=active?Math.sin(t*10)*2:0;
  shadow(x,y, p.kind==='rug'?23:11);
  ctx.save();ctx.translate(x,y);
  switch(p.kind){
    case 'rug':rect(-30,-7,60,15,'#87576b');rect(-27,-5,54,11,'#ae7880');rect(-24,-3,48,7,'#714b65');for(let i=-28;i<30;i+=4){rect(i,-9,1,2,C.gold);rect(i,8,1,2,C.gold);}break;
    case 'bell':rect(-9,-2,18,3,C.ink);rect(-8,-5,16,3,C.gold);ellipse(0,-7,7,7,C.gold);rect(-1,-16,3,3,C.cream);rect(-4,-10,2,4,C.cream);break;
    case 'rack':rect(-14,-34,28,3,C.wood);rect(-12,-33,2,31,C.gold);rect(11,-33,2,31,C.gold);rect(-17,-1,9,2,C.wood);rect(8,-1,9,2,C.wood);for(let i=-8;i<=8;i+=8){rect(i,-29,1,5,C.gold);rect(i-2,-25,5,1,C.cream);}break;
    case 'ghost':{const f=Math.round(s*2+b);rect(-7,-18+f,14,14,C.white);rect(-5,-22+f,10,5,C.white);rect(-9,-14+f,18,9,C.white);for(let i=-9;i<9;i+=6)rect(i,-6+f,3,4,C.white);rect(-4,-16+f,2,3,C.ink);rect(3,-16+f,2,3,C.ink);rect(-1,-10+f,2,2,'#ba9bb3');break;}
    case 'volcano':poly([[-22,0],[-8,-29],[7,-29],[24,0]],'#8f6265');rect(-8,-29,15,5,C.red);rect(-4,-24,8,12,'#dd956e');ellipse(0,-30,9,3,C.gold);ellipse(-2,-39-s*2,5,4,'#b89cab80');break;
    case 'cup':ellipse(11,-10,5,5,C.gold);ellipse(11,-10,3,3,C.ink);rect(-10,-18,19,15,C.white);ellipse(0,-3,10,3,C.white);ellipse(0,-18,10,3,C.cream);ellipse(0,-18,7,2,C.wood);rect(-7,-14,2,8,'#fff0cc');if(active)line(0,-24,3,-31,C.white);break;
    case 'rock':poly([[-12,-1],[-14,-8],[-5,-16],[7,-14],[14,-5],[8,1]],'#86818f');poly([[-12,-8],[-5,-16],[7,-14],[2,-8]],'#a29ba8');line(-3,-9,4,-5,'#6a657e');break;
    case 'plant':pot(0,0);rect(-1,-25,2,18,C.green);for(let i=0;i<4;i++){ellipse((i%2?1:-1)*5,-12-i*5,7,3,i%2?C.green:C.teal);}break;
    case 'carnivore':{
      const age=progress*2.6;
      const gape=active?(age<1.6?Math.min(1,age/.45):.08+Math.abs(Math.sin(t*8))*.12):.15+Math.sin(t*2)*.06;
      const jaw=5+gape*16;
      rect(-22,-14,44,17,'#87504e');rect(-26,-18,52,6,'#bc7963');rect(-18,1,36,4,'#5e3e41');
      rect(-5,-46,10,30,'#398b3d');rect(-2,-44,3,24,'#a8d65a');
      ellipse(-21,-27,22,7,'#648e59');ellipse(22,-33,23,8,'#8bad65');
      line(-39,-27,-8,-25,'#b1c47b',2);line(9,-32,42,-36,'#c1d587',2);
      ellipse(0,-49,34,jaw+8,'#422634');ellipse(0,-47+gape*7,23,gape*8+2,'#9d5064');
      ellipse(0,-52-jaw,35,14,'#70b83f');ellipse(-9,-57-jaw,18,7,'#b2e061');
      ellipse(0,-45+jaw,34,10,'#4d9c3e');ellipse(0,-48+jaw,29,4,'#bc7c81');
      for(let i=-24;i<=24;i+=8){poly([[i-3,-48-jaw],[i+3,-48-jaw],[i,-39-jaw]],C.cream);poly([[i-3,-49+jaw],[i+3,-49+jaw],[i,-58+jaw]],C.cream);}
      for(const [a,b] of [[-22,-60],[-5,-64],[18,-59]])ellipse(a,b-jaw,3,2,'#597b48');
      rect(-16,-61-jaw,8,3,'#415039');rect(9,-61-jaw,8,3,'#415039');
      rect(-13,-57-jaw,3,3,C.gold);rect(11,-57-jaw,3,3,C.gold);
      break;
    }
    case 'mailbox':rect(-2,-16,4,17,C.wood);rect(-11,-31,22,18,C.red);ellipse(0,-31,11,6,C.red);rect(-7,-28,15,2,C.ink);rect(12,-34,2,16,C.gold);rect(14,-34,6,5,C.gold);txt('POST',0,-19,C.cream,4);break;
    case 'snail':ellipse(1,-1,14,3,C.teal);ellipse(-3,-7,8,8,C.gold);ellipse(-3,-7,5,5,C.wood);ellipse(-3,-7,2,2,C.gold);line(11,-1,13,-11,C.teal);line(8,-1,8,-9,C.teal);rect(12,-12,2,2,C.cream);rect(7,-10,2,2,C.cream);break;
    case 'letter':rect(-11,-13,22,14,C.white);line(-11,-13,0,-5,C.wood);line(0,-5,11,-13,C.wood);rect(6,-11,3,4,C.red);break;
    case 'clock':ellipse(0,-14,14,14,C.gold);ellipse(0,-14,11,11,C.cream);for(let i=0;i<4;i++)rect(Math.sin(i*Math.PI/2)*8-1,-15+Math.cos(i*Math.PI/2)*8,2,2,C.wood);line(0,-14,Math.sin(active?t*10:t*.15)*7,-14-Math.cos(active?t*10:t*.15)*7,C.ink);line(0,-14,-5,-17,C.ink);rect(-1,-15,2,2,C.red);break;
    case 'lighthouse':rect(-7,-28,14,28,C.white);rect(-7,-20,14,6,C.red);rect(-7,-6,14,5,C.red);rect(-10,-34,20,5,C.gold);rect(-6,-42,12,8,C.gold);poly([[-10,-43],[0,-50],[10,-43]],C.red);rect(-3,-40,6,5,C.cream);rect(-2,-9,4,9,C.ink);break;
    case 'boat':poly([[-17,-7],[17,-7],[10,0],[-10,0]],C.wood);rect(-1,-33,2,26,C.gold);poly([[-3,-31],[-3,-11],[-18,-11]],C.white);poly([[2,-29],[15,-13],[2,-13]],C.pink);break;
    case 'calendar':rect(-12,-27,24,26,C.white);rect(-12,-27,24,7,C.red);rect(-7,-29,2,5,C.gold);rect(5,-29,2,5,C.gold);txt('TUE',0,-14,C.wood,6);txt('?',0,-5,C.ink,7);break;
    case 'box':case 'gift':case 'suitcase':case 'bag':rect(-12,-19,24,19,C.wood);rect(-12,-19,24,5,C.gold);rect(-2,-19,4,19,C.cream);if(p.kind==='gift'){ellipse(-4,-22,5,3,C.pink);ellipse(4,-22,5,3,C.pink);}if(p.kind==='suitcase'||p.kind==='bag'){rect(-5,-24,10,5,C.ink);rect(-3,-23,6,4,C.gold);}break;
    case 'rocket':rect(-5,-23,10,18,C.pink);poly([[-5,-23],[0,-31],[5,-23]],C.gold);poly([[-5,-11],[-10,-2],[-5,-4]],C.red);poly([[5,-11],[10,-2],[5,-4]],C.red);rect(-2,-19,4,4,C.blue);rect(-1,-5,2,7,C.gold);break;
    case 'sign':rect(-1,-19,3,20,C.wood);rect(-16,-33,32,16,C.wood);rect(-14,-31,28,12,C.cream);txt('PLEASE',0,-26,C.wood,4);txt('BE ODD',0,-20,C.wood,4);break;
    case 'cloud':ellipse(0,-12,21,10,C.white);ellipse(-9,-20,11,10,C.white);ellipse(7,-23,13,11,C.white);ellipse(19,-14,9,8,C.white);rect(-17,-12,34,6,'#b9c5cd');rect(-5,-17,2,2,C.ink);rect(5,-17,2,2,C.ink);rect(0,-12,3,1,C.pink);break;
    case 'can':rect(-9,-14,17,13,C.teal);ellipse(10,-10,5,5,C.teal);ellipse(10,-10,3,3,C.ink);poly([[-9,-9],[-19,-15],[-17,-18],[-7,-14]],C.teal);rect(-19,-18,3,6,C.gold);break;
    case 'flower':flower(0,0,v);break;
    case 'rainbow':for(let i=0;i<5;i++){ctx.strokeStyle=[C.pink,C.gold,C.cream,C.teal,C.blue][i];ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,22-i*3,Math.PI,0);ctx.stroke();}break;
    case 'dresser':rect(-17,-28,34,27,C.wood);rect(-19,-30,38,4,C.gold);for(let i=0;i<3;i++){rect(-14,-23+i*8,28,6,'#785665');rect(-2,-21+i*8,4,2,C.gold);}rect(-14,-1,4,3,C.gold);rect(10,-1,4,3,C.gold);break;
    case 'sock':rect(-4,-22,9,17,C.pink);rect(-4,-7,15,7,C.pink);rect(-4,-22,9,4,C.cream);rect(-4,-11,9,3,C.gold);rect(6,-7,6,7,C.red);break;
    case 'horn':rect(-2,-10,4,10,C.gold);poly([[-3,-10],[-14,-26],[14,-26],[3,-10]],C.gold);ellipse(0,-26,15,4,C.wood);ellipse(0,-26,10,2,C.ink);rect(-8,-1,16,2,C.wood);break;
    case 'cake':rect(-16,-14,32,13,C.pink);ellipse(0,-14,16,5,C.cream);rect(-16,-8,32,3,C.cream);for(let i=-10;i<=10;i+=10){rect(i,-23,2,8,C.teal);ellipse(i+1,-26,2,3,C.gold);}break;
    case 'candle':rect(-4,-17,8,17,C.cream);rect(-8,-1,16,3,C.gold);ellipse(0,-22,3,5+s,C.gold);ellipse(0,-22,1,3,C.white);break;
    case 'chair':rect(-10,-29,20,17,C.red);rect(-8,-27,16,12,C.pink);rect(-11,-12,22,5,C.wood);rect(-9,-7,3,9,C.gold);rect(6,-7,3,9,C.gold);break;
    case 'umbrella':poly([[-23,-17],[-18,-27],[-8,-33],[8,-33],[18,-27],[23,-17]],C.pink);poly([[0,-33],[-8,-17],[8,-17]],C.gold);rect(-1,-17,2,19,C.wood);rect(-5,0,5,2,C.wood);break;
    case 'fish':ellipse(0,-8,11,6,C.gold);poly([[8,-8],[17,-15],[17,-1]],C.pink);rect(-7,-10,2,2,C.ink);line(-3,-3,1,-6,C.wood);break;
    case 'tank':rect(-23,-38,46,37,'#91bbb1');rect(-20,-34,40,31,'#3e7786');rect(-18,-30,36,25,'#5897a2');rect(-18,-8,36,5,C.gold);rect(-14,-29,2,12,'#abd8c8');rect(11,-21,2,14,C.green);rect(8,-18,7,3,C.green);rect(-25,-39,50,4,C.wood);rect(-25,-2,50,4,C.wood);break;
    case 'machine':case 'vending':rect(-17,-35,34,35,'#91a6a2');rect(-14,-32,21,19,C.ink);rect(-12,-29,17,4,C.blue);rect(-12,-22,5,6,C.gold);rect(-4,-22,8,6,C.pink);rect(10,-26,3,3,C.red);rect(10,-19,3,3,C.gold);rect(-10,-9,20,5,C.ink);rect(-18,0,36,2,C.wood);break;
    case 'table':rect(-20,-19,40,8,C.wood);rect(-21,-20,42,4,C.gold);rect(-16,-11,4,13,C.wood);rect(12,-11,4,13,C.wood);break;
    case 'moon':ellipse(0,-20,21,21,C.cream);ellipse(-8,-29,5,5,'#d0bd9c');ellipse(7,-12,4,4,'#d0bd9c');rect(-7,-24,2,3,C.ink);rect(4,-24,2,3,C.ink);rect(-2,-16,5,1,C.wood);break;
    case 'star':star(0,-12,12,C.gold);rect(-4,-14,2,2,C.ink);rect(3,-14,2,2,C.ink);break;
    case 'cactus':pot(0,0);rect(-5,-34,10,26,C.green);rect(-13,-26,5,13,C.green);rect(-10,-17,8,5,C.green);rect(9,-30,5,13,C.green);rect(4,-20,9,4,C.green);rect(-2,-32,2,20,C.teal);rect(-12,-24,1,8,C.teal);flower(3,-31,0);break;
    case 'lamp':rect(-1,-28,3,28,C.gold);ellipse(0,0,9,3,C.wood);poly([[-7,-40],[8,-40],[15,-26],[-14,-26]],C.gold);rect(-13,-27,27,3,C.cream);break;
    case 'bone':rect(-9,-6,18,4,C.cream);for(const xx of[-10,10]){ellipse(xx,-7,3,3,C.cream);ellipse(xx,-2,3,3,C.cream);}break;
    case 'shell':ellipse(0,-8,11,9,C.pink);for(let i=-7;i<10;i+=4)line(0,0,i,-14,C.cream);break;
    case 'radio':rect(-16,-20,32,20,C.wood);rect(-13,-16,17,12,C.ink);for(let i=-12;i<2;i+=3)rect(i,-14,1,8,'#8b7180');ellipse(10,-12,3,3,C.gold);rect(8,-5,5,2,C.cream);line(8,-20,15,-32,C.gold);break;
    case 'tree':rect(-3,-23,6,24,C.wood);ellipse(0,-32,16,18,C.green);ellipse(-10,-26,10,11,C.green);ellipse(11,-29,11,13,'#85a287');rect(-9,-39,6,3,'#acc39b');break;
    case 'mushroom':rect(-4,-13,8,13,C.cream);ellipse(0,-15,15,11,C.red);rect(-15,-15,30,5,C.red);rect(-9,-19,4,4,C.cream);rect(4,-22,4,4,C.cream);rect(0,-8,1,2,C.ink);break;
    case 'mirror':case 'frame':case 'window':rect(-17,-40,34,39,C.gold);rect(-14,-37,28,33,p.kind==='window'?'#7e91b6':'#7f9cac');rect(-11,-34,3,19,'#bfd0d0');if(p.kind==='window'){rect(-1,-37,2,33,C.wood);rect(-14,-21,28,2,C.wood);}if(p.kind==='frame')rect(-11,-34,22,27,'#3c354c');break;
    case 'balloon':ellipse(0,-26,12,15,C.pink);ellipse(-4,-31,3,5,'#edbdbe');poly([[-3,-12],[3,-12],[0,-16]],C.pink);line(0,-11,2,-3,C.cream);line(2,-3,0,6,C.cream);break;
    case 'weight':rect(-16,-11,7,11,C.ink);rect(9,-11,7,11,C.ink);rect(-9,-7,18,3,'#89909d');rect(-13,-11,2,9,'#69667e');break;
    case 'book':poly([[-18,-19],[-3,-17],[0,-14],[3,-17],[18,-19],[18,-2],[3,0],[0,2],[-3,0],[-18,-2]],C.gold);rect(-16,-18,14,15,C.cream);rect(2,-18,14,15,C.white);for(let i=0;i<3;i++){rect(-13,-14+i*4,9,1,C.wood);rect(4,-14+i*4,9,1,C.wood);}break;
    case 'shelf':rect(-20,-42,40,42,C.wood);for(let row=0;row<2;row++){rect(-17,-39+row*19,34,16,C.ink);for(let i=0;i<6;i++)rect(-15+i*5,-36+row*19,4,13,[C.pink,C.teal,C.gold,C.blue][i%4]);}rect(-22,-43,44,3,C.gold);break;
    case 'puddle':ellipse(0,-2,24,6,'#588395');ellipse(-4,-3,15,3,'#8baeb2');rect(-12,-4,10,1,'#d1cec5');break;
    case 'building':rect(-18,-42,36,43,C.wood);rect(-20,-45,40,4,C.gold);for(let i=0;i<3;i++)for(let j=0;j<3;j++){rect(-14+i*11,-37+j*10,7,6,active&&Math.sin(t*8+i+j)>0?C.cream:C.blue);}rect(-4,-10,8,11,C.ink);break;
    case 'belt':rect(-23,-11,46,8,C.ink);for(let i=-20;i<23;i+=7)rect(i,-9,4,4,C.wood);rect(-20,-3,3,6,C.gold);rect(17,-3,3,6,C.gold);break;
    case 'basket':case 'nest':ellipse(0,-5,15,8,C.wood);for(let i=-12;i<13;i+=4)line(i,-11,i+3,0,C.gold);for(let j=-7;j<0;j+=3)rect(-13,j,26,1,'#6e4c51');if(p.kind==='basket'){ctx.strokeStyle=C.gold;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-12,10,Math.PI,0);ctx.stroke();}break;
    case 'apple':ellipse(-4,-8,7,8,C.red);ellipse(4,-8,7,8,C.red);rect(-1,-22,2,8,C.wood);ellipse(4,-19,5,2,C.green);rect(-7,-11,2,4,C.pink);break;
    case 'hole':ellipse(0,-11,24,12,C.purple);ellipse(0,-11,21,10,C.gold);ellipse(0,-11,18,9,C.ink);ellipse(0,-11,13,6,'#121324');break;
    case 'cookie':ellipse(0,-9,12,10,C.gold);for(const [a,b]of[[-6,-12],[3,-15],[5,-6],[-4,-5]])rect(a,b,3,3,C.wood);break;
    case 'door':rect(-16,-39,32,40,C.gold);rect(-13,-36,26,37,C.wood);rect(-10,-33,20,12,'#7f5765');rect(-10,-18,20,15,'#7f5765');rect(8,-18,2,3,C.cream);break;
    case 'scissors':ellipse(-5,-5,4,4,C.gold);ellipse(5,-5,4,4,C.gold);line(-3,-7,8,-24,C.white,2);line(3,-7,-8,-24,C.white,2);break;
    case 'egg':ellipse(0,-12,10,13,C.cream);ellipse(-3,-17,3,5,C.white);break;
    case 'pan':ellipse(0,-6,15,6,'#68687b');ellipse(0,-7,12,4,C.ink);rect(12,-9,20,4,C.wood);break;
    case 'train':rect(-25,-21,42,16,C.red);rect(15,-14,12,9,C.gold);rect(-21,-27,26,8,C.red);rect(-18,-24,8,8,C.blue);rect(-7,-24,8,8,C.blue);rect(17,-29,6,15,C.ink);for(const i of[-16,0,18]){ellipse(i,-3,5,5,C.ink);ellipse(i,-3,2,2,C.gold);}break;
    case 'bench':case 'sofa':rect(-24,-23,48,16,C.red);rect(-21,-21,42,12,C.pink);rect(-25,-9,50,6,C.red);rect(-23,-3,4,5,C.wood);rect(19,-3,4,5,C.wood);rect(-27,-14,4,12,C.wood);rect(23,-14,4,12,C.wood);if(p.kind==='sofa')rect(-1,-20,2,11,C.red);break;
    case 'chest':rect(-16,-17,32,17,C.wood);ellipse(0,-18,16,9,C.wood);rect(-15,-17,30,3,C.gold);rect(-12,-24,3,24,C.gold);rect(9,-24,3,24,C.gold);rect(-3,-15,6,7,C.cream);break;
    case 'coin':ellipse(0,-8,8,9,C.gold);ellipse(0,-8,5,6,C.cream);rect(-1,-11,2,7,C.gold);break;
    case 'skull':ellipse(0,-13,11,11,C.white);rect(-6,-6,12,6,C.white);rect(-6,-16,4,4,C.ink);rect(3,-16,4,4,C.ink);rect(-1,-9,2,3,C.ink);for(let i=-4;i<5;i+=3)rect(i,-3,1,3,C.ink);break;
    case 'ticket':rect(-14,-13,28,13,C.gold);rect(-14,-9,3,4,C.ink);rect(11,-9,3,4,C.ink);txt('ADMIT 1',0,-5,C.wood,5);break;
    case 'easel':rect(-15,-39,30,26,C.wood);rect(-12,-36,24,20,C.cream);rect(-12,-23,24,7,C.red);ellipse(3,-26,5,5,C.gold);line(-9,-13,-15,3,C.wood,3);line(9,-13,15,3,C.wood,3);rect(-18,-14,36,3,C.gold);break;
    case 'sun':ellipse(0,-16,13,13,C.gold);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(Math.sin(a)*16,-16+Math.cos(a)*16,Math.sin(a)*20,-16+Math.cos(a)*20,C.gold,2);}rect(-4,-18,2,2,C.wood);rect(3,-18,2,2,C.wood);break;
    case 'paint':ellipse(0,-5,16,8,C.wood);for(let i=0;i<4;i++)ellipse(-10+i*7,-6,3,3,[C.red,C.blue,C.gold,C.green][i]);line(-4,-12,9,-25,C.gold,2);break;
    case 'compass':ellipse(0,-12,14,14,C.gold);ellipse(0,-12,11,11,C.cream);poly([[0,-23],[-4,-10],[4,-10]],C.red);poly([[0,-1],[-4,-10],[4,-10]],C.blue);txt('N',0,-26,C.gold,5);break;
    case 'map':rect(-18,-23,36,23,C.cream);for(let i=0;i<3;i++)line(-13+i*12,-21,-15+i*12,-2,C.gold);line(-12,-7,11,-18,C.wood);line(6,-19,13,-12,C.red,2);line(13,-19,6,-12,C.red,2);break;
    case 'phone':rect(-12,-12,24,12,C.red);ellipse(0,-7,6,5,C.gold);ellipse(0,-7,3,2,C.ink);rect(-14,-24,28,6,C.pink);rect(-15,-23,7,10,C.pink);rect(8,-23,7,10,C.pink);break;
    case 'pedestal':rect(-13,-20,26,20,'#9a8b98');rect(-17,-24,34,5,C.white);rect(-16,0,32,3,C.white);rect(-9,-18,3,16,'#bfb3bd');break;
    case 'rope':ellipse(0,-5,13,5,C.gold);ellipse(0,-5,9,3,C.wood);line(10,-5,18,1,C.gold);break;
    case 'scroll':rect(-14,-22,28,20,C.cream);ellipse(-14,-12,3,11,C.gold);ellipse(14,-12,3,11,C.gold);for(let i=0;i<3;i++)rect(-9,-18+i*5,18,1,C.wood);break;
    case 'mountain':poly([[-27,0],[0,-39],[29,0]],'#8c8fa8');poly([[-10,-24],[0,-39],[12,-23],[4,-26],[0,-21],[-4,-26]],C.white);poly([[0,-39],[29,0],[9,0]],'#6d6b89');break;
    case 'baton':line(-9,0,9,-25,C.cream,2);line(-9,0,-4,-7,C.gold,3);star(9,-25,3,C.gold);break;
    case 'cone':rect(-14,-3,28,4,C.wood);poly([[-10,-3],[0,-28],[10,-3]],'#df976b');poly([[-5,-16],[5,-16],[7,-11],[-7,-11]],C.cream);break;
    case 'zipper':rect(-7,-33,14,33,C.wood);for(let j=-30;j<0;j+=4){rect(-4,j,4,2,C.gold);rect(1,j+2,4,2,C.gold);}rect(-3,-28,6,9,C.white);rect(-1,-27,2,5,C.ink);break;
    case 'coat':rect(-9,-31,18,30,C.red);poly([[-9,-30],[-17,-20],[-12,-17],[-6,-24]],C.pink);poly([[9,-30],[17,-20],[12,-17],[6,-24]],C.pink);rect(-1,-30,2,29,C.gold);for(let j=-24;j<-2;j+=7)rect(3,j,2,2,C.gold);break;
    case 'bread':rect(-14,-13,28,12,C.gold);ellipse(0,-14,14,8,C.gold);for(let i=-9;i<=9;i+=9)line(i,-18,i+3,-12,C.cream,2);break;
    case 'bird':ellipse(0,-9,10,7,'#9fa0b7');ellipse(-7,-17,6,6,'#bab7c6');rect(-16,-17,5,3,C.gold);rect(-10,-19,2,2,C.ink);rect(-5,-2,1,5,C.gold);rect(4,-2,1,5,C.gold);poly([[8,-10],[16,-14],[13,-3]],'#777e9b');break;
    case 'gear':for(let i=0;i<8;i++){const a=i*Math.PI/4;rect(Math.sin(a)*11-3,-14+Math.cos(a)*11-3,6,6,C.gold);}ellipse(0,-14,11,11,C.gold);ellipse(0,-14,5,5,C.ink);break;
    case 'case':rect(-16,-32,32,32,C.red);rect(-12,-28,24,24,C.blue);rect(-8,-24,3,11,'#b4d1d0');star(3,-14,6,C.gold);break;
    case 'ice':rect(-11,-22,22,22,C.blue);poly([[-11,-22],[-4,-27],[17,-27],[11,-22]],'#c1ded8');poly([[11,-22],[17,-27],[17,-5],[11,0]],'#799fae');rect(-8,-19,3,13,C.white);break;
    case 'scarf':rect(-12,-24,24,6,C.pink);rect(5,-18,6,18,C.pink);for(let i=0;i<3;i++)rect(5+i*2,0,1,3,C.gold);break;
    case 'snowman':ellipse(0,-10,13,12,C.white);ellipse(0,-27,9,10,C.white);rect(-3,-30,1,2,C.ink);rect(3,-30,1,2,C.ink);poly([[0,-27],[10,-25],[0,-24]],C.gold);rect(-8,-20,17,3,C.pink);rect(4,-18,4,10,C.pink);rect(-11,-36,22,3,C.ink);rect(-6,-45,12,10,C.ink);break;
    case 'flag':rect(-1,-42,2,43,C.gold);poly([[1,-42],[18,-38],[1,-31]],C.pink);break;
    case 'telescope':line(0,-16,-10,1,C.gold,2);line(0,-16,10,1,C.gold,2);poly([[-13,-25],[-10,-33],[19,-22],[16,-14]],C.gold);ellipse(-12,-29,4,6,C.blue);rect(-3,-19,4,5,C.wood);break;
    case 'ladder':rect(-13,-44,3,45,C.wood);rect(10,-44,3,45,C.wood);for(let j=-39;j<0;j+=9)rect(-10,j,20,3,C.gold);break;
    case 'bucket':case 'bowl':ellipse(0,-10,12,4,C.gold);rect(-11,-10,22,9,C.blue);ellipse(0,-1,11,3,C.blue);ellipse(0,-10,9,3,C.ink);if(p.kind==='bucket')line(-11,-10,0,-22,C.gold);break;
    case 'piano':rect(-21,-27,42,22,C.ink);rect(-21,-9,42,6,C.white);for(let i=-18;i<20;i+=6)rect(i,-9,3,4,C.ink);rect(-18,-3,3,6,C.wood);rect(15,-3,3,6,C.wood);rect(-20,-27,40,3,C.gold);break;
    case 'anchor':line(0,-27,0,-2,C.blue,3);ellipse(0,-30,4,4,C.gold);line(-12,-13,-7,-4,C.blue,3);line(-7,-4,0,0,C.blue,3);line(12,-13,7,-4,C.blue,3);line(7,-4,0,0,C.blue,3);rect(-9,-23,18,3,C.blue);break;
    case 'globe':case 'jar':ellipse(0,-20,17,17,'#7dafbc');ellipse(-7,-26,3,7,'#cbe0d8');rect(-12,-3,24,5,C.wood);rect(-14,1,28,3,C.gold);if(p.kind==='globe'){poly([[-8,-6],[0,-23],[10,-6]],C.cream);}else{star(4,-17,3,C.gold);star(-2,-24,2,C.gold);}break;
    case 'spoon':ellipse(0,-27,6,8,C.white);rect(-1,-21,3,22,C.blue);break;
    case 'washer':rect(-19,-37,38,38,'#b9c9c3');rect(-16,-34,32,6,C.blue);ellipse(9,-31,2,2,C.gold);ellipse(0,-14,13,13,C.wood);ellipse(0,-14,10,10,'#567c91');ellipse(-3,-17,5,5,'#8cb3bd');rect(-16,1,5,2,C.ink);rect(11,1,5,2,C.ink);break;
    case 'bridge':rect(-29,-18,58,10,C.wood);for(let i=-26;i<29;i+=8)rect(i,-18,1,9,C.gold);rect(-29,-23,58,3,C.gold);rect(-28,-23,3,25,C.wood);rect(25,-23,3,25,C.wood);break;
    case 'fridge':rect(-16,-43,32,44,C.white);rect(-13,-39,26,14,'#a9c5c0');rect(-13,-23,26,20,'#a9c5c0');rect(8,-36,2,7,C.wood);rect(8,-20,2,9,C.wood);break;
    case 'hat':ellipse(0,-3,19,5,C.ink);rect(-12,-25,24,22,C.ink);rect(-12,-10,24,4,C.pink);ellipse(0,-25,12,3,'#4d405b');break;
    case 'oven':rect(-18,-33,36,34,C.white);rect(-15,-20,30,16,C.ink);rect(-13,-18,26,12,'#85594b');rect(-12,-30,4,4,C.gold);rect(-3,-30,4,4,C.gold);rect(6,-30,4,4,C.gold);rect(-13,-23,26,2,C.wood);break;
    case 'castle':rect(-22,-33,12,34,'#8990a1');rect(10,-33,12,34,'#8990a1');rect(-12,-24,24,25,'#a4a2b0');for(let i=-22;i<23;i+=8)rect(i,-37,4,6,'#a4a2b0');ellipse(0,-6,6,9,C.ink);break;
    case 'screen':rect(-25,-40,50,32,C.wood);rect(-22,-37,44,26,C.white);rect(-1,-8,2,10,C.gold);rect(-15,1,30,2,C.gold);break;
    case 'projector':rect(-15,-20,28,16,C.wood);ellipse(-8,-25,8,8,'#858396');ellipse(8,-25,8,8,'#858396');rect(13,-16,8,8,C.gold);rect(-12,-4,3,7,C.gold);rect(8,-4,3,7,C.gold);break;
    case 'jellyfish':ellipse(0,-21,14,13,C.pink);rect(-14,-22,28,10,C.pink);for(let i=-10;i<=10;i+=5)line(i,-12,i+Math.sin(t*3+i)*3,0,C.purple,2);rect(-5,-24,2,2,C.ink);rect(4,-24,2,2,C.ink);break;
    case 'glove':rect(-7,-15,14,13,C.white);for(let i=-7;i<=5;i+=4)rect(i,-24+Math.abs(i),3,12,C.white);rect(-12,-12,6,5,C.white);rect(-6,-2,12,4,C.gold);break;
    case 'traffic':rect(-2,-33,4,34,C.wood);rect(-7,-45,14,29,C.ink);ellipse(0,-40,3,3,active?'#785469':C.red);ellipse(0,-31,3,3,C.gold);ellipse(0,-22,3,3,active?C.teal:'#405e57');break;
    case 'car':rect(-24,-15,48,11,C.red);poly([[-15,-15],[-10,-27],[10,-27],[18,-15]],C.pink);rect(-8,-24,8,8,C.blue);rect(3,-24,8,8,C.blue);ellipse(-14,-3,5,5,C.ink);ellipse(15,-3,5,5,C.ink);rect(20,-12,5,3,C.cream);break;
    case 'rabbit':ellipse(0,-9,11,10,C.white);ellipse(-4,-21,9,9,C.white);rect(-10,-40,5,16,C.white);rect(-1,-42,5,16,C.white);rect(-9,-38,2,10,C.pink);rect(0,-40,2,11,C.pink);rect(-7,-23,2,2,C.ink);rect(-13,-19,4,2,C.pink);ellipse(11,-6,4,4,C.white);break;
    case 'carousel':rect(-2,-38,4,36,C.gold);poly([[-29,-29],[0,-47],[29,-29]],C.pink);rect(-28,-29,56,4,C.gold);rect(-30,-3,60,5,C.gold);for(let i=-20;i<=20;i+=20)rect(i,-24,2,20,C.gold);break;
    case 'horse':ellipse(0,-14,13,7,C.gold);rect(7,-25,7,15,C.gold);ellipse(10,-26,8,5,C.gold);rect(7,-30,2,4,C.wood);rect(11,-28,2,2,C.ink);rect(-8,-9,3,11,C.wood);rect(7,-9,3,11,C.wood);line(-12,-16,-17,-8,C.wood,2);break;
    case 'fireplace':rect(-21,-32,42,33,C.wood);rect(-24,-34,48,4,C.gold);rect(-15,-26,30,25,C.ink);for(let i=-9;i<12;i+=7)poly([[i-4,-2],[i,-18+s*2],[i+5,-2]],C.gold);rect(-15,-3,30,3,C.wood);break;
    case 'shoe':rect(-10,-10,13,11,C.wood);rect(-10,-6,24,7,C.red);rect(-10,0,25,3,C.cream);rect(-4,-6,5,2,C.gold);break;
    case 'keyhole':ellipse(0,-24,9,9,C.ink);poly([[-4,-20],[4,-20],[7,-5],[-7,-5]],C.ink);ctx.strokeStyle=C.gold;ctx.lineWidth=2;ctx.strokeRect(-18,-42,36,44);break;
    case 'key':ellipse(-7,-12,7,7,C.gold);ellipse(-7,-12,4,4,C.ink);rect(0,-13,18,3,C.gold);rect(10,-10,3,5,C.gold);rect(15,-10,3,4,C.gold);break;
    case 'planet':ellipse(0,-19,18,18,C.blue);ellipse(-5,-25,7,4,C.teal);ellipse(7,-13,7,5,C.green);ctx.strokeStyle=C.gold;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-18,27,7,-.35,0,Math.PI*2);ctx.stroke();break;
    case 'candy':ellipse(0,-10,9,8,C.pink);poly([[-8,-10],[-16,-17],[-16,-3]],C.gold);poly([[8,-10],[16,-17],[16,-3]],C.gold);rect(-3,-15,3,10,C.white);break;
    case 'disco':line(0,-46,0,-29,C.gold);ellipse(0,-17,15,15,C.blue);for(let j=-28;j<-4;j+=5)for(let i=-10;i<=10;i+=5)if(i*i+(j+17)**2<180)rect(i,j,3,3,Math.sin(t*2+i+j)>0?C.white:C.purple);break;
    case 'dragon':ellipse(0,-12,16,10,C.green);ellipse(12,-24,9,9,C.green);poly([[-13,-13],[-27,-5],[-8,-7]],C.green);poly([[-4,-19],[-13,-34],[6,-19]],C.teal);rect(14,-27,2,2,C.ink);rect(15,-22,11,5,C.green);rect(-9,-4,6,5,C.teal);break;
    case 'bed':rect(-21,-21,42,20,C.wood);rect(-18,-19,36,16,C.pink);rect(-18,-24,15,9,C.white);rect(-21,-28,3,31,C.gold);rect(18,-18,3,21,C.gold);break;
    case 'lever':rect(-12,-5,24,6,C.wood);line(0,-5,active?8:-8,-26,C.gold,3);ellipse(active?8:-8,-26,5,5,C.red);break;
    case 'comet':poly([[0,-12],[30,-36],[18,-10]],C.pink);poly([[0,-12],[23,-30],[10,-10]],C.gold);ellipse(0,-10,10,10,C.cream);break;
    case 'sponge':rect(-12,-13,24,12,C.gold);rect(-9,-10,3,3,C.wood);rect(0,-6,3,2,C.wood);rect(7,-10,2,3,C.wood);break;
    case 'hatch':poly([[-20,-6],[0,-18],[22,-6],[0,7]],C.wood);poly([[-14,-6],[0,-13],[16,-6],[0,3]],C.ink);rect(-2,-7,5,2,C.gold);break;
    case 'kite':poly([[0,-36],[-13,-20],[0,-6],[13,-20]],C.pink);poly([[0,-36],[0,-6],[13,-20]],C.gold);line(0,-6,5,2,C.cream);line(5,2,0,9,C.cream);rect(1,1,7,2,C.teal);break;
    case 'thermometer':rect(-3,-34,6,27,C.white);rect(-1,-28,2,21,C.red);ellipse(0,-5,6,6,C.white);ellipse(0,-5,4,4,C.red);break;
    case 'stamp':rect(-4,-24,8,18,C.wood);ellipse(0,-25,9,5,C.red);rect(-14,-8,28,6,C.wood);rect(-16,-2,32,3,C.gold);break;
    default: throw new Error(`Missing prop renderer: ${p.kind}`);
  }
  ctx.restore();
}

const emitters={
  steam:'cloud',fireworks:'star',hearts:'heart',confetti:'confetti',rain:'drop',upRain:'drop',timefall:'clock',snow:'snow',bubbles:'bubble',letters:'letter',fireflies:'spark',wish:'star',candles:'candle',birds:'bread',ducks:'bird',picnic:'ant',shoot:'star',burst:'letter',treasure:'coin',applause:'heart',waterfall:'drop',seacall:'drop',raincoat:'drop',storm:'spark',trim:'cloud',planetbloom:'flower',bookcake:'cake',graduate:'scroll',rebellion:'letter',chat:'bubble',ring:'note',opera:'note',clockdance:'note',orchestra:'note',disco:'note',ending:'star',echo:'echo',beacon:'spark',dragon:'spark',sunhat:'sun',scarf:'heart',hug:'heart',rainbow:'spark',comet:'bubble',frames:'flower',bloom:'flower',laundry:'sun',jelly:'bubble',tea:'cloud',constellation:'star',sunrise:'sun',sunset:'sun',horizon:'cloud',skyfloor:'cloud',shoes:'cloud',rabbit:'star',doors:'star',fridge:'cake',mirror:'spark',eye:'spark',eyes:'spark',zip:'spark',map:'coin',anchor:'cloud',skyline:'star',stamp:'star',shadow:'spark',moon:'star',aquarium:'bubble',hatch:'star',bridge:'spark',bend:'spark',whirlpool:'bubble',compass:'spark',lift:'star',levitate:'spark',grow:'spark',migrate:'sock',race:'letter',float:'bubble',dance:'note',hop:'heart',roll:'spark',train:'cloud',fly:'clock',sail:'bubble',ghostdrive:'spark',kites:'star',carousel:'note',swallow:'star',beam:'spark',cinema:'star',orbit:'star'};
export const effectKinds=new Set(Object.keys(emitters));
effectKinds.add('devour');
function effectParticle(kind,x,y,t,i){
  if(kind==='heart')heart(x,y);
  else if(kind==='note')notes(x,y,t);
  else if(kind==='drop')rect(x,y,1,4,C.blue);
  else if(kind==='snow')star(x,y,2,C.white);
  else if(kind==='spark'||kind==='star')star(x,y,2+(i%2),i%2?C.gold:C.white);
  else if(kind==='confetti')rect(x,y,2,4,[C.gold,C.pink,C.teal,C.blue][i%4]);
  else if(kind==='ant'){rect(x,y,3,1,C.ink);rect(x+1,y-1,1,3,C.ink);}
  else if(kind==='bubble'){ctx.strokeStyle=C.blue;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,2+i%4,0,Math.PI*2);ctx.stroke();}
  else if(kind==='echo')txt(['hello','Hello!','...nice shoes.'][i%3],x,y,C.cream,5);
  else{ctx.save();ctx.translate(x,y);ctx.scale(.35,.35);drawProp(ctx,{kind,x:0,y:0},t);ctx.restore();}
}
export function roomEffect(context,model,t,age){
  ctx=context;
  if(model.room.deadly){
    const plant=model.room.props[0];
    if(age<.8)txt('FEED ME!',plant.x,plant.y-94,C.cream,9);
    else if(age>1.6){
      txt(age<2.3?'CHOMP.':'...burp.',plant.x+58,plant.y-55,C.gold,7);
      if(age<2.7){rect(plant.x+38,plant.y-42-(age-1.6)*15,10,4,C.red);rect(plant.x+36,plant.y-39-(age-1.6)*15,14,3,C.pink);}
    }
    return;
  }
  const f=model.room,p=f.props[0],q=age/2.6,kind=emitters[f.effect],mainX=p.x,mainY=p.y-20;
  for(let i=0;i<(f.effect==='echo'?4:19);i++){
    const a=i*2.399;const r=12+((age*28+i*13)%65);let x=mainX+Math.cos(a)*r,y=mainY+Math.sin(a)*r*.55-age*7;
    if(['rain','snow','waterfall','timefall','raincoat'].includes(f.effect)){x=mainX-50+(i*17)%100;y=105+(age*43+i*17)%94;}
    if(f.effect==='upRain'){x=mainX-52+(i*19)%104;y=210-(age*55+i*13)%105;}
    if(f.effect==='disco'||f.effect==='orchestra'){x=110+(i*19)%255;y=120+(i*37)%90-Math.sin(t*4+i)*7;}
    if(f.effect==='swallow'){x=mainX+Math.cos(a+age)*Math.max(0,70-age*27);y=mainY+Math.sin(a+age)*Math.max(0,40-age*14);}
    if(f.effect==='echo'){x=mainX+Math.sin(i*7)*65;y=mainY-15-i*14;}
    effectParticle(kind,x,y,t,i);
  }
  const extra=(kind,x=mainX,y=mainY,scale=1)=>{ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);drawProp(ctx,{kind,x:0,y:0},t,true,q);ctx.restore();};
  switch(f.effect){
    case 'shadow':{const x=mainX+(175-mainX)*Math.min(1,age*2),y=180+(123-180)*Math.min(1,age*2);ellipse(x,y-8,5,9,'#201b2b');rect(x-7,y-15,14,11,'#201b2b');break;}
    case 'upRain':extra('rainbow',240,119,1.4);break;
    case 'moon':ellipse(mainX+12,mainY-8,17,18,palettes[f.palette].floor);extra('cup',mainX-29,mainY+14,.5);break;
    case 'aquarium':if(model.drawExplorer)model.drawExplorer(mainX,mainY+13);else drawAndy(ctx,mainX,mainY+13,t,true,'down');break;
    case 'laundry':for(let i=0;i<5;i++){const a=age*2+i;extra(i%2?'moon':'sun',mainX+Math.cos(a)*50,mainY-10+Math.sin(a)*28,.38);}break;
    case 'stamp':{const dy=age<.6?40-age*80:-8+Math.max(0,age-1.6)*70;extra('stamp',mainX,mainY-dy,2.5);if(age>.6)txt((model.explorerName||'Andy').toUpperCase()+' APPROVED',mainX,mainY+30,C.gold,8);break;}
    case 'skyline':extra('building',mainX,mainY+20,Math.min(1.2,age));break;
    case 'rainbow':extra('rainbow',240,153,2.3);break;
    case 'hatch':extra('bird',mainX,mainY-20-Math.sin(age*3)*8);break;
    case 'beacon':extra('lighthouse',mainX,mainY+15,Math.min(1,age));break;
    case 'rabbit':extra('rabbit',mainX,mainY+10-Math.min(25,age*35),.8);extra('hat',mainX+25,mainY+5,.4);break;
    case 'fridge':extra('cake',mainX,mainY+8);break;
    case 'sunhat':extra('hat',mainX,mainY-22,.8);break;
    case 'scarf':extra('scarf',mainX,mainY+17,.85);break;
    case 'mirror':if(model.drawExplorer)model.drawExplorer(mainX,mainY+13);else drawAndy(ctx,mainX,mainY+13,t,true,'down');break;
    case 'eyes':case 'eye':ellipse(mainX,mainY,11,6,C.white);ellipse(mainX+Math.sin(t*3)*4,mainY,4,5,C.ink);break;
    case 'frames':extra('flower',mainX,mainY+6,.9);break;
    case 'sunrise':extra('sun',mainX,mainY+5-Math.min(30,age*20));break;
    case 'sunset':rect(85,110,310,2,C.gold);extra('sun',mainX,130+age*10);break;
    case 'horizon':rect(80,146,320,2,C.gold);extra('mountain',160,144,.65);extra('sun',330,139,.7);break;
    case 'cinema':rect(mainX-20,mainY-16,40,25,C.ink);txt('FIN.',mainX,mainY,C.cream,9);break;
    case 'graduate':extra('hat',mainX,mainY-24-Math.sin(age*2)*15,.7);break;
    case 'storm':line(mainX+3,mainY-14,mainX-4,mainY-4,C.gold,2);line(mainX-4,mainY-4,mainX+4,mainY-2,C.gold,2);line(mainX+4,mainY-2,mainX-3,mainY+10,C.gold,2);break;
    case 'beam':case 'beaconLight':poly([[mainX,mainY-20],[mainX+Math.cos(age)*90,90],[mainX+Math.cos(age)*90,140]],'#f4d9a733');break;
    case 'tea':extra('cup',mainX+20,mainY-5,.7);break;
    case 'treasure':extra('coin',mainX,mainY-20,.8);break;
    case 'constellation':for(let i=0;i<6;i++)line(140+i*32,110+Math.sin(i*2)*17,172+i*32,110+Math.sin((i+1)*2)*17,'#dfbd8866');break;
    case 'shoes':extra('shoe',166,133,.8);break;
    case 'map':extra('chair',mainX,mainY+15,.8);break;
    case 'bridge':rect(mainX-30,mainY+3,60,3,C.gold);break;
    case 'zip':rect(mainX-1,mainY-15,3,20,C.cream);break;
  }
}
export function transformProp(p,index,model,t,age){
  const f=model.room,e=f.effect,a=age===null?false:true;
  let x=p.x,y=p.y,scale=1,rotation=0;
  if(!a)return {x,y,scale,rotation};
  const pulse=Math.sin(Math.min(1,age/.4)*Math.PI/2);
  if(['levitate','float','fly','migrate','letters','shoot','jelly','kites'].includes(e)){y-=pulse*(12+index*3)+Math.sin(t*3+index)*4;}
  if(['dance','disco','orchestra','hop','chat','opera','clockdance','applause','rebellion'].includes(e)){y-=Math.max(0,Math.sin(t*9+index*2))*9;rotation=Math.sin(t*7+index)*.12;}
  if(['grow','bloom','planetbloom'].includes(e)&&index===0)scale=1+Math.sin(Math.min(age,1.7)*1.2)*.45;
  if(['race','sail','train','ghostdrive','roll','shoes'].includes(e)&&index!==0){x+=Math.sin(age*2+index)*25;}
  if(['orbit','carousel','whirlpool'].includes(e)&&index!==0){const m=f.props[0];x=m.x+Math.cos(age*2+index*1.8)*76;y=m.y+Math.sin(age*2+index*1.8)*30;}
  if(['bend','compass','ring','zip','mirror'].includes(e)&&index===0)rotation=Math.sin(age*5)*.2;
  if(e==='lift'&&p.kind==='weight')y-=Math.sin(age)*18;
  if(e==='anchor'&&p.kind==='anchor')y-=age*20;
  if(e==='aquarium'&&p.kind==='fish'){x+=(240-x)*Math.min(1,age)*.55;y+=(150-y)*Math.min(1,age)*.55;}
  if(e==='hug'&&p.kind==='cactus'&&index>0)x+=(240-x)*Math.sin(age)*.3;
  if(e==='doors'&&p.kind==='door')scale=.85+Math.sin(age*4+index)*.15;
  if(e==='swallow'&&index>0){const k=Math.min(1,age*.6);x+=(240-x)*k;y+=(143-y)*k;scale=1-k*.8;}
  return{x,y,scale,rotation};
}