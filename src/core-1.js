(async function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
if(!window.THREE){document.body.insertAdjacentHTML('beforeend','<div id="err">The 3D engine could not load. Check your connection and reload.</div>');return;}
const W=window.WORLD,LM=window.LANDMARKS;
try{await Promise.race([document.fonts.load('800 48px "Baloo 2"'),new Promise(r=>setTimeout(r,1500))]);}catch(e){}
const VERSION='3.4';

/* ================= storage + config ================= */
const store={get(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const REGIONS=[
  {id:'west',name:'West',states:'Maharashtra, Gujarat, Rajasthan, Dadra & Nagar Haveli and Daman & Diu',map:true},
  {id:'north',name:'North',states:'Delhi, Punjab, Haryana, Chandigarh, Himachal Pradesh, Uttarakhand, J&K, Ladakh'},
  {id:'central',name:'Central',states:'Uttar Pradesh, Madhya Pradesh, Chhattisgarh'},
  {id:'east',name:'East',states:'West Bengal, Bihar, Jharkhand, Odisha'},
  {id:'northeast',name:'Northeast',states:'Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Sikkim'},
  {id:'southwest',name:'South-West',states:'Karnataka, Kerala, Goa, Lakshadweep'},
  {id:'southeast',name:'South-East',states:'Tamil Nadu, Andhra Pradesh, Telangana, Puducherry, Andaman & Nicobar'}];
const FEST_DEFAULT=[
  {name:'Navratri',type:'navratri',where:'GJ,MH,RJ,DD,DN',start:'2026-10-11',end:'2026-10-20',mult:1.2},
  {name:'Diwali',type:'diwali',where:'all',start:'2026-11-06',end:'2026-11-10',mult:1.5},
  {name:'Uttarayan',type:'uttarayan',where:'GJ',start:'2027-01-14',end:'2027-01-15',mult:1.2},
  {name:'Holi',type:'holi',where:'all',start:'2027-03-21',end:'2027-03-22',mult:1.3},
  {name:'Ganpati',type:'ganpati',where:'MH',start:'2027-09-04',end:'2027-09-14',mult:1.3}];
const EVENT_DEFAULT=[{name:'Rann Utsav',zone:'bhuj',start:'2026-11-01',end:'2027-02-28',mult:1.2},{name:'Juhu beach party',zone:'mumbai',start:'2026-10-10',end:'2026-10-18',mult:1.5}];
const BILL_DEFAULT=[{text:'INDIA BAY',fg:'#ff9f1c',bg:'#1d1433',zone:'all',start:'',end:''},{text:'चाय पियो',fg:'#2a1600',bg:'#ffc93c',zone:'all',start:'',end:''},{text:'VADA PAV ₹20',fg:'#ffffff',bg:'#d9483b',zone:'mumbai',start:'',end:''},
  {text:'KHAMAN HOUSE',fg:'#2a1600',bg:'#f6d7a7',zone:'ahmedabad',start:'',end:''},{text:'पधारो म्हारे देस',fg:'#ffffff',bg:'#b5562f',zone:'jaipur',start:'',end:''},{text:'SUNRISE CINEMA',fg:'#ffe9b8',bg:'#2f3e8f',zone:'all',start:'',end:''},{text:'MONSOON SALE',fg:'#1d1433',bg:'#3ddc97',zone:'all',start:'',end:''}];
const CHANGELOG=[
  {v:'3.4',date:'2026-10-12',notes:'New 👤 Profile button in the top row: your account, settings, privacy policy and Contact support in one place.\nOnline players can change their username, sign out, or delete their online account from Profile.\nOther players now see your vehicle parked where you left it.\nPrivacy policy and Contact support links on the start screen.'},
  {v:'3.3',date:'2026-10-11',notes:'Online play: sign in with Google or as a guest, pick a unique username, and your progress is saved in the cloud.\nSee other players walking and driving around West India, with their names above them.\nChat with players near you (T or the 💬 button), with mute and report in Phone → Online.\nAdmin settings now reach every player on the hosted game.'},
  {v:'3.2',date:'2026-10-11',notes:'Cleaner screen: menu, phone, settings and camera are four icons in one row, with the date, time and weather removed from the corner.\nDirections sit as a small chip under those icons, and the 3D arrow in front of the vehicle is gone; the blue line on the minimap shows the way.\nOn phones the health bars and minimap are smaller, so you see more road.\nDrag with the mouse or a finger to look around; the camera returns behind you after a moment.\nThe radio never starts by itself. Turn it on once and it remembers your station in every vehicle until you turn it off.\nAll India map shows the real state outlines; tap a state to see its region.\nTapping a map now shows a card with a Directions button, like a maps app.\nTraffic signals at city junctions: cars stop at red, and jumping a red light costs a ₹1,000 e-challan.\nTraffic jams appear in orange and red on the maps, and directions route around them, with an arrival time.'},
  {v:'3.1',date:'2026-10-11',notes:'Directions like a maps app: a blue route line, turn-by-turn instructions and an arrow that follows the road, for jobs, story goals and any place you pick.\nNew map with three tabs: Current city (with a legend for every icon), Current region and All India (with every state abbreviation explained). Tap anywhere for directions.\nCars, bikes and autos can drive on footpaths and open ground. Only buildings block you.\nFood and toilet needs last 3 times longer and hurt your health more slowly. No more screen shake when health drops.\nMission notes now pop up at the top and hide after 5 seconds. Tap the blue direction bar to see them again.\nNew Menu (Garage, Jobs, Wardrobe, Business), Phone and Settings buttons. Radio can be switched off in Settings or with ✕.\nFuel is sold in litres. Honking is only for fuel queues. New vehicles come insured. You can sell vehicles in the Garage. Roads in Ahmedabad, Surat and Nashik now bridge their rivers.'},
  {v:'3.0',date:'2026-10-11',notes:'The whole West region is open: Maharashtra, Gujarat, Rajasthan, Daman & Diu and Dadra & Nagar Haveli, with 28 cities and towns, 57 famous places, 13 airports, the Arabian Sea coast, highways and expressways.\nTrains, flights, buses, bot taxis, the Mumbai local and the Gateway–Mandwa ferry.\nCycles, motorbikes, sports bikes, cycle rickshaws and sedans. Fuel, damage, mechanics, insurance, PUC, licences and traffic police checks.\nJobs with an agent or freelance: food delivery, auto, cab, truck, bus and dabbawala, each with a star rating.\nShared Bay clock (1 game minute = 1 real second), real-time needs, queues, festivals, radio, BayGame, photo mode and clips, story chapter, achievements and daily rewards.'},
  {v:'2.0',date:'2026-10-10',notes:'Open-world Mumbai with admin settings, banks, shops, weapons, police stars, homes, needs and first-person view.'},
  {v:'1.0',date:'2026-10-10',notes:'First drive along the Mumbai seafront in an auto rickshaw.'}];
const DEFAULTS={name:'India Bay',tagline:'Open-world West India: Maharashtra, Gujarat, Rajasthan and the coast',announce:'',theme:'kesar',accent:'#ffc93c',
  timeSpeed:1,timeOffset:0,weather:'auto',traffic:30,peds:40,police:'normal',weapons:true,needs:true,
  foodHrs:30,wcHrs:24,awakeHrs:16,
  act:{sleep:480,meal:30,snack:10,drink:5,cook:30,tv:60,toilet:5},
  queue:{petrol:20,cng:40,atm:15,toilet:5,ticket:20,hospital:30,checkin:30},
  travel:{sleeper:[400,360],ac:[1200,300],flight:[4500,120],bus:[250,420],bottaxi:[2500,240],ferry:[300,90],local:[10,40]},
  fuel:{petrol:100,diesel:90,cng:80},challan:{licence:5000,helmet:1000,puc:10000,insurance:2000,speeding:2000,queue:500,signal:1000},toll:150,
  priceMul:1,fareMul:1,startCash:500,regions:{west:true},festivals:FEST_DEFAULT,events:EVENT_DEFAULT,billboards:BILL_DEFAULT,changelog:[]};
const THEMES={kesar:{label:'Sunset kesar',accent:'#ffc93c',panel:'rgba(20,15,38,.66)',edge:'rgba(255,214,150,.22)',sheet:'#211a3a',sheet2:'#2c2350'},neon:{label:'Bollywood neon',accent:'#ff4fa3',panel:'rgba(14,6,32,.72)',edge:'rgba(255,79,163,.38)',sheet:'#1c0f33',sheet2:'#2b1648'},monsoon:{label:'Monsoon teal',accent:'#3fd0c9',panel:'rgba(8,26,32,.7)',edge:'rgba(63,208,201,.32)',sheet:'#0f2a30',sheet2:'#173b42'},chalk:{label:'Chalk and ink',accent:'#f4f1ea',panel:'rgba(16,16,20,.74)',edge:'rgba(244,241,234,.26)',sheet:'#1b1b20',sheet2:'#2a2a31'}};
function mergeCfg(base,over){const o=Object.assign({},base,over||{});for(const k of ['act','queue','travel','fuel','challan','regions'])o[k]=Object.assign({},base[k],(over&&over[k])||{});for(const k of ['festivals','events','billboards','changelog'])o[k]=Array.isArray(over&&over[k])?over[k]:base[k];return o;}
let CFG=mergeCfg(DEFAULTS,store.get('ib.cfg'));let savedCFG=CFG;
const price=b=>Math.max(5,Math.round(b*CFG.priceMul/5)*5);
const inr=n=>(n<0?'−':'')+'₹'+Math.abs(Math.round(n)).toLocaleString('en-IN');
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

/* ================= clocks ================= */
function gameMin(){return Date.now()/1000*CFG.timeSpeed+(+CFG.timeOffset||0);}
let clockH=0,gameDay=0;
function tickClock(){const g=gameMin();clockH=((g/60)%24+24)%24;gameDay=Math.floor(g/1440);}
const IST=(()=>{try{return{d:new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',weekday:'short',day:'numeric',month:'short',year:'numeric'}),iso:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}),m:new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',month:'numeric'})};}catch(e){return null;}})();
function istText(){const d=new Date();if(!IST)return d.toDateString();const p=IST.d.formatToParts(d),g=t=>(p.find(x=>x.type===t)||{}).value||'';return `${g('weekday')}, ${g('day')} ${g('month')} ${g('year')}`;}
function istISO(){const d=new Date();return IST?IST.iso.format(d):d.toISOString().slice(0,10);}
function istMonth(){return IST?+IST.m.format(new Date()):new Date().getMonth()+1;}
const bayTime=()=>{const h=Math.floor(clockH),m=Math.floor((clockH-h)*60);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;};

/* ================= renderer ================= */
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('#c'),antialias:true,powerPreference:'high-performance'});}
catch(e){document.body.insertAdjacentHTML('beforeend','<div id="err">Your browser has 3D graphics turned off. Try Chrome or Safari on a newer device.</div>');return;}
const isTouch=matchMedia('(hover: none)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio,isTouch?1.5:2));
renderer.shadowMap.enabled=!isTouch;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xf3a65a,180,700);scene.background=new THREE.Color();
const camera=new THREE.PerspectiveCamera(62,1,0.1,4000);
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.fov=camera.aspect<1?74:62;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const rnd=mulberry32(2026);
const R=(a,b)=>a+rnd()*(b-a),pick=a=>a[Math.floor(rnd()*a.length)];
const MR=(a,b)=>a+Math.random()*(b-a),mpick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const wrapA=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
const hash=n=>{let x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const maxAniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());
function canvasTex(w,h,draw,repeat=true){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new THREE.CanvasTexture(c);if(repeat)t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=maxAniso;return t;}

/* ================= textures + materials ================= */
const winTex=canvasTex(128,128,x=>{x.fillStyle='#fff';x.fillRect(0,0,128,128);for(let i=0;i<8;i++)for(let j=0;j<8;j++){const cx=i*16,cy=j*16;x.fillStyle='#2c3444';x.fillRect(cx+4,cy+3,8,9);x.fillStyle='#d8d2c6';x.fillRect(cx+3,cy+12,10,2);if(rnd()<.13){x.fillStyle='#c4c8cc';x.fillRect(cx+10,cy+8,5,4);}}});
const litTex=canvasTex(128,128,x=>{x.fillStyle='#000';x.fillRect(0,0,128,128);for(let i=0;i<8;i++)for(let j=0;j<8;j++){if(rnd()<.42){x.fillStyle=pick(['#ffd27a','#ffe9b8','#ffb85c','#cfe4ff','#ffc98a']);x.fillRect(i*16+4,j*16+3,8,9);}}});
const oldTex=canvasTex(128,128,x=>{x.fillStyle='#fff';x.fillRect(0,0,128,128);for(let i=0;i<4;i++)for(let j=0;j<4;j++){const cx=i*32,cy=j*32;if(rnd()<.8){x.fillStyle='#3a3030';x.fillRect(cx+10,cy+12,12,14);x.beginPath();x.arc(cx+16,cy+12,6,Math.PI,0);x.fill();x.fillStyle='rgba(0,0,0,.12)';x.fillRect(cx+8,cy+26,16,2);}}});
const oldLit=canvasTex(128,128,x=>{x.fillStyle='#000';x.fillRect(0,0,128,128);for(let i=0;i<4;i++)for(let j=0;j<4;j++){if(rnd()<.45){x.fillStyle=pick(['#ffd27a','#ffb85c','#ffe9b8']);x.fillRect(i*32+10,j*32+12,12,14);}}});
const roadTex=canvasTex(64,64,x=>{x.fillStyle='#3a3b41';x.fillRect(0,0,64,64);for(let i=0;i<300;i++){x.fillStyle=rnd()<.5?'rgba(255,255,255,.04)':'rgba(0,0,0,.08)';x.fillRect(rnd()*64,rnd()*64,1,1);}x.fillStyle='#d9d3c3';x.fillRect(2,0,1.5,64);x.fillRect(60.5,0,1.5,64);x.fillStyle='#eadfb8';x.fillRect(31,4,2,26);});
const hwTex=canvasTex(64,64,x=>{x.fillStyle='#35363b';x.fillRect(0,0,64,64);for(let i=0;i<300;i++){x.fillStyle=rnd()<.5?'rgba(255,255,255,.05)':'rgba(0,0,0,.09)';x.fillRect(rnd()*64,rnd()*64,1,1);}x.fillStyle='#e8e2d0';x.fillRect(3,0,2,64);x.fillRect(59,0,2,64);x.fillStyle='#f2c94c';x.fillRect(30,0,1.5,64);x.fillRect(32.5,0,1.5,64);});
const seaTex=canvasTex(128,128,x=>{x.fillStyle='#fff';x.fillRect(0,0,128,128);for(let i=0;i<70;i++){x.fillStyle='rgba(120,170,210,.35)';x.fillRect(rnd()*128,rnd()*128,R(6,22),1);}});
const LMat=(c,o={})=>new THREE.MeshLambertMaterial(Object.assign({color:c},o));
const M={ground:LMat('#8c8676'),pave:LMat('#bdb4a4'),earth:LMat('#b8a58a'),road:LMat('#ffffff',{map:roadTex}),hw:LMat('#ffffff',{map:hwTex}),asphalt:LMat('#3a3b41'),grass:LMat('#5f9a45'),dirt:LMat('#c9a26b'),sand:LMat('#e2cf9f'),wall:LMat('#9c958a'),concrete:LMat('#aaa59b'),
  trunk:LMat('#7a5a3a'),leaf:LMat('#3e8c3a'),tree:LMat('#4f8f3e'),treeDry:LMat('#7f8a3c'),treeDark:LMat('#2f6b33'),pole:LMat('#3b3a40'),tank:LMat('#202226'),stone:LMat('#d6b47c'),plaza:LMat('#cfc09e'),temple:LMat('#e2b77e'),gold:LMat('#f2c14e'),station:LMat('#a8704a'),cream:LMat('#f1e2c2'),
  awn:['#d9483b','#2f7fc1','#e8a628','#3aa66b','#9b4fb5'].map(c=>LMat(c)),boat:LMat('#e4572e'),boat2:LMat('#2e86ab'),white:LMat('#f3f1ec'),blue:LMat('#2d5fb3'),red:LMat('#c8102e'),kiosk:LMat('#e8a628'),wc:LMat('#3b82c4'),lamp:new THREE.MeshBasicMaterial({color:0x666055}),
  lampBox:new THREE.MeshBasicMaterial({color:0xfff6d8}),marble:LMat('#f4f0e6'),ballast:LMat('#7d7468'),steel:LMat('#8d939a'),wood:LMat('#6b4a32'),roofTin:LMat('#8a8f86'),dark:LMat('#24211f'),basalt:LMat('#55504a'),redstone:LMat('#b5562f'),blackstone:LMat('#3a3638'),
  waterBox:new THREE.MeshPhongMaterial({color:0x2f78a8,shininess:80}),bronze:LMat('#6f6550'),glassBox:LMat('#86a9c4'),tile:LMat('#a84a2a'),rock:LMat('#8a6a4a'),pink:LMat('#e08a6c'),pinkLight:LMat('#efb59c'),gold2:LMat('#d9b26a'),runway:LMat('#2e2f33'),apron:LMat('#5b5d61'),canopy:LMat('#f3f1ec'),
  cow:LMat('#efe8dc'),lion:LMat('#c99a52'),tiger:LMat('#e08a2a'),camel:LMat('#c8a06a'),roofRed:LMat('#a8402a'),plane:LMat('#f4f6f8'),planeTail:LMat('#ff7a1a')};
const styleCache=new Map();
function bmat(col,old){const k=col+(old?'o':'m');if(!styleCache.has(k))styleCache.set(k,LMat(col,{map:old?oldTex:winTex,emissiveMap:old?oldLit:litTex,emissive:0xffffff,emissiveIntensity:0}));return styleCache.get(k);}
const glassMat=LMat('#86a9c4',{map:winTex,emissiveMap:litTex,emissive:0xffffff,emissiveIntensity:0});styleCache.set('glass',glassMat);
const STYLES={metro:{cols:['#efe3c8','#f2b8a2','#bfe0cf','#a9cfe8','#e8c070','#f4f1ea','#cfc6dc','#e7a46b','#f6d7a7'],h:[12,46],tower:.08,lots:2},mid:{cols:['#efe3c8','#e9d6bd','#cfd8d6','#f2c6a0','#d9cfe0','#f4f1ea'],h:[10,32],tower:.05,lots:2},
  gujarat:{cols:['#e9dcc4','#d9c2a0','#c8d7d9','#efe3c8','#f2c6a0','#d0d6c2'],h:[10,38],tower:.06,lots:2},pink:{cols:['#e8967a','#e3a083','#d98a6d','#eda98f'],h:[6,14],old:true,lots:3,chhatri:.25},
  blue:{cols:['#5b8fd6','#7aa7e0','#4a7ec9','#9cc0ea','#f0ece2'],h:[5,12],old:true,lots:3},gold:{cols:['#d9b26a','#cfa45a','#e3bf7a'],h:[5,11],old:true,lots:3,chhatri:.15},
  white:{cols:['#f4f1ea','#efe8da','#e9e2d0','#f2d7a7'],h:[6,16],old:true,lots:3,dome:.15},town:{cols:['#f2b8a2','#bfe0cf','#a9cfe8','#e8c070','#f4f1ea','#cfc6dc','#f6d7a7'],h:[5,14],old:true,lots:3},
  hill:{cols:['#f1e2c2','#e8d6b0','#d9c7a8'],h:[4,7],old:true,lots:2,cottage:true}};

/* ================= static batching in chunks ================= */
const CH=400;const chunks=new Map();const farGroups=[];let lmCollect=null;
function chunkOf(x,z){const k=Math.floor(x/CH)+','+Math.floor(z/CH);let c=chunks.get(k);if(!c){c={k,cx:(Math.floor(x/CH)+.5)*CH,cz:(Math.floor(z/CH)+.5)*CH,group:new THREE.Group(),pend:new Map()};scene.add(c.group);chunks.set(k,c);}return c;}
function addStatic(g,mat,cast=true,receive=true){if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;const x=(b.min.x+b.max.x)/2,z=(b.min.z+b.max.z)/2;
  if(lmCollect){lmCollect.push([g,mat,cast,receive]);return;}const c=chunkOf(x,z);const key=mat.uuid+(cast?1:0)+(receive?1:0);let p=c.pend.get(key);if(!p){p={mat,geoms:[],cast,receive};c.pend.set(key,p);}p.geoms.push(g);}
function merge(geoms){let vc=0,ic=0;for(const g of geoms){vc+=g.attributes.position.count;ic+=g.index?g.index.count:g.attributes.position.count;}
  const pos=new Float32Array(vc*3),nor=new Float32Array(vc*3),uv=new Float32Array(vc*2),idx=new Uint32Array(ic);let vo=0,io=0;
  for(const g of geoms){const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;pos.set(p.array,vo*3);if(n)nor.set(n.array,vo*3);if(u)uv.set(u.array,vo*2);if(g.index){const a=g.index.array;for(let i=0;i<a.length;i++)idx[io++]=a[i]+vo;}else{for(let i=0;i<p.count;i++)idx[io++]=vo+i;}vo+=p.count;g.dispose();}
  const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.BufferAttribute(pos,3));o.setAttribute('normal',new THREE.BufferAttribute(nor,3));o.setAttribute('uv',new THREE.BufferAttribute(uv,2));o.setIndex(new THREE.BufferAttribute(idx,1));o.computeBoundingSphere();return o;}
function flushStatic(){for(const c of chunks.values()){for(const p of c.pend.values()){if(!p.geoms.length)continue;const m=new THREE.Mesh(merge(p.geoms),p.mat);m.castShadow=p.cast;m.receiveShadow=p.receive;m.matrixAutoUpdate=false;m.updateMatrix();c.group.add(m);}c.pend.clear();}}
function flushFar(list,x,z){const by=new Map();for(const [g,mat,cast,recv] of list){const k=mat.uuid+(cast?1:0);let p=by.get(k);if(!p){p={mat,geoms:[],cast,recv};by.set(k,p);}p.geoms.push(g);}
  const grp=new THREE.Group();for(const p of by.values()){const m=new THREE.Mesh(merge(p.geoms),p.mat);m.castShadow=p.cast;m.receiveShadow=p.recv;m.matrixAutoUpdate=false;m.updateMatrix();grp.add(m);}scene.add(grp);farGroups.push({group:grp,x,z});}
function updChunks(px,pz){const r=scene.fog.far+120,rf=Math.min(2600,scene.fog.far*2.6+300);for(const c of chunks.values()){c.group.visible=Math.abs(c.cx-px)<r+CH/2&&Math.abs(c.cz-pz)<r+CH/2;}for(const f of farGroups){f.group.visible=Math.hypot(f.x-px,f.z-pz)<rf;}}
function box(w,h,d,x,y,z,mat,cast,recv){const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);addStatic(g,mat,cast!==false,recv!==false);return g;}
function boxRot(w,h,d,x,y,z,ry,mat,cast,recv){const g=new THREE.BoxGeometry(w,h,d);g.rotateY(ry);g.translate(x,y,z);addStatic(g,mat,cast!==false,recv!==false);return g;}

/* ================= land, water, roads ================= */
function pip(x,z,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const xi=p[i][0],zi=p[i][1],xj=p[j][0],zj=p[j][1];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))c=!c;}return c;}
const LG=20,LGW=Math.ceil(W.W/LG)+1,LGH=Math.ceil(W.H/LG)+1;const landGrid=new Uint8Array(LGW*LGH);
for(let j=0;j<LGH;j++)for(let i=0;i<LGW;i++){const x=i*LG,z=j*LG;let l=pip(x,z,W.land)?1:0;landGrid[j*LGW+i]=l;}
for(const is of W.islands)for(let j=Math.floor((is.z-is.r)/LG);j<=Math.ceil((is.z+is.r)/LG);j++)for(let i=Math.floor((is.x-is.r)/LG);i<=Math.ceil((is.x+is.r)/LG);i++){if(Math.hypot(i*LG-is.x,j*LG-is.z)<=is.r&&i>=0&&j>=0&&i<LGW&&j<LGH)landGrid[j*LGW+i]=2;}
function isLand(x,z){if(x<0||z<0||x>W.W||z>W.H)return false;const i=Math.round(x/LG),j=Math.round(z/LG);return landGrid[j*LGW+i]>0;}
function onIsland(x,z){for(const is of W.islands)if(Math.hypot(x-is.x,z-is.z)<is.r)return true;return false;}
function segD(px,pz,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;let t=l2?((px-ax)*dx+(pz-az)*dz)/l2:0;t=clamp(t,0,1);return Math.hypot(px-ax-dx*t,pz-az-dz*t);}
function inLake(x,z){for(const l of W.lakes){const dx=(x-l.x)/l.rx,dz=(z-l.z)/l.rz;if(dx*dx+dz*dz<1&&!onIsland(x,z))return l;}return null;}
function inRiver(x,z){for(const r of W.rivers){const p=r.pts;for(let k=0;k<p.length-1;k++)if(segD(x,z,p[k][0],p[k][1],p[k+1][0],p[k+1][1])<r.w/2)return r;}return null;}
function isWater(x,z){return !isLand(x,z)||!!inLake(x,z)||!!inRiver(x,z);}
const EDGES=[];const RH=50,rHash=new Map();const ROADS=[];
function addRoad(pts,w,kind,name){const r={pts,w,kind,name,edges:[]};ROADS.push(r);for(let k=0;k<pts.length-1;k++){const [ax,az]=pts[k],[bx,bz]=pts[k+1];const len=Math.hypot(bx-ax,bz-az);if(len<1)continue;
    const e={id:EDGES.length,ax,az,bx,bz,len,dx:(bx-ax)/len,dz:(bz-az)/len,w,kind,road:r,k,lane:w>=16?4:w>=12?3.5:1.6};EDGES.push(e);r.edges.push(e);
    for(let t=0;t<=len;t+=RH/2){const x=ax+e.dx*t,z=az+e.dz*t;for(const ox of [-1,0,1])for(const oz of [-1,0,1]){const key=Math.floor((x+ox*w/2)/RH)+','+Math.floor((z+oz*w/2)/RH);let a=rHash.get(key);if(!a)rHash.set(key,a=[]);if(a[a.length-1]!==e.id&&!a.includes(e.id))a.push(e.id);}}}return r;}
function edgesNear(x,z){return rHash.get(Math.floor(x/RH)+','+Math.floor(z/RH))||[];}
function roadAt(x,z,m=0){for(const id of edgesNear(x,z)){const e=EDGES[id];if(segD(x,z,e.ax,e.az,e.bx,e.bz)<e.w/2+m)return e;}return null;}
function nearestRoadPoint(x,z,maxR=400){let best=null,bd=1e9;for(let r=RH;r<=maxR;r+=RH){for(let ox=-r;ox<=r;ox+=RH)for(let oz=-r;oz<=r;oz+=RH){for(const id of edgesNear(x+ox,z+oz)){const e=EDGES[id];const l2=e.len*e.len;let t=((x-e.ax)*(e.bx-e.ax)+(z-e.az)*(e.bz-e.az))/l2;t=clamp(t,0,1);const px=e.ax+(e.bx-e.ax)*t,pz=e.az+(e.bz-e.az)*t;const d=Math.hypot(px-x,pz-z);if(d<bd){bd=d;best={x:px,z:pz,e,t:t*e.len};}}}if(best)return best;}return best;}
function drivable(x,z){return !!roadAt(x,z,.5)||(!isWater(x,z)&&x>2&&z>2&&x<W.W-2&&z<W.H-2);}

/* colliders */
const CHS=64,cHash=new Map();const colliders=[];
function addCol(x,z,hw,hd,veh=true,foot=true){const c={x,z,hw,hd,veh,foot};colliders.push(c);for(let i=Math.floor((x-hw)/CHS);i<=Math.floor((x+hw)/CHS);i++)for(let j=Math.floor((z-hd)/CHS);j<=Math.floor((z+hd)/CHS);j++){const k=i+','+j;let a=cHash.get(k);if(!a)cHash.set(k,a=[]);a.push(c);}return c;}
function collide(p,r,foot){let hit=false;const seen=new Set();for(let i=Math.floor((p.x-r)/CHS);i<=Math.floor((p.x+r)/CHS);i++)for(let j=Math.floor((p.z-r)/CHS);j<=Math.floor((p.z+r)/CHS);j++){const a=cHash.get(i+','+j);if(!a)continue;for(const c of a){if(seen.has(c))continue;seen.add(c);if(foot?!c.foot:!c.veh)continue;
    const dx=p.x-c.x,dz=p.z-c.z,ex=c.hw+r,ez=c.hd+r;if(Math.abs(dx)<ex&&Math.abs(dz)<ez){const px=ex-Math.abs(dx),pz=ez-Math.abs(dz);if(px<pz)p.x+=Math.sign(dx||1)*px;else p.z+=Math.sign(dz||1)*pz;hit=true;}}}return hit;}

/* ================= terrain ================= */
function inE(b,x,z){const dx=(x-b.x)/b.rx,dz=(z-b.z)/b.rz;return dx*dx+dz*dz;}
const zoneRects=W.zones.map(z=>({z,x0:z.x0-24,z0:z.z0-24,x1:z.x0+z.nx*80+24,z1:z.z0+z.nz*80+24}));
function zoneAt(x,z,m=0){for(const r of zoneRects)if(x>r.x0-m&&x<r.x1+m&&z>r.z0-m&&z<r.z1+m)return r.z;return null;}
const cA=new THREE.Color(),cB2=new THREE.Color();
function biomeColor(x,z,out){const n=hash(Math.floor(x/90)*31.7+Math.floor(z/90)*7.3),n2=hash(Math.floor(x/23)+Math.floor(z/23)*57);
  if(!isLand(x,z)&&!onIsland(x,z))return out.set('#6c7d74');
  let coast=false;for(const [ox,oz] of [[60,0],[-60,0],[0,60],[0,-60]])if(!isLand(x+ox,z+oz)){coast=true;break;}
  if(coast)return out.set('#e2cf9f').offsetHSL(0,0,(n2-.5)*.04);
  for(const b of W.biomes){const e=inE(b,x,z);if(e<1){if(b.kind==='rann')return out.set('#f2f0e8').offsetHSL(0,0,(n2-.5)*.03);if(b.kind==='desert')return out.set(e<.6?'#dcb878':'#cfb07a').offsetHSL((n-.5)*.02,0,(n2-.5)*.05);
      if(b.kind==='forest')return out.set(n<.5?'#5f7d3a':'#6f8a40').offsetHSL(0,0,(n2-.5)*.05);if(b.kind==='ghats')return out.set(n<.5?'#4f7a36':'#5d8a3c').offsetHSL(0,0,(n2-.5)*.06);if(b.kind==='scrub')return out.set('#b8a46a').offsetHSL(0,0,(n2-.5)*.06);}}
  const zz=zoneAt(x,z,10);if(zz)return out.set(zz.style==='gold'||zz.style==='pink'?'#c7ad86':'#9a937f');
  const fields=['#8aa84f','#a8b85a','#c2b46a','#7e9a48','#b39a5c','#9fae55'];return out.set(fields[Math.floor(n*fields.length)]).offsetHSL(0,0,(n2-.5)*.04);}
const TG=40;
{const nx=Math.ceil(W.W/TG),nz=Math.ceil(W.H/TG);const g=new THREE.PlaneGeometry(W.W,W.H,nx,nz);g.rotateX(-Math.PI/2);g.translate(W.W/2,0,W.H/2);const pos=g.attributes.position;const col=new Float32Array(pos.count*3);
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);const l=isLand(x,z)||onIsland(x,z);pos.setY(i,l?0:-4);biomeColor(x,z,cA);col[i*3]=cA.r;col[i*3+1]=cA.g;col[i*3+2]=cA.b;}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.receiveShadow=true;scene.add(m);}
const outer=new THREE.Mesh(new THREE.PlaneGeometry(W.W*5,W.H*5),new THREE.MeshPhongMaterial({color:0x2a6f97,map:seaTex,shininess:90,specular:0x99bbdd}));
seaTex.repeat.set(140,180);outer.rotation.x=-Math.PI/2;outer.position.set(W.W/2,-0.8,W.H/2);scene.add(outer);
const edgeLand=new THREE.Mesh(new THREE.PlaneGeometry(W.W*3,W.H*3),LMat('#c7b089'));edgeLand.rotation.x=-Math.PI/2;edgeLand.position.set(W.W/2,-0.12,-W.H*1.5+2);scene.add(edgeLand);
const edgeE=new THREE.Mesh(new THREE.PlaneGeometry(W.W*2,W.H*4),LMat('#9fae55'));edgeE.rotation.x=-Math.PI/2;edgeE.position.set(W.W+W.W-2,-0.12,W.H/2);scene.add(edgeE);
const waterMat=new THREE.MeshPhongMaterial({color:0x2f78a8,shininess:90,specular:0x88aacc,transparent:true,opacity:.92});
for(const l of W.lakes){const g=new THREE.CircleGeometry(1,40);g.rotateX(-Math.PI/2);g.scale(l.rx,1,l.rz);g.translate(l.x,.04,l.z);addStatic(g,waterMat,false,true);}
for(const r of W.rivers){const p=r.pts;for(let k=0;k<p.length-1;k++){const [ax,az]=p[k],[bx,bz]=p[k+1];const len=Math.hypot(bx-ax,bz-az),a=Math.atan2(bx-ax,bz-az);const g=new THREE.PlaneGeometry(r.w,len+r.w*.6);g.rotateX(-Math.PI/2);g.rotateY(a);g.translate((ax+bx)/2,.012,(az+bz)/2);addStatic(g,waterMat,false,true);}}
for(const is of W.islands){const g=new THREE.CircleGeometry(is.r,24);g.rotateX(-Math.PI/2);g.translate(is.x,.06,is.z);addStatic(g,M.sand,false,true);}

/* ================= decoration helpers ================= */
function palm(x,z){const h=R(7,9.5),tilt=R(-.15,.15);const tr=new THREE.CylinderGeometry(.22,.38,h,6);tr.translate(0,h/2,0);tr.rotateZ(tilt);tr.translate(x,0,z);addStatic(tr,M.trunk);const tx=x-Math.sin(tilt)*h,ty=Math.cos(tilt)*h;
  for(let k=0;k<7;k++){const l=new THREE.BoxGeometry(.5,.06,4.2);l.translate(0,0,2);l.rotateX(.45+R(0,.25));l.rotateY(k*Math.PI*2/7+R(0,.4));l.translate(tx,ty,z);addStatic(l,M.leaf);}}
function tree(x,z,s=1,mat){const t=new THREE.CylinderGeometry(.25*s,.35*s,3*s,5);t.translate(x,1.5*s,z);addStatic(t,M.trunk);const f=new THREE.IcosahedronGeometry(2.4*s*R(.85,1.15),0);f.translate(x,4*s,z);addStatic(f,mat||M.tree);}
const flags=[];const flagGeo=new THREE.BufferGeometry();flagGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,-1.6,0,3,-.8,0],3));flagGeo.computeVertexNormals();const flagMat=new THREE.MeshLambertMaterial({color:0xff8a1c,side:THREE.DoubleSide});
function addFlag(x,y,z,big){const f=new THREE.Mesh(flagGeo,flagMat);f.position.set(x,y,z);if(big)f.scale.setScalar(2.2);scene.add(f);flags.push(f);box(.08,big?6:3.5,.08,x,y-(big?2.5:1.7),z,M.pole);}
const signTexCache=[];
function signTex(t,fg,bg,w=512,h=128){return canvasTex(w,h,x=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.strokeStyle=fg;x.lineWidth=Math.max(4,h/20);x.strokeRect(h/14,h/14,w-h/7,h-h/7);x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';let s=h*.55;x.font=`800 ${s}px "Baloo 2", sans-serif`;while(x.measureText(t).width>w*.86&&s>12){s-=4;x.font=`800 ${s}px "Baloo 2", sans-serif`;}x.fillText(t,w/2,h*.56);},false);}
function addSign(text,x,y,z,ry,w,h,fg,bg){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:signTex(text,fg,bg,512,Math.round(512*h/w)),side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);return m;}
const clockTex=canvasTex(128,128,x=>{x.fillStyle='#f6f1e3';x.beginPath();x.arc(64,64,60,0,6.29);x.fill();x.strokeStyle='#2a2420';x.lineWidth=6;x.stroke();x.lineWidth=5;x.beginPath();x.moveTo(64,64);x.lineTo(64,24);x.moveTo(64,64);x.lineTo(92,70);x.stroke();},false);

/* ================= city + building generation ================= */
let curZone=null,curStyle=STYLES.metro;
function building(x,z,w,d,h,mat,opts={}){const g=new THREE.BoxGeometry(w,h,d);const uv=g.attributes.uv;
  for(let f=0;f<6;f++)for(let k=0;k<4;k++){const i=f*4+k;let u=uv.getX(i),v=uv.getY(i);if(f===2||f===3){u=.01;v=.01;}else{const fw=f<2?d:w;u*=fw/(opts.old?24:32);v*=h/(opts.old?24:32);}uv.setXY(i,u,v);}
  g.translate(x,h/2+.3,z);addStatic(g,mat);addCol(x,z,w/2+.15,d/2+.15,true,true);
  if(opts.cottage){const r=new THREE.CylinderGeometry(0,Math.max(w,d)*.75,3,4,1);r.rotateY(Math.PI/4);r.scale(w/Math.max(w,d),1,d/Math.max(w,d));r.translate(x,h+1.8,z);addStatic(r,M.roofRed);return;}
  box(w+.4,.6,d+.4,x,h+.6,z,M.cream);
  if(!opts.old&&rnd()<.5){const t=new THREE.CylinderGeometry(.9,.9,1.6,8);t.translate(x+R(-w/4,w/4),h+1.7,z+R(-d/4,d/4));addStatic(t,M.tank);}
  if(opts.chhatri&&rnd()<opts.chhatri){const cx=x+R(-w/4,w/4),cz=z+R(-d/4,d/4);for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const p=new THREE.CylinderGeometry(.12,.12,1.6,4);p.translate(cx+dx*.9,h+1.6,cz+dz*.9);addStatic(p,mat);}const dm=new THREE.SphereGeometry(1.3,8,5,0,Math.PI*2,0,Math.PI/2);dm.translate(cx,h+2.4,cz);addStatic(dm,mat);}
  if(opts.dome&&rnd()<opts.dome){const dm=new THREE.SphereGeometry(Math.min(w,d)*.25,10,6,0,Math.PI*2,0,Math.PI/2);dm.translate(x,h+.9,z);addStatic(dm,M.white);}
  if(opts.awn&&h<70){const a=pick(M.awn);if(opts.awn[0])box(.9,.25,d*.8,x+opts.awn[0]*(w/2+.45),3.6,z,a);else box(w*.8,.25,.9,x,3.6,z+opts.awn[1]*(d/2+.45),a);}}
function ctxBuilding(x,z,w,d,h,kind){const S=curStyle;if(kind==='glass')return building(x,z,w,d,h,glassMat,{});building(x,z,w,d,h,bmat(pick(S.cols),S.old),{old:S.old});}
const LCTX={THREE,M,rnd,pick,box:(w,h,d,x,y,z,m,c,r)=>box(w,h,d,x,y,z,m,c,r),boxRot:(w,h,d,x,y,z,ry,m,c,r)=>boxRot(w,h,d,x,y,z,ry,m,c,r),
  cyl:(rt,rb,h,x,y,z,m,seg=10)=>{const g=new THREE.CylinderGeometry(rt,rb,h,seg);g.translate(x,y,z);addStatic(g,m);},
  cone:(r,h,x,y,z,m,seg=8)=>{const g=new THREE.ConeGeometry(r,h,seg);if(seg===4)g.rotateY(Math.PI/4);g.translate(x,y,z);addStatic(g,m);},
  sph:(r,x,y,z,m)=>{const g=new THREE.SphereGeometry(r,12,8);g.translate(x,y,z);addStatic(g,m);},
  dome:(r,x,y,z,m)=>{const g=new THREE.SphereGeometry(r,14,8,0,Math.PI*2,0,Math.PI/2);g.translate(x,y,z);addStatic(g,m);},
  torus:(R1,r,x,y,z,m)=>{const g=new THREE.TorusGeometry(R1,r,8,16,Math.PI);g.rotateY(Math.PI/2);g.translate(x,y,z);addStatic(g,m);},
  roof:(w,h,d,x,y,z,m)=>{const g=new THREE.CylinderGeometry(0,1,h,4,1);g.rotateY(Math.PI/4);g.scale(w*.71,1,d*.71);g.translate(x,y+h/2,z);addStatic(g,m);},
  wedge:(w,h,d,x,y,z,m)=>{const s=new THREE.Shape();s.moveTo(-d/2,0);s.lineTo(d/2,0);s.lineTo(d/2,h);s.lineTo(-d/2,0);const g=new THREE.ExtrudeGeometry(s,{depth:w,bevelEnabled:false});g.rotateY(Math.PI/2);g.translate(x-w/2,y,z);addStatic(g,m);},
  sign:(t,x,y,z,ry,w,h,fg,bg)=>addSign(t,x,y,z,ry,w,h,fg,bg),
  clock:(x,y,z,ry)=>{const m=new THREE.Mesh(new THREE.CircleGeometry(2.2,20),new THREE.MeshBasicMaterial({map:clockTex}));m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);},
  cable:(x1,y1,z1,x2,y2,z2)=>{const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1,y1,z1),new THREE.Vector3(x2,y2,z2)]);scene.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0xdddddd})));},
  flag:(x,y,z,big)=>addFlag(x,y,z,big),tree:(x,z,s)=>tree(x,z,s),palm:(x,z)=>palm(x,z),building:ctxBuilding,col:(x,z,hw,hd)=>{const b=LCTX._blk;if(b){const x0=Math.max(x-hw,b.x-30.5),x1=Math.min(x+hw,b.x+30.5),z0=Math.max(z-hd,b.z-30.5),z1=Math.min(z+hd,b.z+30.5);if(x1<=x0||z1<=z0)return;return addCol((x0+x1)/2,(z0+z1)/2,(x1-x0)/2,(z1-z0)/2);}return addCol(x,z,hw,hd);},far:()=>{LCTX._far=true;}};

/* roads first so buildings avoid them */
for(const z of W.zones){const x1=z.x0+z.nx*80,z1=z.z0+z.nz*80;
  const clip=(pts,w,name)=>{let run=[];const out=[];const [a,b]=pts;const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const n=Math.ceil(len/10);for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,zz=a[1]+(b[1]-a[1])*t;if(isLand(x,zz)&&!inLake(x,zz))run.push([x,zz]);else{if(run.length>1)out.push(run);run=[];}}if(run.length>1)out.push(run);
    for(const r of out)addRoad([r[0],r[r.length-1]],w,'city',name);};
  for(let i=0;i<=z.nx;i++)clip([[z.x0+i*80,z.z0],[z.x0+i*80,z1]],16,z.name);for(let j=0;j<=z.nz;j++)clip([[z.x0,z.z0+j*80],[x1,z.z0+j*80]],16,z.name);}
for(const h of W.highways){const w=h.w||(h.kind==='exp'?16:h.kind==='bridge'?14:14);addRoad(h.pts,w,h.kind==='bridge'?'bridge':h.kind==='coast'?'coast':'hw',h.name);}
for(const a of W.airports)addRoad(a.access,12,'city',a.name+' road');
function roadRibbons(){for(const r of ROADS){const isCity=r.kind==='city';const mat=isCity||r.kind==='coast'?M.road:M.hw;const y=isCity?(Math.abs(r.pts[0][0]-r.pts[1][0])<1?.02:.026):r.kind==='bridge'?.08:r.kind==='coast'?.03:.034;
  for(const e of r.edges){const seg=Math.ceil(e.len/160);for(let s=0;s<seg;s++){const t0=e.len*s/seg,t1=e.len*(s+1)/seg,l=t1-t0+(isCity?0:e.w*.5);const g=new THREE.PlaneGeometry(e.w,l);g.rotateX(-Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*l/16);g.rotateY(Math.atan2(e.dx,e.dz));
      const mx=e.ax+e.dx*(t0+t1)/2,mz=e.az+e.dz*(t0+t1)/2;g.translate(mx,y,mz);addStatic(g,mat,false,true);
      if(r.kind==='bridge'){const d=new THREE.BoxGeometry(e.w+1,1.2,l);d.rotateY(Math.atan2(e.dx,e.dz));d.translate(mx,-.55,mz);addStatic(d,M.concrete,false,true);}}}}}
roadRibbons();
for(const z of W.zones)for(let i=0;i<=z.nx;i++)for(let j=0;j<=z.nz;j++){const x=z.x0+i*80,zz=z.z0+j*80;if(!isLand(x,zz)||inLake(x,zz))continue;const p=new THREE.PlaneGeometry(16,16);p.rotateX(-Math.PI/2);p.translate(x,.04,zz);addStatic(p,M.asphalt,false,true);}
function nearHighway(x,z,r){for(const id of edgesNear(x,z)){const e=EDGES[id];if(e.kind==='city')continue;if(segD(x,z,e.ax,e.az,e.bx,e.bz)<e.w/2+r)return true;}for(const [ox,oz] of [[r,0],[-r,0],[0,r],[0,-r]])for(const id of edgesNear(x+ox,z+oz)){const e=EDGES[id];if(e.kind==='city')continue;if(segD(x,z,e.ax,e.az,e.bx,e.bz)<e.w/2+r)return true;}return false;}

/* services are planned before buildings so lots can be reserved */
const pois=[];const blocks=[];const zoneData=new Map();
const SVC_LOT=new Set(['pump','cng','station','bus']);
for(const z of W.zones){const zd={z,blocks:[],tallRoofs:[],slots:[]};zoneData.set(z.id,zd);
  for(let i=0;i<z.nx;i++)for(let j=0;j<z.nz;j++){const bx=z.x0+i*80+40,bz=z.z0+j*80+40;const sp=z.specials[i+','+j];const land=!isWater(bx,bz)&&!isWater(bx-28,bz-28)&&!isWater(bx+28,bz+28)&&!isWater(bx-28,bz+28)&&!isWater(bx+28,bz-28);
    const b={zone:z,i,j,x:bx,z:bz,sp,land,reserved:new Set(),open:false,hasBld:false};zd.blocks.push(b);blocks.push(b);}
  const free=zd.blocks.filter(b=>b.land&&!b.sp&&!nearHighway(b.x,b.z,8));const r2=mulberry32(z.x0*7+z.z0);const sides=['n','s','e','w'];
  let svc=(W.serviceSets[z.size]||W.serviceSets.small).slice();if(z.station&&!svc.includes('station'))svc.push('station');
  if(z.id==='mumbai')svc=svc.filter(s=>s!=='station');
  const used=new Set();
  for(const type of svc){if(!free.length)break;let b,side,t,tries=0;do{b=free[Math.floor(r2()*free.length)];side=sides[Math.floor(r2()*4)];t=[-18,0,18][Math.floor(r2()*3)];tries++;}while((used.has(b.i+','+b.j+side+t)||(SVC_LOT.has(type)&&b.reserved.size>=2))&&tries<40);
    used.add(b.i+','+b.j+side+t);used.add(b.i+','+b.j+side+(t+18));used.add(b.i+','+b.j+side+(t-18));
    let lot=null;if(SVC_LOT.has(type)){const lx=side==='e'?1:side==='w'?-1:(t>=0?1:-1),lz=side==='s'?1:side==='n'?-1:(t>=0?1:-1);lot=[lx,lz];b.reserved.add(lx+','+lz);if(side==='n'||side==='s')t=lx*14;else t=lz*14;}
    zd.slots.push({type,b,side,t,lot});}
}
function edgePos(cx,cz,side,t,off=29.5){switch(side){case'n':return[cx+t,cz-off,Math.PI];case's':return[cx+t,cz+off,0];case'w':return[cx-off,cz+t,-Math.PI/2];default:return[cx+off,cz+t,Math.PI/2];}}

/* build cities */
for(const z of W.zones){const zd=zoneData.get(z.id);curZone=z;curStyle=STYLES[z.style]||STYLES.town;const S=curStyle;
  for(const b of zd.blocks){if(!b.land){continue;}const groundMat=S.old?M.earth:M.pave;
    if(b.sp){const [kind,arg]=b.sp.split(':');const fn=LM[kind];box(64,.3,64,b.x,.15,b.z,groundMat,false,true);
      if(fn){LCTX._far=false;LCTX._blk=b;const res=fn(LCTX,b.x,b.z,{arg,zone:z})||{};LCTX._blk=null;b.open=!!res.open;
        for(const p of res.poi||[])zd.slots.push({type:p.type,name:p.name,b,side:p.side,t:p.t||0,extra:p.extra,x:p.x,z:p.z,rot:p.rot});}continue;}
    box(64,.3,64,b.x,.15,b.z,groundMat,false,true);
    const n=S.lots,ls=60/n;let any=false;
    for(let li=0;li<n;li++)for(let lj=0;lj<n;lj++){const ox=-30+ls*(li+.5),oz=-30+ls*(lj+.5);const lx=b.x+ox,lz=b.z+oz;
      const key=(n===2?(li?1:-1):(li===0?-1:li===n-1?1:0))+','+(n===2?(lj?1:-1):(lj===0?-1:lj===n-1?1:0));
      if(b.reserved.has(key)||(n===2&&b.reserved.has(key))){continue;}
      if(n===3&&[...b.reserved].some(k=>{const [a,c]=k.split(',').map(Number);return Math.abs(li-1-a)<=0.5&&Math.abs(lj-1-c)<=0.5;}))continue;
      if(isWater(lx,lz)||nearHighway(lx,lz,ls/2))continue;
      if(S.cottage&&rnd()<.35){tree(lx,lz,1);continue;}
      const w=ls*R(.62,.88),d=ls*R(.62,.88);let h=R(S.h[0],S.h[1]);if(S.tower&&rnd()<S.tower)h=R(55,z.tall?95:75);
      const face=Math.abs(ox)>Math.abs(oz)?[Math.sign(ox),0]:[0,Math.sign(oz)];
      building(lx,lz,w,d,h,bmat(pick(S.cols),S.old),{old:S.old,chhatri:S.chhatri,dome:S.dome,cottage:S.cottage,awn:!S.cottage&&rnd()<.45?face:null});any=true;if(h>20)zd.tallRoofs.push([lx,h+.6,lz]);}
    b.hasBld=any;}
  if(z.id==='mumbai'||z.id==='surat'||z.id==='daman'||z.id==='alibaug'){}}
curZone=null;

/* Marine Drive and seafront lamps */
const lampGeoms=[];
function lampsAlong(pts,side,step){for(let k=0;k<pts.length-1;k++){const [ax,az]=pts[k],[bx,bz]=pts[k+1];const len=Math.hypot(bx-ax,bz-az),dx=(bx-ax)/len,dz=(bz-az)/len;const nx=dz*side,nz=-dx*side;
  for(let t=0;t<len;t+=step){const x=ax+dx*t+nx*9,z=az+dz*t+nz*9;if(isWater(x,z))continue;const p=new THREE.CylinderGeometry(.12,.16,6.6,5);p.translate(x,3.3,z);addStatic(p,M.pole);const bl=new THREE.SphereGeometry(.34,6,5);bl.translate(x-nx*1.4,6.3,z-nz*1.4);lampGeoms.push(bl);if(rnd()<.6)palm(x+nx*3,z+nz*3);}}}
lampsAlong(W.highways.find(h=>h.name==='Marine Drive').pts,-1,16);
lampsAlong([[2540,8100],[2540,8690]],1,18);
{const m=new THREE.Mesh(merge(lampGeoms),M.lamp);scene.add(m);}

/* free-standing landmarks */
const lmPois=[];
for(const l of W.landmarks){const fn=LM[l.kind];if(!fn)continue;LCTX._far=false;lmCollect=[];const res=fn(LCTX,l.x,l.z,{})||{};const list=lmCollect;lmCollect=null;
  if(LCTX._far)flushFar(list,l.x,l.z);else for(const a of list)addStatic(...a);for(const p of res.poi||[])lmPois.push(p);}

/* airports */
const planeGeo=(()=>{const g=new THREE.Group();return g;})();
function buildPlane(){const g=new THREE.Group();const body=new THREE.Mesh(G0.cyl,M.plane);body.scale.set(2.2,24,2.2);body.rotation.x=Math.PI/2;g.add(body);const nose=new THREE.Mesh(new THREE.SphereGeometry(2.2,10,8),M.plane);nose.position.z=12;g.add(nose);
  const wing=new THREE.Mesh(new THREE.BoxGeometry(30,.5,5),M.plane);wing.position.set(0,-.4,1);g.add(wing);const tail=new THREE.Mesh(new THREE.BoxGeometry(.5,5,4),M.planeTail);tail.position.set(0,3,-11);g.add(tail);const ts=new THREE.Mesh(new THREE.BoxGeometry(10,.4,3),M.plane);ts.position.set(0,.6,-11);g.add(ts);
  for(const s of [-1,1]){const e=new THREE.Mesh(G0.cyl,M.steel);e.scale.set(.9,3,.9);e.rotation.x=Math.PI/2;e.position.set(s*6,-1.4,2.4);g.add(e);}g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
const G0={cyl:new THREE.CylinderGeometry(1,1,1,10)};
const airportPlanes=[];
for(const a of W.airports){const s=a.side;box(a.L,.12,30,a.x,.05,a.z,M.runway,false,true);for(let t=-a.L/2+10;t<a.L/2-10;t+=18)box(8,.02,.8,a.x+t,.12,a.z,M.white,false,true);
  box(a.L*.7,.1,14,a.x,.05,a.z+s*24,M.runway,false,true);box(a.L*.45,.1,22,a.x,.06,a.z+s*36,M.apron,false,true);
  box(120,12,16,a.x,6,a.z+s*48,glassMat);box(122,1,18,a.x,12.4,a.z+s*48,M.white);box(4,26,4,a.x+70,13,a.z+s*44,M.concrete);box(8,4,8,a.x+70,28,a.z+s*44,M.glassBox);addCol(a.x,a.z+s*48,60,8);addCol(a.x+70,a.z+s*44,3,3);
  const pl=buildPlane();pl.position.set(a.x-30,2.6,a.z+s*34);pl.rotation.y=Math.PI/2;scene.add(pl);const fly=buildPlane();fly.visible=false;scene.add(fly);airportPlanes.push({a,fly,t:-1,next:MR(10,40)});
  lmPois.push({type:'airport',name:a.name,x:a.x,z:a.z+s*64,rot:s>0?0:Math.PI,extra:a.id});}

/* hills, dunes, forests */
function freeSpot(x,z,r){return !roadAt(x,z,r)&&!isWater(x,z)&&!zoneAt(x,z,r)&&!colliders.slice(-1).length||(!roadAt(x,z,r)&&!isWater(x,z)&&!zoneAt(x,z,r));}
const hillMats=[LMat('#6f7f45'),LMat('#7d8a4c'),LMat('#8a7a5a'),LMat('#5f7340')];
for(const h of W.hills){for(let i=0;i<h.n;i++){const a=rnd()*6.283,rr=Math.sqrt(rnd());const x=h.x+Math.cos(a)*h.rx*rr,z=h.z+Math.sin(a)*h.rz*rr;const H=R(h.h[0],h.h[1]),rad=H*R(1.2,1.8);
  if(roadAt(x,z,rad*.7)||nearHighway(x,z,rad*.8)||zoneAt(x,z,rad)||isWater(x,z))continue;const g=new THREE.ConeGeometry(rad,H,7,1);g.translate(x,H/2-.5,z);
  lmCollect=[];addStatic(g,pick(hillMats));const l=lmCollect;lmCollect=null;flushFar(l,x,z);addCol(x,z,rad*.55,rad*.55);}}
const duneMat=LMat('#d9b676');
for(const d of W.dunes){for(let i=0;i<d.n;i++){const a=rnd()*6.283,rr=Math.sqrt(rnd());const x=d.x+Math.cos(a)*d.rx*rr,z=d.z+Math.sin(a)*d.rz*rr;const s=R(8,22);if(roadAt(x,z,s+4)||zoneAt(x,z,s))continue;
  const g=new THREE.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI/2);g.scale(s*R(1.4,2.4),s*R(.25,.45),s);g.rotateY(R(0,3));g.translate(x,-.2,z);addStatic(g,duneMat,false,true);}}
for(const f of W.forests){const mat=f.kind==='dry'?M.treeDry:M.treeDark;for(let i=0;i<f.n;i++){const a=rnd()*6.283,rr=Math.sqrt(rnd());const x=f.x+Math.cos(a)*f.rx*rr,z=f.z+Math.sin(a)*f.rz*rr;if(roadAt(x,z,3)||zoneAt(x,z)||isWater(x,z))continue;tree(x,z,R(.8,1.4),mat);}}
for(let i=0;i<2600;i++){const x=R(50,W.W-50),z=R(50,W.H-50);if(isWater(x,z)||roadAt(x,z,4)||zoneAt(x,z,10))continue;let skip=false;for(const b of W.biomes)if((b.kind==='desert'||b.kind==='rann')&&inE(b,x,z)<1){skip=rnd()<.85;break;}if(skip)continue;tree(x,z,R(.7,1.2));}
for(let i=0;i<14;i++){const bx=R(2350,2470),bz=R(8150,8900),ry=R(0,3);if(isLand(bx,bz))continue;const g=new THREE.BoxGeometry(2.2,1,7);g.rotateY(ry);g.translate(bx,-0.3,bz);addStatic(g,i%2?M.boat:M.boat2);const c=new THREE.BoxGeometry(1.6,1.2,2);c.rotateY(ry);c.translate(bx,0.6,bz);addStatic(c,M.cream);}

/* highway stops: pump, dhaba and toilet every ~1.7 km */
const hwStops=[];
for(const r of ROADS){if(r.kind!=='hw'&&r.kind!=='exp')continue;let acc=0;const total=r.edges.reduce((a,e)=>a+e.len,0);if(total<1300)continue;let next=650;
  for(const e of r.edges){while(next<acc+e.len){const t=next-acc;const x=e.ax+e.dx*t,z=e.az+e.dz*t;const nx=e.dz,nz=-e.dx;const sx=x+nx*(e.w/2+12),sz=z+nz*(e.w/2+12);
      if(!isWater(sx,sz)&&!zoneAt(sx,sz,30)){const ang=Math.atan2(e.dx,e.dz);boxRot(22,.25,16,sx,.12,sz,ang,M.pave,false,true);boxRot(14,.5,8,sx,5.2,sz-0,ang,M.canopy);
        for(const k of [-4,4]){const g=new THREE.BoxGeometry(.6,4.8,.6);g.rotateY(ang);g.translate(sx+e.dx*k,2.6,sz+e.dz*k);addStatic(g,M.pole);}
        const hx=sx+nx*9,hz=sz+nz*9;boxRot(12,4,7,hx,2,hz,ang,M.kiosk);boxRot(13,.4,8,hx,4.2,hz,ang,M.awn[0]);addCol(hx,hz,5,5);
        const px=x+nx*(e.w/2+3),pz=z+nz*(e.w/2+3);hwStops.push({x:px,z:pz,rot:ang,road:r.name});
        lmPois.push({type:'pump',name:'Highway fuel',x:px,z:pz,rot:ang,drive:true},{type:'food',name:'Highway dhaba',x:px+e.dx*9,z:pz+e.dz*9,rot:ang,extra:'HW'},{type:'toilet',name:'Highway toilet',x:px-e.dx*9,z:pz-e.dz*9,rot:ang});}
      next+=1700;}acc+=e.len;}}
