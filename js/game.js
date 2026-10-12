(async function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
if(!window.THREE){document.body.insertAdjacentHTML('beforeend','<div id="err">The 3D engine could not load. Check your connection and reload.</div>');return;}
const W=window.WORLD,LM=window.LANDMARKS;
try{await Promise.race([document.fonts.load('800 48px "Baloo 2"'),new Promise(r=>setTimeout(r,1500))]);}catch(e){}
const VERSION='4.0';

/* ================= storage + config ================= */
const store={get(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const {REGIONS,FEST_DEFAULT,EVENT_DEFAULT,BILL_DEFAULT,DEFAULTS,THEMES,mergeCfg}=window.IBCONF;
const CHANGELOG=[
  {v:'4.0',date:'2026-10-12',notes:'Indian Super League: Mumbai City FC, FC Goa, Bengaluru FC and Kerala Blasters FC play at Mumbai Football Arena, Fatorda Stadium, Sree Kanteerava Stadium and Jawaharlal Nehru Stadium Kochi, rebuilt as real stadium bowls with stands, roofs, tracks and floodlights. West Block Blues and Manjappada join the fan clubs.\nNew jobs: Swiggy and Zomato delivery partner and BayCart parcel agent. Your phone comes with Swiggy, Zomato and BayCart: order food and goods and they are delivered to you.\nHome garages: park at a home you own and take vehicles out later from Menu → Garage. Keep a vehicle you took by parking it at home or getting papers at a workshop. Workshops now paint, tune, fit musical horns and underglow.\nHealth: eating, sleeping and hospitals bring health back. Empty needs wear health down slowly but no longer knock you out. Below 25% health you walk and drive slower.\nWaterfalls flow, airports have curved-roof terminals, jet bridges, towers and hangars (Kochi has its solar farm, Bengaluru its garden terminal), and roads, kerbs and billboard posts no longer overlap.\nThe weapon label only shows when you hold a weapon.'},
  {v:'3.9',date:'2026-10-12',notes:'Every job has its own countdown, worked out from the road distance, the vehicle you use and the time at each stop. A timer bar stays on screen while you work; bus routes can run late but never fail.\nLicences are now only for jobs: motorbike delivery needs a two-wheeler licence, auto taxi an auto rickshaw licence (new, at RTO offices), cab a car licence, and truck and bus a heavy vehicle licence. Cycle delivery and dabbawala need none.\nNo more traffic fines: e-challans, speed cameras, police paper checks, red-light fines, PUC and insurance are gone. FASTag tolls and helmets stay.\nFootball: the Bay Super League with 12 teams and stadiums in Mumbai, Margao, Bengaluru and Kochi. Matches every Bay evening at 7:30 pm with live scores, tickets, jerseys and fan clubs, fan marches with drums, flares and banners before kick-off, fireworks and street celebrations after home wins, a league table, and a champions\' celebration at the end of each season.'},
  {v:'3.8',date:'2026-10-12',notes:'South-West India is open: Goa, Karnataka and Kerala join the West as one connected map. Drive the NH66 coast road from the Konkan to Kanyakumari, or NH48 from Pune to Bengaluru, with 47 new cities and towns, 12 new airports, ferries, backwaters, tea gardens and the Western Ghats.\nNew landmarks include Bom Jesus, Hampi, Mysore Palace, Vidhana Soudha, Gol Gumbaz, Jog Falls, Murudeshwar, the Chinese fishing nets, Bekal Fort, Padmanabhaswamy Temple and Kanyakumari, with Goan, Karnataka and Kerala food and homes.\nThe start screen is a map of India: tap a bright state and a city to start there.\nThe map now zooms like a maps app: drag, pinch or scroll, with buttons to zoom, centre on you and show the whole route. The route is drawn bolder on the map and the minimap.\nOnline: hop into another player\'s vehicle when they stop (up to its seats; the driver drives), and take a vehicle another player left parked.'},
  {v:'3.7',date:'2026-10-12',notes:'More realistic look: cars, taxis, SUVs and police jeeps have shaped bodies with tinted glass, glossy paint, bumpers, number plates and wheels with rims. Autos have a curved canopy; buses and trucks have windows and painted cargo boxes.\nPeople have human proportions, faces, hands and shoes, with different skin tones and hair, and women in sarees. Bike riders wear helmets.\nRoads have real asphalt texture, kerbs, and zebra crossings at city junctions. Rivers get proper bridges with side walls and pillars.\nFixed: a copy of your character stayed standing outside after you got into a vehicle.\nFixed: hills no longer sit on top of roads, and crossing highways no longer flicker.\nFixed: roadside billboards stand further back and fade out when the camera is close.'},
  {v:'3.6',date:'2026-10-12',notes:'New roadside billboards along city roads, highways and expressways, plus the rooftop ones.\nWhen no brand ads are running, billboards advertise real places nearby: homes for sale, cars and bikes, food, jobs, repairs, trains, flights and more.\nTap a billboard to open it. India Bay ads give you directions; brand ads have a Visit button.\nPlayers under 18 only see child-safe ad categories.'},
  {v:'3.5',date:'2026-10-12',notes:'A cleaner start screen: just the game, your 👤 profile at the top, and the privacy policy and support links at the bottom.\nCreating a player now asks for your name and date of birth (kept private), so billboards can show ads suitable for your age.\nProfile holds Achievements, Settings, Privacy policy, Contact support, Log out and Delete account.\nSupport and advertising: support@indiabaygame.com.'},
  {v:'3.4',date:'2026-10-12',notes:'New 👤 Profile button in the top row: your account, settings, privacy policy and Contact support in one place.\nOnline players can change their username, sign out, or delete their online account from Profile.\nOther players now see your vehicle parked where you left it.\nPrivacy policy and Contact support links on the start screen.'},
  {v:'3.3',date:'2026-10-11',notes:'Online play: sign in with Google or as a guest, pick a unique username, and your progress is saved in the cloud.\nSee other players walking and driving around West India, with their names above them.\nChat with players near you (T or the 💬 button), with mute and report in Phone → Online.\nAdmin settings now reach every player on the hosted game.'},
  {v:'3.2',date:'2026-10-11',notes:'Cleaner screen: menu, phone, settings and camera are four icons in one row, with the date, time and weather removed from the corner.\nDirections sit as a small chip under those icons, and the 3D arrow in front of the vehicle is gone; the blue line on the minimap shows the way.\nOn phones the health bars and minimap are smaller, so you see more road.\nDrag with the mouse or a finger to look around; the camera returns behind you after a moment.\nThe radio never starts by itself. Turn it on once and it remembers your station in every vehicle until you turn it off.\nAll India map shows the real state outlines; tap a state to see its region.\nTapping a map now shows a card with a Directions button, like a maps app.\nTraffic signals at city junctions: cars stop at red, and jumping a red light costs a ₹1,000 e-challan.\nTraffic jams appear in orange and red on the maps, and directions route around them, with an arrival time.'},
  {v:'3.1',date:'2026-10-11',notes:'Directions like a maps app: a blue route line, turn-by-turn instructions and an arrow that follows the road, for jobs, story goals and any place you pick.\nNew map with three tabs: Current city (with a legend for every icon), Current region and All India (with every state abbreviation explained). Tap anywhere for directions.\nCars, bikes and autos can drive on footpaths and open ground. Only buildings block you.\nFood and toilet needs last 3 times longer and hurt your health more slowly. No more screen shake when health drops.\nMission notes now pop up at the top and hide after 5 seconds. Tap the blue direction bar to see them again.\nNew Menu (Garage, Jobs, Wardrobe, Business), Phone and Settings buttons. Radio can be switched off in Settings or with ✕.\nFuel is sold in litres. Honking is only for fuel queues. New vehicles come insured. You can sell vehicles in the Garage. Roads in Ahmedabad, Surat and Nashik now bridge their rivers.'},
  {v:'3.0',date:'2026-10-11',notes:'The whole West region is open: Maharashtra, Gujarat, Rajasthan, Daman & Diu and Dadra & Nagar Haveli, with 28 cities and towns, 57 famous places, 13 airports, the Arabian Sea coast, highways and expressways.\nTrains, flights, buses, bot taxis, the Mumbai local and the Gateway–Mandwa ferry.\nCycles, motorbikes, sports bikes, cycle rickshaws and sedans. Fuel, damage, mechanics, insurance, PUC, licences and traffic police checks.\nJobs with an agent or freelance: food delivery, auto, cab, truck, bus and dabbawala, each with a star rating.\nShared Bay clock (1 game minute = 1 real second), real-time needs, queues, festivals, radio, BayGame, photo mode and clips, story chapter, achievements and daily rewards.'},
  {v:'2.0',date:'2026-10-10',notes:'Open-world Mumbai with admin settings, banks, shops, weapons, police stars, homes, needs and first-person view.'},
  {v:'1.0',date:'2026-10-10',notes:'First drive along the Mumbai seafront in an auto rickshaw.'}];
let CFG=mergeCfg(DEFAULTS,store.get('ib.cfg'));let savedCFG=CFG;
const price=b=>Math.max(5,Math.round(b*CFG.priceMul/5)*5);
// Price of a catalogue item: the admin's price from /admin → Time and prices, else the default (js/prices.js), times Prices ×.
const rawCost=(key,def)=>{const o=CFG.prices&&CFG.prices[key];if(o!=null&&o!==''&&isFinite(+o)&&+o>=0)return +o;if(def!=null)return def;const P0=window.PRICES;return P0&&P0.DEF[key]!=null?P0.DEF[key]:0;};
const cost=(key,def)=>price(rawCost(key,def));
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
// Asphalt with grain, patches, tyre-worn lanes and crisp markings (repeats every 16 m along the road).
function asphalt(x,w,h,base){x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<2600;i++){const v=rnd();x.fillStyle=v<.45?'rgba(255,255,255,.05)':v<.9?'rgba(0,0,0,.09)':'rgba(120,110,95,.12)';const s=rnd()<.9?1:2;x.fillRect(rnd()*w,rnd()*h,s,s);}
  for(let i=0;i<5;i++){x.fillStyle=rnd()<.5?'rgba(0,0,0,.08)':'rgba(255,255,255,.035)';x.fillRect(rnd()*w,rnd()*h,20+rnd()*60,14+rnd()*50);}
  x.fillStyle='rgba(0,0,0,.10)';for(const c of [.2,.34,.66,.8])x.fillRect(w*c-6,0,12,h);}
const roadTex=canvasTex(256,512,x=>{asphalt(x,256,512,'#3c3d42');x.fillStyle='#e6e1d3';x.fillRect(7,0,5,512);x.fillRect(244,0,5,512);x.fillStyle='#f0e7c4';x.fillRect(125,24,6,220);x.fillRect(125,280,6,220);});
const hwTex=canvasTex(256,512,x=>{asphalt(x,256,512,'#36373c');x.fillStyle='#ece7d8';x.fillRect(10,0,7,512);x.fillRect(239,0,7,512);x.fillStyle='#f2c94c';x.fillRect(120,0,5,512);x.fillRect(131,0,5,512);
  x.fillStyle='rgba(236,231,216,.85)';x.fillRect(62,40,4,180);x.fillRect(62,300,4,180);x.fillRect(190,40,4,180);x.fillRect(190,300,4,180);});
const zebraTex=canvasTex(128,64,x=>{x.clearRect(0,0,128,64);x.fillStyle='rgba(238,234,224,.92)';for(let i=4;i<128;i+=16)x.fillRect(i,4,9,56);},false);
const seaTex=canvasTex(128,128,x=>{x.fillStyle='#fff';x.fillRect(0,0,128,128);for(let i=0;i<70;i++){x.fillStyle='rgba(120,170,210,.35)';x.fillRect(rnd()*128,rnd()*128,R(6,22),1);}});
const LMat=(c,o={})=>new THREE.MeshLambertMaterial(Object.assign({color:c},o));
const M={kerb:LMat('#b9b2a2'),zebra:new THREE.MeshLambertMaterial({map:zebraTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),ground:LMat('#8c8676'),pave:LMat('#bdb4a4'),earth:LMat('#b8a58a'),road:LMat('#ffffff',{map:roadTex}),hw:LMat('#ffffff',{map:hwTex}),asphalt:LMat('#3a3b41'),grass:LMat('#5f9a45'),dirt:LMat('#c9a26b'),sand:LMat('#e2cf9f'),wall:LMat('#9c958a'),concrete:LMat('#aaa59b'),
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
  hill:{cols:['#f1e2c2','#e8d6b0','#d9c7a8'],h:[4,7],old:true,lots:2,cottage:true},
  goa:{cols:['#f2d16b','#7fb7d9','#e98b7f','#f4f1ea','#9fd3a5','#d9a0c8','#f2b8a2'],h:[5,9],old:true,lots:3,cottage:true},
  kerala:{cols:['#f4f1ea','#efe8da','#f2d7a7','#cfe3c8','#e9c9a0','#d7e6ef'],h:[5,11],old:true,lots:3,cottage:true}};

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
      if(b.kind==='forest')return out.set(n<.5?'#5f7d3a':'#6f8a40').offsetHSL(0,0,(n2-.5)*.05);if(b.kind==='ghats')return out.set(n<.5?'#4f7a36':'#5d8a3c').offsetHSL(0,0,(n2-.5)*.06);if(b.kind==='scrub')return out.set('#b8a46a').offsetHSL(0,0,(n2-.5)*.06);
      if(b.kind==='laterite')return out.set(n<.4?'#b0643c':'#8f8a45').offsetHSL(0,0,(n2-.5)*.05);if(b.kind==='coffee')return out.set(n<.5?'#3f6b30':'#4b7a35').offsetHSL(0,0,(n2-.5)*.05);
      if(b.kind==='tea')return out.set(Math.floor(z/14)%2?'#5aa83c':'#4c9433').offsetHSL(0,0,(n2-.5)*.04);if(b.kind==='paddy')return out.set(n<.5?'#8fc24a':'#a6cf55').offsetHSL(0,0,(n2-.5)*.04);
      if(b.kind==='coconut')return out.set(n<.5?'#6f9a3e':'#7ea845').offsetHSL(0,0,(n2-.5)*.04);if(b.kind==='deccan')return out.set(n<.4?'#8f8262':n<.7?'#a99a62':'#9aa04e').offsetHSL(0,0,(n2-.5)*.05);}}
  const zz=zoneAt(x,z,10);if(zz)return out.set(zz.style==='gold'||zz.style==='pink'?'#c7ad86':'#9a937f');
  const fields=['#8aa84f','#a8b85a','#c2b46a','#7e9a48','#b39a5c','#9fae55'];return out.set(fields[Math.floor(n*fields.length)]).offsetHSL(0,0,(n2-.5)*.04);}
const TG=40;
{const nx=Math.ceil(W.W/TG),nz=Math.ceil(W.H/TG);const g=new THREE.PlaneGeometry(W.W,W.H,nx,nz);g.rotateX(-Math.PI/2);g.translate(W.W/2,0,W.H/2);const pos=g.attributes.position;const col=new Float32Array(pos.count*3);
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);const l=isLand(x,z)||onIsland(x,z);pos.setY(i,l?0:-4);biomeColor(x,z,cA);col[i*3]=cA.r;col[i*3+1]=cA.g;col[i*3+2]=cA.b;}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.receiveShadow=true;scene.add(m);}
// The sea is split into many small triangles so its depth stays exact near the camera (one huge quad can poke through the land).
const outer=new THREE.Mesh(new THREE.PlaneGeometry(W.W*5,W.H*5,120,Math.round(120*W.H/W.W)),new THREE.MeshPhongMaterial({color:0x2a6f97,map:seaTex,shininess:90,specular:0x99bbdd}));
seaTex.repeat.set(140,180);outer.rotation.x=-Math.PI/2;outer.position.set(W.W/2,-1.1,W.H/2);scene.add(outer);
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
function signTex(t,fg,bg,w=512,h=128){return canvasTex(w,h,x=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.strokeStyle=fg;x.lineWidth=Math.max(4,h/20);x.strokeRect(h/14,h/14,w-h/7,h-h/7);x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';const L=String(t).split('|').map(q=>q.trim()).filter(Boolean).slice(0,2);if(L.length>1){const fit=(q,sz,wt)=>{x.font=`${wt} ${sz}px "Baloo 2", sans-serif`;while(x.measureText(q).width>w*.8&&sz>8){sz-=2;x.font=`${wt} ${sz}px "Baloo 2", sans-serif`;}return sz;};const f1=fit(L[0],Math.round(h*.34),800);x.fillText(L[0],w/2,h*.4);fit(L[1],Math.round(Math.max(Math.min(h*.2,f1*1.05),h*.14)),700);x.fillText(L[1],w/2,h*.71);return;}t=L[0]||'';let s=h*.55;x.font=`800 ${s}px "Baloo 2", sans-serif`;while(x.measureText(t).width>w*.86&&s>12){s-=4;x.font=`800 ${s}px "Baloo 2", sans-serif`;}x.fillText(t,w/2,h*.56);},false);}
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
const LCTX={THREE,M,rnd,pick,add:(g,m,c,r)=>addStatic(g,m,c!==false,r!==false),box:(w,h,d,x,y,z,m,c,r)=>box(w,h,d,x,y,z,m,c,r),boxRot:(w,h,d,x,y,z,ry,m,c,r)=>boxRot(w,h,d,x,y,z,ry,m,c,r),
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
// Parts of a highway that are not already covered by a parallel road (a city edge road or an earlier highway),
// so two road surfaces never lie on top of each other.
function hwSpans(e,ri){const st=3,keep=[];let a=-1;const covered=t=>{const x=e.ax+e.dx*t,z=e.az+e.dz*t;for(const id of edgesNear(x,z)){const f=EDGES[id];if(f===e||f.road===e.road)continue;if(f.kind!=='city'&&ROADS.indexOf(f.road)>ri)continue;
      if(Math.abs(e.dx*f.dx+e.dz*f.dz)<.94)continue;if(segD(x,z,f.ax,f.az,f.bx,f.bz)<Math.max(f.w,e.w)/2-1)return true;}return false;};
  for(let t=0;t<=e.len+.01;t+=st){const tt=Math.min(t,e.len);const c=covered(tt);if(!c&&a<0)a=tt;if(c&&a>=0){if(tt-a>2)keep.push([a,tt]);a=-1;}}if(a>=0&&e.len-a>2)keep.push([a,e.len]);return keep;}
function roadRibbons(){ROADS.forEach((r,ri)=>{const isCity=r.kind==='city';const mat=isCity||r.kind==='coast'?M.road:M.hw;
  // each highway gets its own small height so two highways that cross never flicker against each other
  const y=isCity?(Math.abs(r.pts[0][0]-r.pts[1][0])<1?.02:.026):r.kind==='bridge'?.08:r.kind==='coast'?.03:.036+(ri%6)*.006;
  for(const e of r.edges){const spans=isCity?[[0,e.len]]:hwSpans(e,ri);for(const [u0,u1] of spans){const seg=Math.ceil((u1-u0)/160);for(let s=0;s<seg;s++){const t0=u0+(u1-u0)*s/seg,t1=u0+(u1-u0)*(s+1)/seg,l=t1-t0+(isCity?0:e.w*.5);const g=new THREE.PlaneGeometry(e.w,l);g.rotateX(-Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*l/16);g.rotateY(Math.atan2(e.dx,e.dz));
      const mx=e.ax+e.dx*(t0+t1)/2,mz=e.az+e.dz*(t0+t1)/2;g.translate(mx,y,mz);addStatic(g,mat,false,true);
      if(r.kind==='bridge'){const d=new THREE.BoxGeometry(e.w+1,1.2,l);d.rotateY(Math.atan2(e.dx,e.dz));d.translate(mx,-.55,mz);addStatic(d,M.concrete,false,true);}}}
    if(r.kind!=='bridge')riverBridges(e,y);
    if(isCity)kerbsAndCrossings(e,y);}});}
// City roads run straight across the whole grid, so kerbs and zebra crossings are placed block by block between junctions.
function kerbsAndCrossings(e,y){const zz=zoneAt((e.ax+e.bx)/2,(e.az+e.bz)/2,0);const vert=Math.abs(e.dx)<.01,ang=Math.atan2(e.dx,e.dz);
  if(!zz||!(vert||Math.abs(e.dz)<.01)){return;}const o0=vert?zz.z0:zz.x0,a0=vert?e.az:e.ax,sgn=Math.sign(vert?e.dz:e.dx)||1;const trim=e.w/2+1.4,big=zz.size==='big'||zz.size==='mid';
  const c0=Math.min(a0,a0+sgn*e.len),c1=Math.max(a0,a0+sgn*e.len);
  for(let n=Math.floor((c0-o0)/80);n*80+o0<c1;n++){const g0=o0+n*80,g1=g0+80;const s0=Math.max(g0,c0),s1=Math.min(g1,c1);const k0=s0+(s0===g0?trim:.5),k1=s1-(s1===g1?trim:.5);if(k1-k0<4)continue;
    const mid=(k0+k1)/2,l=k1-k0;const cx=vert?e.ax:mid,cz=vert?mid:e.az;
    for(const sd of [-1,1]){const ox=e.dz*sd*(e.w/2+.15),oz=-e.dx*sd*(e.w/2+.15);let r0=-1;const put=(a,b)=>{if(b-a<1.5)return;const m=(a+b)/2;const k=new THREE.BoxGeometry(.3,.15,b-a);k.rotateY(ang);k.translate((vert?e.ax:m)+ox,.075,(vert?m:e.az)+oz);addStatic(k,M.kerb,false,true);};
      for(let q=k0;q<=k1+.01;q+=1.5){const qq=Math.min(q,k1);const px=(vert?e.ax:qq)+ox,pz=(vert?qq:e.az)+oz;let blocked=false;for(const id of edgesNear(px,pz)){const f=EDGES[id];if(f===e)continue;if(segD(px,pz,f.ax,f.az,f.bx,f.bz)<f.w/2+.6){blocked=true;break;}}
        if(!blocked&&r0<0)r0=qq;if(blocked&&r0>=0){put(r0,qq-.4);r0=-1;}}if(r0>=0)put(r0,k1);}
    if(big)for(const [edge,at] of [[s0===g0,k0+1.2],[s1===g1,k1-1.2]]){if(!edge)continue;const zx=vert?e.ax:at,zz2=vert?at:e.az;const zg=new THREE.PlaneGeometry(e.w*.86,3);zg.rotateX(-Math.PI/2);zg.rotateY(ang);zg.translate(zx,y+.004,zz2);addStatic(zg,M.zebra,false,true);}}}
// Where a road crosses a river or lake, add a concrete deck with side walls and pillars under it.
function riverBridges(e,y){const st=6;let t0=-1;const ang=Math.atan2(e.dx,e.dz);const span=(a,b)=>{a=Math.max(0,a-10);b=Math.min(e.len,b+10);const l=b-a;if(l<8)return;const mx=e.ax+e.dx*(a+b)/2,mz=e.az+e.dz*(a+b)/2;
    const d=new THREE.BoxGeometry(e.w+1.4,.9,l);d.rotateY(ang);d.translate(mx,y-.47,mz);addStatic(d,M.concrete,false,true);
    for(const sd of [-1,1]){const w=new THREE.BoxGeometry(.35,.75,l);w.rotateY(ang);w.translate(mx+e.dz*sd*(e.w/2+.5),y+.36,mz-e.dx*sd*(e.w/2+.5));addStatic(w,M.concrete,false,true);}
    for(let q=a+8;q<b-4;q+=28){const px=e.ax+e.dx*q,pz=e.az+e.dz*q;const pl=new THREE.BoxGeometry(e.w*.6,4,1.6);pl.rotateY(ang);pl.translate(px,y-2.8,pz);addStatic(pl,M.concrete,false,true);}};
  for(let t=0;t<=e.len;t+=st){const w=isWater(e.ax+e.dx*t,e.az+e.dz*t);if(w&&t0<0)t0=t;if(!w&&t0>=0){span(t0,t);t0=-1;}}if(t0>=0)span(t0,e.len);}
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
for(const l of W.landmarks){const [lk,...la]=l.kind.split(':');const fn=LM[lk];if(!fn)continue;LCTX._far=false;lmCollect=[];const res=fn(LCTX,l.x,l.z,{arg:la.join(':')})||{};const list=lmCollect;lmCollect=null;
  if(LCTX._far)flushFar(list,l.x,l.z);else for(const a of list)addStatic(...a);for(const p of res.poi||[])lmPois.push(p);}

/* airports */
const planeGeo=(()=>{const g=new THREE.Group();return g;})();
function buildPlane(){const g=new THREE.Group();const body=new THREE.Mesh(G0.cyl,M.plane);body.scale.set(2.2,24,2.2);body.rotation.x=Math.PI/2;g.add(body);const nose=new THREE.Mesh(new THREE.SphereGeometry(2.2,10,8),M.plane);nose.position.z=12;g.add(nose);
  const wing=new THREE.Mesh(new THREE.BoxGeometry(30,.5,5),M.plane);wing.position.set(0,-.4,1);g.add(wing);const tail=new THREE.Mesh(new THREE.BoxGeometry(.5,5,4),M.planeTail);tail.position.set(0,3,-11);g.add(tail);const ts=new THREE.Mesh(new THREE.BoxGeometry(10,.4,3),M.plane);ts.position.set(0,.6,-11);g.add(ts);
  for(const s of [-1,1]){const e=new THREE.Mesh(G0.cyl,M.steel);e.scale.set(.9,3,.9);e.rotation.x=Math.PI/2;e.position.set(s*6,-1.4,2.4);g.add(e);}g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
const G0={cyl:new THREE.CylinderGeometry(1,1,1,10)};
const airportPlanes=[];
// Airports: runway with markings, parallel taxiway, apron with parked planes and jet bridges, a terminal with a
// curved roof, a control tower and a hangar. A few airports get their own touch (Kochi's solar farm,
// Bengaluru's garden terminal, Mumbai's big white roof).
const AIRLOOK={COK:{solar:true},BLR:{garden:true,roof:'#6f9a52'},BOM:{wide:1.4,roof:'#f4f1ea'},GOX:{roof:'#c75b3a'},GOI:{},TRV:{roof:'#c75b3a'},AMD:{},JAI:{roof:'#e8967a'},UDR:{roof:'#f4f1ea'}};
const termGlass=LMat('#7fa6c4',{map:winTex,emissiveMap:litTex,emissive:0xffffff,emissiveIntensity:0});
function curvedRoof(len,r,x,y,z,mat,flat){const g=new THREE.CylinderGeometry(r,r,len,16,1,true,0,Math.PI);g.rotateZ(Math.PI/2);g.rotateY(Math.PI/2);g.rotateY(Math.PI/2);g.scale(1,flat,1);g.translate(x,y,z);addStatic(g,mat);
  const cap=new THREE.BoxGeometry(len+2,.4,r*2+2);cap.translate(x,y-.2,z);addStatic(cap,mat);}
for(const a of W.airports){const s=a.side;const look=AIRLOOK[a.id]||{};const roofM=LMat(look.roof||'#e9e6df');
  box(a.L,.12,30,a.x,.05,a.z,M.runway,false,true);for(let t=-a.L/2+16;t<a.L/2-16;t+=18)box(8,.02,.8,a.x+t,.12,a.z,M.white,false,true);
  for(const e of [-1,1]){for(let k=0;k<6;k++)box(9,.02,1.4,a.x+e*(a.L/2-6),.12,a.z-10+k*4,M.white,false,true);box(3,.02,26,a.x+e*(a.L/2-14),.12,a.z,M.white,false,true);
    for(let k=1;k<=4;k++)box(.6,.4,8,a.x+e*(a.L/2+k*7),.2,a.z,LMat('#d9d2b8'),false,true);}
  box(a.L*.7,.1,14,a.x,.05,a.z+s*24,M.runway,false,true);for(let t=-a.L*.35;t<a.L*.35;t+=10)box(4,.02,.35,a.x+t,.11,a.z+s*24,LMat('#f2c14e'),false,true);
  for(const e of [-1,1])box(10,.1,10,a.x+e*a.L*.3,.05,a.z+s*12,M.runway,false,true);
  const TW=120*(look.wide||1);box(a.L*.5,.1,24,a.x,.06,a.z+s*36,M.apron,false,true);
  // terminal: glass hall under a curved roof, with a drop-off canopy on the landside
  box(TW,9,16,a.x,4.5,a.z+s*48,termGlass);curvedRoof(TW+4,10.5,a.x,9,a.z+s*48,roofM,.42);box(TW*.8,.5,8,a.x,6,a.z+s*60,roofM);for(let t=-TW*.38;t<=TW*.38;t+=TW*.19)box(.5,6,.5,a.x+t,3,a.z+s*63,M.steel);
  addSign(a.name.toUpperCase(),a.x,8,a.z+s*56.3,s>0?0:Math.PI,Math.min(40,TW*.4),2.4,'#ffffff','#1b3a6b');
  // jet bridges and parked planes at the gates
  const gates=[-TW*.3,0,TW*.3];for(const gx of gates){const jb=new THREE.BoxGeometry(2.6,2.6,12);jb.translate(a.x+gx,4,a.z+s*34);addStatic(jb,M.concrete);const rot=new THREE.CylinderGeometry(2,2,3.2,10);rot.translate(a.x+gx,3.4,a.z+s*28);addStatic(rot,M.concrete);box(.6,3,.6,a.x+gx,1.5,a.z+s*28,M.steel);}
  for(const gx of gates.slice(0,2)){const pp=buildPlane();pp.position.set(a.x+gx+TW*.15,2.6,a.z+s*24);pp.rotation.y=s>0?Math.PI:0;scene.add(pp);}
  // control tower and hangar
  const tx=a.x+TW/2+22,tz=a.z+s*44;{const g=new THREE.CylinderGeometry(1.8,2.4,28,10);g.translate(tx,14,tz);addStatic(g,M.concrete);const cab=new THREE.CylinderGeometry(4.6,3.8,3.4,8);cab.translate(tx,29.6,tz);addStatic(cab,M.glassBox);const rf=new THREE.CylinderGeometry(5,5,.6,8);rf.translate(tx,31.6,tz);addStatic(rf,M.white);box(.2,4,.2,tx,34,tz,M.steel);}
  addCol(tx,tz,3,3);const hx=a.x-TW/2-34,hz=a.z+s*40;box(34,9,24,hx,4.5,hz,M.roofTin);curvedRoof(34,12,hx,9,hz,M.roofTin,.35);box(24,8,.3,hx,4,hz-s*12.2,M.dark);addCol(hx,hz,17,12);
  addCol(a.x,a.z+s*48,TW/2,8);
  if(look.solar){const sol=LMat('#1f3a6b');for(let r=0;r<6;r++)for(let k=0;k<10;k++){const g=new THREE.BoxGeometry(9,.2,3.2);g.rotateX(-.4*s);g.translate(a.x-a.L/2+20+k*11,1,a.z-s*(32+r*6));addStatic(g,sol,false,true);}addSign('SOLAR POWERED AIRPORT',a.x-a.L/2+70,3,a.z-s*70,s>0?Math.PI:0,20,2,'#ffffff','#1f6f4a');}
  if(look.garden){for(let k=0;k<26;k++)tree(a.x-TW/2+k*(TW/25),a.z+s*(70+(k%3)*4),1.1,M.treeDark);box(TW,.1,10,a.x,.06,a.z+s*72,M.grass,false,true);}
  const pl=buildPlane();pl.position.set(a.x-30,2.6,a.z+s*34);pl.rotation.y=Math.PI/2;scene.add(pl);const fly=buildPlane();fly.visible=false;scene.add(fly);airportPlanes.push({a,fly,t:-1,next:MR(10,40)});
  lmPois.push({type:'airport',name:a.name,x:a.x,z:a.z+s*64,rot:s>0?0:Math.PI,extra:a.id});}

/* hills, dunes, forests */
function freeSpot(x,z,r){return !roadAt(x,z,r)&&!isWater(x,z)&&!zoneAt(x,z,r)&&!colliders.slice(-1).length||(!roadAt(x,z,r)&&!isWater(x,z)&&!zoneAt(x,z,r));}
const hillMats=[LMat('#6f7f45'),LMat('#7d8a4c'),LMat('#8a7a5a'),LMat('#5f7340')];
const HILLS_TRY=[];window.__HILLS=HILLS_TRY;
// A hill only goes where its whole base is clear: no road within its radius, no city, airport, famous place or water under it.
function hillClear(x,z,rad){if(zoneAt(x,z,rad+30)||isWater(x,z))return false;
  for(const e of EDGES){const m=e.w/2+rad*.95+8;if(Math.min(e.ax,e.bx)-m>x||Math.max(e.ax,e.bx)+m<x||Math.min(e.az,e.bz)-m>z||Math.max(e.az,e.bz)+m<z)continue;if(segD(x,z,e.ax,e.az,e.bx,e.bz)<m)return false;}
  for(const a of W.airports)if(Math.hypot(x-a.x,z-a.z)<a.L/2+rad+60)return false;
  for(const pl of W.places)if(Math.hypot(x-pl[1],z-pl[2])<rad+50)return false;
  let wet=0;for(let i=0;i<8;i++){const an=i*.785;if(isWater(x+Math.cos(an)*rad*.85,z+Math.sin(an)*rad*.85))wet++;}return wet<2;}
for(const h of W.hills){for(let i=0;i<h.n;i++){const a=rnd()*6.283,rr=Math.sqrt(rnd());const x=h.x+Math.cos(a)*h.rx*rr,z=h.z+Math.sin(a)*h.rz*rr;const H=R(h.h[0],h.h[1]),rad=H*R(1.2,1.8);
  HILLS_TRY.push({x,z,rad,H,ok:hillClear(x,z,rad)});if(!HILLS_TRY[HILLS_TRY.length-1].ok)continue;const g=new THREE.ConeGeometry(rad,H,7,1);g.translate(x,H/2-.5,z);
  lmCollect=[];addStatic(g,pick(hillMats));const l=lmCollect;lmCollect=null;flushFar(l,x,z);addCol(x,z,rad*.55,rad*.55);}}
const duneMat=LMat('#d9b676');
for(const d of W.dunes){for(let i=0;i<d.n;i++){const a=rnd()*6.283,rr=Math.sqrt(rnd());const x=d.x+Math.cos(a)*d.rx*rr,z=d.z+Math.sin(a)*d.rz*rr;const s=R(8,22);if(roadAt(x,z,s+4)||zoneAt(x,z,s))continue;
  const g=new THREE.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI/2);g.scale(s*R(1.4,2.4),s*R(.25,.45),s);g.rotateY(R(0,3));g.translate(x,-.2,z);addStatic(g,duneMat,false,true);}}
for(const f of W.forests){const mat=f.kind==='dry'?M.treeDry:M.treeDark;for(let i=0;i<f.n;i++){const a=rnd()*6.283,rr=Math.sqrt(rnd());const x=f.x+Math.cos(a)*f.rx*rr,z=f.z+Math.sin(a)*f.rz*rr;if(roadAt(x,z,3)||zoneAt(x,z)||isWater(x,z))continue;tree(x,z,R(.8,1.4),mat);}}
for(const g of W.palms||[]){for(let i=0;i<g.n;i++){const a=rnd()*6.283,rr=Math.sqrt(rnd());const x=g.x+Math.cos(a)*g.rx*rr,z=g.z+Math.sin(a)*g.rz*rr;if(isWater(x,z)||roadAt(x,z,4)||zoneAt(x,z,6))continue;palm(x,z);}}
for(let i=0,nT=Math.round(2600*W.H/11000);i<nT;i++){const x=R(50,W.W-50),z=R(50,W.H-50);if(isWater(x,z)||roadAt(x,z,4)||zoneAt(x,z,10))continue;let skip=false;for(const b of W.biomes)if((b.kind==='desert'||b.kind==='rann')&&inE(b,x,z)<1){skip=rnd()<.85;break;}if(skip)continue;tree(x,z,R(.7,1.2));}
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

/* ================= places you can use ================= */
const PCOL={stadium:'#3ddc97',bank:'#3ddc97',food:'#ff9f1c',toilet:'#5fb4ff',pump:'#2fc4b2',cng:'#7fd858',hospital:'#ff6b6b',police:'#5f8bff',rto:'#c9a227',jobs:'#ffb347',cars:'#c38bff',bikes:'#ff8fd0',clothes:'#ff6fa8',furniture:'#d8a46a',mobile:'#6fc3ff',guns:'#ff5d73',realty:'#ffc93c',mechanic:'#9aa5b1',station:'#e07b39',bus:'#e85d5d',lodge:'#b38bff',home:'#ffe08a',airport:'#7ad0ff',local:'#ff9a3c',ferry:'#4fb3ff',safari:'#9bd36a',camel:'#e3b26a'};
const PICON={stadium:'⚽',bank:'🏦',food:'🍛',toilet:'🚻',pump:'⛽',cng:'🟢',hospital:'🏥',police:'🚓',rto:'🪪',jobs:'💼',cars:'🚗',bikes:'🏍',clothes:'👕',furniture:'🛋',mobile:'📱',guns:'🎯',realty:'🏘',mechanic:'🔧',station:'🚆',bus:'🚌',lodge:'🛏',home:'🏡',airport:'✈',local:'🚉',ferry:'⛴',safari:'🦁',camel:'🐪'};
const PLABEL={stadium:'Football stadium',bank:'Bank and ATM',food:'Food and chai',toilet:'Public toilet',pump:'Petrol and diesel',cng:'CNG pump',hospital:'Hospital',police:'Police station',rto:'RTO (licences)',jobs:'Job agent',cars:'Car showroom',bikes:'Two-wheeler dealer',clothes:'Clothes shop',furniture:'Furniture',mobile:'Mobile shop',guns:'Gun shop',realty:'Homes for sale',mechanic:'Mechanic',station:'Railway station',bus:'Bus stand',lodge:'Lodge to sleep',home:'Home',airport:'Airport',local:'Mumbai local',ferry:'Ferry',safari:'Lion safari',camel:'Camel ride'};
const VALUE={cycle:4000,rickshaw:15000,bike:65000,sportsbike:180000,auto:12000,car:45000,sedan:85000,suv:120000,sports:250000,taxi:40000};
const PNAME={bank:'Bharat Bay Bank',toilet:'Public toilet',pump:'Petrol pump',cng:'CNG pump',hospital:'Hospital',police:'Police station',rto:'RTO office',jobs:'Rozgar job agent',cars:'Bay Motors',bikes:'Do-Pahiya two-wheelers',clothes:'Kapda Bazaar',furniture:'Ghar Sajao furniture',mobile:'Mobile Point',guns:'Hathiyar Ghar',realty:'Sapna Homes',mechanic:'Mechanic garage',station:'Railway station',bus:'ST bus stand',lodge:'Lodge'};
const FOODNAME={MH:['Chai tapri','Vada pav stall','Udupi canteen'],GJ:['Chai tapri','Farsan house','Gujarati thali house'],RJ:['Chai tapri','Kachori corner','Rajasthani bhojanalaya'],DD:['Coconut stall','Seafood shack','Beach cafe']};
function labelTex(t,col){return canvasTex(256,56,x=>{x.font='800 27px "Baloo 2", sans-serif';const w=Math.min(250,x.measureText(t).width+34);const l=(256-w)/2;x.fillStyle='rgba(20,15,38,.84)';x.beginPath();x.moveTo(l+15,3);x.arcTo(l+w,3,l+w,53,15);x.arcTo(l+w,53,l,53,15);x.arcTo(l,53,l,3,15);x.arcTo(l,3,l+w,3,15);x.fill();x.fillStyle=col;x.fillRect(l+11,20,7,16);x.fillStyle='#fff4e2';x.textAlign='center';x.textBaseline='middle';x.fillText(t,128+6,30);},false);}
const ringGeo=new THREE.RingGeometry(1.1,1.5,24);ringGeo.rotateX(-Math.PI/2);const ringMats={};
function makePoi(o){const col=o.color||PCOL[o.type]||'#ffffff';if(!ringMats[col])ringMats[col]=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.85,side:THREE.DoubleSide});
  const ring=new THREE.Mesh(ringGeo,ringMats[col]);ring.position.set(o.x,.36,o.z);scene.add(ring);
  const p=Object.assign({icon:PICON[o.type]||'•',color:col,ring,sp:null,zone:zoneAt(o.x,o.z,40)},o);pois.push(p);return p;}
function lotCenter(b,lot){const n=STYLES[b.zone.style]?STYLES[b.zone.style].lots:3;const o=n===2?15:20;return[b.x+lot[0]*o,b.z+lot[1]*o];}
for(const [id,zd] of zoneData){const z=zd.z;let foodN=0;
  for(const s of zd.slots){let x,zz,rot;if(s.x!=null){x=s.x;zz=s.z;rot=s.rot||0;}else{[x,zz,rot]=edgePos(s.b.x,s.b.z,s.side,s.t);}
    let name=s.name,extra=s.extra;
    if(s.type==='food'&&!name){const nm=FOODNAME[z.food]||(W.foodNames||{})[z.food]||FOODNAME.MH;name=nm[foodN%3];extra=foodN===2?'HW':z.food;foodN++;}
    if(!name)name=s.type==='station'?z.name+' Railway Station':s.type==='bus'?z.name+' ST stand':s.type==='lodge'?(z.st==='RJ'||z.id==='shirdi'?z.name+' dharamshala':z.name+' lodge'):PNAME[s.type]||s.type;
    if(s.lot){const [cx,cz]=lotCenter(s.b,s.lot);const n=STYLES[z.style]?STYLES[z.style].lots:3;const sz=n===2?26:18;
      if(s.type==='pump'||s.type==='cng'){box(sz,.1,sz,cx,.32,cz,M.concrete,false,true);box(sz*.8,.5,sz*.55,cx,5.4,cz,M.canopy);box(sz*.8,.7,sz*.57,cx,5.0,cz,s.type==='cng'?M.awn[3]:M.awn[1]);for(const k of [-1,1]){box(.5,5,.5,cx+k*sz*.25,2.8,cz,M.pole);box(1,1.6,.6,cx+k*sz*.25,1.1,cz+2,M.white);}}
      if(s.type==='station'){building(cx,cz,sz*.9,sz*.7,9,bmat('#c97a4a',true),{old:true});box(sz*.95,.6,sz*.75,cx,9.6,cz,M.cream);addSign(z.name.toUpperCase(),cx,7,cz+(s.side==='s'?sz*.36:-sz*.36),0,sz*.6,1.6,'#1d1433','#ffd04a');}
      if(s.type==='bus'){box(sz*.7,.4,4,cx,3.2,cz,M.roofTin);for(const k of [-1,1])box(.3,3,.3,cx+k*sz*.3,1.8,cz,M.pole);box(sz*.6,.6,1,cx,.6,cz,M.wood);}}
    makePoi({type:s.type,name,x,z:zz,rot,extra,drive:s.type==='pump'||s.type==='cng'||s.type==='mechanic'});}}
for(const p of lmPois)makePoi(p);
for(const h of W.homes){const zd=zoneData.get(h.zone);const b=zd.blocks.find(b=>b.land&&b.hasBld&&!b.used&&!pois.some(p=>Math.hypot(p.x-b.x,p.z-b.z)<20))||zd.blocks.find(b=>b.land&&b.hasBld);if(!b)continue;b.used=true;
  const [x,zz,rot]=edgePos(b.x,b.z,'s',-8);makePoi({type:'home',name:h.name,x,z:zz,rot,extra:h.id});}
flushStatic();

/* rooftop billboards near the player */
function playerAge(){return IBCONF.ageFromDob(P&&P.dob);}
/* ================= billboards and ads =================
   Slots: up to 4 rooftop boards per city, up to 3 roadside boards on city roads, and roadside boards along highways.
   Each slot shows a running collaborator ad (admin → Billboards, entries with an advertiser) if one fits,
   otherwise an India Bay "house ad" for something real nearby: homes for sale, vehicles, food, jobs and more.
   Tapping a board opens it; house ads give directions, collaborator ads have a Visit link. */
const billboardMeshes=[];let SLOTS=null;const adShown=new Map(),houseCount=new Map();
function collabAds(zid){const iso=istISO(),age=playerAge(),kid=age==null||age<18;
  return CFG.billboards.filter(b=>b.advertiser&&String(b.advertiser).trim()&&(b.zone==='all'||b.zone===zid)&&(!b.start||b.start<=iso)&&(!b.end||b.end>=iso)&&!IBCONF.adBlocked(b.category)&&(kid?IBCONF.kidSafe(b.category):IBCONF.ageOK(b.ages,age)));}
function activeBillboards(zid){return collabAds(zid);}
function buildSlots(){SLOTS=[];
  for(const [id,zd] of zoneData){zd.tallRoofs.slice(0,4).forEach(([x,h,zz],i)=>SLOTS.push({id:`r:${id}:${i}`,x,y:h+5.5,z:zz,rot:(i%2)?Math.PI/2:0,kind:'roof',zone:id,bw:14,bh:7}));
    const z=zd.z,x1=z.x0+z.nx*80,z1=z.z0+z.nz*80;let n=0;
    for(const e of EDGES){if(n>=3)break;if(e.kind!=='city'||e.len<60)continue;const mx=(e.ax+e.bx)/2,mz=(e.az+e.bz)/2;if(mx<z.x0-5||mx>x1+5||mz<z.z0-5||mz>z1+5)continue;
      const edge=Math.min(Math.abs(mx-z.x0),Math.abs(mx-x1),Math.abs(mz-z.z0),Math.abs(mz-z1));if(edge>12||hash(e.id*1.7)>.5)continue;
      const o=e.w/2+6,sx=mx-e.dz*o,sz=mz+e.dx*o;if(isWater(sx,sz)||roadAt(sx,sz,4)||collide(new THREE.Vector3(sx,0,sz),5,false))continue;SLOTS.push({id:`c:${e.id}`,x:sx,y:0,z:sz,rot:Math.atan2(e.dx,e.dz),kind:'road',road:'city road',zone:id,bw:9,bh:4.5});n++;}}
  for(const e of EDGES){if(e.kind!=='hw'||e.len<200)continue;const step=1600,cnt=Math.max(1,Math.floor(e.len/step));for(let j=0;j<cnt;j++){if(hash(e.id*7.31+j)>.6)continue;const t=Math.min(e.len-60,60+(j+.5)*(e.len-120)/cnt),side=hash(e.id+j*3.3)<.5?1:-1;const mx=e.ax+e.dx*t,mz=e.az+e.dz*t,o=(e.w/2+13)*side,sx=mx-e.dz*o,sz=mz+e.dx*o;if(isWater(sx,sz)||roadAt(sx,sz,6)||zoneAt(sx,sz,10))continue;
    const zz=zoneAt(sx,sz,8000);SLOTS.push({id:`h:${e.id}:${j}`,x:sx,y:0,z:sz,rot:Math.atan2(e.dx,e.dz),kind:'road',road:/express/i.test(e.road&&e.road.name||'')?'expressway':'highway',zone:zz?zz.id:null,bw:10,bh:5});}}}
/* India Bay's own ads, made from real places near the board */
const HOUSE=[
  ['realty',p=>{const h=W.homes.find(q=>q.zone===p.zone&&!(P.homes||[]).includes(q.id)&&p.extra===q.id);return h?{title:'FOR SALE: '+h.name.toUpperCase(),line2:inr(cost('home.'+h.id,h.price))+' · ready to move in',desc:`${h.name} is for sale. Visit it to buy and move in.`,cat:'Homes',fg:'#ffffff',bg:'#2f6b4f'}:null},'home'],
  ['cars',p=>({title:'NEW SEDANS FROM '+inr(cost('veh.sedan',VALUE.sedan)),line2:p.name,desc:`Cars, SUVs and sports cars at ${p.name}. Test drive today.`,cat:'Vehicles',fg:'#ffffff',bg:'#1f4fa8'})],
  ['bikes',p=>({title:'BIKES FROM '+inr(cost('veh.bike',VALUE.bike)),line2:p.name,desc:`Motorbikes, sports bikes and helmets at ${p.name}.`,cat:'Vehicles',fg:'#1d1433',bg:'#ffc93c'})],
  ['food',p=>({title:'HUNGRY? EAT HERE',line2:p.name,desc:`Hot local food at ${p.name}. Filling up keeps your health up.`,cat:'Food',fg:'#ffffff',bg:'#d9483b'})],
  ['jobs',p=>({title:'DRIVERS WANTED',line2:'Earn every trip · '+p.name,desc:`Delivery, auto, cab, truck and bus jobs. Sign up at ${p.name}.`,cat:'Jobs',fg:'#1d1433',bg:'#3ddc97'})],
  ['mechanic',p=>({title:'REPAIRS AND SERVICE',line2:p.name,desc:`Fix damage and get a quick service at ${p.name}.`,cat:'Vehicles',fg:'#ffffff',bg:'#5b4636'})],
  ['clothes',p=>({title:'NEW KURTAS IN STOCK',line2:p.name,desc:`Kurtas, sarees, sneakers and sunglasses at ${p.name}.`,cat:'Fashion',fg:'#1d1433',bg:'#ff9ecb'})],
  ['mobile',p=>({title:'DATA PACKS AND COVERS',line2:p.name,desc:`Recharges and phone covers at ${p.name}. Order anything else on BayCart.`,cat:'Mobiles',fg:'#ffffff',bg:'#3b2f8f'})],
  ['furniture',p=>({title:'FURNITURE SALE',line2:p.name,desc:`Beds, sofas and TVs for your home at ${p.name}.`,cat:'Home',fg:'#2a1600',bg:'#f6d7a7'})],
  ['station',p=>({title:'TRAINS ACROSS WEST INDIA',line2:p.name,desc:`Sleeper and AC tickets at ${p.name}.`,cat:'Travel',fg:'#ffffff',bg:'#7a2e2e'})],
  ['stadium',p=>{const F=window.FOOTBALL;if(!F)return null;const t=F.byId(p.extra);if(!t)return null;const n=F.nextHome(t.id,gameDay);if(!n)return null;return{title:n.inDays?'NEXT HOME MATCH · '+t.short+' v '+n.f.away.short:'MATCHDAY · '+t.short+' v '+n.f.away.short,line2:(n.inDays?'In '+n.inDays+' Bay day'+(n.inDays>1?'s':'')+' · ':'Tonight · ')+'7:30 pm · '+p.name,desc:`${t.name} play ${n.f.away.name} at ${p.name}. Tickets, jerseys and the ${t.fans} fan club at the stadium gate.`,cat:'Sports',fg:t.col2==='#ffffff'?'#ffffff':t.col2,bg:t.col};}],
  ['airport',p=>({title:'FLY ACROSS INDIA',line2:p.name,desc:`Flights between West India's cities from ${p.name}.`,cat:'Travel',fg:'#ffffff',bg:'#1b6aa5'})],
  ['bank',p=>({title:'KEEP CASH SAFE',line2:p.name,desc:`Cash in the bank is safe from robbers. Deposit at ${p.name}.`,cat:'Banking',fg:'#ffffff',bg:'#0f5f5f'})],
  ['pump',p=>({title:'FUEL UP HERE',line2:p.name,desc:`Petrol and diesel at ${p.name}. Fill up before long drives.`,cat:'Fuel',fg:'#1d1433',bg:'#ff9f1c'})],
  ['lodge',p=>({title:'ROOMS FOR TONIGHT',line2:p.name,desc:`A bed to sleep in at ${p.name}.`,cat:'Travel',fg:'#ffffff',bg:'#6b3fa0'})]];
const SAFETY=[{title:'WEAR A HELMET',line2:'Road safety · India Bay',desc:'Helmets save lives, and traffic police fine riders without one.',cat:'Road safety',fg:'#ffffff',bg:'#c0392b'},
  {title:'STOP AT RED',line2:'Road safety · India Bay',desc:'Red means stop. Wait for green.',cat:'Road safety',fg:'#1d1433',bg:'#ffffff'},
  {title:'YOUR AD HERE',line2:'support@indiabaygame.com',desc:'Businesses and creators can book billboards in India Bay by city, dates and age group.',cat:'Advertise',fg:'#1d1433',bg:'#ffffff',mail:true}];
function houseAd(slot,n){const R=slot.kind==='road'&&slot.road!=='city road'?4000:1600;const near=pois.filter(p=>Math.abs(p.x-slot.x)<R&&Math.abs(p.z-slot.z)<R);
  const opts=[];for(const [type,f,alt] of HOUSE){const list=near.filter(p=>p.type===type||(alt&&p.type===alt)).sort((a,b)=>Math.hypot(a.x-slot.x,a.z-slot.z)-Math.hypot(b.x-slot.x,b.z-slot.z));for(const p of list){const ad=f(p);if(ad){opts.push(Object.assign(ad,{target:{x:p.x,z:p.z,name:p.name}}));break;}}}
  // spread the variety: each board in an area takes the next kind of ad; every 5th is a road-safety or advertise-here board
  const key=slot.zone||'hw',c=houseCount.get(key)||0;houseCount.set(key,c+1);const off=Math.floor(hash(key.length*13.1+(slot.zone?slot.zone.charCodeAt(0):7))*97);
  const pick=!opts.length||c%5===4?SAFETY[(c+off)%SAFETY.length]:opts[(c+off)%opts.length];return Object.assign({house:true},pick);}
function chooseAd(slot,n){const list=collabAds(slot.zone);for(let i=0;i<list.length;i++){const b=list[(i+n)%list.length];const key=b.advertiser+'|'+b.text;const c=adShown.get(key)||0;if(c<3){adShown.set(key,c+1);const L=String(b.text||'').split('|');return{collab:true,title:L[0]||b.advertiser,line2:L[1]||'',text:b.text,fg:b.fg||'#1d1433',bg:b.bg||'#ffffff',advertiser:b.advertiser,link:b.link||'',cat:IBCONF.adLabel(b.category)};}}
  return houseAd(slot,n);}
const postMat=LMat('#3b3a40'),frameMat=LMat('#202226');
function buildBoard(slot,n){const ad=slot.ad||(slot.ad=chooseAd(slot,n));const g=new THREE.Group();g.position.set(slot.x,slot.y,slot.z);g.rotation.y=slot.rot;
  const tex=signTex(ad.text||(ad.line2?ad.title+'|'+ad.line2:ad.title),ad.fg,ad.bg,512,256);const board=new THREE.Mesh(new THREE.PlaneGeometry(slot.bw,slot.bh),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
  board.userData.ad=ad;board.userData.slot=slot;g.add(board);billboardMeshes.push(board);
  if(slot.kind==='road'){const top=6+slot.bh/2;board.position.set(0,top,.16);board.material.side=THREE.FrontSide;const back=new THREE.Mesh(board.geometry,new THREE.MeshBasicMaterial({map:tex}));back.position.set(0,top,-.16);back.rotation.y=Math.PI;back.userData=board.userData;g.add(back);billboardMeshes.push(back);
    const ph=top-slot.bh/2+.4;for(const sx of [-slot.bw*.3,slot.bw*.3])part(G.box,postMat,.24,ph,.24,sx,ph/2,0,g);part(G.box,frameMat,slot.bw+.5,slot.bh+.5,.25,0,top,0,g);}
  scene.add(g);return g;}
function freeBoard(g){scene.remove(g);g.traverse(o=>{if(o.isMesh&&o.material.map){o.material.map.dispose();o.material.dispose();const i=billboardMeshes.indexOf(o);if(i>=0)billboardMeshes.splice(i,1);if(o.geometry.dispose)o.geometry.dispose();}});}
const boardOf=new Map();
function refreshBillboards(){for(const g of boardOf.values())freeBoard(g);boardOf.clear();adShown.clear();houseCount.clear();if(SLOTS)for(const s of SLOTS)s.ad=null;}
// Hide a board while the camera is right next to it, so its posts and frame never fill the screen.
function fadeBoards(){const c=camera.position;for(const g of boardOf.values()){const dx=g.position.x-c.x,dz=g.position.z-c.z;g.visible=dx*dx+dz*dz>20*20;}}
function updBillboards(px,pz){if(!SLOTS)buildSlots();SLOTS.forEach((s,i)=>{const d=Math.hypot(s.x-px,s.z-pz),has=boardOf.has(s.id);if(d<700&&!has)boardOf.set(s.id,buildBoard(s,i));else if(d>950&&has){freeBoard(boardOf.get(s.id));boardOf.delete(s.id);}});}
const adRay=new THREE.Raycaster();
function pickBillboard(cx,cy){if(!billboardMeshes.length)return false;const r=renderer.domElement.getBoundingClientRect();adRay.setFromCamera({x:(cx-r.left)/r.width*2-1,y:-((cy-r.top)/r.height)*2+1},camera);adRay.far=220;
  const hit=adRay.intersectObjects(billboardMeshes,false)[0];if(!hit)return false;adSheet(hit.object.userData.ad,hit.object.userData.slot);return true;}
function adSheet(ad,slot){const pp=ppos();const d=ad.target?Math.hypot(ad.target.x-pp.x,ad.target.z-pp.z):0;const dist=d<1000?Math.round(d/10)*10+' m':(d/1000).toFixed(1)+' km';
  P.extra.adClicks=P.extra.adClicks||{};if(ad.collab){const k=ad.advertiser;P.extra.adClicks[k]=(P.extra.adClicks[k]||0)+1;}
  openSheet(ad.collab?esc(ad.advertiser):'India Bay',ad.collab?`Ad · ${esc(ad.cat||'')}`:esc(ad.cat||'Ad'),`<div class="adprev" style="background:${esc(ad.bg)};color:${esc(ad.fg)};border-color:${esc(ad.fg)}"><b>${esc(ad.title)}</b>${ad.line2?`<span>${esc(ad.line2)}</span>`:''}</div>
    ${ad.desc?`<p class="note" style="color:var(--ink);font-size:14.5px">${esc(ad.desc)}</p>`:''}${ad.target?`<p class="note">${esc(ad.target.name)} · ${dist} away</p>`:''}
    <div class="btnrow">${ad.target?'<button class="go" data-id="dir">Directions</button>':''}${ad.collab&&/^https:\/\//.test(ad.link)?'<button class="go" data-id="visit">Visit</button>':''}${ad.mail?'<a class="go" href="mailto:support@indiabaygame.com?subject=Billboard%20ads%20in%20India%20Bay">Email us</a>':''}<button class="buy ghost" data-id="close">Close</button></div>
    ${ad.collab?'<p class="note">Sponsored. Opens the advertiser\'s website in a new tab.</p>':''}`,s=>s.onclick=e=>{const id=e.target.dataset.id;if(!id)return;if(id==='close')return closeSheet();
      if(id==='dir'){closeSheet();if(api.TRAVEL&&api.TRAVEL.go)api.TRAVEL.go(ad.target.x,ad.target.z,ad.target.name);return;}
      if(id==='visit'){window.open(ad.link,'_blank','noopener');closeSheet();}});}

/* ================= vehicles ================= */
const G={wheel:new THREE.CylinderGeometry(.36,.36,.26,12).rotateZ(Math.PI/2),thin:new THREE.CylinderGeometry(.33,.33,.08,14).rotateZ(Math.PI/2),box:new THREE.BoxGeometry(1,1,1),sph:new THREE.SphereGeometry(1,10,8),cyl:new THREE.CylinderGeometry(1,1,1,8)};
const VM={black:LMat('#1c1c20'),yellow:LMat('#ffc61a'),green:LMat('#1f8a4c'),glass:new THREE.MeshLambertMaterial({color:0x9fc6dd,transparent:true,opacity:.55}),light:new THREE.MeshBasicMaterial({color:0xfff2c8}),tail:new THREE.MeshBasicMaterial({color:0xff3b30}),seat:LMat('#3a2a22'),skin:LMat('#a86b4a'),hair:LMat('#1a1414'),
  red:LMat('#c8102e'),white:LMat('#eeeeea'),silver:LMat('#b9bec4'),orange:LMat('#f08a24'),blue:LMat('#2d6cdf'),maroon:LMat('#6d1a2a'),teal:LMat('#1f8a8a'),sirR:new THREE.MeshBasicMaterial({color:0xff2a2a}),sirB:new THREE.MeshBasicMaterial({color:0x2a5bff}),dark:new THREE.MeshBasicMaterial({color:0x222222}),chrome:LMat('#cfd3d6')};
const hornTex=canvasTex(256,256,x=>{x.fillStyle='#ffe066';x.fillRect(0,0,256,256);x.fillStyle='#d9483b';x.fillRect(0,0,256,30);x.fillRect(0,226,256,30);x.fillStyle='#1d1433';x.textAlign='center';x.font='800 50px "Baloo 2", sans-serif';x.fillText('HORN',128,100);x.fillText('OK',128,150);x.font='800 40px "Baloo 2", sans-serif';x.fillStyle='#1f8a4c';x.fillText('PLEASE',128,200);},false);
const policeTex=canvasTex(256,64,x=>{x.fillStyle='#ffffff';x.fillRect(0,0,256,64);x.fillStyle='#1d3f9a';x.font='800 44px "Baloo 2", sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('POLICE',128,34);},false);
function part(geo,mat,sx,sy,sz,x,y,z,parent){const m=new THREE.Mesh(geo,mat);m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
function wheels(g,pts,s=1,geo=G.wheel){return pts.map(([x,y,z])=>{const w=new THREE.Mesh(geo,VM.black);w.position.set(x,y,z);w.scale.setScalar(s);g.add(w);return w;});}
const SPEC={
  cycle:{max:9,acc:4,turn:2.6,len:1.8,wid:.6,two:true,fuel:null,lic:null,fp:[0,1.75,.25],cam:3.6,label:'Cycle',seat:[0,.95,-.15],pedal:true},
  rickshaw:{max:7,acc:3,turn:1.7,len:2.8,wid:1.3,fuel:null,lic:null,fp:[0,1.85,.75],cam:4.5,label:'Cycle rickshaw',seat:[0,1.05,.85],pedal:true},
  bike:{max:28,acc:14,turn:2.4,len:2.1,wid:.8,two:true,fuel:'petrol',tank:10,range:35000,lic:'two',fp:[0,1.65,.2],cam:4,label:'Motorbike',seat:[0,.9,-.2]},
  sportsbike:{max:48,acc:24,turn:2.6,len:2.1,wid:.8,two:true,fuel:'petrol',tank:14,range:30000,lic:'two',fp:[0,1.55,.25],cam:4,label:'Sports bike',seat:[0,.9,-.25]},
  auto:{max:26,acc:15,turn:1.9,len:3.2,wid:1.7,fuel:'cng',tank:8,range:20000,lic:null,fp:[0,1.95,.55],cam:4.5,label:'Auto rickshaw'},
  taxi:{max:32,acc:16,turn:1.7,len:4.2,wid:1.9,fuel:'cng',tank:10,range:25000,lic:'lmv',fp:[-.4,1.45,.15],cam:5,label:'Kaali-peeli taxi'},
  car:{max:33,acc:16,turn:1.7,len:4.2,wid:1.9,fuel:'petrol',tank:35,range:30000,lic:'lmv',fp:[-.4,1.45,.15],cam:5,label:'Hatchback'},
  sedan:{max:38,acc:18,turn:1.7,len:4.7,wid:1.95,fuel:'petrol',tank:40,range:32000,lic:'lmv',fp:[-.4,1.45,.1],cam:5.3,label:'Sedan'},
  suv:{max:36,acc:18,turn:1.6,len:4.4,wid:2.0,fuel:'diesel',tank:50,range:30000,lic:'lmv',fp:[-.45,1.9,.25],cam:5.5,label:'SUV'},
  sports:{max:46,acc:26,turn:2.0,len:4.3,wid:2.0,fuel:'petrol',tank:50,range:22000,lic:'lmv',fp:[-.4,1.15,0],cam:5,label:'Sports coupe'},
  police:{max:38,acc:20,turn:1.8,len:4.4,wid:2.0,fuel:'diesel',tank:50,range:30000,lic:'lmv',fp:[-.45,1.9,.25],cam:5.5,label:'Police jeep'},
  bus:{max:20,acc:7,turn:1.1,len:10.5,wid:2.6,fuel:'diesel',tank:150,range:60000,lic:'heavy',fp:[-.8,2.6,4.4],cam:9,label:'BEST-style bus'},
  truck:{max:22,acc:8,turn:1.2,len:7.6,wid:2.4,fuel:'diesel',tank:150,range:60000,lic:'heavy',fp:[-.6,2.5,2.9],cam:8,label:'Goods truck'}};
/* ---------- realistic vehicle parts ---------- */
const PAINT=new Map();function paint(c){c=typeof c==='string'?c:'#'+c.color.getHexString();if(!PAINT.has(c))PAINT.set(c,new THREE.MeshPhongMaterial({color:c,shininess:70,specular:0x3a3a3a}));return PAINT.get(c);}
const VX={tire:LMat('#17171a'),rim:new THREE.MeshPhongMaterial({color:0xc9ccd1,shininess:90,specular:0x666666}),trim:LMat('#26272b'),grille:LMat('#141416'),
  glass:new THREE.MeshPhongMaterial({color:0x22313d,shininess:120,specular:0x8899aa,transparent:true,opacity:.78}),plateW:LMat('#f2f2ee'),plateY:LMat('#f4c430'),canvas:LMat('#1d1d1f'),seatC:LMat('#3b2b23')};
function wheelGeo(r,w,rimR){const t=new THREE.CylinderGeometry(r,r,w,18);t.rotateZ(Math.PI/2);const rim=new THREE.CylinderGeometry(rimR,rimR,w+.02,14);rim.rotateZ(Math.PI/2);const hub=new THREE.CylinderGeometry(rimR*.35,rimR*.35,w+.05,8);hub.rotateZ(Math.PI/2);
  const tc=t.index.count,rc=rim.index.count+hub.index.count;const g=merge([t,rim,hub]);g.clearGroups();g.addGroup(0,tc,0);g.addGroup(tc,rc,1);return g;}
function spokeGeo(r){const t=new THREE.TorusGeometry(r,.035,6,20);t.rotateY(Math.PI/2);const parts=[];for(let i=0;i<4;i++){const b=new THREE.BoxGeometry(.012,r*2,.012);b.rotateX(i*Math.PI/4);parts.push(b);}const hub=new THREE.CylinderGeometry(.05,.05,.08,8);hub.rotateZ(Math.PI/2);parts.push(hub);
  const tc=t.index.count;let rc=0;for(const q of parts)rc+=q.index.count;const g=merge([t,...parts]);g.clearGroups();g.addGroup(0,tc,0);g.addGroup(tc,rc,1);return g;}
const WG={car:wheelGeo(.34,.24,.22),big:wheelGeo(.36,.28,.22),heavy:wheelGeo(.5,.34,.3),moto:wheelGeo(.33,.12,.24),auto:wheelGeo(.3,.16,.18),cycle:spokeGeo(.32)};
function wheels2(g,pts,geo){return pts.map(([x,y,z])=>{const w=new THREE.Mesh(geo,[VX.tire,VX.rim]);w.position.set(x,y,z);w.castShadow=true;g.add(w);return w;});}
// Side profile (z = along the car, y = up) extruded across the width, with rounded edges.
function sideBody(pts,width,mat,g,bevel=.07){const sh=new THREE.Shape();pts.forEach(([z,y],i)=>i?sh.lineTo(z,y):sh.moveTo(z,y));sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth:Math.max(.05,width-2*bevel),bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel*.8,bevelSegments:2,curveSegments:3});
  geo.translate(0,0,-(width-2*bevel)/2);geo.rotateY(-Math.PI/2);const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
const CAR_SHAPES={
  car:{body:[[-2,.38],[2,.38],[2.05,.72],[1.9,.9],[.95,1.0],[-1.85,1.02],[-2.05,.85]],cab:[[.98,.98],[.28,1.46],[-1.45,1.46],[-1.86,1.0]],belt:1.0,roof:1.46},
  sedan:{body:[[-2.3,.38],[2.3,.38],[2.35,.7],[2.2,.88],[1.05,.98],[-1.6,.98],[-2.25,1.0],[-2.38,.8]],cab:[[1.08,.96],[.35,1.44],[-1.0,1.44],[-1.7,.98]],belt:.98,roof:1.44},
  suv:{body:[[-2.15,.45],[2.15,.45],[2.2,.85],[2.05,1.12],[1.2,1.18],[-2.1,1.2],[-2.2,1.0]],cab:[[1.22,1.16],[.62,1.84],[-2.0,1.86],[-2.12,1.18]],belt:1.18,roof:1.86},
  sports:{body:[[-2.1,.32],[2.1,.32],[2.15,.55],[1.9,.72],[.6,.84],[-1.9,.86],[-2.15,.7]],cab:[[.62,.82],[-.1,1.16],[-1.1,1.16],[-1.75,.86]],belt:.84,roof:1.16}};
function buildCar(type,colorMat,g){const sp=SPEC[type],shape=type==='taxi'?'car':type==='police'?'suv':type,S=CAR_SHAPES[shape];const L=sp.len,W=sp.wid-.05,k=L/(shape==='sedan'?4.7:shape==='suv'?4.4:shape==='sports'?4.3:4.2);
  const sc=pts=>pts.map(([z,y])=>[z*k,y]);
  let body,top;if(type==='taxi'){body=paint('#151517');top=paint('#f6c90e');}else if(type==='police'){body=paint('#f4f4f2');top=body;}
  else{const pal={car:['#f2f2ee','#b9bec4','#c8102e','#2d5fb8','#6b6f75'],sedan:['#f2f2ee','#b9bec4','#6d1a2a','#1c1c20','#1f6f6f'],suv:['#1c1c20','#b9bec4','#f2f2ee','#8a1c1c','#3d4a3a'],sports:['#d0101e','#f2b705','#f07c1a','#1b6fd6']}[shape];body=colorMat?paint(colorMat):paint(mpick(pal));top=body;}
  sideBody(sc(S.body),W,body,g);sideBody(sc(S.cab),W-.16,VX.glass,g,.05);
  // roof skin and pillars in paint so the glass reads as windows
  const r1=sc(S.cab);const roof=[[r1[1][0]-.05,S.roof-.07],[r1[1][0]+.02,S.roof+.02],[r1[2][0]-.02,S.roof+.02],[r1[2][0]+.08,S.roof-.07]];sideBody(roof,W-.1,top,g,.04);
  const pz=[(r1[0][0]+r1[1][0])/2,(r1[2][0]+r1[3][0])/2,(r1[1][0]+r1[2][0])/2];for(const z of pz){const p=part(G.box,top,W-.12,S.roof-S.belt,.12,0,(S.roof+S.belt)/2,z,g);}
  const fz=L/2,bz=-L/2;part(G.box,VX.trim,W+.04,.2,.18,0,.47,fz-.02,g);part(G.box,VX.trim,W+.04,.2,.18,0,.47,bz+.02,g);part(G.box,VX.grille,W*.5,.16,.05,0,.66,fz+.02,g);
  for(const sx of [-1,1]){part(G.box,VM.light,.34,.13,.05,sx*(W/2-.3),.8,fz+.01,g);part(G.box,VM.tail,.3,.13,.05,sx*(W/2-.28),.84,bz-.01,g);part(G.box,top,.14,.1,.2,sx*(W/2+.06),S.belt+.06,r1[0][0]-.15,g);}
  const plate=type==='taxi'?VX.plateY:VX.plateW;part(G.box,plate,.5,.13,.03,0,.5,fz+.12,g);part(G.box,plate,.5,.13,.03,0,.62,bz-.04,g);
  if(type==='taxi')part(G.box,paint('#f6c90e'),.7,.2,.32,0,S.roof+.12,-.3*k,g);
  if(type==='sports')part(G.box,body,W*.9,.06,.42,0,S.belt+.28,bz+.25,g);
  if(type==='police'){part(G.box,paint('#1d3f9a'),W+.02,.18,L*.92,0,.82,0,g);const r=part(G.box,VM.sirR,.55,.16,.3,-.32,S.roof+.1,-.2,g),bl=part(G.box,VM.sirB,.55,.16,.3,.32,S.roof+.1,-.2,g);g.userData.lights=[r,bl];
    const p=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.36),new THREE.MeshBasicMaterial({map:policeTex}));p.position.set(W/2+.04,1.0,0);p.rotation.y=Math.PI/2;g.add(p);const p2=p.clone();p2.position.x=-W/2-.04;p2.rotation.y=-Math.PI/2;g.add(p2);}
  const wz=L/2-.78*k,wx=W/2-.12,wg=shape==='suv'?WG.big:WG.car,wy=shape==='suv'?.36:.34;return wheels2(g,[[-wx,wy,wz],[wx,wy,wz],[-wx,wy,-wz],[wx,wy,-wz]],wg);}
const busSide=canvasTex(512,128,x=>{x.fillStyle='#b8202a';x.fillRect(0,0,512,128);x.fillStyle='#f3efe6';x.fillRect(0,92,512,14);for(let i=0;i<9;i++){x.fillStyle='#1d2a34';x.fillRect(14+i*55,14,46,58);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(16+i*55,16,18,54);}},false);
const truckBox=canvasTex(256,128,x=>{const c=mpick(['#2f6fb5','#e0a21b','#2d8a4e','#b5432f']);x.fillStyle=c;x.fillRect(0,0,256,128);x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=3;for(let i=12;i<256;i+=22){x.beginPath();x.moveTo(i,0);x.lineTo(i,128);x.stroke();}x.fillStyle='#ffe066';x.font='800 22px "Baloo 2", sans-serif';x.fillText('BHARAT TRANSPORT',22,70);},false);
function buildVeh(type,colorMat){const g=new THREE.Group();let w;g.userData={};
  if(type==='cycle'){const f=colorMat||mpick([VM.red,VM.blue,VM.black,VM.green]);part(G.box,f,.05,.05,1.05,0,.72,0,g);part(G.box,f,.05,.62,.05,0,.6,-.18,g);part(G.box,f,.05,.6,.05,0,.65,.44,g);part(G.box,VM.black,.56,.04,.04,0,1.05,.5,g);part(G.box,VM.seat,.16,.06,.26,0,.98,-.2,g);
    w=wheels2(g,[[0,.34,.6],[0,.34,-.6]],WG.cycle);}
  else if(type==='rickshaw'){part(G.box,VM.black,.07,.07,1.4,0,.8,.7,g);part(G.box,VM.seat,.2,.06,.3,0,1.02,.85,g);part(G.box,paint(mpick(['#2d5fb8','#1f8a4c','#6d1a2a'])),1.3,.5,.8,0,.85,-.55,g);part(G.box,VM.seat,1.2,.15,.6,0,1.15,-.55,g);
    const hood=new THREE.Mesh(new THREE.SphereGeometry(.75,12,6,0,Math.PI,0,Math.PI/2),LMat('#2a2a2a'));hood.rotation.y=Math.PI/2;hood.scale.set(1,1.2,.9);hood.position.set(0,1.3,-.75);hood.castShadow=true;g.add(hood);
    w=wheels2(g,[[0,.34,1.35],[-.68,.34,-.55],[.68,.34,-.55]],WG.cycle);}
  else if(type==='bike'||type==='sportsbike'){const sp=type==='sportsbike';const b=paint(colorMat?colorMat:sp?mpick(['#d0101e','#1b6fd6','#f2b705','#1f8a4c']):mpick(['#1c1c20','#c8102e','#6d1a2a','#2d5fb8']));
    const tank=new THREE.Mesh(G.sph,b);tank.scale.set(.2,.15,.36);tank.position.set(0,.98,.22);g.add(tank);part(G.box,b,.26,.3,.9,0,.68,0,g);part(G.box,VM.seat,.26,.09,.62,0,.98,-.32,g);part(G.box,VM.chrome,.07,.07,.62,.17,.45,-.45,g);
    part(G.box,VM.chrome,.04,.5,.04,-.1,.82,.62,g);part(G.box,VM.chrome,.04,.5,.04,.1,.82,.62,g);part(G.box,VM.black,.72,.04,.04,0,1.13,.62,g);part(G.sph,VM.light,.11,.11,.07,0,1.0,.78,g);part(G.box,VM.tail,.16,.06,.04,0,.86,-.66,g);
    if(sp){const fr=part(G.box,b,.4,.38,.5,0,1.02,.6,g);fr.rotation.x=-.5;part(G.box,b,.3,.2,.5,0,.85,-.55,g);}w=wheels2(g,[[0,.34,.72],[0,.34,-.68]],WG.moto);}
  else if(type==='auto'){const body=colorMat?paint(colorMat):Math.random()<.7?paint('#1f8a4c'):paint(mpick(['#1c1c20','#2d5fb8']));const yel=paint('#f6c90e');
    part(G.box,body,1.5,.42,2.9,0,.62,-.05,g);const nose=new THREE.Mesh(G.sph,body);nose.scale.set(.72,.62,.55);nose.position.set(0,1.05,1.05);nose.castShadow=true;g.add(nose);
    const cg=new THREE.CylinderGeometry(.86,.86,2.75,16,1,false,Math.PI/2,Math.PI);cg.rotateX(Math.PI/2);cg.scale(1,.42,1);const cano=new THREE.Mesh(cg,yel);cano.position.set(0,2.0,-.1);cano.castShadow=true;g.add(cano);
    part(G.box,VX.canvas,1.72,1.2,.08,0,1.48,-1.43,g);part(G.box,yel,1.74,.14,2.78,0,2.0,-.1,g);
    for(const [x,z] of [[-.8,1.05],[.8,1.05],[-.8,-1.35],[.8,-1.35]])part(G.box,VX.trim,.06,1.45,.06,x,1.4,z,g);
    part(G.box,VX.glass,1.25,.7,.04,0,1.8,1.32,g);part(G.box,VM.seat,1.38,.45,.65,0,1.08,-.78,g);part(G.sph,VM.light,.15,.15,.08,0,1.15,1.58,g);part(G.box,VM.tail,.22,.11,.05,-.58,.75,-1.52,g);part(G.box,VM.tail,.22,.11,.05,.58,.75,-1.52,g);part(G.box,VX.plateY,.42,.13,.03,0,.55,-1.53,g);
    const d=new THREE.Group();part(G.sph,VM.skin,.17,.2,.18,0,1.8,.42,d);part(G.sph,VM.hair,.18,.11,.18,0,1.9,.4,d);part(G.box,paint('#d9d4c4'),.5,.55,.3,0,1.35,.42,d);g.add(d);g.userData.driver=d;
    const pax=new THREE.Group();part(G.box,VM.red,.5,.5,.3,0,1.38,-.78,pax);part(G.sph,VM.skin,.16,.19,.17,0,1.82,-.78,pax);pax.visible=false;g.add(pax);g.userData.pax=pax;
    w=wheels2(g,[[0,.3,1.18],[-.8,.3,-.95],[.8,.3,-.95]],WG.auto);}
  else if(['taxi','car','suv','police','sports','sedan'].includes(type)){w=buildCar(type,colorMat,g);}
  else if(type==='bus'){const dd=Math.random()<.5,h=dd?4.3:2.8,red=paint('#b8202a');const side=new THREE.MeshPhongMaterial({map:busSide,shininess:40,specular:0x222222});
    const bodyM=[side,side,red,red,red,red];const bx=new THREE.Mesh(new THREE.BoxGeometry(2.55,h,10.3),bodyM);bx.position.y=.6+h/2;bx.castShadow=true;g.add(bx);
    if(dd){const up=new THREE.Mesh(new THREE.BoxGeometry(2.56,1.2,10.0),[side,side,red,red,red,red]);up.position.y=.6+h-1.0;g.add(up);}
    part(G.box,VX.glass,2.3,1.1,.06,0,.6+h-(dd?2.2:1.0),5.16,g);part(G.box,VX.trim,2.6,.32,.2,0,.68,5.14,g);part(G.box,VX.trim,2.6,.32,.2,0,.68,-5.14,g);part(G.box,VX.grille,1.2,.3,.04,0,1.0,5.2,g);
    part(G.box,VM.light,.4,.2,.05,-.9,1.1,5.2,g);part(G.box,VM.light,.4,.2,.05,.9,1.1,5.2,g);part(G.box,VM.tail,.3,.3,.05,-1.0,1.2,-5.2,g);part(G.box,VM.tail,.3,.3,.05,1.0,1.2,-5.2,g);part(G.box,LMat('#111111'),2.0,.35,.05,0,.6+h-.35,5.17,g);
    w=wheels2(g,[[-1.15,.5,3.5],[1.15,.5,3.5],[-1.15,.5,-3.4],[1.15,.5,-3.4]],WG.heavy);}
  else{const cab=paint(mpick(['#e8761e','#d9483b','#2f6fb5']));const box=new THREE.MeshLambertMaterial({map:truckBox});
    sideBody([[1.4,.6],[3.75,.6],[3.8,1.6],[3.55,2.75],[1.4,2.8]],2.3,cab,g,.1);part(G.box,VX.glass,2.0,.85,.05,0,2.15,3.72,g);part(G.box,VX.trim,2.4,.3,.25,0,.7,3.75,g);part(G.box,VX.grille,1.4,.45,.05,0,1.2,3.82,g);
    part(G.box,VM.light,.35,.2,.05,-.85,1.0,3.8,g);part(G.box,VM.light,.35,.2,.05,.85,1.0,3.8,g);
    const cargo=new THREE.Mesh(new THREE.BoxGeometry(2.4,2.5,5.2),[box,box,LMat('#5a3b22'),LMat('#3b2a1c'),box,box]);cargo.position.set(0,2.0,-1.1);cargo.castShadow=true;g.add(cargo);part(G.box,VX.trim,2.3,.25,6.9,0,.7,-.5,g);
    const back=new THREE.Mesh(new THREE.PlaneGeometry(2.3,2.4),new THREE.MeshLambertMaterial({map:hornTex}));back.position.set(0,2.0,-3.71);back.rotation.y=Math.PI;g.add(back);
    w=wheels2(g,[[-1.1,.5,2.7],[1.1,.5,2.7],[-1.1,.5,-2.0],[1.1,.5,-2.0],[-1.1,.5,-3.0],[1.1,.5,-3.0]],WG.heavy);}
  g.userData.wheels=w;bakeVeh(g);return g;}
function bakeVeh(g){const keep=new Set(g.userData.wheels||[]);if(g.userData.lights)g.userData.lights.forEach(m=>keep.add(m));const by=new Map();
  for(const c of g.children.slice()){if(!c.isMesh||keep.has(c)||Array.isArray(c.material)||c.material.transparent||c.material.map)continue;c.updateMatrix();const geo=c.geometry.clone();geo.applyMatrix4(c.matrix);if(!geo.index){}const k=c.material.uuid;if(!by.has(k))by.set(k,{mat:c.material,geos:[]});by.get(k).geos.push(geo);g.remove(c);}
  for(const {mat,geos} of by.values()){const m=new THREE.Mesh(merge(geos),mat);m.castShadow=true;g.add(m);}}
const vehicles=[];
const headL=new THREE.SpotLight(0xfff1c8,0,70,.55,.6,1),headT=new THREE.Object3D();headL.target=headT;scene.add(headL);scene.add(headT);
function makeVeh(type,x,z,h,state='parked',opts={}){const m=buildVeh(type,opts.colorMat);m.position.set(x,0,z);m.rotation.y=h;scene.add(m);
  const v={m,type,spec:SPEC[type],v:0,h,steer:0,pos:m.position,state,owned:false,hp:opts.hp!=null?opts.hp:100,fuel:opts.fuel!=null?opts.fuel:MR(35,95),stopT:0,blockT:0,lane:null,ai:null,dead:false,fallen:false,lean:0,smokeT:0,company:!!opts.company};
  if(m.userData.driver)m.userData.driver.visible=state==='traffic';vehicles.push(v);return v;}
function removeVeh(v){scene.remove(v.m);const i=vehicles.indexOf(v);if(i>=0)vehicles.splice(i,1);}
function segDist(px,pz,v){const fx=Math.sin(v.h),fz=Math.cos(v.h),half=Math.max(0,v.spec.len/2-v.spec.wid/2);let t=(px-v.pos.x)*fx+(pz-v.pos.z)*fz;t=clamp(t,-half,half);const qx=v.pos.x+fx*t,qz=v.pos.z+fz*t,dx=px-qx,dz=pz-qz;return{d:Math.hypot(dx,dz),dx,dz};}

/* lanes */
function lanePos(l,out){const e=l.e;const bx=e.ax+e.dx*l.s,bz=e.az+e.dz*l.s;const fx=e.dx*l.dir,fz=e.dz*l.dir;out.x=bx+fz*e.lane;out.z=bz-fx*e.lane;out.h=Math.atan2(fx,fz);return out;}
const _lp={x:0,z:0,h:0};
function placeLane(v){lanePos(v.lane,_lp);v.pos.set(_lp.x,0,_lp.z);v.h=_lp.h;v.m.rotation.y=v.h;}
function nextLane(l){const e=l.e;const r=e.road;const nk=e.k+(l.dir>0?1:-1);const ne=r.edges.find(q=>q.k===nk);if(ne){l.e=ne;l.s=l.dir>0?0:ne.len;return;}
  const px=l.dir>0?e.bx:e.ax,pz=l.dir>0?e.bz:e.az;const cand=[];for(const ox of [-RH,0,RH])for(const oz of [-RH,0,RH])for(const id of edgesNear(px+ox,pz+oz)){const q=EDGES[id];if(q===e||q.kind==='bridge'&&q.road.name.includes('Haji'))continue;
    if(Math.hypot(q.ax-px,q.az-pz)<14)cand.push([q,1]);else if(Math.hypot(q.bx-px,q.bz-pz)<14)cand.push([q,-1]);}
  if(cand.length){const [q,d]=mpick(cand);l.e=q;l.dir=d;l.s=d>0?0:q.len;return;}l.dir=-l.dir;}
function randomLaneNear(cx,cz,rmin,rmax){for(let k=0;k<25;k++){const a=Math.random()*6.283,r=MR(rmin,rmax);const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;const ids=edgesNear(x,z);if(!ids.length)continue;const e=EDGES[mpick(ids)];if(e.road.name.includes('Haji'))continue;
  const l={e,dir:Math.random()<.5?1:-1,s:MR(0,e.len)};lanePos(l,_lp);const d=Math.hypot(_lp.x-cx,_lp.z-cz);if(d>=rmin*.8&&d<=rmax*1.1)return l;}return null;}
const TT=['taxi','taxi','taxi','car','car','car','sedan','bus','truck','auto','auto','auto','bike','bike','suv','cycle'];
const TTOWN=['auto','auto','bike','bike','bike','car','truck','bus','suv','cycle','rickshaw','sedan'];
function trafficTypeAt(x,z){const zz=zoneAt(x,z);if(!zz)return mpick(['truck','truck','bus','car','sedan','suv','bike','taxi']);if(zz.id==='mumbai')return mpick(TT);return mpick(TTOWN);}
function spawnTraffic(far){const pp=ppos();const l=randomLaneNear(pp.x,pp.z,far?90:20,330);if(!l)return null;lanePos(l,_lp);const type=trafficTypeAt(_lp.x,_lp.z);const sp=SPEC[type];l.vmax=Math.min(sp.max*.55,type==='bus'||type==='truck'?MR(8,11):MR(9,15))*(l.e.kind==='city'?1:1.6);
  const v=makeVeh(type,0,0,0,'traffic');v.lane=l;v.v=l.vmax;placeLane(v);if(v.spec.two)addRider(v);return v;}
const riderMat=['#d9483b','#2f7fc1','#e8a628','#3aa66b','#f4f1ea'].map(c=>LMat(c));
function addRider(v){const r=buildPerson(mpick(pedCols));const U=r.userData;U.legs.forEach(l=>l.rotation.x=-1.25);U.arms.forEach(a=>a.rotation.x=-1.05);const seat=(v.spec.seat||[0,.95,-.2]);r.position.set(0,seat[1]-.82,seat[2]-.05);
  if(v.type!=='cycle'){const h=new THREE.Mesh(G.sph,mpick([VM.black,VM.red,VM.white,VM.blue]));h.scale.set(.17,.16,.19);h.position.set(0,1.75,0);r.add(h);}v.m.add(r);v.m.userData.driver=r;}

/* ================= player ================= */
/* ---------- people: human proportions, faces, hands and shoes ---------- */
const PG={torso:new THREE.CylinderGeometry(.26,.21,.6,10),hips:new THREE.CylinderGeometry(.215,.225,.2,10),neck:new THREE.CylinderGeometry(.062,.072,.13,8),head:new THREE.SphereGeometry(1,14,10),
  cap:new THREE.SphereGeometry(1,12,8,0,Math.PI*2,0,Math.PI*.56),eye:new THREE.SphereGeometry(1,6,4),box:new THREE.BoxGeometry(1,1,1),leg:new THREE.CylinderGeometry(.095,.075,.82,8),
  sleeve:new THREE.CylinderGeometry(.078,.068,.34,8),fore:new THREE.CylinderGeometry(.058,.048,.33,8),hand:new THREE.SphereGeometry(1,8,6),skirt:new THREE.CylinderGeometry(.2,.35,.9,12),bun:new THREE.SphereGeometry(1,8,6)};
const SKIN=['#8d5524','#a0673f','#b97a4f','#c68642','#7b4a2e','#d19a6a'],HAIRC=['#141010','#1e1612','#2b1d14','#3a2a20'],SHOES=['#2a1d14','#1b1b1d','#5a3b22','#6b6b6b'];
const PANTS=['#2d3142','#4a4e57','#3b3024','#1f3a5f','#e9e4d6'],SAREE=['#c2185b','#f57c00','#1565c0','#2e7d32','#f9a825','#6a1b9a','#00838f','#d84315'];
function cgeo(geo,col,sx,sy,sz,x,y,z,rx=0,rz=0){const g=geo.clone();g.scale(sx,sy,sz);if(rx)g.rotateX(rx);if(rz)g.rotateZ(rz);g.translate(x,y,z);const n=g.attributes.position.count,c=new Float32Array(n*3),C=new THREE.Color(col);for(let i=0;i<n;i++){c[i*3]=C.r;c[i*3+1]=C.g;c[i*3+2]=C.b;}g.setAttribute('color',new THREE.BufferAttribute(c,3));return g;}
function mergeC(list){let vc=0,ic=0;for(const g of list){vc+=g.attributes.position.count;ic+=g.index?g.index.count:g.attributes.position.count;}const pos=new Float32Array(vc*3),nor=new Float32Array(vc*3),col=new Float32Array(vc*3),idx=new Uint32Array(ic);let vo=0,io=0;
  for(const g of list){pos.set(g.attributes.position.array,vo*3);nor.set(g.attributes.normal.array,vo*3);col.set(g.attributes.color.array,vo*3);if(g.index){const a=g.index.array;for(let i=0;i<a.length;i++)idx[io++]=a[i]+vo;}else for(let i=0;i<g.attributes.position.count;i++)idx[io++]=vo+i;vo+=g.attributes.position.count;g.dispose();}
  const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.BufferAttribute(pos,3));o.setAttribute('normal',new THREE.BufferAttribute(nor,3));o.setAttribute('color',new THREE.BufferAttribute(col,3));o.setIndex(new THREE.BufferAttribute(idx,1));o.computeBoundingSphere();return o;}
const PEDMAT=new THREE.MeshLambertMaterial({vertexColors:true});const PMAT=new Map();const pm=c=>{if(!PMAT.has(c))PMAT.set(c,LMat(c));return PMAT.get(c);};
// One person = a body piece, two legs and two arms (5 draws), each part coloured per vertex. opts.mats keeps separate materials (the player, so outfits can recolour it).
function buildPerson(shirt,opts={}){const g=new THREE.Group();const shirtC=typeof shirt==='string'?shirt:'#'+shirt.color.getHexString();
  const female=opts.female!=null?opts.female:!opts.mats&&Math.random()<.4,skin=opts.skin||mpick(SKIN),hair=mpick(HAIRC),shoe=mpick(SHOES),pants=female?mpick(SAREE):mpick(PANTS),saree=female&&Math.random()<.7;
  const legC=saree?pants:female?mpick(PANTS):pants;
  const B=[[PG.torso,shirtC,1,1,.62,0,1.18,0],[PG.hips,legC,1,1,.64,0,.9,0],[PG.neck,skin,1,1,1,0,1.53,0],[PG.head,skin,.135,.165,.15,0,1.7,0],[PG.cap,hair,.145,.15,.158,0,1.71,-.005],
    [PG.hand,shirtC,.095,.085,.1,-.28,1.42,0],[PG.hand,shirtC,.095,.085,.1,.28,1.42,0],[PG.eye,'#141010',.018,.018,.012,-.047,1.715,.135],[PG.eye,'#141010',.018,.018,.012,.047,1.715,.135],[PG.box,skin,.03,.05,.04,0,1.675,.15]];
  if(female){B.push([PG.box,hair,.2,.34,.06,0,1.55,-.12],[PG.bun,hair,.07,.07,.07,0,1.7,-.16]);if(saree)B.push([PG.skirt,pants,1,1,.72,0,.47,0],[PG.box,pants,.08,.66,.3,.17,1.2,.01]);}
  else if(Math.random()<.35)B.push([PG.box,hair,.085,.016,.02,0,1.643,.147]);
  const legs=[],arms=[];let body,hairM=null;
  if(opts.mats){const byC=new Map();for(const q of B){const k=q[0]===PG.torso?'__shirt':q[1];if(!byC.has(k))byC.set(k,[]);byC.get(k).push(q);}
    for(const [k,list] of byC){const geo=merge(list.map(([gg,c,sx,sy,sz,x,y,z])=>{const t=gg.clone();t.scale(sx,sy,sz);t.translate(x,y,z);return t;}));const m=new THREE.Mesh(geo,k==='__shirt'?shirt:pm(k));m.castShadow=true;g.add(m);if(k==='__shirt')body=m;if(k===hair)hairM=m;}
    for(const sx of [-1,1]){const lp=new THREE.Group();lp.position.set(sx*.1,.86,0);const lm=new THREE.Mesh(PG.leg,opts.legM||pm(legC));lm.position.y=-.41;lm.castShadow=true;lp.add(lm);const sm=new THREE.Mesh(PG.box,pm(shoe));sm.scale.set(.12,.08,.25);sm.position.set(0,-.83,.045);lp.add(sm);g.add(lp);legs.push(lp);
      const ap=new THREE.Group();ap.position.set(sx*.31,1.44,0);const am=new THREE.Mesh(PG.sleeve,shirt);am.position.y=-.17;am.castShadow=true;ap.add(am);const fh=new THREE.Mesh(merge([(()=>{const t=PG.fore.clone();t.translate(0,-.5,0);return t;})(),(()=>{const t=PG.hand.clone();t.scale(.06,.065,.06);t.translate(0,-.69,0);return t;})()]),pm(skin));fh.castShadow=true;ap.add(fh);g.add(ap);arms.push(ap);}}
  else{body=new THREE.Mesh(mergeC(B.map(q=>cgeo(...q))),PEDMAT);body.castShadow=true;g.add(body);
    for(const sx of [-1,1]){const lp=new THREE.Group();lp.position.set(sx*.1,.86,0);const lm=new THREE.Mesh(mergeC([cgeo(PG.leg,legC,1,1,1,0,-.41,0),cgeo(PG.box,shoe,.12,.08,.25,0,-.83,.045)]),PEDMAT);lm.castShadow=true;lp.add(lm);g.add(lp);legs.push(lp);
      const ap=new THREE.Group();ap.position.set(sx*.31,1.44,0);const am=new THREE.Mesh(mergeC([cgeo(PG.sleeve,shirtC,1,1,1,0,-.17,0),cgeo(PG.fore,skin,1,1,1,0,-.5,0),cgeo(PG.hand,skin,.06,.065,.06,0,-.69,0)]),PEDMAT);am.castShadow=true;ap.add(am);g.add(ap);arms.push(ap);}}
  const legM=opts.legM||pm(legC);g.userData={legs,arms,body,head:body,hair:hairM||{visible:true},legM,female};return g;}
const avatar=buildPerson(LMat('#e8573e'),{mats:true,female:false,skin:'#a0673f'});scene.add(avatar);avatar.visible=false;
const AU=avatar.userData;
const gunMeshes={bat:part(G.box,LMat('#c99a5b'),.09,.09,1.1,0,-.6,.45,AU.arms[1]),pistol:part(G.box,VM.black,.1,.16,.4,0,-.62,.18,AU.arms[1]),shotgun:part(G.box,VM.black,.1,.12,1.1,0,-.6,.5,AU.arms[1])};
const outfitParts={kurta:part(G.box,LMat('#ffffff'),.66,.5,.4,0,.7,0,avatar),saree:(()=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.3,.46,.95,10),LMat('#ffffff'));m.position.y=.5;avatar.add(m);return m;})(),
  pallu:part(G.box,LMat('#ffffff'),.18,.85,.4,.22,1.2,0,avatar),glasses:part(G.box,VM.black,.34,.07,.05,0,1.75,.2,avatar),cap:part(G.sph,LMat('#2d6cdf'),.25,.12,.27,0,1.9,.02,avatar),
  helmet:part(G.sph,VM.black,.28,.28,.3,0,1.8,0,avatar),sneakers:[part(G.box,LMat('#ffffff'),.24,.12,.36,-.16,.06,.04,avatar),part(G.box,LMat('#ffffff'),.24,.12,.36,.16,.06,.04,avatar)]};
const player={mode:'drive',veh:null,pos:new THREE.Vector3(2940,0,8736),h:Math.PI/2,v:0,shake:0,anim:0,fireCd:0,arrestT:0,coolT:0,stars:0,hitCd:0,run:false,knock:0};
const ppos=()=>player.mode==='drive'&&player.veh?player.veh.pos:player.pos;
const WEAP={fist:{name:'Fists',range:1.9,rate:.45,melee:true},bat:{name:'Cricket bat',range:2.6,rate:.55,melee:true},pistol:{name:'Pistol',range:60,rate:.32,ammo:'pistol'},shotgun:{name:'Shotgun',range:28,rate:.95,ammo:'shotgun'}};

/* save */
function newSave(){return{v:3,name:'',age18:false,cash:CFG.startCash,bank:0,health:100,hunger:80,bladder:80,energy:85,weapons:['fist'],ammo:{pistol:0,shotgun:0},weapon:'fist',
  cars:[{type:'auto',fuel:80,hp:100,puc:0,ins:0}],homes:[],pos:null,inCar:0,trips:0,lic:{two:false,lmv:false,heavy:false},helmet:false,
  outfit:{top:'shirt',topCol:'#e8573e',botCol:'#2d3142',shoes:'chappal',glasses:false,cap:false},wardrobe:['shirt'],furniture:{},phone:'smart',challans:[],
  ratings:{},jobs:{},discovered:{},ach:{},daily:{last:'',streak:0},story:{step:0,done:false},biz:[],rent:{},seenVersion:'',robbedAt:-99,stats:{km:0,lions:0,trips:0,earned:0,fines:0},extra:{}};}
let P=store.get('ib.save.v3');const hadSave=!!P;
if(!P){const old=store.get('bb.save.v2');P=newSave();if(old){P.cash=old.cash||P.cash;P.bank=old.bank||0;P.weapons=old.weapons||P.weapons;P.ammo=Object.assign(P.ammo,old.ammo||{});P.homes=(old.homes||[]).filter(h=>W.homes.some(x=>x.id===h));
  P.cars=(old.cars||['auto']).map(t=>({type:SPEC[t]?t:'auto',fuel:80,hp:100,puc:0,ins:0}));P.trips=old.trips||0;}}
P=Object.assign(newSave(),P);for(const k of ['ammo','lic','outfit','stats','story','daily'])P[k]=Object.assign(newSave()[k],P[k]||{});
let dirty=false,lastSave=0;
function save(){if(!startedOnce){store.set('ib.save.v3',P);return;}if(player.mode==='drive'&&player.veh){P.pos={x:player.veh.pos.x,z:player.veh.pos.z,h:player.veh.h};P.inCar=player.veh.owned?player.veh.ownedIdx:null;}else if(!inside){P.pos={x:player.pos.x,z:player.pos.z,h:player.h};P.inCar=null;}
  for(const v of ownedVeh)if(v&&P.cars[v.ownedIdx]){const c=P.cars[v.ownedIdx];c.fuel=Math.round(v.fuel*10)/10;c.hp=Math.round(v.hp);c.x=Math.round(v.pos.x);c.z=Math.round(v.pos.z);c.h=+v.h.toFixed(2);}
  P.savedAt=Date.now();store.set('ib.save.v3',P);dirty=false;emit('save');}

/* owned vehicles */
const ownedVeh=[];
function spawnOwned(i,x,z,h){if(ownedVeh[i])removeVeh(ownedVeh[i]);const c=P.cars[i];c.garage=null;const v=makeVeh(c.type,x,z,h,'parked',{fuel:c.fuel,hp:c.hp,colorMat:c.color||undefined});v.owned=true;v.ownedIdx=i;ownedVeh[i]=v;
  if(c.neon){const sp=SPEC[c.type];const g=new THREE.PlaneGeometry(sp.wid*1.15,sp.len*1.05);g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c.neon,transparent:true,opacity:.55,depthWrite:false}));m.position.y=.06;v.m.add(m);}
  return v;}
// Put an owned vehicle away in a home garage: it leaves the street and waits there.
function storeOwned(i,homeId){const v=ownedVeh[i];const c=P.cars[i];if(!c)return;if(v){if(player.veh===v)exitVehicle(true);c.fuel=Math.round(v.fuel);c.hp=Math.round(v.hp);removeVeh(v);ownedVeh[i]=null;}c.x=null;c.z=null;c.garage=homeId;dirty=true;}
function roadSpotNear(p){const r=nearestRoadPoint(p.x,p.z,300);if(!r)return[p.x,p.z,0];const e=r.e;const nx=e.dz,nz=-e.dx;const o=e.w/2+1.4;return[r.x+nx*o,r.z+nz*o,Math.atan2(e.dx,e.dz)];}

/* ================= pedestrians, cows, wildlife ================= */
const peds=[];const pedCols=['#d9483b','#e8a628','#2f7fc1','#9b4fb5','#3aa66b','#ff6fa8','#f4f1ea','#1f8a8a','#c96a2a','#e9e4d6','#5c6b8a','#8b5e3c','#ffffff','#3c4a5c'];
function pedBlocksNear(x,z){return blocks.filter(b=>b.hasBld&&Math.abs(b.x-x)<230&&Math.abs(b.z-z)<230);}
function edgeXY(p){const off=29.4,b=p.b;if(p.side<2){p.x=b.x+p.t;p.z=b.z+(p.side?off:-off);p.ry=p.dir>0?Math.PI/2:-Math.PI/2;}else{p.z=b.z+p.t;p.x=b.x+(p.side===2?-off:off);p.ry=p.dir>0?0:Math.PI;}}
function placePed(p,minD){const pp=ppos();const bl=pedBlocksNear(pp.x,pp.z);if(!bl.length){p.g.visible=false;p.state='idle';return;}for(let k=0;k<12;k++){p.b=mpick(bl);p.side=Math.floor(Math.random()*4);p.t=MR(-26,26);p.dir=Math.random()<.5?1:-1;edgeXY(p);if(Math.hypot(p.x-pp.x,p.z-pp.z)>minD)break;}
  p.state='walk';p.sp=MR(1,1.8);p.g.rotation.set(0,0,0);p.g.visible=true;}
function addPed(){const g=buildPerson(mpick(pedCols));scene.add(g);const p={g,x:0,z:0,ry:0,state:'walk',ph:Math.random()*6};placePed(p,started?60:0);peds.push(p);return p;}
function setPedCount(n){while(peds.length<n)addPed();while(peds.length>n){const p=peds.pop();scene.remove(p.g);}}
function knockPed(p,crime){if(p.state==='down')return;p.state='down';p.downT=14;p.g.rotation.set(-Math.PI/2,p.ry,0,'YXZ');if(crime)addWanted(1,crime);emit('pedDown',p);}
function fleeFrom(x,z,r){for(const p of peds){if(p.state!=='walk'&&p.state!=='flee')continue;if(Math.hypot(p.x-x,p.z-z)<r){p.state='flee';p.fleeT=8;const ex=p.side<2?1:0,ez=1-ex;p.dir=Math.sign(((p.x-x)*ex+(p.z-z)*ez)||1);}}}
function ejectDriver(v){const p=peds.find(q=>q.state==='walk'&&Math.hypot(q.x-ppos().x,q.z-ppos().z)>40)||peds[0];if(!p)return;const sx=Math.cos(v.h),sz=-Math.sin(v.h);p.x=v.pos.x+sx*(v.spec.wid/2+.8);p.z=v.pos.z+sz*(v.spec.wid/2+.8);const a=Math.atan2(p.x-v.pos.x,p.z-v.pos.z);p.vx=Math.sin(a)*5;p.vz=Math.cos(a)*5;p.ry=a;p.state='run';p.runT=6;p.g.visible=true;p.g.rotation.set(0,a,0);}
function buildAnimal(kind){const g=new THREE.Group();const m=kind==='cow'?M.cow:kind==='lion'?M.lion:kind==='tiger'?M.tiger:M.camel;const s=kind==='camel'?1.25:1;
  part(G.box,m,.7*s,.7*s,1.7*s,0,.95*s,0,g);const hd=part(G.box,m,.4,.4,.55,0,1.25*s+(kind==='camel'?.8:0),.95*s,g);if(kind==='camel'){part(G.box,m,.25,1.1,.3,0,1.6,.75,g);part(G.sph,m,.45,.4,.5,0,1.5,-.1,g);}
  if(kind==='lion')part(G.sph,LMat('#8a5a2a'),.4,.42,.32,0,1.3,.8,g);if(kind==='tiger')for(let i=0;i<4;i++)part(G.box,M.dark,.72,.08,.08,0,1.1,-.5+i*.3,g);if(kind==='cow')part(G.box,M.wood,.5,.06,.06,0,1.5,1.05,g);
  const legs=[];for(const [x,z] of [[-.25,.6],[.25,.6],[-.25,-.6],[.25,-.6]]){const p=new THREE.Group();p.position.set(x*s,.65*s,z*s);part(G.box,m,.16,.7*s,.16,0,-.32*s,0,p);g.add(p);legs.push(p);}g.userData={legs};scene.add(g);return g;}
const animals=[];
const FAUNA=[{kind:'lion',x:1800,z:5780,rx:330,rz:200,n:7},{kind:'tiger',x:6000,z:2150,rx:260,rz:170,n:5},{kind:'camel',x:1030,z:1310,rx:160,rz:140,n:7},{kind:'camel',x:4220,z:1860,rx:90,rz:70,n:4}];
for(const f of FAUNA)for(let i=0;i<f.n;i++){const g=buildAnimal(f.kind);g.visible=false;const a={g,kind:f.kind,area:f,x:f.x+MR(-.6,.6)*f.rx,z:f.z+MR(-.6,.6)*f.rz,h:MR(0,6.28),sp:0,t:0};animals.push(a);}
const cows=[];for(let i=0;i<8;i++){const g=buildAnimal('cow');g.visible=false;cows.push({g,kind:'cow',x:0,z:0,h:0,active:false,t:0});}
function updAnimals(dt,now){const pp=ppos();
  for(const a of animals){const near=Math.hypot(a.area.x-pp.x,a.area.z-pp.z)<a.area.rx+500;a.g.visible=near&&!inside;if(!near)continue;a.t-=dt;if(a.t<=0){a.t=MR(2,6);a.sp=Math.random()<.5?0:MR(.6,1.6);a.h+=MR(-1.4,1.4);}
    const dx=pp.x-a.x,dz=pp.z-a.z,d=Math.hypot(dx,dz);
    if((a.kind==='lion'||a.kind==='tiger')&&d<14&&player.mode==='foot'&&!inside){a.h=Math.atan2(dx,dz);a.sp=4;if(d<2.2&&player.hitCd<=0){damage(14,a.kind==='lion'?'A lion swiped at you':'A tiger pounced');player.hitCd=1.2;toast(a.kind==='lion'?'Lion! Back to the jeep!':'Tiger! Run!','#ff5d73');}}
    let nx=a.x+Math.sin(a.h)*a.sp*dt,nz=a.z+Math.cos(a.h)*a.sp*dt;if(inE(a.area,nx,nz)>1||isWater(nx,nz)){a.h+=Math.PI*.7;}else{a.x=nx;a.z=nz;}
    a.g.position.set(a.x,0,a.z);a.g.rotation.y=a.h;const sw=a.sp>0?Math.sin(now*a.sp*4)*.5:0;const L=a.g.userData.legs;L[0].rotation.x=L[3].rotation.x=sw;L[1].rotation.x=L[2].rotation.x=-sw;}
  const zz=zoneAt(pp.x,pp.z,200);const town=zz&&zz.id!=='mumbai';
  for(const c of cows){if(!c.active){if(town&&!inside&&Math.random()<.01){const r=randomLaneNear(pp.x,pp.z,60,200);if(r&&r.e.kind==='city'){lanePos(r,_lp);c.x=_lp.x;c.z=_lp.z;c.h=_lp.h+MR(-.4,.4);c.active=true;c.g.visible=true;c.t=MR(30,80);}}continue;}
    c.t-=dt;const d=Math.hypot(c.x-pp.x,c.z-pp.z);if(c.t<=0&&d>120||d>320||inside){c.active=false;c.g.visible=false;continue;}
    if(Math.random()<.01)c.h+=MR(-.8,.8);const sp=.35;const nx=c.x+Math.sin(c.h)*sp*dt,nz=c.z+Math.cos(c.h)*sp*dt;if(roadAt(nx,nz)){c.x=nx;c.z=nz;}else c.h+=Math.PI/2;c.g.position.set(c.x,0,c.z);c.g.rotation.y=c.h;}}

/* ================= Mumbai local train and planes ================= */
const localTrains=[];
function buildTrain(){const g=new THREE.Group();const cm=LMat('#d8d0bf'),stripe=LMat('#7b2a5e');for(let i=0;i<7;i++){part(G.box,cm,3,3.2,11.5,0,2,i*12,g);part(G.box,stripe,3.05,.5,11.6,0,1.2,i*12,g);for(let k=0;k<4;k++)part(G.box,VM.dark,3.08,.9,1.4,0,2.4,i*12-4+k*2.6,g);}g.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(g);return g;}
for(let i=0;i<2;i++){const g=buildTrain();localTrains.push({g,z:i?8800:8150,dir:i?-1:1,wait:0,x:i?2902.2:2897.8});}
const LSTATIONS=[8140,8300,8540,8860];
function updTrains(dt){const pp=ppos();const rush=(clockH>=8&&clockH<11)||(clockH>=17&&clockH<21);localTrains.forEach((t,i)=>{const near=Math.abs(pp.x-2900)<900&&pp.z>7600&&pp.z<9400;t.g.visible=near&&!inside&&(i===0||rush);if(!t.g.visible)return;
  if(t.wait>0){t.wait-=dt;return;}const nz=t.z+t.dir*16*dt;for(const s of LSTATIONS){if((t.z-s)*(nz-s)<0){t.wait=6;}}t.z=nz;if(t.z>8880){t.dir=-1;t.z=8880;t.wait=8;}if(t.z<8080){t.dir=1;t.z=8080;t.wait=8;}
  t.g.position.set(t.x,0,t.z-(t.dir>0?78:0));t.g.rotation.y=0;
  const half=42,cz=t.z+(t.dir>0?-36:36);if(Math.abs(pp.x-t.x)<3.4&&Math.abs(pp.z-cz)<half&&player.hitCd<=0&&!inside){damage(30,'Hit by a local train');player.hitCd=1.5;toast('Stay off the tracks!','#ff5d73');if(player.mode==='drive'&&player.veh){player.veh.v=0;player.veh.hp-=40;player.veh.pos.x+=pp.x<t.x?-5:5;}else player.pos.x+=pp.x<t.x?-5:5;}});}
function updPlanes(dt){const pp=ppos();for(const ap of airportPlanes){const a=ap.a;const d=Math.hypot(a.x-pp.x,a.z-pp.z);if(ap.t<0){ap.next-=dt;if(ap.next<=0&&d<1100){ap.t=0;ap.fly.visible=true;}continue;}
  ap.t+=dt;const T=ap.t;const along=-a.L/2+Math.min(a.L*1.6,2*T*T);const y=T>9?(T-9)*(T-9)*2.2:2.6;ap.fly.position.set(a.x+along,y,a.z);ap.fly.rotation.set(-(T>9?Math.min(.25,(T-9)*.05):0),Math.PI/2,0,'YXZ');
  if(T>32){ap.t=-1;ap.fly.visible=false;ap.next=MR(60,140);}}}

/* ================= police + wanted ================= */
const AGGR={off:0,easy:.6,normal:1,hard:1.5};
function addWanted(n,why){if(CFG.police==='off'||inside)return;const before=player.stars;player.stars=Math.min(5,player.stars+n);player.coolT=0;if(player.stars>before){toast(`${why} · police alerted`,'#ff5d73');emit('stars',player.stars);}renderStars();}
function renderStars(){const el=$('#stars');let h='';for(let i=0;i<5;i++){const on=i<player.stars;h+=`<svg viewBox="0 0 24 24" class="${on?'on':''}"><path d="M12 2.5l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.7 6.2 20l1.4-6.4L2.7 9.2l6.5-.7z" fill="${on?'#ffc93c':'rgba(255,255,255,.18)'}" stroke="${on?'#7a4a00':'none'}" stroke-width="1"/></svg>`;}el.innerHTML=player.stars?h:'';}
let policeSpawnT=0;
function spawnPolice(){const pp=ppos();const l=randomLaneNear(pp.x,pp.z,110,170);if(!l)return;lanePos(l,_lp);const v=makeVeh('police',_lp.x,_lp.z,Math.atan2(pp.x-_lp.x,pp.z-_lp.z),'police');v.ai={stuck:0,shootT:2};v.hp=100;}
function updPolice(dt,now){const pp=ppos();const cops=vehicles.filter(v=>v.state==='police');const aggr=AGGR[CFG.police]||0;
  if(player.stars>0&&!inside){const want=Math.round(Math.min(8,player.stars*(player.stars>=3?2:1.4))*aggr);policeSpawnT-=dt;if(cops.filter(c=>!c.dead).length<want&&policeSpawnT<=0){spawnPolice();policeSpawnT=2.5;}}
  let near=false;
  for(const c of cops){const dx=pp.x-c.pos.x,dz=pp.z-c.pos.z,d=Math.hypot(dx,dz);
    if(player.stars===0||inside){if(d>40||inside){removeVeh(c);continue;}c.v*=.95;}
    if(c.m.userData.lights){const f=Math.floor(now*6)%2;c.m.userData.lights[0].material=f?VM.sirR:VM.dark;c.m.userData.lights[1].material=f?VM.dark:VM.sirB;}
    if(c.dead||player.stars===0)continue;if(d<70)near=true;
    const want=Math.atan2(dx,dz),diff=wrapA(want-c.h);c.steer=clamp(diff*2,-1,1);const tv=d>14?c.spec.max*(.75+.25*aggr):d>7?7:0;c.v+=clamp(tv-c.v,-25*dt,c.spec.acc*dt);
    c.h+=c.steer*c.spec.turn*clamp(Math.abs(c.v)/7,0,1)*dt;const nx=c.pos.x+Math.sin(c.h)*c.v*dt,nz=c.pos.z+Math.cos(c.h)*c.v*dt;if(drivable(nx,nz)){c.pos.x=nx;c.pos.z=nz;}else c.v*=.3;
    if(collide(c.pos,1.2,false)&&c.v>6)c.v*=.6;if(c.v<2&&d>20)c.ai.stuck+=dt;else c.ai.stuck=Math.max(0,c.ai.stuck-dt);if(c.ai.stuck>3||d>260){removeVeh(c);continue;}
    c.m.rotation.y=c.h;for(const w of c.m.userData.wheels)w.rotation.x+=c.v*dt/.4;
    if(player.mode==='foot'){const s=segDist(pp.x,pp.z,c);if(s.d<c.spec.wid/2+.6&&c.v>5&&player.hitCd<=0){damage(12,'Hit by a police jeep');player.hitCd=1;player.pos.x+=s.dx/(s.d||1)*2;player.pos.z+=s.dz/(s.d||1)*2;}}
    if(player.stars>=3&&d<34){c.ai.shootT-=dt*aggr;if(c.ai.shootT<=0){c.ai.shootT=MR(1.1,1.8);tracer(c.pos.x,1.6,c.pos.z,pp.x+MR(-.5,.5),1.2,pp.z+MR(-.5,.5),0x9fd0ff);sfxShot(.5);damage(player.mode==='drive'?2:5,'Police fire');}}}
  if(player.stars>0){const close=cops.some(c=>!c.dead&&c.pos.distanceTo(pp)<7.5);const spd=player.mode==='drive'?Math.abs(player.veh.v):player.v;if(close&&spd<3.5)player.arrestT+=dt;else player.arrestT=Math.max(0,player.arrestT-dt*1.5);if(player.arrestT>2.6)busted();
    if(near)player.coolT=0;else{player.coolT+=dt;if(player.coolT>10+player.stars*3){player.stars--;player.coolT=0;renderStars();toast(player.stars?'Lost a star':'You lost the police','#3ddc97');emit('stars',player.stars);}}}
  $('#stars').classList.toggle('hot',near);}

/* ================= weapons ================= */
const tracers=[];
function tracer(x1,y1,z1,x2,y2,z2,col=0xfff1a0){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1,y1,z1),new THREE.Vector3(x2,y2,z2)]);const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.9}));scene.add(l);tracers.push({l,t:.09});}
const flash=new THREE.PointLight(0xffd27a,0,10);scene.add(flash);
function fire(){if(player.mode!=='foot'||inside||player.fireCd>0||uiLock()||player.knock>0)return;const Wp=WEAP[P.weapon];
  if(!Wp.melee&&!CFG.weapons){P.weapon='fist';updWeap();return;}if(Wp.ammo&&P.ammo[Wp.ammo]<=0){toast('Out of ammo · buy more at Hathiyar Ghar','#ff9f1c');P.weapon='fist';updWeap();return;}
  player.fireCd=Wp.rate;player.anim=.25;const ox=player.pos.x,oz=player.pos.z;const cone=Wp.melee?1.1:.32;let best=null,bd=1e9;const cand=[];
  for(const p of peds)if(p.state!=='down'&&p.g.visible)cand.push({k:'ped',o:p,x:p.x,z:p.z});for(const v of vehicles)if(v.state==='traffic'||v.state==='police')cand.push({k:'veh',o:v,x:v.pos.x,z:v.pos.z});
  for(const c of cand){const dx=c.x-ox,dz=c.z-oz,d=Math.hypot(dx,dz);const lim=Wp.range+(c.k==='veh'?c.o.spec.len/2:0);if(d>lim||d<.01)continue;const da=Math.abs(wrapA(Math.atan2(dx,dz)-player.h));if(da<cone&&d<bd){bd=d;best=c;}}
  if(Wp.melee){sfxPunch();if(best&&best.k==='ped'&&bd<Wp.range+.4){player.h=Math.atan2(best.x-ox,best.z-oz);knockPed(best.o,'Assault');fleeFrom(ox,oz,25);}return;}
  P.ammo[Wp.ammo]--;dirty=true;updWeap();sfxShot(1);flash.position.set(ox+Math.sin(player.h),1.4,oz+Math.cos(player.h));flash.intensity=3;let tx=ox+Math.sin(player.h)*Wp.range,tz=oz+Math.cos(player.h)*Wp.range;
  const hitOne=c=>{if(c.k==='ped')knockPed(c.o,null);else{const v=c.o;if(v.state==='police'){v.hp-=25;addWanted(1,'Shot at police');if(v.hp<=0){v.dead=true;v.v=0;}}else{v.stopT=8;}}};
  if(best){player.h=Math.atan2(best.x-ox,best.z-oz);tx=best.x;tz=best.z;hitOne(best);if(best.k==='ped')addWanted(1,'Attack');}
  if(P.weapon==='shotgun'){let n=0;for(const c of cand){if(c===best||n>=2)continue;const dx=c.x-ox,dz=c.z-oz,d=Math.hypot(dx,dz);if(d<16&&Math.abs(wrapA(Math.atan2(dx,dz)-player.h))<.25){hitOne(c);n++;}}}
  tracer(ox+Math.sin(player.h)*.6,1.35,oz+Math.cos(player.h)*.6,tx,1.1,tz);if(player.stars===0)addWanted(1,'Shots fired');fleeFrom(ox,oz,45);}
function cycleWeapon(){const list=P.weapons.filter(w=>CFG.weapons||WEAP[w].melee);const i=list.indexOf(P.weapon);P.weapon=list[(i+1)%list.length]||'fist';updWeap();}
function updWeap(){const Wp=WEAP[P.weapon]||WEAP.fist;const el=$('#weap');el.hidden=P.weapon==='fist'||!P.weapon;el.textContent=Wp.ammo?`${Wp.name} · ${P.ammo[Wp.ammo]}`:Wp.name;el.title='Weapon in hand · Q switches';for(const k in gunMeshes)gunMeshes[k].visible=k===P.weapon;}

/* ================= events + hooks ================= */
let started=false,startedOnce=false;document.body.classList.add('pre');
const bus={};function on(ev,fn){(bus[ev]=bus[ev]||[]).push(fn);}function emit(ev,d){for(const f of bus[ev]||[]){try{f(d);}catch(e){console.error(e);}}}
const hooks={update:[],start:[],afterRender:[],key:{}};const poiHandlers={};const missions=[];const speedMods=[];const apps=[];

/* ================= light + weather ================= */
const hemi=new THREE.HemisphereLight(0xffe6c4,0x4a3b55,.7);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffc48a,.95);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-110,right:110,top:110,bottom:-110,near:1,far:500});sun.shadow.bias=-0.0008;scene.add(sun);scene.add(sun.target);
const WX={clear:{dim:1,fn:180,ff:700,rain:0,grey:0},cloudy:{dim:.75,fn:140,ff:520,rain:0,grey:.45},rain:{dim:.6,fn:80,ff:340,rain:.5,grey:.6},monsoon:{dim:.45,fn:50,ff:240,rain:1,grey:.75},fog:{dim:.72,fn:14,ff:150,rain:0,grey:.7}};
const WLABEL={clear:'Clear',cloudy:'Cloudy',rain:'Rain',monsoon:'Monsoon',fog:'Fog'};
const wx={cur:'clear',dim:1,fn:180,ff:700,rain:0,grey:0,flash:0};
function autoWeather(){const slot=Math.floor(gameMin()/240);const r=hash(slot*13.37+7);const m=istMonth();if(m>=6&&m<=9)return r<.25?'cloudy':r<.65?'rain':r<.9?'monsoon':'clear';if(m===10||m===11)return r<.62?'clear':r<.86?'cloudy':r<.94?'rain':'fog';if(m===12||m<=2)return r<.55?'clear':r<.8?'fog':'cloudy';return r<.75?'clear':r<.95?'cloudy':'rain';}
const RAIN_N=1600;const rainPos=new Float32Array(RAIN_N*6);const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xaabbd0,transparent:true,opacity:.5}));rain.frustumCulled=false;scene.add(rain);for(let i=0;i<RAIN_N;i++)rainPos[i*6+1]=-100;
function updRain(dt,cx,cy,cz){const n=Math.floor(RAIN_N*wx.rain);rain.visible=n>0&&!inside;if(!rain.visible)return;for(let i=0;i<RAIN_N;i++){const o=i*6;if(i>=n){rainPos[o+1]=rainPos[o+4]=-100;continue;}
  let y=rainPos[o+1]-48*dt;if(y<0||Math.abs(rainPos[o]-cx)>45||Math.abs(rainPos[o+2]-cz)>45){rainPos[o]=cx+MR(-45,45);rainPos[o+2]=cz+MR(-45,45);y=cy+MR(5,35);}rainPos[o+1]=y;rainPos[o+3]=rainPos[o]+.15;rainPos[o+4]=y+1.3;rainPos[o+5]=rainPos[o+2];}rainGeo.attributes.position.needsUpdate=true;}
const SKY=[[0,'#0d1030','#151a3a',.12,'#8fa4ff',.25,1],[5,'#0d1030','#151a3a',.12,'#8fa4ff',.25,1],[6.3,'#f2a1a7','#e9a99a',.5,'#ffb38a',.5,.4],[8,'#8ec5ee','#bcd8ea',.95,'#fff1d6',.75,0],[16,'#8ec5ee','#c9dcea',.95,'#fff1d6',.75,0],[17.6,'#f3a65a','#f0a868',.95,'#ffb36b',.7,0],[18.6,'#d8606a','#c86a70',.6,'#ff8a5c',.55,.35],[19.6,'#3a2a5c','#3b2f5a',.25,'#9f8cff',.35,.85],[21,'#0d1030','#151a3a',.12,'#8fa4ff',.25,1],[24,'#0d1030','#151a3a',.12,'#8fa4ff',.25,1]];
const cB=new THREE.Color(),greyC=new THREE.Color(),lampOff=new THREE.Color(0x666055),lampOn=new THREE.Color(0xffd27a);let nightF=0;
function updSky(dt){const target=CFG.weather==='auto'?autoWeather():CFG.weather;if(target!==wx.cur){wx.cur=target;emit('weather',target);}const Wt=WX[target]||WX.clear;const k=Math.min(1,dt*.8);for(const f of ['dim','fn','ff','rain','grey'])wx[f]+=(Wt[f]-wx[f])*k;
  let i=0;while(i<SKY.length-2&&SKY[i+1][0]<=clockH)i++;const a=SKY[i],b=SKY[i+1];const t=(clockH-a[0])/(b[0]-a[0]||1);nightF=a[6]+(b[6]-a[6])*t;greyC.set(0x8b9099).multiplyScalar(.2+.8*(1-nightF));
  scene.background.set(a[1]).lerp(cB.set(b[1]),t).lerp(greyC,wx.grey);scene.fog.color.set(a[2]).lerp(cB.set(b[2]),t).lerp(greyC,wx.grey);scene.fog.near=wx.fn;scene.fog.far=wx.ff;
  sun.intensity=(a[3]+(b[3]-a[3])*t)*wx.dim;sun.color.set(a[4]).lerp(cB.set(b[4]),t);hemi.intensity=(a[5]+(b[5]-a[5])*t)*(.55+.45*wx.dim)+wx.flash*2.5;hemi.color.copy(scene.fog.color).lerp(cB.set('#ffffff'),.4);
  const night=Math.max(nightF,(1-wx.dim)*.45);for(const m of styleCache.values())m.emissiveIntensity=night*.95;M.lamp.color.copy(lampOff).lerp(lampOn,night);headL.intensity=player.mode==='drive'&&!inside?night*2.2:0;
}
const sunDir=new THREE.Vector3();
function updSun(c){const a=(clockH-6)/12*Math.PI;const day=clockH>5.5&&clockH<19.5;if(day)sunDir.set(Math.cos(a),Math.max(Math.sin(a),.12),.35).normalize();else sunDir.set(-.3,.8,.5).normalize();sun.position.copy(c).addScaledVector(sunDir,220);sun.target.position.copy(c);}

/* ================= festivals, events, fares ================= */
const stateAt=(x,z)=>{const zz=zoneAt(x,z,60);if(zz)return zz.st;for(const sp of W.statePolys||[])if(pip(x,z,sp.pts))return sp.st;if(z<3000)return 'RJ';if(z<3550&&x>2400)return 'RJ';if(z<7000&&x<5200)return 'GJ';return 'MH';};
function activeFestivals(st){const iso=istISO();return CFG.festivals.filter(f=>f.start&&f.end&&f.start<=iso&&f.end>=iso&&(f.where==='all'||String(f.where).split(',').map(s=>s.trim()).includes(st)));}
function activeEvents(){const iso=istISO();return CFG.events.filter(e=>e.start<=iso&&e.end>=iso);}
function fareMultAt(x,z){let m=CFG.fareMul;const st=stateAt(x,z);for(const f of activeFestivals(st))m*=+f.mult||1;const zz=zoneAt(x,z,60);for(const e of activeEvents())if(zz&&e.zone===zz.id)m*=+e.mult||1;return m;}

/* ================= needs + damage ================= */
let warned={};let sleeping=false;
function damage(n,why){if(inside)return;P.health=Math.max(0,P.health-n);if(P.health<=0)knockedOut(why);}
speedMods.push(()=>P.health<25?.6:1); // badly hurt: vehicles go slower too
function updNeeds(dt){const gm=dt*CFG.timeSpeed;if(!CFG.needs){P.hunger=P.bladder=P.energy=100;}else{const s=sleeping?.5:1;P.hunger-=100/(CFG.foodHrs*60)*gm*s;P.bladder-=100/(CFG.wcHrs*60)*gm*s;if(!sleeping)P.energy-=100/(CFG.awakeHrs*60)*gm*(player.run&&player.mode==='foot'?1.6:1)*(player.veh&&player.veh.spec.pedal&&Math.abs(player.veh.v)>1?1.8:1);}
  P.hunger=clamp(P.hunger,0,100);P.bladder=clamp(P.bladder,0,100);P.energy=clamp(P.energy,0,100);
  // Empty needs wear health down slowly, but never knock you out: eat, sleep or see a doctor to get it back.
  if(!inside&&!waitOpen()&&CFG.needs){const drain=(P.hunger<=0?.12:0)+(P.bladder<=0?.05:0)+(P.energy<=0?.06:0);if(drain&&P.health>10)P.health=Math.max(10,P.health-drain*dt);}
  if(P.hunger>60&&P.bladder>40&&P.energy>50&&P.health<100)P.health=Math.min(100,P.health+dt*.03);
  if(P.health<25&&!warned.health){warned.health=1;toast('Health low · you move slower. Eat, sleep or visit a hospital','#ff5d73');}if(P.health>35)warned.health=0;
  for(const [k,msg] of [['hunger','You need food · find an orange marker'],['bladder','You need a toilet · find a WC marker'],['energy','You need sleep · home, lodge or dharamshala']]){if(P[k]<22&&!warned[k]){warned[k]=1;toast(msg,'#ff9f1c');}if(P[k]>40)warned[k]=0;}}
function setMeter(id,v){const el=$(id);el.querySelector('i').style.width=v+'%';el.classList.toggle('low',v<22);}
let overT=0;
function teleport(x,z,h,opts={}){if(inside)leaveHome(true);if(player.mode==='drive'&&!opts.keepCar)exitVehicle(true);player.pos.set(x,0,z);player.h=h||0;camSnap=true;emit('teleport',{x,z});}
function respawnAt(x,z,h){teleport(x,z,h);player.stars=0;player.arrestT=0;renderStars();for(const v of vehicles.slice())if(v.state==='police')removeVeh(v);}
function nearestPoi(type,x,z){let b=null,bd=1e9;for(const p of pois)if(p.type===type){const d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;b=p;}}return b;}
function knockedOut(why){if(overT>0)return;overT=3;big('KNOCKED OUT','#ff5d73');const fee=Math.min(P.cash,cost('svc.ko',1000));P.cash-=fee;emit('ko');
  setTimeout(()=>{const h=nearestPoi('hospital',ppos().x,ppos().z);respawnAt(h.x+Math.sin(h.rot)*2,h.z+Math.cos(h.rot)*2,h.rot);P.health=100;P.hunger=Math.max(P.hunger,50);P.bladder=Math.max(P.bladder,60);P.energy=Math.max(P.energy,50);save();toast(`${h.name} · treatment ${inr(fee)}`,'#ffc93c');},1800);}
function busted(){if(overT>0)return;overT=3;big('BUSTED','#5fb4ff');const fine=Math.min(P.cash,Math.max(price(500),Math.round(P.cash*.15)));P.cash-=fine;P.weapons=P.weapons.filter(w=>WEAP[w].melee);P.ammo={pistol:0,shotgun:0};if(!P.weapons.includes(P.weapon))P.weapon='fist';emit('bust');
  setTimeout(()=>{const s=nearestPoi('police',ppos().x,ppos().z);respawnAt(s.x+Math.sin(s.rot)*2,s.z+Math.cos(s.rot)*2,s.rot);updWeap();save();toast(`Released · fine ${inr(fine)}, guns taken`,'#5fb4ff');},1800);}
function addChallan(){} // traffic fines were removed in v3.9

/* ================= entering and leaving vehicles ================= */
function enterVehicle(v){if(v.state==='traffic'){ejectDriver(v);addWanted(1,'Carjacking');if(v.m.userData.driver&&v.spec.two){v.m.remove(v.m.userData.driver);v.m.userData.driver=null;}}
  else if(v.state==='police'){if(!v.dead)addWanted(2,'Stole a police jeep');}
  if(v.fallen){v.fallen=false;}v.state='player';v.lane=null;v.v=0;player.veh=v;player.mode='drive';
  const ride=!!(v.spec.two||v.spec.pedal);avatar.visible=ride;if(v.m.userData.driver&&!v.spec.two)v.m.userData.driver.visible=true;
  v.m.add(headL);v.m.add(headT);headL.position.set(0,1.3,v.spec.len/2);headT.position.set(0,0,v.spec.len/2+12);
  emit('enterVehicle',v);toast(v.owned?`Your ${v.spec.label}`:v.spec.label,'#ffc93c');updAvatarGear();}
function exitVehicle(force){const v=player.veh;if(!v)return;if(!force&&Math.abs(v.v)>4){toast('Slow down to get out','#ff9f1c');return;}
  v.state='parked';v.v=0;v.m.remove(headL);v.m.remove(headT);scene.add(headL);scene.add(headT);headL.intensity=0;if(v.m.userData.driver&&!v.spec.two)v.m.userData.driver.visible=false;
  const sx=Math.cos(v.h),sz=-Math.sin(v.h);let px=v.pos.x+sx*(v.spec.wid/2+.9),pz=v.pos.z+sz*(v.spec.wid/2+.9);if(!drivable(px,pz)){px=v.pos.x-sx*(v.spec.wid/2+.9);pz=v.pos.z-sz*(v.spec.wid/2+.9);}
  player.pos.set(px,0,pz);player.h=v.h;player.mode='foot';player.veh=null;avatar.visible=true;avatar.rotation.set(0,player.h,0);collide(player.pos,.4,true);emit('exitVehicle',v);updAvatarGear();
  if(v.company)return;const extra=vehicles.filter(q=>q.state==='parked'&&!q.owned&&!q.company);if(extra.length>8){extra.sort((a,b)=>b.pos.distanceTo(player.pos)-a.pos.distanceTo(player.pos));removeVeh(extra[0]);}}
function nearestVeh(){let best=null,bd=1e9;for(const v of vehicles){if(v.state==='player'||v.state==='procession')continue;const s=segDist(player.pos.x,player.pos.z,v);const lim=v.spec.wid/2+1.8;if(s.d<lim&&s.d<bd){bd=s.d;best=v;}}return best;}
function fallOff(v,impact){exitVehicle(true);v.fallen=true;v.m.rotation.set(0,v.h,Math.PI/2.2,'YXZ');player.knock=1.6;const dmg=impact*(P.helmet?.45:1.4);damage(dmg,'Fell off');toast(P.helmet?'You fell off · the helmet saved you':'You fell off · buy a helmet!','#ff5d73');emit('fall');}

/* ================= outfits ================= */
const shirtMat=AU.body.material=LMat(P.outfit.topCol);AU.arms.forEach(a=>a.children[0].material=shirtMat);const legMat=LMat(P.outfit.botCol);AU.legs.forEach(l=>l.children[0].material=legMat);
function applyOutfit(){const o=P.outfit;shirtMat.color.set(o.topCol||'#e8573e');legMat.color.set(o.botCol||'#2d3142');outfitParts.kurta.visible=o.top==='kurta';outfitParts.kurta.material.color.set(o.topCol);
  outfitParts.saree.visible=outfitParts.pallu.visible=o.top==='saree';outfitParts.saree.material.color.set(o.topCol);outfitParts.pallu.material.color.set(o.topCol);AU.legs.forEach(l=>l.visible=o.top!=='saree'||player.mode==='drive');
  outfitParts.sneakers.forEach(s=>s.visible=o.shoes==='sneakers'&&o.top!=='saree');outfitParts.glasses.visible=!!o.glasses;updAvatarGear();}
function updAvatarGear(){const riding=player.mode==='drive'&&player.veh&&player.veh.spec.two&&player.veh.type!=='cycle';outfitParts.helmet.visible=riding&&P.helmet;outfitParts.cap.visible=!!P.outfit.cap&&!outfitParts.helmet.visible;AU.hair.visible=!outfitParts.helmet.visible;}

/* ================= interiors ================= */
let inside=null;const inter={scene:new THREE.Scene(),group:null,pois:[],w:0,d:0};
inter.scene.background=new THREE.Color('#120d1f');inter.scene.add(new THREE.HemisphereLight(0xfff0dc,0x3a3040,.75));const iLamp=new THREE.PointLight(0xffd7a0,1,40);iLamp.position.set(0,3.6,0);inter.scene.add(iLamp);
const HTYPE={chawl:{w:7,d:6,wall:'#7fb3a8',floor:'#8b5a3c',toilet:false,kit:'stove'},flat:{w:12,d:9,wall:'#efe3c8',floor:'#c9a27a',toilet:true,kit:'fridge',tv:true,view:0x5fa8d8},bungalow:{w:16,d:12,wall:'#f2e6cf',floor:'#a8784e',toilet:true,kit:'fridge',tv:true},
  cottage:{w:11,d:9,wall:'#e9dcc0',floor:'#8b5a3c',toilet:true,kit:'stove'},pol:{w:9,d:8,wall:'#d98a5a',floor:'#9a6a3a',toilet:true,kit:'stove'},haveli:{w:16,d:14,wall:'#e8967a',floor:'#b07a4a',toilet:true,kit:'fridge',tv:true},
  villa:{w:16,d:12,wall:'#f4f1ea',floor:'#d2b48c',toilet:true,kit:'fridge',tv:true,view:0x5fa8d8},tent:{w:8,d:7,wall:'#efe2c4',floor:'#c9a26b',toilet:false,kit:'stove'},
  portuguese:{w:14,d:11,wall:'#f2d16b',floor:'#a0522d',toilet:true,kit:'fridge',tv:true},hut:{w:8,d:7,wall:'#d9b98a',floor:'#c9a26b',toilet:true,kit:'stove',view:0x5fa8d8},
  nalukettu:{w:17,d:15,wall:'#f1e6cf',floor:'#5a3a24',toilet:true,kit:'stove',tv:true},houseboat:{w:14,d:6,wall:'#c9a06a',floor:'#7a5030',toilet:true,kit:'stove',view:0x3f86c1}};
const FURN={sofa:{name:'Sofa set',price:18000},tv:{name:'LED TV',price:25000},plant:{name:'Tulsi and money plant',price:800},rug:{name:'Jaipur dhurrie rug',price:4500},lamp:{name:'Brass lamp',price:2500},shelf:{name:'Bookshelf',price:7000},painting:{name:'Madhubani painting',price:6000},jhoola:{name:'Wooden jhoola swing',price:22000},puja:{name:'Puja shelf',price:3500},dining:{name:'Dining table',price:15000}};
function buildInterior(home){const H=HTYPE[home.type]||HTYPE.flat;if(inter.group)inter.scene.remove(inter.group);const g=new THREE.Group();const w=H.w,d=H.d;inter.w=w;inter.d=d;
  const wall=LMat(H.wall),floor=LMat(H.floor),wood=LMat('#6b4a32'),cloth=LMat('#3b5b8c'),white=LMat('#f1eee7'),dark=LMat('#202024'),green=LMat('#3e8c3a'),brass=LMat('#c9a227');
  const b=(sx,sy,sz,x,y,z,m)=>{const mm=new THREE.Mesh(G.box,m);mm.scale.set(sx,sy,sz);mm.position.set(x,y,z);g.add(mm);return mm;};
  b(w,.2,d,0,-.1,0,floor);b(w,3.6,.2,0,1.8,-d/2,wall);b(.2,3.6,d,-w/2,1.8,0,wall);b(.2,3.6,d,w/2,1.8,0,wall);
  const win=new THREE.Mesh(new THREE.PlaneGeometry(H.view?4:1.6,1.5),new THREE.MeshBasicMaterial({color:H.view||0x9fb7c7}));win.position.set(1,2.1,-d/2+.12);g.add(win);
  b(2.2,.45,1.3,-w/2+1.3,.3,-d/2+.9,wood);b(2.1,.25,1.2,-w/2+1.3,.65,-d/2+.9,white);b(.6,.18,1.1,-w/2+.55,.85,-d/2+.9,cloth);
  const ip=[{k:'bed',name:'Bed · sleep',x:-w/2+1.3,z:-d/2+2},{k:'door',name:'Door · go outside',x:0,z:d/2-.6}];
  if(H.kit==='fridge'){b(.7,1.9,.7,w/2-.5,.95,-d/2+1.6,white);ip.push({k:'fridge',name:'Fridge · eat',x:w/2-.5,z:-d/2+2.4});}else{b(1,.9,.5,w/2-.6,.45,d/2-1.4,wood);b(.4,.25,.4,w/2-.6,1,d/2-1.4,dark);ip.push({k:'stove',name:'Stove · cook dal-chawal',x:w/2-.6,z:d/2-2.1});}
  if(H.toilet){b(.12,2.4,2.2,-w/2+2.6,1.2,d/2-1.2,wall);const t=new THREE.Mesh(new THREE.CylinderGeometry(.25,.2,.45,10),white);t.position.set(-w/2+.8,.25,d/2-1);g.add(t);ip.push({k:'toilet',name:'Bathroom · use toilet',x:-w/2+.8,z:d/2-1.8});}
  const F=P.furniture[home.id]||[];const hasTv=H.tv||F.includes('tv');if(hasTv){b(1.8,1,.1,w/2-.2,1.6,0,dark);ip.push({k:'tv',name:'TV · watch cricket',x:w/2-1.2,z:0});}
  if(F.includes('sofa')||H.tv){b(2.4,.5,.9,-1,.35,1.2,cloth);b(2.4,.8,.25,-1,.7,1.6,cloth);}
  if(F.includes('rug'))b(2.2,.03,1.6,-.6,.02,.1,LMat('#b8483b'));if(F.includes('plant')){const pot=new THREE.Mesh(new THREE.CylinderGeometry(.25,.2,.4,8),LMat('#a85a3a'));pot.position.set(w/2-.6,.2,d/2-.6);g.add(pot);const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,0),green);leaf.position.set(w/2-.6,.75,d/2-.6);g.add(leaf);}
  if(F.includes('lamp')){b(.1,1.4,.1,-w/2+.4,.7,.6,brass);b(.4,.3,.4,-w/2+.4,1.45,.6,LMat('#ffe2a8'));}if(F.includes('shelf'))b(1.2,2,.35,w/2-.3,1,-d/2+3.2,wood);
  if(F.includes('painting'))b(1.4,.9,.05,-1.5,2.2,-d/2+.13,LMat('#d9483b'));if(F.includes('jhoola')){b(1.6,.1,.6,1.5,.6,-d/2+2.6,wood);b(.04,2.4,.04,.75,1.8,-d/2+2.6,dark);b(.04,2.4,.04,2.25,1.8,-d/2+2.6,dark);}
  if(F.includes('puja')){b(.8,.6,.4,-w/2+.3,1.4,-.8,brass);ip.push({k:'puja',name:'Puja shelf · light a diya',x:-w/2+.9,z:-.8});}if(F.includes('dining')){b(1.6,.08,.9,1.2,.75,1.6,wood);for(const dx of [-.6,.6])b(.08,.75,.08,1.2+dx,.37,1.6,wood);}
  inter.scene.add(g);inter.group=g;inter.pois=ip;}
function homeById(id){return W.homes.find(h=>h.id===id);}
function enterHome(poi){const home=homeById(poi.extra);if(!home)return;if(P.rent[home.id]){toast('Your tenants live here now · end the rental from Phone → Business','#ff9f1c');return;}buildInterior(home);inside={poi,home};player.mode='foot';player.pos.set(0,0,inter.d/2-1.2);player.h=Math.PI;scene.remove(avatar);inter.scene.add(avatar);avatar.visible=true;camSnap=true;
  for(const v of vehicles.slice())if(v.state==='police')removeVeh(v);if(player.stars){player.stars=0;renderStars();toast('You hid at home · the police gave up','#3ddc97');}emit('enterHome',home);}
function leaveHome(silent){if(!inside)return;const poi=inside.poi;inter.scene.remove(avatar);scene.add(avatar);inside=null;const o=1.8;player.pos.set(poi.x+Math.sin(poi.rot)*o,0,poi.z+Math.cos(poi.rot)*o);player.h=poi.rot;camSnap=true;}
function homeAction(k){if(k==='door')return leaveHome();
  if(k==='bed')return startSleep('Sleeping at home','Needs refill while the Bay clock keeps running');
  if(k==='fridge')return startActivity({title:'Eating leftovers',minutes:CFG.act.snack,effects:{hunger:45,bladder:-6}});
  if(k==='stove')return startActivity({title:'Cooking dal-chawal',minutes:CFG.act.cook,effects:{hunger:42}});
  if(k==='toilet')return startActivity({title:'In the bathroom',minutes:CFG.act.toilet,effects:{bladder:100}});
  if(k==='tv')return startActivity({title:'Watching cricket',sub:mpick(['India need 32 off 18 balls','Super over!','Rain delay at Wankhede','A century in the making']),minutes:CFG.act.tv,effects:{energy:10}});
  if(k==='puja'){toast('Diya lit · peace of mind','#ffc93c');P.energy=Math.min(100,P.energy+3);}}

/* ================= wait overlay: activities and queues ================= */
let wait=null;const waitOpen=()=>!!wait;
function openWait(o){wait=Object.assign({t:0},o);const el=$('#wait');el.hidden=false;el.innerHTML=`<div class="wcard"><div class="wk">${esc(o.kind||'Please wait')}</div><h2>${esc(o.title)}</h2><div class="wsub" id="wsub">${esc(o.sub||'')}</div><div class="wbar"><i id="wfill"></i></div><div class="wtime" id="wtime"></div>
  <div class="btnrow wbtns">${(o.buttons||[]).map(b=>`<button class="buy ghost" data-w="${b.id}">${esc(b.label)}</button>`).join('')}${hooks.bayGame?'<button class="buy ghost" data-w="__game">Play BayGame</button>':''}${o.cancel?`<button class="buy danger" data-w="__cancel">${esc(o.cancel)}</button>`:''}</div></div>`;
  el.onclick=e=>{const id=e.target.dataset&&e.target.dataset.w;if(!id)return;if(id==='__cancel'){const w=wait;closeWait();w.onCancel&&w.onCancel();return;}if(id==='__game'){hooks.bayGame();return;}const b=(wait.buttons||[]).find(x=>x.id===id);b&&b.fn();};for(const k in keys)keys[k]=false;}
function closeWait(){wait=null;$('#wait').hidden=true;sleeping=false;}
function tickWait(dt){if(!wait)return;wait.t+=dt;const f=Math.min(1,wait.t/wait.total);if(wait.onTick)wait.onTick(dt,f);$('#wfill').style.width=(f*100)+'%';const left=Math.max(0,Math.ceil(wait.total-wait.t));$('#wtime').textContent=wait.timeText?wait.timeText(left,f):`${left}s left`;
  if(f>=1){const w=wait;closeWait();w.onDone&&w.onDone();}}
// Food also heals: health goes up by half of what the dish fills, when you are hurt.
function healFx(fx){const o=Object.assign({},fx);const h=Math.max(0,fx.hunger||0)*.5+(fx.energy||0)*.3;if(h>0)o.health=(o.health||0)+h;return o;}
function startActivity(o){if(player.stars){toast('Lose the police first','#ff5d73');return;}const total=Math.max(2,o.minutes/Math.max(.05,CFG.timeSpeed));let applied=0;const eff=o.effects||{};
  openWait({kind:o.kind||'Activity',title:o.title,sub:o.sub||`${o.minutes} game minutes`,total,cancel:o.cancelLabel||'Stop',buttons:o.buttons,timeText:(l)=>`${l}s · Bay ${bayTime()}`,
    onTick:(dt,f)=>{const d=f-applied;applied=f;for(const k in eff)P[k]=clamp(P[k]+eff[k]*d,0,100);o.onTick&&o.onTick(dt,f);},onDone:()=>{dirty=true;o.onDone&&o.onDone();emit('activity',o);},onCancel:()=>{dirty=true;o.onCancel&&o.onCancel();}});}
function startSleep(title,sub){if(P.energy>85){toast('You are not sleepy yet','#d6c8e4');return;}const mins=CFG.act.sleep*(100-P.energy)/100;sleeping=true;
  startActivity({kind:'Sleeping',title,sub:sub+' · wake up any time',minutes:Math.max(20,mins),effects:{energy:100-P.energy,health:Math.max(0,(100-P.health)*.8*(100-P.energy)/100+(P.health<100?10:0))},cancelLabel:'Wake up',onDone:()=>{save();toast('Fully rested · game saved','#3ddc97');emit('sleep');},onCancel:()=>{save();toast('Up early · game saved','#d6c8e4');}});sleeping=true;}
const QLINES=['Bhaiya, jaldi karo!','Line mein raho, boss.','Ek minute, server down hai.','Chhutta nahi hai?','Uncle is paying in coins.'];
function startQueue(o){if(player.stars){toast('Lose the police first','#ff5d73');return;}const rush=(clockH>=8&&clockH<11)||(clockH>=17&&clockH<21);let ahead=o.ahead!=null?o.ahead:Math.floor(MR(0,rush?6:3));const svc=CFG.queue[o.place]||15;
  const total=Math.max(1,(ahead+1)*svc);openWait({kind:'Queue',title:o.title,sub:ahead?`${ahead} ${ahead===1?'person':'people'} ahead of you${rush?' · rush hour':''}`:'You are next',total,cancel:'Leave the queue',
    timeText:(l,f)=>{const pos=Math.ceil((1-f)*(ahead+1))-1;$('#wsub').textContent=pos>0?`${pos} ahead of you`:'Being served';return `~${l}s`;},
    buttons:[...(['petrol','cng'].includes(o.place)&&player.mode==='drive'?[{id:'honk',label:'Honk',fn:()=>{hornSfx();toast(mpick(QLINES),'#ffc93c');}}]:[]),{id:'cut',label:'Cut the queue',fn:()=>{closeWait();toast('Attendant: "Line mein aao!" · service refused','#ff5d73');}}],
    onDone:()=>{o.onServe&&o.onServe();}});}

/* ================= sheets ================= */
let sheetClose=null;const sheetOpen=()=>!$('#sheetWrap').hidden;
function openSheet(title,sub,body,bind,onClose){$('#sheet').onclick=null;$('#sheet').innerHTML=`<div class="shead"><div><h2>${title}</h2><div class="sub">${sub||''}</div></div><button class="x" aria-label="Close" data-close>×</button></div><div id="sbody">${body}</div>`;
  $('#sheetWrap').hidden=false;sheetClose=onClose||null;for(const k in keys)keys[k]=false;$$('.pad button').forEach(b=>b.classList.remove('on'));$('#sheet').querySelector('[data-close]').onclick=closeSheet;if(bind)bind($('#sheet'));}
function closeSheet(){$('#sheetWrap').hidden=true;if(sheetClose){const f=sheetClose;sheetClose=null;f();}}
$('#sheetWrap').addEventListener('click',e=>{if(e.target.id==='sheetWrap')closeSheet();});
const uiLock=()=>sheetOpen()||waitOpen()||!started;
function rowHtml(id,nm,sub,label,cls=''){return`<div class="row"><div class="nm">${nm}<small>${sub}</small></div><button class="buy ${cls}" data-id="${id}">${label}</button></div>`;}
function spend(n,allowBank){if(P.cash>=n){P.cash-=n;dirty=true;return true;}if(allowBank&&P.cash+P.bank>=n){P.bank-=n-P.cash;P.cash=0;dirty=true;return true;}toast(`Not enough ${allowBank?'money':'cash'} · you need ${inr(n)}`,'#ff5d73');return false;}
function earn(n,why){P.cash+=n;P.stats.earned+=n;dirty=true;emit('earn',{n,why});}

/* core shops */
const KIND_MIN=k=>CFG.act[k]||CFG.act.snack;
function foodSheet(poi){const list=W.menus[poi.extra]||W.menus.MH;openSheet(poi.name,`Cash ${inr(P.cash)} · Food ${Math.round(P.hunger)}%`,list.map(([id,nm,sub,p,fx,k])=>rowHtml(id,nm,`${sub} · ${KIND_MIN(k)} min`,inr(cost('food.'+poi.extra+'.'+id,p)))).join(''),
  s=>s.onclick=e=>{const id=e.target.dataset.id;if(!id)return;const it=list.find(i=>i[0]===id);if(!spend(cost('food.'+poi.extra+'.'+id,it[3])))return;closeSheet();emit('eat',it);startActivity({kind:'Eating',title:it[1],sub:poi.name,minutes:KIND_MIN(it[5]),effects:healFx(it[4]),onDone:()=>toast(`${it[1]} · tasty`,'#3ddc97')});});}
function bankSheet(poi){const gun=P.weapon==='pistol'||P.weapon==='shotgun';const amts=[500,5000,'all'];
  const body=`<div class="bal"><div><small>Cash</small><b>${inr(P.cash)}</b></div><div><small>Bank</small><b>${inr(P.bank)}</b></div></div>`+amts.map(a=>rowHtml('d'+a,a==='all'?'Deposit all cash':'Deposit '+inr(a),'At the counter · bank money is safe','Deposit')).join('')+
    amts.map(a=>rowHtml('w'+a,a==='all'?'Withdraw everything':'Withdraw '+inr(a),'ATM · there may be a queue','Withdraw','ghost')).join('')+(CFG.weapons?rowHtml('rob','Rob the bank',gun?'Grab the cash drawer. 3 stars at least.':'You need a gun in hand','Rob','danger'):'');
  openSheet(poi.name,'Savings account · counter and ATM',body,s=>s.onclick=e=>{const id=e.target.dataset.id;if(!id)return;
    if(id==='rob'){if(!gun){toast('Equip a pistol or shotgun first','#ff9f1c');return;}const hrs=gameMin()/60;if(hrs-P.robbedAt<6){toast('The vault is still empty · come back later','#ff9f1c');return;}const take=Math.round(MR(8000,20000)/100)*100;earn(take,'robbery');P.robbedAt=hrs;closeSheet();addWanted(Math.max(3-player.stars,1),'Bank robbery');toast(`+${inr(take)} · run!`,'#3ddc97');fleeFrom(player.pos.x,player.pos.z,60);return;}
    const a=id.slice(1),n=a==='all'?null:+a;if(id[0]==='d'){const v=n==null?P.cash:Math.min(n,P.cash);if(v<=0){toast('No cash to deposit','#ff9f1c');return;}P.cash-=v;P.bank+=v;save();emit('deposit',v);bankSheet(poi);}
    else{const v=n==null?P.bank:Math.min(n,P.bank);if(v<=0){toast('Your account is empty','#ff9f1c');return;}closeSheet();startQueue({place:'atm',title:'ATM queue',onServe:()=>{P.bank-=v;P.cash+=v;save();toast(`Withdrew ${inr(v)}`,'#3ddc97');}});}});}
const GUNSHOP=[['bat','Cricket bat','Close-range swing',600],['pistol','Pistol','Includes 24 rounds',8000],['shotgun','Shotgun','Includes 12 shells',20000],['ammoP','Pistol rounds','24 rounds',600],['ammoS','Shotgun shells','12 shells',900]];
function gunSheet(poi){if(!CFG.weapons){toast('Weapons are switched off in this world','#d6c8e4');return;}openSheet(poi.name,`Cash ${inr(P.cash)}`,GUNSHOP.map(([id,nm,sub,p])=>rowHtml(id,nm,sub,['bat','pistol','shotgun'].includes(id)&&P.weapons.includes(id)?'Owned':inr(cost('gun.'+id,p)),P.weapons.includes(id)?'ghost':'')).join(''),
  s=>s.onclick=e=>{const id=e.target.dataset.id;if(!id)return;const it=GUNSHOP.find(i=>i[0]===id);if(['bat','pistol','shotgun'].includes(id)&&P.weapons.includes(id))return;if(!spend(cost('gun.'+id,it[3])))return;
    if(id==='ammoP')P.ammo.pistol+=24;else if(id==='ammoS')P.ammo.shotgun+=12;else{P.weapons.push(id);P.weapon=id;if(id==='pistol')P.ammo.pistol+=24;if(id==='shotgun')P.ammo.shotgun+=12;}updWeap();save();emit('buy',{kind:'weapon',id});toast(`Bought ${it[1]}`,'#3ddc97');gunSheet(poi);});}
const SHOWROOM=[['auto','Auto rickshaw','CNG · no licence needed',12000],['car','Hatchback','Petrol · LMV licence',45000],['sedan','Sedan','Petrol · for cab jobs',85000],['suv','SUV','Diesel · big and tough',120000],['sports','Sports coupe','Top speed 110 km/h',250000]];
function buyVehicle(type,cost,near){if(!spend(cost,true))return false;P.cars.push({type,fuel:100,hp:100});const i=P.cars.length-1;const [x,z,h]=roadSpotNear(near);spawnOwned(i,x,z,h);save();emit('buy',{kind:'vehicle',type});toast(`${SPEC[type].label} is yours · parked outside`,'#3ddc97');return true;}
function carSheet(poi){openSheet(poi.name,`Cash ${inr(P.cash)} · bank money works too`,SHOWROOM.map(([id,nm,sub,p])=>rowHtml(id,nm,sub,inr(cost('veh.'+id,p)))).join('')+`<p class="note">Comes with a full tank.</p>`,
  s=>s.onclick=e=>{const id=e.target.dataset.id;if(!id)return;const it=SHOWROOM.find(i=>i[0]===id);if(buyVehicle(id,cost('veh.'+id,it[3]),{x:poi.x,z:poi.z}))closeSheet();});}
function realtySheet(poi){openSheet(poi.name,`Cash ${inr(P.cash)} · Bank ${inr(P.bank)}`,W.homes.map(h=>{const z=W.zones.find(q=>q.id===h.zone);return rowHtml(h.id,h.name,`${z?z.name:''} · ${HTYPE[h.type].toilet?'with bathroom':'shared toilet'}`,P.homes.includes(h.id)?'Owned':inr(cost('home.'+h.id,h.price)),P.homes.includes(h.id)?'ghost':'');}).join('')+`<p class="note">Homes are marked H on the map once you own them. Sleep, cook, decorate, hide from police, or rent them out.</p>`,
  s=>s.onclick=e=>{const id=e.target.dataset.id;if(id)buyHome(id,()=>realtySheet(poi));});}
function buyHome(id,done){const h=homeById(id);const c=cost('home.'+h.id,h.price);if(P.homes.includes(id))return;if(!spend(c,true))return;P.homes.push(id);save();emit('buy',{kind:'home',id});toast(`${h.name} is yours`,'#3ddc97');done&&done();}
function fuelSheet(poi){const v=player.veh;if(!v){toast('Drive in to refuel','#d6c8e4');return;}const sp=v.spec;if(!sp.fuel){toast(`A ${sp.label.toLowerCase()} runs on legs, not fuel`,'#d6c8e4');return;}
  const cng=poi.type==='cng';if(cng!==(sp.fuel==='cng')){toast(cng?'This pump only has CNG':`This ${sp.label.toLowerCase()} runs on CNG · find a CNG pump`,'#ff9f1c');return;}
  const per=CFG.fuel[sp.fuel]*CFG.priceMul;const unit='L';const need=(100-v.fuel)/100*sp.tank;const full=Math.ceil(need*per);
  openSheet(poi.name,`${sp.label} · ${Math.round(v.fuel)}% · ${inr(per)}/${unit}`,rowHtml('full','Fill it up',`${need.toFixed(1)} ${unit}`,inr(full))+rowHtml('500','₹500 worth',`${(500/per).toFixed(1)} ${unit}`,inr(500),'ghost')+rowHtml('200','₹200 worth',`${(200/per).toFixed(1)} ${unit}`,inr(200),'ghost'),
    s=>s.onclick=e=>{const id=e.target.dataset.id;if(!id)return;
      const amt=id==='full'?full:+id;if(amt<=0){toast('Tank is already full','#d6c8e4');return;}if(P.cash<amt){toast(`You need ${inr(amt)} in cash`,'#ff5d73');return;}closeSheet();
      startQueue({place:cng?'cng':'petrol',title:cng?'CNG pump queue':'Petrol pump queue',onServe:()=>{P.cash-=amt;v.fuel=Math.min(100,v.fuel+amt/per/sp.tank*100);dirty=true;emit('refuel',v);toast(`Filled · ${Math.round(v.fuel)}% tank`,'#3ddc97');}});});}
function hospitalSheet(poi){openSheet(poi.name,`Health ${Math.round(P.health)}%`,rowHtml('heal','Full treatment','Restores health to 100% · OPD queue',inr(cost('svc.hospital',300))),s=>s.onclick=e=>{if(!e.target.dataset.id)return;if(P.cash<cost('svc.hospital',300)){toast(`You need ${inr(cost('svc.hospital',300))}`,'#ff5d73');return;}closeSheet();
  startQueue({place:'hospital',title:'OPD queue',onServe:()=>{P.cash-=cost('svc.hospital',300);P.health=100;dirty=true;toast('Treated · health 100%','#3ddc97');}});});}
function policeSheet(poi){const ch=P.challans.reduce((a,c)=>a+c.amt,0);const fine=price(1000*player.stars);
  openSheet(poi.name,`${player.stars?player.stars+' star'+(player.stars>1?'s':''):'No wanted level'}`,(player.stars?rowHtml('fine','Surrender and pay','Clears your wanted level',inr(fine)):'')+''||'<p class="note">Nothing to pay · drive safe.</p>',
  s=>s.onclick=e=>{const id=e.target.dataset.id;if(id==='fine'&&spend(fine,true)){player.stars=0;renderStars();emit('stars',0);toast('Fine paid · record clear','#3ddc97');policeSheet(poi);}if(id==='ch'&&spend(ch,true)){P.challans=[];save();toast('All challans paid','#3ddc97');policeSheet(poi);}});}
function lodgeSheet(poi){const p=poi.name.includes('dharamshala')?cost('svc.dharamshala',200):poi.name.includes('tent')||poi.name.includes('camp')?cost('svc.camp',1500):cost('svc.lodge',600);openSheet(poi.name,'Rooms by the night',rowHtml('sleep','Sleep here',`Energy ${Math.round(P.energy)}% · includes a bathroom`,inr(p)),s=>s.onclick=e=>{if(!e.target.dataset.id)return;if(P.energy>85){toast('You are not sleepy yet','#d6c8e4');return;}if(!spend(p))return;closeSheet();P.bladder=100;startSleep(poi.name,'Room booked');});}
function safariSheet(poi){const camel=poi.type==='camel';const p=camel?cost('svc.camel',500):cost('svc.safari',800);openSheet(poi.name,camel?'Ride into the dunes at sunset':'Open jeep safari with a guide',rowHtml('go',camel?'Camel ride':'Lion safari',camel?'20 game minutes':'40 game minutes',inr(p)),s=>s.onclick=e=>{if(!e.target.dataset.id||!spend(p))return;closeSheet();
  startActivity({kind:camel?'Camel safari':'Safari',title:camel?'Swaying over the dunes':'Searching for lions',minutes:camel?20:40,effects:{energy:-4},onDone:()=>{if(camel){toast('Sunset over the Thar · unforgettable','#ffc93c');emit('camel');}else{const n=Math.floor(MR(1,5));P.stats.lions+=n;toast(`You spotted ${n} Asiatic lion${n>1?'s':''}!`,'#ffc93c');emit('safari',n);}}});});}
function openPoi(poi){const T=poi.type;if(player.stars&&!['police','home'].includes(T)){toast('Lose the police first · or surrender at a police station','#ff5d73');return;}if(poi.onUse)return poi.onUse(poi,api);if(poiHandlers[T])return poiHandlers[T](poi,api);
  if(T==='food')return foodSheet(poi);if(T==='toilet'){if(P.bladder>90){toast('You do not need to go','#d6c8e4');return;}const p=cost('svc.toilet',5);if(P.cash<p){toast(`You need ${inr(p)}`,'#ff5d73');return;}return startQueue({place:'toilet',title:poi.name,onServe:()=>{P.cash-=p;startActivity({kind:'Toilet',title:poi.name,minutes:CFG.act.toilet,effects:{bladder:100}});}});}
  if(T==='bank')return bankSheet(poi);if(T==='guns')return gunSheet(poi);if(T==='cars')return carSheet(poi);if(T==='realty')return realtySheet(poi);if(T==='pump'||T==='cng')return fuelSheet(poi);
  if(T==='home'){if(P.homes.includes(poi.extra))return enterHome(poi);const h=homeById(poi.extra);return openSheet(h.name,'For sale',rowHtml(h.id,h.name,'Buy it to sleep, cook, decorate and hide from the police',inr(cost('home.'+h.id,h.price))),s=>s.onclick=e=>{if(e.target.dataset.id)buyHome(h.id,()=>{closeSheet();enterHome(poi);});});}
  if(T==='hospital')return hospitalSheet(poi);if(T==='police')return policeSheet(poi);if(T==='lodge')return lodgeSheet(poi);if(T==='safari'||T==='camel')return safariSheet(poi);
  toast(`${poi.name} opens in a coming update`,'#d6c8e4');}

/* ================= phone ================= */
function addApp(a){apps.push(a);}
const ORDER={phone:['map','swiggy','zomato','baycart','football','baypay','roadside','radio','baygame','camera','baygram','story'],menu:['garage','jobs','wardrobe','business'],settings:['whatsnew','ach','admin']};
function appGrid(group){const smart=P.phone==='smart';const list=apps.filter(a=>(a.group||'phone')===group&&(!a.admin||adminOK)).sort((a,b)=>(ORDER[group].indexOf(a.id)+99)%99-(ORDER[group].indexOf(b.id)+99)%99);
  return `<div class="apps">${list.map(a=>`<button class="app${a.smart&&!smart?' locked':''}" data-app="${a.id}"><span>${esc(a.icon||'•')}</span>${esc(a.label)}</button>`).join('')}</div>`;}
function appClick(e){const b=e.target.closest('[data-app]');if(!b)return false;const a=apps.find(x=>x.id===b.dataset.app);if(a.smart&&P.phone!=='smart'){toast('Needs a smartphone · Mobile Point sells them','#ff9f1c');return true;}a.fn(api);return true;}
function phoneSheet(){const smart=P.phone==='smart';openSheet(smart?'📱 Smartphone':'📱 Keypad phone',`${istText()} · Bay ${bayTime()}`,appGrid('phone')+(smart?'':'<p class="note">Locked apps need a smartphone. Buy one at any Mobile Point.</p>'),s=>s.onclick=appClick);}
function menuSheet(){openSheet('Menu','Your vehicles, work, clothes and business',appGrid('menu'),s=>s.onclick=appClick);}
addApp({id:'garage',label:'Garage',icon:'🚗',group:'menu',fn:garageSheet});addApp({id:'whatsnew',label:"What's new",icon:'✨',group:'settings',fn:()=>whatsNew(false)});addApp({id:'admin',label:'Admin',icon:'🔑',group:'settings',admin:true,fn:()=>adminSheet()});
function garageSheet(){const pp=ppos();const homeNear=P.homes.map(id=>pois.find(q=>q.type==='home'&&q.extra===id)).find(q=>q&&Math.hypot(q.x-pp.x,q.z-pp.z)<45);
  openSheet('🚗 Garage',`${P.cars.length} vehicle${P.cars.length===1?'':'s'} · valet ${inr(cost('svc.valet',200))} brings one to the nearest road`,P.cars.map((c,i)=>{const v=ownedVeh[i];const d=v?Math.round(v.pos.distanceTo(pp)*2.4/100)/10:null;const val=Math.round(cost('veh.'+c.type,VALUE[c.type]||10000)*.5*Math.max(.3,(v?v.hp:c.hp)/100)/5)*5;
    const home=c.garage?homeById(c.garage):null;const here=home&&homeNear&&homeNear.extra===c.garage;const mods=[c.tune?'tuned':'',c.horn?'musical horn':'',c.neon?'underglow':''].filter(Boolean).join(', ');
    return `<div class="row"><div class="nm"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${c.color||'#9aa'};margin-right:6px;vertical-align:-1px"></span>${SPEC[c.type].label}${c.stolen?' · no papers':''}<small>${home?'In your garage at '+esc(home.name):v?d+' km away':'Not on the street'} · fuel ${Math.round(v?v.fuel:c.fuel)}% · body ${Math.round(v?v.hp:c.hp)}%${mods?' · '+mods:''}</small></div><div class="btnrow" style="gap:6px;flex-wrap:nowrap">${here?`<button class="buy" data-out="${i}">Take out</button>`:`<button class="buy ghost" data-id="${i}">Deliver</button>`}${P.cars.length>1?`<button class="buy danger" data-sell="${i}">Sell ${inr(val)}</button>`:''}</div></div>`;}).join('')||'<p class="note">No vehicles yet. Visit Bay Motors or a two-wheeler dealer.</p>'+
    `<p class="note">Park in your own garage: drive up to a home you own and press E. A vehicle you take from the street can be kept too: park it in your garage, or get papers at a mechanic workshop.</p>`,
  s=>s.onclick=e=>{const si=e.target.dataset.sell,out=e.target.dataset.out;if(out!=null){const k=+out;const c=P.cars[k];const hp=pois.find(q=>q.type==='home'&&q.extra===c.garage);const [x,z,h]=roadSpotNear(hp||player.pos);const v=spawnOwned(k,x,z,h);closeSheet();toast(`${SPEC[c.type].label} out of the garage`,'#3ddc97');return;}
    if(si!=null){const k=+si;const v=ownedVeh[k];if(player.veh&&player.veh===v){toast('Get out before selling it','#ff9f1c');return;}const c=P.cars[k];const val=Math.round(cost('veh.'+c.type,VALUE[c.type]||10000)*.5*Math.max(.3,(v?v.hp:c.hp)/100)/5)*5;
    if(v)removeVeh(v);ownedVeh.splice(k,1);P.cars.splice(k,1);ownedVeh.forEach((q,j)=>{if(q)q.ownedIdx=j;});earn(val,'sale');save();toast(`Sold for ${inr(val)}`,'#3ddc97');garageSheet();return;}const i=e.target.dataset.id;if(i==null)return;if(inside){toast('Go outside first','#ff9f1c');return;}if(player.veh===ownedVeh[+i]){toast('You are already in it','#d6c8e4');return;}const fee=cost('svc.valet',200);if(!spend(fee,true))return;const [x,z,h]=roadSpotNear(player.pos);spawnOwned(+i,x,z,h);closeSheet();toast(`${SPEC[P.cars[i].type].label} delivered · ${inr(fee)} valet`,'#3ddc97');});}
function settingsSheet(){const rOff=!(P.extra.radio&&P.extra.radio.on);openSheet('⚙ Settings',P.name?`Playing on this device as ${esc(P.name)}`:'Playing solo',appGrid('settings')+rowHtml('sound','Sound',muted?'Off':'On',muted?'Turn on':'Turn off','ghost')+rowHtml('radio','Radio',rOff?'Off · stays off until you turn it on':'On · remembers your station · R switches',rOff?'Turn on':'Turn off','ghost')+rowHtml('help','Controls','Keyboard and touch','Show','ghost')+rowHtml('profile','Profile','Username and age','Edit','ghost')+rowHtml('suggest','Suggest a schedule change','Opening hours, festivals or events · goes to the admin','Write','ghost')+rowHtml('reset','Start a new game','Clears progress on this device','Reset','danger'),
  s=>s.onclick=e=>{if(appClick(e))return;const id=e.target.dataset.id;if(!id)return;if(id==='sound'){muted=!muted;emit('mute',muted);settingsSheet();}if(id==='radio'){emit('radioSetting',rOff);settingsSheet();}if(id==='help')helpSheet();if(id==='profile'){if(hooks.profileEdit)hooks.profileEdit();else profileSheet(false);}if(id==='suggest')suggestSheet();
    if(id==='reset'){if(e.target.dataset.sure){P=newSave();store.set('ib.save.v3',P);location.reload();}else{e.target.dataset.sure=1;e.target.textContent='Tap again';}}});}
/* profile hub: the 👤 button, in the game and on the start screen. Online play adds account rows through api.addProfileRows. */
const profileRows=[];
function setAvatar(){const u=(hooks.displayName&&hooks.displayName())||P.name;const n=P.fullName||u;const el=$('#pAv');if(el)el.textContent=n?n[0].toUpperCase():'👤';
  const ip=$('#introProf');if(ip){const lab=hooks.introLabel?hooks.introLabel():(u?u:'Profile');ip.innerHTML=`<span class="pav sm">${esc(n?n[0].toUpperCase():'👤')}</span><span>${esc(lab)}</span>`;}}
function openApp(id){const a=apps.find(x=>x.id===id);if(a)a.fn();}
function hubSheet(){const ex=profileRows.map(f=>{try{return f();}catch(e){return null;}}).filter(Boolean)[0]||null;
  const u=(hooks.displayName&&hooks.displayName())||P.name||'',full=P.fullName||'',shown=full||u||'New player';
  const row=r=>rowHtml(r.id,r.label,r.sub||'',r.btn,r.cls||'ghost');
  const end=ex?(ex.end||[]):(P.name||hadSave?[{id:'h_wipe',label:'🗑 Delete my data',sub:'Erases your player and progress on this device',btn:'Delete',cls:'danger'}]:[]);
  openSheet('Profile','',`<div class="phead"><div class="pav">${esc(shown[0].toUpperCase())}</div><div><b>${esc(shown)}</b><small>${u?'@'+esc(u)+' · ':''}${esc(ex&&ex.sub||'Playing on this device')}</small>${P.name?`<small>${inr(P.cash)} cash · ${inr(P.bank)} in bank · ${Object.keys(P.ach||{}).length} achievements</small>`:''}</div></div>`+
    (ex&&ex.top||[]).map(row).join('')+
    rowHtml('h_ach','🏆 Achievements','Goals you have reached and what is left','Open','ghost')+rowHtml('h_set','⚙ Settings','Sound, radio, controls and your profile details','Open','ghost')+rowHtml('h_priv','🔒 Privacy policy','What we collect and why','Read','ghost')+rowHtml('h_sup','💬 Contact support','support@indiabaygame.com','Write','ghost')+
    end.map(row).join(''),
    s=>s.onclick=e=>{const id=e.target.dataset.id;if(!id)return;if(id==='h_ach')return openApp('ach');if(id==='h_set')return settingsSheet();if(id==='h_priv')return window.open('privacy.html','_blank','noopener');if(id==='h_sup')return supportSheet();
      if(id==='h_wipe'){if(!e.target.dataset.sure){e.target.dataset.sure=1;e.target.textContent='Tap again to delete';return;}P=newSave();store.set('ib.save.v3',P);location.reload();return;}
      if(ex&&ex.handle&&(ex.top||[]).concat(ex.end||[]).some(r=>r.id===id))ex.handle(id,e);});}
function supportSheet(){const SITE=window.SITE||{};const mail=SITE.supportEmail||'';const can=!!(cfgBackend&&cfgBackend.support);
  openSheet('Contact support',can?'Your message goes straight to the India Bay team':mail?'Opens your email app':'Send us a message',`<form class="form" id="sup" novalidate><label>Topic<select id="su_t"><option>Something is broken</option><option>Account or sign-in</option><option>Lost progress</option><option>Report a player</option><option>Delete my data</option><option>Idea or feedback</option><option>Other</option></select></label>
    <label>Message<textarea id="su_m" maxlength="1000" placeholder="What happened? Where in the game were you?"></textarea></label><label>Email for our reply (optional)<input type="email" id="su_e" maxlength="120" value="${esc((hooks.userEmail&&hooks.userEmail())||'')}" placeholder="you@example.com"></label>
    <div class="btnrow"><button class="go" type="submit">Send</button></div><p class="note" id="su_msg">${mail?`You can also email <a href="mailto:${esc(mail)}">${esc(mail)}</a>. Businesses: write to the same address to advertise on in-game billboards.`:can?'':'Sign in to play online to send messages from the game.'}</p></form>`,s=>{
    s.querySelector('#sup').onsubmit=async e=>{e.preventDefault();const m=s.querySelector('#su_msg');const row={topic:s.querySelector('#su_t').value,message:s.querySelector('#su_m').value.trim().slice(0,1000),reply_email:s.querySelector('#su_e').value.trim().slice(0,120),name:P.name||'',page:location.host+' · v'+VERSION+' · '+navigator.userAgent.slice(0,80)};
      if(row.message.length<5){m.textContent='Please write a little more so we can help.';m.className='note bad';return;}
      if(can){m.textContent='Sending…';m.className='note';try{await cfgBackend.support(row);closeSheet();toast('Sent · thank you, we will get back to you','#3ddc97');}catch(err){m.textContent='Could not send: '+(err&&err.message||'check your connection');m.className='note bad';}return;}
      if(mail){location.href=`mailto:${mail}?subject=${encodeURIComponent('India Bay · '+row.topic)}&body=${encodeURIComponent(row.message+'\n\n— '+row.name+' · '+row.page)}`;return;}
      m.textContent='Support messages need online play. Open the game at indiabaygame.com and sign in.';m.className='note bad';};});}
function suggestSheet(){openSheet('Suggest a change','The admin reads every suggestion',`<form class="form" id="sg" novalidate><label>Region<select id="sg_r">${REGIONS.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')}</select></label><label>Your suggestion<textarea id="sg_t" maxlength="400" placeholder="Keep the West open till 3 am on Saturdays"></textarea></label><div class="note" id="sg_m"></div><div class="btnrow"><button class="go" type="submit">Send</button></div></form>`,s=>{s.querySelector('#sg').onsubmit=async e=>{e.preventDefault();const t=s.querySelector('#sg_t').value.trim(),m=s.querySelector('#sg_m');if(t.length<5){m.textContent='Write a few words first.';m.className='note bad';return;}
  const row={region:s.querySelector('#sg_r').value,text:t.slice(0,400),name:P.name||'player',date:istISO()};if(cfgBackend&&cfgBackend.suggest){try{await cfgBackend.suggest(row);closeSheet();toast('Sent to the admin · thank you','#3ddc97');return;}catch(err){m.textContent='Could not send. Check your connection and that you are signed in.';m.className='note bad';return;}}if(db){try{await db.collection('suggestions').add(row);closeSheet();toast('Sent to the admin · thank you','#3ddc97');return;}catch(err){m.textContent='Could not send. Only players with access to this game can send suggestions.';m.className='note bad';return;}}
  const l=store.get('ib.suggestions')||[];l.push(row);store.set('ib.suggestions',l);closeSheet();toast('Saved on this device for the admin','#3ddc97');};});}
function helpSheet(){openSheet('Controls','',`<div class="note" style="font-size:14px;line-height:1.9;color:var(--ink)"><b>Keyboard</b><br><kbd>W</kbd><kbd>S</kbd> forward and back · <kbd>A</kbd><kbd>D</kbd> turn · <kbd>Shift</kbd> run · <kbd>E</kbd> enter, leave, use · <kbd>J</kbd> or click attack · <kbd>Q</kbd> weapon · <kbd>Space</kbd> brake · <kbd>H</kbd> horn · <kbd>C</kbd> camera · <kbd>M</kbd> phone · <kbd>I</kbd> menu · <kbd>O</kbd> settings · <kbd>R</kbd> radio · <kbd>N</kbd> India map · <kbd>P</kbd> photo mode<br>
  <b>Touch</b><br>Arrows turn · GO and BACK move · E enters, leaves and uses · FIRE attacks · GUN switches weapon · HORN honks · tap the minimap for the map<br><b>Tips</b><br>Keep cash in the bank. Fill up before long highway drives. Wear a helmet on bikes: falls hurt less. Jobs need the right licence from an RTO office.</div>`);}
const BLOCK=['admin','police','mod','moderator','support','staff','claude','anthropic','root','system','sex','fuck','shit','bitch','chutiya','madarchod','bhenchod','gandu','randi','harami','kamina','bastard','asshole'];
function nameOk(n){if(!/^[A-Za-z0-9]{1,10}$/.test(n))return 'Use 1 to 10 letters or numbers.';const l=n.toLowerCase();if(BLOCK.some(b=>l.includes(b)))return 'That name is not allowed. Try another.';return '';}
function personErr(full,dob){full=String(full||'').trim();if(full.length<2)return 'Please type your name.';if(!/^[\p{L}\p{M} .'-]{2,60}$/u.test(full))return 'Use letters only in your name.';const age=IBCONF.ageFromDob(dob);if(age==null)return 'Please pick your date of birth.';if(age<3||age>120)return 'Please check your date of birth.';return '';}
function personFields(pre){return `<label>Your name<input type="text" id="pf_full" maxlength="60" autocomplete="name" value="${esc(pre.fullName||'')}" placeholder="Raju Sharma"></label>
  <label>Date of birth<input type="date" id="pf_dob" min="1900-01-01" max="${istISO()}" value="${esc(pre.dob||'')}"></label><p class="note">Your name and date of birth stay private. We use your age to show suitable billboard ads in the game. <a href="privacy.html" target="_blank" rel="noopener">Privacy policy</a></p>`;}
function profileSheet(first,done){openSheet(first?'Welcome to India Bay':'Profile',first?'Create your player':'Saved on this device',`<form class="form" id="pf" novalidate><label>Username<input type="text" id="pf_name" maxlength="10" autocomplete="off" value="${esc(P.name)}" placeholder="Raju2026"></label><div class="note" id="pf_msg">Letters and numbers, up to 10. Other players see this name.</div>
  ${personFields(P)}<p class="note bad" id="pf_err" aria-live="polite"></p><div class="btnrow"><button class="go" type="submit" id="pf_go">${first?'Continue':'Save'}</button></div></form>`,s=>{const f=s.querySelector('#pf'),inp=s.querySelector('#pf_name'),msg=s.querySelector('#pf_msg'),er=s.querySelector('#pf_err');
    inp.oninput=()=>{const m=nameOk(inp.value);msg.textContent=m||'Looks good.';msg.className='note '+(m?'bad':'ok');};f.onsubmit=e=>{e.preventDefault();const m=nameOk(inp.value);if(m){msg.textContent=m;msg.className='note bad';return;}
      const full=s.querySelector('#pf_full').value.trim(),dob=s.querySelector('#pf_dob').value;const pe=personErr(full,dob);if(pe){er.textContent=pe;return;}
      P.name=inp.value;P.fullName=full;P.dob=dob;P.age18=IBCONF.ageFromDob(dob)>=18;save();refreshBillboards();setAvatar();closeSheet();done&&done();};});}
function whatsNew(auto){const list=CFG.changelog.concat(CHANGELOG).sort((a,b)=>String(b.v).localeCompare(String(a.v),undefined,{numeric:true}));openSheet(auto?`What's new in ${list[0].v}`:"What's new",auto?'Since you last played':'Every version',list.slice(0,auto?1:20).map(c=>`<div class="cl"><b>${esc(c.v)}</b> <small>${esc(c.date||'')}</small>${String(c.notes||'').split('\n').map(l=>`<p>${esc(l)}</p>`).join('')}</div>`).join(''),null,()=>{P.seenVersion=list[0].v;dirty=true;});}

/* ================= admin ================= */
let adminOK=false,adminLocal=false,db=null,isOwner=false,cfgBackend=null;
function cloudConfig(d){d=Object.assign({},d);delete d.updatedAt;store.set('ib.cfg',d);savedCFG=mergeCfg(DEFAULTS,d);if(!$('#adm'))applyConfig(d);}
function applyTheme(){const T=THEMES[CFG.theme]||THEMES.kesar;const s=document.documentElement.style;s.setProperty('--acc',CFG.accent||T.accent);s.setProperty('--panel',T.panel);s.setProperty('--panel-edge',T.edge);s.setProperty('--sheet',T.sheet);s.setProperty('--sheet-2',T.sheet2);}
function applyConfig(c){const prev=CFG;CFG=mergeCfg(DEFAULTS,c);applyTheme();document.title=CFG.name;renderIntro();if(started){setPedCount(CFG.peds);}
  if(JSON.stringify(prev.billboards)!==JSON.stringify(CFG.billboards))refreshBillboards();if(!CFG.weapons&&!WEAP[P.weapon].melee)P.weapon='fist';if(CFG.police==='off'&&player.stars){player.stars=0;renderStars();}updWeap();emit('config',CFG);}
const getPath=(o,p)=>p.split('.').reduce((a,k)=>a==null?a:a[k],o);
function setPath(o,p,v){const k=p.split('.');let a=o;for(let i=0;i<k.length-1;i++){a[k[i]]=Array.isArray(a[k[i]])?a[k[i]].slice():Object.assign({},a[k[i]]);a=a[k[i]];}a[k[k.length-1]]=v;}
const LISTS=IBCONF.lists(W.zones.map(z=>z.id));
function adminSheet(){const C=JSON.parse(JSON.stringify(CFG));let work=C;
  const num=(p,label,min,max,step)=>`<label>${label}<input type="number" data-p="${p}" min="${min}" max="${max}" step="${step}" value="${getPath(C,p)}"></label>`;
  const txt=(p,label,max)=>`<label>${label}<input type="text" data-p="${p}" maxlength="${max}" value="${esc(getPath(C,p))}"></label>`;
  const ck=(p,label)=>`<label class="ck"><input type="checkbox" data-p="${p}" data-t="b"${getPath(C,p)?' checked':''}> ${label}</label>`;
  const sel=(p,label,opts)=>`<label>${label}<select data-p="${p}">${opts.map(([v,l])=>`<option value="${v}"${String(v)===String(getPath(C,p))?' selected':''}>${l}</option>`).join('')}</select></label>`;
  const rng=(p,label,min,max,step)=>`<label>${label} · <span class="val" data-v="${p}"></span><input type="range" data-p="${p}" min="${min}" max="${max}" step="${step}" value="${getPath(C,p)}"></label>`;
  const list=name=>{const cols=LISTS[name];return `<div class="ltable" data-list="${name}">${(work[name]||[]).map((row,i)=>`<div class="lrow">${cols.map(([k,l,t])=>Array.isArray(t)?`<label>${l}<select data-l="${name}" data-i="${i}" data-k="${k}">${t.map(o=>`<option${o===row[k]?' selected':''}>${o}</option>`).join('')}</select></label>`:`<label>${l}<input type="${t}" data-l="${name}" data-i="${i}" data-k="${k}" value="${esc(row[k])}"${t==='number'?' step="0.1" min="0.5" max="3"':''}></label>`).join('')}<button type="button" class="buy danger" data-del="${name}" data-i="${i}">Remove</button></div>`).join('')}<button type="button" class="buy ghost" data-add="${name}">Add</button></div>`;};
  const body=()=>`<form class="form" id="adm" autocomplete="off" novalidate>
  <details open><summary>Game</summary>${txt('name','Game name',40)}${txt('tagline','Tagline',90)}<label>Announcement on the start screen<textarea data-p="announce" maxlength="240" placeholder="Diwali update: double fares this week">${esc(C.announce)}</textarea></label></details>
  <details><summary>Look</summary>${sel('theme','Colour theme',Object.entries(THEMES).map(([k,t])=>[k,t.label]))}<label class="ck"><input type="color" data-p="accent" value="${C.accent}"> Accent colour</label></details>
  <details><summary>Bay clock and weather</summary>${rng('timeSpeed','Time speed (game minutes per real second)',0,10,0.5)}${num('timeOffset','Clock shift (game minutes)',-1440,1440,10)}${sel('weather','Weather',[['auto','Follows the season and changes every 4 game hours'],['clear','Always clear'],['cloudy','Cloudy'],['rain','Rain'],['monsoon','Monsoon storm'],['fog','Fog']])}</details>
  <details><summary>Needs and activity times</summary>${ck('needs','Hunger, toilet and sleep needs')}${num('foodHrs','Food lasts (game hours)',2,48,1)}${num('wcHrs','Bladder lasts (game hours)',2,48,1)}${num('awakeHrs','Awake time before exhausted (game hours)',4,48,1)}
   ${['sleep','meal','snack','drink','cook','tv','toilet'].map(k=>num('act.'+k,{sleep:'Full sleep',meal:'Meal',snack:'Snack',drink:'Drink',cook:'Cooking',tv:'TV cricket',toilet:'Toilet'}[k]+' (game minutes)',1,720,1)).join('')}</details>
  <details><summary>Queues (real seconds per person)</summary>${Object.keys(C.queue).map(k=>num('queue.'+k,{petrol:'Petrol pump',cng:'CNG pump',atm:'ATM',toilet:'Public toilet',ticket:'Railway ticket counter',hospital:'Hospital',checkin:'Airport check-in'}[k],1,300,1)).join('')}</details>
  <details><summary>Travel tickets and times</summary>${Object.keys(C.travel).map(k=>`<div class="pair">${num('travel.'+k+'.0',{sleeper:'Train sleeper',ac:'Train AC',flight:'Flight',bus:'Bus',bottaxi:'Bot taxi',ferry:'Ferry',local:'Mumbai local'}[k]+' ticket (₹)',0,100000,10)}${num('travel.'+k+'.1','Longest trip (real seconds)',5,1800,5)}</div>`).join('')}<p class="note">Shorter trips take less time, scaled by distance.</p></details>
  <details><summary>Streets and police</summary>${rng('traffic','Traffic vehicles near the player',0,60,1)}${rng('peds','Pedestrians near the player',0,80,1)}${sel('police','Police',[['off','Off'],['easy','Easy'],['normal','Normal'],['hard','Hard']])}${ck('weapons','Weapons and bank robbery')}</details>
  <details><summary>Economy</summary>${rng('priceMul','Prices ×',0.5,3,0.1)}${rng('fareMul','Job pay ×',0.5,3,0.1)}${num('startCash','Starting cash for new players (₹)',0,10000000,100)}${num('fuel.petrol','Petrol ₹/L',10,500,1)}${num('fuel.diesel','Diesel ₹/L',10,500,1)}${num('fuel.cng','CNG ₹/L',10,500,1)}${num('toll','Toll (₹)',0,5000,10)}
</details>
  <details><summary>Festivals</summary><p class="note">Real dates in India time. Check dates each year: they follow the Hindu calendar.</p>${list('festivals')}</details>
  <details><summary>Happening now events</summary>${list('events')}</details>
  <details><summary>Billboards</summary><p class="note">Text billboards on rooftops in the chosen city. Image uploads need the online storage (R2).</p>${list('billboards')}</details>
  <details><summary>Changelog</summary><p class="note">Add an entry with a higher version number to show players a What's new pop-up.</p>${list('changelog')}</details>
  <details><summary>Regions</summary>${REGIONS.map(r=>`<label class="ck"><input type="checkbox" data-p="regions.${r.id}" data-t="b"${C.regions[r.id]?' checked':''}${r.map?'':' disabled'}> ${r.name}: ${r.states}${r.map?'':' (map not built yet)'}</label>`).join('')}</details>
  <details id="sugg"><summary>Player suggestions</summary><div id="sugg_l" class="note">Open to load.</div></details>
  <div class="btnrow"><button type="submit" class="go">${adminLocal?'Save on this device':'Save for all players'}</button><button type="button" class="go alt" id="a_reset">Defaults</button></div>
  <p class="note" id="a_msg">${adminLocal?'This copy is not connected to your Claude account, so changes stay on this device.':'Changes preview live on your screen. Players get them when you save.'}</p></form>`;
  openSheet('Admin settings',adminLocal?'Local admin mode':'Signed in as the game owner',body(),bind,()=>{if(JSON.stringify(CFG)!==JSON.stringify(savedCFG))applyConfig(savedCFG);});
  function read(f){const c=JSON.parse(JSON.stringify(work));f.querySelectorAll('[data-p]').forEach(el=>{const p=el.dataset.p;let v=el.dataset.t==='b'?el.checked:el.type==='number'||el.type==='range'?clamp(+el.value||0,+el.min||-1e9,+el.max||1e9):el.value;if(p.startsWith('travel.')){const [,k,i]=p.split('.');c.travel[k]=c.travel[k].slice();c.travel[k][+i]=v;return;}setPath(c,p,v);});
    f.querySelectorAll('[data-l]').forEach(el=>{const l=el.dataset.l,i=+el.dataset.i,k=el.dataset.k;c[l]=c[l].slice();c[l][i]=Object.assign({},c[l][i],{[k]:el.type==='number'?+el.value:el.value});});c.name=String(c.name||'').trim()||DEFAULTS.name;return c;}
  function labels(s){s.querySelectorAll('[data-v]').forEach(el=>{const inp=s.querySelector(`[data-p="${el.dataset.v}"]`);const v=+inp.value;el.textContent=el.dataset.v==='timeSpeed'?(v===0?'Frozen':v+' game min/s'):el.dataset.v.endsWith('Mul')?'×'+v.toFixed(1):v;});}
  function bind(s){const f=s.querySelector('#adm');labels(s);let tm;
    f.addEventListener('input',e=>{labels(s);if(e.target.dataset.p==='theme')f.querySelector('[data-p=accent]').value=THEMES[e.target.value].accent;clearTimeout(tm);tm=setTimeout(()=>{work=read(f);applyConfig(work);},200);});
    f.addEventListener('click',e=>{const a=e.target.dataset.add,d=e.target.dataset.del;if(!a&&!d)return;work=read(f);if(a){const row={};for(const [k,,t] of LISTS[a])row[k]=Array.isArray(t)?t[0]:t==='number'?1:t==='color'?'#ffffff':t==='date'?istISO():'';if(a==='changelog')row.v=VERSION+'.'+(work.changelog.length+1);work[a]=work[a].concat([row]);}else{work[d]=work[d].filter((_,i)=>i!==+e.target.dataset.i);}
      const open=[...f.querySelectorAll('details')].map(x=>x.open);s.querySelector('#sbody').innerHTML=body().replace(/<form[\s\S]*?>/,m=>m);const nf=s.querySelector('#adm');
      nf.querySelectorAll('[data-p]').forEach(el=>{const v=getPath(work,el.dataset.p);if(el.dataset.t==='b')el.checked=!!v;else if(v!=null&&!el.dataset.p.startsWith('travel.'))el.value=v;});nf.querySelectorAll('details').forEach((x,i)=>x.open=open[i]);bind(s);});
    const sg=s.querySelector('#sugg');if(sg)sg.addEventListener('toggle',async()=>{if(!sg.open)return;const el=s.querySelector('#sugg_l');let list=[];if(cfgBackend&&cfgBackend.listSuggestions){try{list=await cfgBackend.listSuggestions();}catch(e){el.textContent='Could not load suggestions.';return;}}else if(db){try{const q=await db.collection('suggestions').orderBy('date','desc').limit(50).get();list=q.docs.map(d=>d.data());}catch(e){el.textContent='Could not load suggestions.';return;}}else list=(store.get('ib.suggestions')||[]).slice().reverse();
      el.innerHTML=list.length?list.map(r=>`<div class="row"><div class="nm">${esc(r.text)}<small>${esc(r.name)} · ${esc(r.region)} · ${esc(r.date)}</small></div></div>`).join(''):'No suggestions yet.';});
    s.querySelector('#a_reset').onclick=()=>{work=JSON.parse(JSON.stringify(DEFAULTS));applyConfig(work);closeSheet();adminSheet();};
    f.addEventListener('submit',async e=>{e.preventDefault();const c=read(f);work=c;const msg=s.querySelector('#a_msg');applyConfig(c);
      if(cfgBackend&&cfgBackend.admin){msg.textContent='Saving…';msg.className='note';try{await cfgBackend.save(c);savedCFG=CFG;store.set('ib.cfg',c);msg.textContent='Saved. Every player now gets these settings.';msg.className='note ok';}catch(err){msg.textContent='Could not save: '+(err&&err.message||'check your connection');msg.className='note bad';}}
      else if(db&&isOwner){msg.textContent='Saving…';msg.className='note';try{await db.doc('config/game').set(Object.assign({},c,{updatedAt:Date.now()}));savedCFG=CFG;store.set('ib.cfg',c);msg.textContent='Saved. Every player now gets these settings.';msg.className='note ok';}catch(err){msg.textContent='Could not save right now. Check your connection and try again.';msg.className='note bad';}}
      else{store.set('ib.cfg',c);savedCFG=CFG;msg.textContent='Saved on this device.';msg.className='note ok';}});}}
(async()=>{if(!window.claude||typeof claude.use!=='function'){return;}
  try{const user=await claude.use('user');isOwner=user?await user.isOwner():false;}catch(e){}
  try{db=await claude.use('db');}catch(e){db=null;}
  if(db){db.doc('config/game').onSnapshot(s=>{if(s.exists){const d=Object.assign({},s.data());delete d.updatedAt;store.set('ib.cfg',d);savedCFG=mergeCfg(DEFAULTS,d);if(!$('#adm'))applyConfig(d);}},()=>{});}
  if(isOwner){adminOK=true;adminLocal=!db;}})();

/* ================= missions + targets ================= */
const beamMat=new THREE.MeshBasicMaterial({color:0x3ddc97,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const mRingMat=new THREE.MeshBasicMaterial({color:0x3ddc97});const marker=new THREE.Group();const beam=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,70,24,1,true),beamMat);beam.position.y=35;marker.add(beam);
const mring=new THREE.Mesh(new THREE.TorusGeometry(4.2,.25,8,40),mRingMat);mring.rotation.x=Math.PI/2;mring.position.y=.3;marker.add(mring);scene.add(marker);marker.visible=false;
const arrowMat=new THREE.MeshBasicMaterial({color:0x3ddc97});const arrowGeo=new THREE.ConeGeometry(.55,1.5,4);arrowGeo.rotateX(Math.PI/2);const arrow=new THREE.Mesh(arrowGeo,arrowMat);arrow.scale.setScalar(.75);scene.add(arrow);arrow.visible=false;
let curMission=null;
function addMission(fn){missions.push(fn);}
function evalMission(){let best={pri:-1};const add=m=>{if(m&&m.pri>best.pri)best=m;};
  if(inside)add({pri:100,k:inside.home.name,t:'Home sweet home',m:'Walk to the bed, kitchen or door'});
  if(player.stars>0)add({pri:90,cls:'wanted',k:`Wanted · ${player.stars} star${player.stars>1?'s':''}`,t:player.arrestT>.3?'Police are arresting you · move!':'Lose the police',m:'Stay away from jeeps, hide at home, or pay at a police station'});
  for(const f of missions){try{add(f(api));}catch(e){console.error(e);}}
  const need=[['hunger','You are hungry','Orange markers sell food'],['bladder','You need a toilet','WC markers are public toilets'],['energy','You are tired','Sleep at home, a lodge or a dharamshala']].find(([k])=>P[k]<30);if(need)add({pri:15,k:'Needs',t:need[1],m:need[2]});
  add({pri:0,k:areaName(),t:'Explore West India',m:'Phone → Jobs for work · tap the minimap for the India map'});return best;}
let missionKey='',missionHide=0;
function showMission(m){const el=$('#mission');const key=m.k+'|'+m.t;if(key!==missionKey){missionKey=key;missionHide=performance.now()+5000;}el.className='pill'+(m.cls?' '+m.cls:'')+(performance.now()<missionHide?' show':'');el.innerHTML=`<div class="k">${esc(m.k)}</div><div class="t">${esc(m.t)}</div><div class="m">${esc(m.m||'')}</div>`;
  const tg=m.target;if(tg&&!inside){marker.visible=true;marker.position.set(tg.x,0,tg.z);const c=tg.col||0x3ddc97;beamMat.color.setHex(c);mRingMat.color.setHex(c);arrowMat.color.setHex(c);}else marker.visible=false;}
let lastArea='';
function areaName(){const pp=ppos();const z=zoneAt(pp.x,pp.z,30);if(z)return `${z.name} · ${W.states[z.st]}`;const e=roadAt(pp.x,pp.z,4);if(e&&e.road.name)return `${e.road.name} · ${W.states[stateAt(pp.x,pp.z)]}`;return W.states[stateAt(pp.x,pp.z)];}

/* ================= navigation: road graph and routes ================= */
const NODES=[],NADJ=[],nHash=new Map();
function nodeFor(x,z){const kx=Math.floor(x/10),kz=Math.floor(z/10);for(let i=kx-1;i<=kx+1;i++)for(let j=kz-1;j<=kz+1;j++){const a=nHash.get(i+','+j);if(a)for(const id of a){const n=NODES[id];if(Math.abs(n.x-x)<6&&Math.abs(n.z-z)<6)return id;}}
  const id=NODES.length;NODES.push({x,z});NADJ.push([]);const k=kx+','+kz;let a=nHash.get(k);if(!a)nHash.set(k,a=[]);a.push(id);return id;}
function nlink(a,b,eid=-1){if(a===b||NADJ[a].some(q=>q[0]===b))return;const d=Math.hypot(NODES[a].x-NODES[b].x,NODES[a].z-NODES[b].z);NADJ[a].push([b,d,eid]);NADJ[b].push([a,d,eid]);}
for(const e of EDGES){const ts=[0,e.len];const cand=new Set();for(let t=0;t<=e.len;t+=RH/2)for(const ox of [-RH,0,RH])for(const oz of [-RH,0,RH])for(const id of edgesNear(e.ax+e.dx*t+ox,e.az+e.dz*t+oz))cand.add(id);
  for(const id of cand){if(id===e.id)continue;const f=EDGES[id];const rx=e.bx-e.ax,rz=e.bz-e.az,sx=f.bx-f.ax,sz=f.bz-f.az;const den=rx*sz-rz*sx;if(Math.abs(den)<1e-6)continue;const qx=f.ax-e.ax,qz=f.az-e.az;const t=(qx*sz-qz*sx)/den,u=(qx*rz-qz*rx)/den;const et=6/e.len,eu=6/f.len;
    if(t>-et&&t<1+et&&u>-eu&&u<1+eu)ts.push(clamp(t,0,1)*e.len);}
  ts.sort((a,b)=>a-b);let prev=null;for(const t of ts){const n=nodeFor(e.ax+e.dx*t,e.az+e.dz*t);if(prev!=null)nlink(prev,n,e.id);prev=n;}}
for(let i=0;i<NODES.length;i++){if(NADJ[i].length>1)continue;const n=NODES[i];let best=-1,bd=32;const kx=Math.floor(n.x/10),kz=Math.floor(n.z/10);for(let a=kx-4;a<=kx+4;a++)for(let b=kz-4;b<=kz+4;b++){for(const id of nHash.get(a+','+b)||[]){if(id===i||NADJ[i].some(q=>q[0]===id))continue;const d=Math.hypot(NODES[id].x-n.x,NODES[id].z-n.z);if(d<bd){bd=d;best=id;}}}if(best>=0)nlink(i,best);}
function nearestNode(x,z){for(let r=1;r<=40;r+=3){let best=-1,bd=1e9;const kx=Math.floor(x/10),kz=Math.floor(z/10);for(let a=kx-r;a<=kx+r;a++)for(let b=kz-r;b<=kz+r;b++)for(const id of nHash.get(a+','+b)||[]){const d=Math.hypot(NODES[id].x-x,NODES[id].z-z);if(d<bd){bd=d;best=id;}}if(best>=0)return best;}return -1;}
function nodesNear(x,z,r,n){const out=[];const kx=Math.floor(x/10),kz=Math.floor(z/10),k=Math.ceil(r/10);for(let a=kx-k;a<=kx+k;a++)for(let b=kz-k;b<=kz+k;b++)for(const id of nHash.get(a+','+b)||[]){const d=Math.hypot(NODES[id].x-x,NODES[id].z-z);if(d<=r)out.push([id,d]);}return out.sort((p,q)=>p[1]-q[1]).slice(0,n);}
function findRoute(sx,sz,tx,tz,hd){let starts=nodesNear(sx,sz,140,5);if(!starts.length){const a=nearestNode(sx,sz);if(a<0)return null;starts=[[a,0]];}let goals=nodesNear(tx,tz,140,4);if(!goals.length){const g0=nearestNode(tx,tz);if(g0<0)return null;goals=[[g0,0]];}
  const gset=new Map(goals.map(([id,d])=>[id,d]));const b=goals[0][0];if(hd!=null)starts=starts.map(([id,d])=>{const n=NODES[id];const dot=(n.x-sx)*Math.sin(hd)+(n.z-sz)*Math.cos(hd);return [id,d+(dot<0&&d>8?60:0)];});const N=NODES.length;const g=new Float64Array(N).fill(Infinity),from=new Int32Array(N).fill(-1),done=new Uint8Array(N);
  const heap=[];const push=(id,f)=>{heap.push([f,id]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return top;};
  const h=id=>Math.hypot(NODES[id].x-tx,NODES[id].z-tz);for(const [id,d] of starts){if(d<g[id]){g[id]=d;push(id,d+h(id));}}let it=0,end=-1,best=Infinity;
  while(heap.length&&it++<80000){const [f,u]=pop();if(f>=best)break;if(done[u])continue;done[u]=1;if(gset.has(u)){const tot=g[u]+gset.get(u);if(tot<best){best=tot;end=u;}}for(const [v,d,eid] of NADJ[u]){const ng=g[u]+d*(1+3*(eid>=0?CONG[eid]:0));if(ng<g[v]){g[v]=ng;from[v]=u;push(v,ng+h(v));}}}
  if(end<0)return null;const path=[];for(let u=end;u>=0;u=from[u])path.push([NODES[u].x,NODES[u].z]);path.reverse();return [[sx,sz],...path,[tx,tz]];}
const nav={route:null,tx:0,tz:0,t:0,name:'',left:0,turn:null};
function updNav(dt){nav.t-=dt;const m=curMission;const tg=m&&m.target&&!inside?m.target:null;const pp=ppos();
  if(!tg||Math.hypot(tg.x-pp.x,tg.z-pp.z)<30){nav.route=null;$('#nav').hidden=true;return;}
  let need=!nav.route||Math.hypot(tg.x-nav.tx,tg.z-nav.tz)>20;
  if(nav.route){let bi=0,bd=1e9;const R=nav.route;for(let i=0;i<Math.min(R.length-1,25);i++){const d=segD(pp.x,pp.z,R[i][0],R[i][1],R[i+1][0],R[i+1][1]);if(d<bd){bd=d;bi=i;}}if(bd>45)need=true;else if(bi>0)nav.route=[[pp.x,pp.z],...R.slice(bi+1)];else R[0]=[pp.x,pp.z];}
  if(need&&nav.t<=0){nav.t=1;nav.tx=tg.x;nav.tz=tg.z;nav.route=findRoute(pp.x,pp.z,tg.x,tg.z,player.mode==='drive'&&player.veh?player.veh.h:player.h)||[[pp.x,pp.z],[tg.x,tg.z]];}
  const R=nav.route;if(!R)return;let total=0,turn=null,acc=0;for(let i=0;i<R.length-1;i++){const l=Math.hypot(R[i+1][0]-R[i][0],R[i+1][1]-R[i][1]);total+=l;
    if(!turn&&i<R.length-2){acc+=l;const ax=R[i+1][0]-R[i][0],az=R[i+1][1]-R[i][1],bx=R[i+2][0]-R[i+1][0],bz=R[i+2][1]-R[i+1][1];const la=Math.hypot(ax,az),lb=Math.hypot(bx,bz);if(la>1&&lb>1){const cos=(ax*bx+az*bz)/(la*lb),cr=ax*bz-az*bx;if(cos<.82&&!(i===0&&acc<12))turn={d:acc,dir:cr>0?'right':'left',u:cos<-.5}}}}
  nav.left=total;nav.turn=turn;const km=total*2.4;const dist=km>=1000?(km/1000).toFixed(1)+' km':Math.round(km/10)*10+' m';
  const tt=turn?(turn.u?'U-turn':`Turn ${turn.dir}`)+` in ${Math.max(10,Math.round(turn.d*2.4/10)*10)} m`:'Continue straight';const ar=turn?(turn.u?'⮌':turn.dir==='left'?'↰':'↱'):'↑';
  const eta=routeEta(R);const mins=Math.max(1,Math.round(eta.t/60));const el=$('#nav');el.hidden=false;el.classList.toggle('heavy',eta.heavy);el.innerHTML=`<b>${ar}</b><span>${tt}</span><small>${esc(m.t)} · ${dist} · ${mins} min${eta.heavy?' · heavy traffic':''}</small>`;}
/* live traffic: busier in big cities and at rush hour, changes every game hour */
const CONG=new Float32Array(EDGES.length);let congT=0;
function updCongestion(){const h=clockH;const rush=(h>=8&&h<11)||(h>=17&&h<21)?1:(h>=23||h<6)?.2:.55;const slot=Math.floor(gameMin()/60);
  for(const e of EDGES){const z=zoneAt((e.ax+e.bx)/2,(e.az+e.bz)/2,10);const base=z?(z.id==='mumbai'?.6:z.size==='big'?.45:z.size==='mid'?.28:.1):e.kind==='exp'?.08:e.kind==='bridge'?.35:.16;CONG[e.id]=clamp(base*rush*(.3+1.5*hash(e.id*3.1+slot*.7))*1.5,0,1);}}
updCongestion();
function routeEta(R){let t=0,heavy=false;for(let i=0;i<R.length-1;i++){const l=Math.hypot(R[i+1][0]-R[i][0],R[i+1][1]-R[i][1]);for(let k=0;k<l;k+=40){const x=R[i][0]+(R[i+1][0]-R[i][0])*k/l,z=R[i][1]+(R[i+1][1]-R[i][1])*k/l;const e=roadAt(x,z);const c=e?CONG[e.id]:0;if(c>.7)heavy=true;const sp=e&&e.kind!=='city'?24:12;t+=Math.min(40,l-k)/(sp*(1-.7*c));}}return{t,heavy};}

/* traffic signals at junctions in cities and big towns */
const SIG=34;
function sigJunction(x,z){const zz=zoneAt(x,z);if(!zz||zz.size==='small')return null;const i=Math.round((x-zz.x0)/80),j=Math.round((z-zz.z0)/80);if(i<=0||j<=0||i>=zz.nx||j>=zz.nz)return null;const jx=zz.x0+i*80,jz=zz.z0+j*80;if(isWater(jx,jz))return null;return{x:jx,z:jz,zone:zz,i,j};}
function sigState(jx,jz,axis){const t=((Date.now()/1000)+hash(jx*.13+jz*.71)*SIG)%SIG;if(axis==='ns')return t<15?'g':t<17?'a':'r';return t<17?'r':t<32?'g':t<34?'a':'r';}
function sigStop(c){const e=c.lane.e;if(e.kind!=='city')return Infinity;const ew=Math.abs(e.dx)>.5;const f=ew?Math.sign(e.dx*c.lane.dir):Math.sign(e.dz*c.lane.dir);const zz=zoneAt(c.pos.x,c.pos.z);if(!zz||zz.size==='small')return Infinity;
  const a=ew?c.pos.x:c.pos.z,base=ew?zz.x0:zz.z0;let k=f>0?Math.ceil((a-base)/80):Math.floor((a-base)/80);let jc=base+k*80;let d=(jc-a)*f;if(d<9){k+=f;jc=base+k*80;d=(jc-a)*f;}if(d>32)return Infinity;
  const jx=ew?jc:c.pos.x,jz=ew?c.pos.z:jc;const J=sigJunction(jx,jz);if(!J)return Infinity;return sigState(J.x,J.z,ew?'ew':'ns')==='g'?Infinity:d-11;}
const sigMats={r:new THREE.MeshBasicMaterial({color:0xff2a2a}),a:new THREE.MeshBasicMaterial({color:0xffb000}),g:new THREE.MeshBasicMaterial({color:0x2aff6a})};
const sigPool=[];for(let k=0;k<14;k++){const grp=new THREE.Group();const heads=[];for(const [cx,cz,faces] of [[9.5,-9.5,[Math.PI,Math.PI/2]],[-9.5,9.5,[0,-Math.PI/2]]]){const pole=new THREE.Mesh(G.cyl,M.pole);pole.scale.set(.14,5,.14);pole.position.set(cx,2.5,cz);grp.add(pole);
  for(const ry of faces){const hd=new THREE.Group();hd.position.set(cx,4.6,cz);hd.rotation.y=ry;const box=new THREE.Mesh(G.box,VM.black);box.scale.set(.5,1.4,.35);box.position.z=.3;hd.add(box);const lamp=new THREE.Mesh(G.box,sigMats.g);lamp.scale.set(.36,.36,.08);lamp.position.z=.5;hd.add(lamp);grp.add(hd);heads.push({lamp,axis:Math.abs(Math.sin(ry))>.5?'ew':'ns'});}}
  grp.visible=false;scene.add(grp);sigPool.push({grp,heads,key:''});}
let sigNear=[];const redSeen=new Map();
function updSignals(){const pp=ppos();const list=[];const zz=zoneAt(pp.x,pp.z,100);if(zz&&zz.size!=='small'&&!inside){for(let i=1;i<zz.nx;i++)for(let j=1;j<zz.nz;j++){const x=zz.x0+i*80,z=zz.z0+j*80;const d=Math.abs(x-pp.x)+Math.abs(z-pp.z);if(d<360&&!isWater(x,z))list.push([d,x,z]);}}
  list.sort((a,b)=>a[0]-b[0]);sigNear=list.slice(0,sigPool.length);sigPool.forEach((p,k)=>{const j=sigNear[k];if(!j){p.grp.visible=false;return;}p.grp.visible=true;p.grp.position.set(j[1],0,j[2]);for(const h of p.heads){const st=sigState(j[1],j[2],h.axis);h.lamp.material=sigMats[st];h.lamp.position.y=st==='r'?.42:st==='a'?0:-.42;}});}
function checkRedLight(now){if(player.mode!=='drive'||!player.veh)return;const v=player.veh;if(Math.abs(v.v)<4)return;const J=sigJunction(v.pos.x,v.pos.z);if(!J)return;if(Math.abs(v.pos.x-J.x)>7||Math.abs(v.pos.z-J.z)>7)return;
  const axis=Math.abs(Math.sin(v.h))>Math.abs(Math.cos(v.h))?'ew':'ns';const key=J.x+','+J.z;if(sigState(J.x,J.z,axis)!=='r'||now-(redSeen.get(key)||-99)<30)return;redSeen.set(key,now);addChallan(CFG.challan.signal||1000,'Jumped a red light');}

function navAhead(dist){const R=nav.route;if(!R||R.length<2)return null;let acc=0;for(let i=0;i<R.length-1;i++){const l=Math.hypot(R[i+1][0]-R[i][0],R[i+1][1]-R[i][1]);if(acc+l>=dist){const t=(dist-acc)/l;return[R[i][0]+(R[i+1][0]-R[i][0])*t,R[i][1]+(R[i+1][1]-R[i][1])*t];}acc+=l;}return R[R.length-1];}

/* ================= toasts ================= */
let toastT;function toast(html,color){const t=$('#toast');t.innerHTML=html;t.style.color=color||'#fff4e2';t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2400);}
let bigT;function big(txt,col){const b=$('#big');b.textContent=txt;b.style.color=col;b.classList.add('show');$('#dim').style.opacity=.55;clearTimeout(bigT);bigT=setTimeout(()=>{b.classList.remove('show');$('#dim').style.opacity=0;},2000);}

/* ================= input ================= */
const keys={up:false,down:false,left:false,right:false,run:false};
const km={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'down',ShiftLeft:'run',ShiftRight:'run'};
addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea,select'))return;if(e.code==='Escape'){if(hooks.escape&&hooks.escape())return;if(sheetOpen()){closeSheet();return;}}if(uiLock())return;
  if(km[e.code]){keys[km[e.code]]=true;e.preventDefault();}if(e.repeat)return;
  if(e.code==='KeyE'||e.code==='KeyF')useAction();if(e.code==='KeyJ')fire();if(e.code==='KeyQ')cycleWeapon();if(e.code==='KeyH')horn();if(e.code==='KeyC')cycleCam();if(e.code==='KeyM')phoneSheet();if(e.code==='KeyI')menuSheet();if(e.code==='KeyO')settingsSheet();if(hooks.key[e.code])hooks.key[e.code]();});
addEventListener('keyup',e=>{if(km[e.code])keys[km[e.code]]=false;});addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
/* drag to orbit the camera (mouse on PC, finger on phones); a short click still attacks */
let camYaw=0,camPitch=0,orbitIdle=9;const drag={on:false,id:null,x:0,y:0,moved:0,btn:0,touch:false};const cv0=$('#c');
cv0.addEventListener('pointerdown',e=>{if(!started||uiLock()||hooks.photo)return;Object.assign(drag,{on:true,id:e.pointerId,x:e.clientX,y:e.clientY,moved:0,btn:e.button,touch:e.pointerType!=='mouse'});try{cv0.setPointerCapture(e.pointerId);}catch(_){}});
cv0.addEventListener('pointermove',e=>{if(!drag.on||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;drag.moved+=Math.abs(dx)+Math.abs(dy);if(drag.moved<4)return;camYaw=wrapA(camYaw-dx*.007);camPitch=clamp(camPitch+dy*.004,-.4,.9);orbitIdle=0;});
const endDrag=e=>{if(!drag.on||e.pointerId!==drag.id)return;drag.on=false;if(drag.moved<6&&drag.btn===0&&!uiLock()&&e.type==='pointerup'){if(pickBillboard(e.clientX,e.clientY))return;if(!drag.touch)fire();}};cv0.addEventListener('pointerup',endDrag);cv0.addEventListener('pointercancel',endDrag);
$$('.pad button[data-k]').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();keys[k]=true;b.classList.add('on');try{b.setPointerCapture(e.pointerId);}catch(_){}};const off=()=>{keys[k]=false;b.classList.remove('on');};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);b.addEventListener('contextmenu',e=>e.preventDefault());});
let fireHeld=false;
$$('.pad button[data-act]').forEach(b=>{const a=b.dataset.act;b.addEventListener('contextmenu',e=>e.preventDefault());
  b.addEventListener('pointerdown',e=>{e.preventDefault();if(uiLock())return;b.classList.add('on');if(a==='use')useAction();if(a==='fire'){fireHeld=true;fire();}if(a==='gun')cycleWeapon();if(a==='horn')horn();});
  const off=()=>{b.classList.remove('on');if(a==='fire')fireHeld=false;};b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);});
let camMode=0;const CAMS=['Chase camera','Far camera','First-person camera'];function cycleCam(){camMode=(camMode+1)%3;$('#camBtn').title=CAMS[camMode];toast(CAMS[camMode],'#d6c8e4');camSnap=true;camYaw=0;camPitch=0;}
$('#camBtn').onclick=cycleCam;$('#menuBtn').onclick=()=>{if(started&&!uiLock())menuSheet();};$('#phoneBtn').onclick=()=>{if(started&&!uiLock())phoneSheet();};$('#setBtn').onclick=()=>{if(started&&!uiLock())hubSheet();};$('#supLink').onclick=e=>{e.preventDefault();supportSheet();};$('#introProf').onclick=()=>{if(hooks.introClick)hooks.introClick();else hubSheet();};$('#mission').onclick=()=>{missionHide=performance.now()+5000;};$('#nav').onclick=()=>{missionHide=performance.now()+5000;};
$('#mini').addEventListener('click',()=>{if(started&&!uiLock()&&hooks.map)hooks.map();});
let curPrompt=null;
function useAction(){if(uiLock()||overT>0||player.knock>0)return;updPrompt();if(curPrompt&&curPrompt.first){curPrompt.fn();return;}
  if(inside){const ip=nearInterior();if(ip)homeAction(ip.k);return;}
  if(player.mode==='drive'){if(curPrompt&&curPrompt.poi&&curPrompt.poi.drive&&Math.abs(player.veh.v)<2){openPoi(curPrompt.poi);return;}exitVehicle();return;}
  if(curPrompt&&curPrompt.poi){openPoi(curPrompt.poi);return;}if(curPrompt&&curPrompt.fn){curPrompt.fn();return;}const v=nearestVeh();if(v)enterVehicle(v);}
function nearInterior(){let b=null,bd=1.4;for(const p of inter.pois){const d=Math.hypot(player.pos.x-p.x,player.pos.z-p.z);if(d<bd){bd=d;b=p;}}return b;}

/* ================= audio ================= */
let ac=null,eng=null,sir=null,muted=false,noiseBuf=null;
function initAudio(){if(ac)return;try{ac=new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator();o.type='sawtooth';const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=380;
  const g=ac.createGain();g.gain.value=0;const lfo=ac.createOscillator();lfo.type='square';lfo.frequency.value=11;const lg=ac.createGain();lg.gain.value=.02;lfo.connect(lg);lg.connect(g.gain);o.connect(f);f.connect(g);g.connect(ac.destination);o.start();lfo.start();eng={o,lfo,g};
  const so=ac.createOscillator();so.type='triangle';so.frequency.value=700;const sl=ac.createOscillator();sl.frequency.value=.7;const sg2=ac.createGain();sg2.gain.value=220;sl.connect(sg2);sg2.connect(so.frequency);const sg=ac.createGain();sg.gain.value=0;so.connect(sg);sg.connect(ac.destination);so.start();sl.start();sir={g:sg};
  noiseBuf=ac.createBuffer(1,ac.sampleRate*.3,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);emit('audio',ac);}catch(e){ac=null;}}
function hornSfx(){if(!ac||muted)return;const t=ac.currentTime;[392,494].forEach(fr=>{const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=fr;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.06,t+.02);g.gain.setValueAtTime(.06,t+.28);g.gain.exponentialRampToValueAtTime(.0001,t+.36);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.4);});}
function horn(){if(player.mode==='drive'){const v=player.veh,c=v&&v.owned?P.cars[v.ownedIdx]:null;if(c&&c.horn)musicHorn();else hornSfx();emit('horn');}}
function musicHorn(){if(!ac||muted)return;const t=ac.currentTime;[523,659,784,659,880].forEach((fr,k)=>{const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=fr;const t0=t+k*.13;g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.05,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+.12);o.connect(g);g.connect(ac.destination);o.start(t0);o.stop(t0+.14);});}
function sfxShot(vol){if(!ac||muted)return;const s=ac.createBufferSource();s.buffer=noiseBuf;const g=ac.createGain();g.gain.value=.25*vol;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=1800;s.connect(f);f.connect(g);g.connect(ac.destination);s.start();}
function sfxPunch(){if(!ac||muted)return;const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(50,t+.12);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.0001,t+.15);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.16);}

/* ================= player updates ================= */
const fwd=new THREE.Vector3();let lastBump=0,lowFuelWarn=false;
const smoke=[];const smokeMat=new THREE.MeshBasicMaterial({color:0x666666,transparent:true,opacity:.5,depthWrite:false});const smokeGeo=new THREE.SphereGeometry(.5,6,4);
function puff(x,y,z){let s=smoke.find(q=>!q.m.visible);if(!s){if(smoke.length>40)return;s={m:new THREE.Mesh(smokeGeo,smokeMat.clone())};scene.add(s.m);smoke.push(s);}s.m.visible=true;s.m.position.set(x,y,z);s.t=1.4;s.m.scale.setScalar(1);}
function updSmoke(dt){for(const s of smoke){if(!s.m.visible)continue;s.t-=dt;s.m.position.y+=dt*1.6;s.m.scale.multiplyScalar(1+dt*.8);s.m.material.opacity=Math.max(0,s.t*.35);if(s.t<=0)s.m.visible=false;}}
function updDrive(dt,now){const v=player.veh,sp=v.spec;const dead=v.hp<=0,dry=sp.fuel&&v.fuel<=0;const acc=dead||dry?0:sp.acc;
  if(keys.up&&acc)v.v+=(v.v<0?30:acc)*dt;if(keys.down)v.v-=(v.v>.5?32:acc?10:0)*dt;if(!keys.up&&!keys.down||(!acc&&v.v>0)){v.v-=Math.sign(v.v)*Math.min(Math.abs(v.v),(acc?5:3)*dt);}
  const road=roadAt(v.pos.x,v.pos.z,.5);const paved=!road&&zoneAt(v.pos.x,v.pos.z);let maxv=sp.max*(wx.rain>.3?.92:1)*(road?1:paved?.7:sp.two?.5:.58);for(const f of speedMods){try{maxv*=f(v);}catch(e){}}
  if(sp.pedal&&P.energy<10)maxv*=.5;v.v=clamp(v.v,sp.two?-2:-8,maxv);
  const st=(keys.left?1:0)-(keys.right?1:0);v.steer+=(st-v.steer)*Math.min(1,dt*8);v.h+=v.steer*sp.turn*clamp(Math.abs(v.v)/7,0,1)*Math.sign(v.v)*(1-.35*Math.abs(v.v)/sp.max)*dt;
  const nx=v.pos.x+Math.sin(v.h)*v.v*dt,nz=v.pos.z+Math.cos(v.h)*v.v*dt;const fx=Math.sin(v.h),fz=Math.cos(v.h);
  let crash=0;if(drivable(nx+fx*sp.len/2,nz+fz*sp.len/2)&&drivable(nx,nz)){v.pos.x=nx;v.pos.z=nz;}else{crash=Math.abs(v.v);v.v*=-.2;}
  const hit=collide(v.pos,Math.min(1.6,sp.wid/2+.2),false);if(hit){crash=Math.max(crash,Math.abs(v.v));v.v*=Math.abs(v.v)>3?-.3:.5;}
  const half=sp.len/2-sp.wid/2;
  for(const o of vehicles){if(o===v)continue;if(Math.abs(o.pos.x-v.pos.x)>14||Math.abs(o.pos.z-v.pos.z)>14)continue;for(const t of [-half,0,half]){const px=v.pos.x+fx*t,pz=v.pos.z+fz*t;const s=segDist(px,pz,o);const min=o.spec.wid/2+sp.wid/2;
      if(s.d<min&&s.d>.001){const k=(min-s.d)/s.d;v.pos.x+=s.dx*k;v.pos.z+=s.dz*k;if(Math.abs(v.v)>5&&now-lastBump>1.2){lastBump=now;crash=Math.max(crash,Math.abs(v.v));if(o.state==='police')addWanted(1,'Rammed police');else if(o.state==='traffic'){o.stopT=3;if(P.cash>=50){P.cash-=50;toast('Bump · −₹50 settled on the spot','#ff5d73');}}}v.v*=.4;break;}}}
  for(const p of peds){if(p.state==='down'||!p.g.visible)continue;const s=segDist(p.x,p.z,v);if(s.d<sp.wid/2+.45){if(Math.abs(v.v)>5)knockPed(p,'Hit a pedestrian');else{p.x+=s.dx/(s.d||1)*.5;p.z+=s.dz/(s.d||1)*.5;}}}
  for(const c of cows){if(!c.active)continue;const s=segDist(c.x,c.z,v);if(s.d<sp.wid/2+.9){v.pos.x-=s.dx/(s.d||1)*.6;v.pos.z-=s.dz/(s.d||1)*.6;if(Math.abs(v.v)>4){crash=Math.max(crash,Math.abs(v.v)*.6);toast('Gaumata on the road! Brake!','#ff9f1c');}v.v*=.2;}}
  if(crash>4){player.shake=Math.min(.8,crash*.03);v.hp=Math.max(0,v.hp-crash*1.1);damage(sp.two||sp.pedal?0:crash*.2,'Crash');hornSfx();emit('crash',{v,impact:crash});if(v.hp<=0)toast('Engine dead · call a mechanic from Phone → Garage, or walk','#ff5d73');
    if((sp.two)&&crash>8){fallOff(v,crash);return;}}
  if(sp.fuel){const used=Math.abs(v.v*dt)/sp.range*100*(v.company?0:1);v.fuel=Math.max(0,v.fuel-used);if(v.fuel<15&&!lowFuelWarn&&v.fuel>0){lowFuelWarn=true;toast('Low fuel · find a pump','#ff9f1c');}if(v.fuel>20)lowFuelWarn=false;if(v.fuel<=0&&dry===false)toast('Out of fuel · push to a pump or call fuel delivery from Garage','#ff5d73');}
  P.stats.km+=Math.abs(v.v*dt)*2.4/1000;
  if(sp.two){v.lean+=((-v.steer*Math.min(Math.abs(v.v)/sp.max,1)*.55)-v.lean)*Math.min(1,dt*6);v.m.position.copy(v.pos);v.m.rotation.set(0,v.h,v.lean,'YXZ');}
  else{v.m.position.copy(v.pos);v.m.rotation.set(0,v.h,-v.steer*Math.min(Math.abs(v.v)/sp.max,1)*.1,'YXZ');}
  for(const w of v.m.userData.wheels)w.rotation.x+=v.v*dt/.36;if(v.m.userData.driver&&!sp.two)v.m.userData.driver.visible=camMode!==2;
  if(sp.two||sp.pedal){const s=sp.seat;const c=Math.cos(v.h),sn=Math.sin(v.h);avatar.position.set(v.pos.x+s[2]*sn,s[1]-.6,v.pos.z+s[2]*c);avatar.rotation.set(0,v.h,sp.two?v.lean:0,'YXZ');AU.legs[0].rotation.x=AU.legs[1].rotation.x=-1.2;AU.arms[0].rotation.x=AU.arms[1].rotation.x=-1.1;
    if(sp.pedal){const ph=now*Math.abs(v.v)*1.2;AU.legs[0].rotation.x=-1.2+Math.sin(ph)*.5;AU.legs[1].rotation.x=-1.2-Math.sin(ph)*.5;}avatar.visible=camMode!==2;}
  if(v.hp<30&&Math.random()<dt*6)puff(v.pos.x+fx*sp.len*.4,1.3,v.pos.z+fz*sp.len*.4);
  if(eng){eng.g.gain.value=muted||!sp.fuel||dead||dry?0:.03;eng.o.frequency.value=(sp.two?70:48)+Math.abs(v.v)*4;eng.lfo.frequency.value=10+Math.abs(v.v)*.9;}}
function updFoot(dt,bounds){if(player.knock>0){player.knock-=dt;avatar.position.set(player.pos.x,.35,player.pos.z);avatar.rotation.set(-Math.PI/2,player.h,0,'YXZ');if(player.knock<=0)avatar.rotation.set(0,player.h,0);return;}
  const tired=(P.energy<=0?.6:1)*(P.health<25?.6:1);player.run=keys.run||keys.up&&isTouch;const target=keys.up?(player.run?7.5:4.2)*tired:keys.down?-2.4:0;player.v+=(target-player.v)*Math.min(1,dt*10);
  const st=(keys.left?1:0)-(keys.right?1:0);player.h+=st*3*dt;const nx=player.pos.x+Math.sin(player.h)*player.v*dt,nz=player.pos.z+Math.cos(player.h)*player.v*dt;
  if(bounds){player.pos.x=clamp(nx,-bounds.w/2+.4,bounds.w/2-.4);player.pos.z=clamp(nz,-bounds.d/2+.4,bounds.d/2-.3);}
  else{if(drivable(nx,nz)){player.pos.x=nx;player.pos.z=nz;}collide(player.pos,.4,true);for(const o of vehicles){if(Math.abs(o.pos.x-player.pos.x)>8||Math.abs(o.pos.z-player.pos.z)>8)continue;const s=segDist(player.pos.x,player.pos.z,o);const min=o.spec.wid/2+.4;if(s.d<min&&s.d>.001){const k=(min-s.d)/s.d;player.pos.x+=s.dx*k;player.pos.z+=s.dz*k;}}}
  player.anim=Math.max(0,player.anim-dt);const ph=performance.now()/1000*(player.run?13:9),sw=Math.min(1,Math.abs(player.v)/4)*.7;
  AU.legs[0].rotation.x=Math.sin(ph)*sw;AU.legs[1].rotation.x=-Math.sin(ph)*sw;AU.arms[0].rotation.x=-Math.sin(ph)*sw;AU.arms[1].rotation.x=player.anim>0?-1.5:(P.weapon==='fist'?Math.sin(ph)*sw:-.5);
  avatar.position.set(player.pos.x,inside?0:.3,player.pos.z);avatar.rotation.set(0,player.h,0);avatar.visible=camMode!==2;if(eng)eng.g.gain.value=0;}
function updTraffic(dt){const pp=ppos();const fp=player.mode==='foot'?player.pos:null;let n=0;
  for(const c of vehicles.slice()){if(c.state!=='traffic')continue;n++;if(c.pos.distanceTo(pp)>390){removeVeh(c);n--;continue;}const l=c.lane;let target=c.stopT>0?0:l.vmax;c.stopT=Math.max(0,c.stopT-dt);let blocked=null;
    const fx=Math.sin(c.h),fz=Math.cos(c.h);const look=c.spec.len/2+6;
    for(const o of vehicles){if(o===c)continue;const dx=o.pos.x-c.pos.x,dz=o.pos.z-c.pos.z;if(Math.abs(dx)>30||Math.abs(dz)>30)continue;const along=dx*fx+dz*fz,lat=Math.abs(-dx*fz+dz*fx);
      if(along>0&&along<look+o.spec.len/2&&lat<2.4){target=Math.min(target,o.state==='traffic'?o.v*.8:0);if(o.state!=='traffic')blocked=o;}}
    for(const q of [fp,...cows.filter(k=>k.active)]){if(!q)continue;const dx=q.x-c.pos.x,dz=q.z-c.pos.z;const along=dx*fx+dz*fz,lat=Math.abs(-dx*fz+dz*fx);if(along>0&&along<look+2&&lat<2.4)target=0;}
    if(blocked&&c.v<.5){c.blockT+=dt;if(c.blockT>9&&c.pos.distanceTo(pp)>60){removeVeh(c);n--;continue;}}else c.blockT=0;
    if(frame%3===0)c.sigD=sigStop(c);if(c.sigD!=null&&c.sigD<Infinity)target=Math.min(target,c.sigD<1?0:Math.max(0,c.sigD*.7));
    c.v+=clamp(target-c.v,-20*dt,5*dt);l.s+=l.dir*c.v*dt;if(l.s>l.e.len||l.s<0){nextLane(l);}placeLane(c);c.m.visible=Math.abs(c.pos.x-pp.x)+Math.abs(c.pos.z-pp.z)<Math.max(240,scene.fog.far*.6);for(const w of c.m.userData.wheels)w.rotation.x+=c.v*dt/.4;}
  let spawns=0;while(n<CFG.traffic&&spawns<3){spawns++;const v=spawnTraffic(started);if(v){const c=CONG[v.lane.e.id];if(Math.random()>.35+c){removeVeh(v);continue;}v.lane.vmax*=1-.55*c;n++;}}}
function updPeds(dt,t){const pp=ppos();for(const p of peds){if(p.state==='idle'){if(Math.random()<.02)placePed(p,40);continue;}
    if(p.state==='down'){p.downT-=dt;if(p.downT<=0)placePed(p,50);p.g.position.set(p.x,.45,p.z);continue;}
    if(Math.abs(p.x-pp.x)>240||Math.abs(p.z-pp.z)>240){placePed(p,60);continue;}
    if(p.state==='run'){p.x+=p.vx*dt;p.z+=p.vz*dt;p.runT-=dt;if(p.runT<=0)placePed(p,50);}
    else{const sp=p.state==='flee'?4.6:p.sp;if(p.state==='flee'){p.fleeT-=dt;if(p.fleeT<=0)p.state='walk';}p.t+=p.dir*sp*dt;if(Math.abs(p.t)>27){p.t=Math.sign(p.t)*27;p.dir*=-1;}edgeXY(p);}
    const far=Math.abs(p.x-pp.x)>110||Math.abs(p.z-pp.z)>110;p.g.visible=!far&&!inside;if(far)continue;const fast=p.state!=='walk';p.g.position.set(p.x,.3+Math.abs(Math.sin(t*(fast?12:7)+p.ph))*.08,p.z);p.g.rotation.set(0,p.state==='run'?Math.atan2(p.vx,p.vz):p.ry,0);
    const U=p.g.userData,sw=fast?.9:.5,ph=t*(fast?12:7)+p.ph;U.legs[0].rotation.x=Math.sin(ph)*sw;U.legs[1].rotation.x=-Math.sin(ph)*sw;U.arms[0].rotation.x=-Math.sin(ph)*sw;U.arms[1].rotation.x=p.state==='flee'?-2.6:p.wave?-2.8+Math.sin(t*8)*.4:Math.sin(ph)*sw;}}

/* ================= prompts, HUD, minimap ================= */
const prompts=[];function addPrompt(fn){prompts.push(fn);}
const firstPrompts=[];
function updPrompt(){let txt=null;curPrompt=null;let pf=null;if(!inside)for(const f of firstPrompts){try{pf=f(api);}catch(e){}if(pf)break;}
  if(pf){curPrompt={fn:pf.fn,first:true};txt=`<kbd>E</kbd>${esc(pf.text)}`;}
  else if(inside){const ip=nearInterior();if(ip)txt=`<kbd>E</kbd>${esc(ip.name)}`;}
  else if(player.mode==='drive'){const near=pois.find(p=>Math.hypot(player.veh.pos.x-p.x,player.veh.pos.z-p.z)<(p.drive?7:6));if(near){curPrompt={poi:near};txt=near.drive?`<kbd>E</kbd>${esc(near.name)}${Math.abs(player.veh.v)>2?' · stop first':''}`:`<kbd>E</kbd>Get out to visit ${esc(near.name)}`;if(!near.drive)curPrompt=null;}}
  else{let best=null,bd=2.8;for(const p of pois){const d=Math.hypot(player.pos.x-p.x,player.pos.z-p.z);if(d<bd){bd=d;best=p;}}
    if(best){curPrompt={poi:best};const own=best.type==='home'&&P.homes.includes(best.extra);txt=`<kbd>E</kbd>${best.prompt?best.prompt:best.type==='home'?(own?'Enter '+esc(best.name):esc(best.name)+' · for sale'):best.type==='toilet'?'Use toilet · '+inr(cost('svc.toilet',5)):esc(best.name)}`;}
    else{for(const f of prompts){const r=f(api);if(r){curPrompt={fn:r.fn};txt=`<kbd>E</kbd>${esc(r.text)}`;break;}}
      if(!txt){const v=nearestVeh();if(v)txt=`<kbd>E</kbd>${v.state==='traffic'?'Take this '+v.spec.label+' (crime)':v.state==='police'?(v.dead?'Take the wrecked jeep':'Steal police jeep'):v.fallen?'Pick up the '+v.spec.label:(v.owned?'Get in your '+v.spec.label:v.company?'Company '+v.spec.label:'Get in '+v.spec.label)}`;}}}
  const el=$('#prompt');if(txt){el.innerHTML=txt;el.hidden=false;}else el.hidden=true;}
function updHud(){$('#money').innerHTML=`${inr(P.cash)}<small>Bank ${inr(P.bank)}</small>`;setMeter('#mHp',P.health);setMeter('#mHunger',P.hunger);setMeter('#mBladder',P.bladder);setMeter('#mEnergy',P.energy);
  const drv=player.mode==='drive'&&player.veh;const spd=drv?Math.abs(player.veh.v):Math.abs(player.v);$('#kmh').textContent=Math.round(spd*2.4);$('#spdLbl').textContent=drv?'KM/H':'ON FOOT';
  const vb=$('#vbars');if(drv){vb.hidden=false;const v=player.veh;$('#fuelBar i').style.width=(v.spec.fuel?v.fuel:100)+'%';$('#fuelBar').classList.toggle('low',v.spec.fuel&&v.fuel<15);$('#fuelBar').style.opacity=v.spec.fuel?1:.35;$('#bodyBar i').style.width=v.hp+'%';$('#bodyBar').classList.toggle('low',v.hp<30);}else vb.hidden=true;
  $('#cross').style.display=camMode===2&&player.mode==='foot'?'block':'none';}
/* pre-rendered world map, 1 px = 8 m */
const MAPS=8;const mapCanvas=document.createElement('canvas');mapCanvas.width=Math.ceil(W.W/MAPS);mapCanvas.height=Math.ceil(W.H/MAPS);
{const mx=mapCanvas.getContext('2d');const lo=document.createElement('canvas');lo.width=Math.ceil(W.W/16);lo.height=Math.ceil(W.H/16);const lx=lo.getContext('2d');const img=lx.createImageData(lo.width,lo.height);
  for(let j=0;j<lo.height;j++)for(let i=0;i<lo.width;i++){const x=i*16+8,z=j*16+8;let c;if(isWater(x,z)&&!roadAt(x,z))c=cA.set('#2a6f97');else c=biomeColor(x,z,cA);const o=(j*lo.width+i)*4;img.data[o]=c.r*255;img.data[o+1]=c.g*255;img.data[o+2]=c.b*255;img.data[o+3]=255;}
  lx.putImageData(img,0,0);mx.imageSmoothingEnabled=true;mx.drawImage(lo,0,0,mapCanvas.width,mapCanvas.height);
  for(const z of W.zones){mx.fillStyle='rgba(70,64,84,.55)';mx.fillRect(z.x0/MAPS,z.z0/MAPS,z.nx*80/MAPS,z.nz*80/MAPS);}
  mx.lineCap='round';for(const r of ROADS){mx.strokeStyle=r.kind==='city'?'#a8a2b8':r.kind==='exp'?'#ffd36a':'#e8e0cc';mx.lineWidth=r.kind==='city'?1.4:2.4;mx.beginPath();r.pts.forEach(([x,z],i)=>i?mx.lineTo(x/MAPS,z/MAPS):mx.moveTo(x/MAPS,z/MAPS));mx.stroke();}
  for(const a of W.airports){mx.fillStyle='#2e2f33';mx.fillRect((a.x-a.L/2)/MAPS,(a.z-15)/MAPS,a.L/MAPS,30/MAPS);}}
const mini=$('#mini'),mc=mini.getContext('2d');
function drawMini(now){const Wd=224,pp=ppos(),h=player.mode==='drive'&&player.veh?player.veh.h:player.h;const spd=player.mode==='drive'&&player.veh?Math.abs(player.veh.v):0;const radius=nav.route?(spd>18?520:spd>9?340:200):(spd>18?700:spd>9?450:300);const ppm=(Wd/2)/radius;
  mc.save();mc.fillStyle='#2a6f97';mc.fillRect(0,0,Wd,Wd);mc.translate(Wd/2,Wd/2);mc.rotate(Math.PI+h);mc.scale(ppm*MAPS,ppm*MAPS);mc.drawImage(mapCanvas,-pp.x/MAPS,-pp.z/MAPS);mc.restore();
  mc.save();mc.translate(Wd/2,Wd/2);mc.rotate(Math.PI+h);for(const e of EDGES){const c=CONG[e.id];if(c<.42)continue;if(Math.max(e.ax,e.bx)<pp.x-radius||Math.min(e.ax,e.bx)>pp.x+radius||Math.max(e.az,e.bz)<pp.z-radius||Math.min(e.az,e.bz)>pp.z+radius)continue;mc.strokeStyle=c>.7?'#e8473a':'#ff9f1c';mc.lineWidth=Math.max(2.5,e.w*ppm*.6);mc.lineCap='round';mc.beginPath();mc.moveTo((e.ax-pp.x)*ppm,(e.az-pp.z)*ppm);mc.lineTo((e.bx-pp.x)*ppm,(e.bz-pp.z)*ppm);mc.stroke();}if(nav.route){mc.lineJoin=mc.lineCap='round';for(const [col,w] of [['#ffffff',11],['#2f7bff',6.5]]){mc.strokeStyle=col;mc.lineWidth=w;mc.beginPath();nav.route.forEach(([x,z],i)=>{const X=(x-pp.x)*ppm,Z=(z-pp.z)*ppm;i?mc.lineTo(X,Z):mc.moveTo(X,Z);});mc.stroke();}}mc.font='13px "Baloo 2", sans-serif';mc.textAlign='center';mc.textBaseline='middle';
  const icon=(x,z,col,txt,rr=7,clampIt)=>{let dx=(x-pp.x)*ppm,dz=(z-pp.z)*ppm;const d=Math.hypot(dx,dz),lim=Wd/2-10;if(d>lim){if(!clampIt)return;dx*=lim/d;dz*=lim/d;}mc.save();mc.translate(dx,dz);mc.rotate(-Math.PI-h);mc.fillStyle=col;mc.beginPath();mc.arc(0,0,rr,0,6.29);mc.fill();if(txt){mc.fillStyle='#1a1430';mc.fillText(txt,0,1);}mc.restore();};
  for(const p of pois){if(Math.abs(p.x-pp.x)>radius*1.2||Math.abs(p.z-pp.z)>radius*1.2)continue;if(p.type==='home'&&!P.homes.includes(p.extra))continue;if(radius>400&&!['pump','cng','airport','station','home','hospital'].includes(p.type))continue;icon(p.x,p.z,p.color,p.icon,8);}
  for(const v of vehicles){if(v.state!=='police')continue;icon(v.pos.x,v.pos.z,Math.floor(now*6)%2?'#ff3b3b':'#3b6bff',null,5,true);}
  if(curMission&&curMission.target){const tg=curMission.target;icon(tg.x,tg.z,'#'+(tg.col||0x3ddc97).toString(16).padStart(6,'0'),null,8,true);}
  mc.restore();mc.save();mc.translate(Wd/2,Wd/2);mc.fillStyle=CFG.accent||'#ffc93c';mc.strokeStyle='#1a1430';mc.lineWidth=2;mc.beginPath();mc.moveTo(0,-11);mc.lineTo(8,9);mc.lineTo(0,4);mc.lineTo(-8,9);mc.closePath();mc.fill();mc.stroke();mc.restore();}
function updLabels(){const pp=ppos();for(const p of pois){const d=Math.abs(p.x-pp.x)+Math.abs(p.z-pp.z);if(d<160&&!p.sp&&!inside){p.sp=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTex(p.name,p.color)}));p.sp.scale.set(9,2,1);p.sp.position.set(p.x,5,p.z);scene.add(p.sp);}
  else if(p.sp&&(d>230)){scene.remove(p.sp);p.sp.material.map.dispose();p.sp.material.dispose();p.sp=null;}}}
function updDiscover(){const pp=ppos();for(const [name,x,z] of W.places){if(P.discovered[name])continue;if(Math.hypot(x-pp.x,z-pp.z)<55){P.discovered[name]=istISO();earn(price(100),'discover');dirty=true;toast(`Discovered: ${esc(name)} · +${inr(price(100))}`,'#ffc93c');emit('discover',name);}}}

/* ================= intro ================= */
function renderIntro(){$('#gName').textContent=CFG.name;$('#gTag').textContent=CFG.tagline;const a=$('#ann');const fest=activeFestivals('MH').concat(activeFestivals('GJ'),activeFestivals('RJ')).filter((f,i,arr)=>arr.indexOf(f)===i);const ev=activeEvents();
  const lines=[];if(CFG.announce)lines.push(esc(CFG.announce));if(fest.length)lines.push('Festival now: '+fest.map(f=>esc(f.name)).join(', '));if(ev.length)lines.push('Happening now: '+ev.map(e=>esc(e.name)).join(', '));a.hidden=!lines.length;a.innerHTML=lines.join('<br>');
  $('#today').textContent=`${istText()} · Bay time ${bayTime()}`;
  drawStartMap();
  pickRow();$('#newGame').hidden=!hadSave;setAvatar();}
/* start screen: India map, tap a state to start there */
var startPick=null;
const stateRegion=st=>{const IS=window.INDIA_STATES;const q=IS&&IS.states.find(x=>x.id===st.toLowerCase());return q?q.region:null;};
function statePlayable(st){const r=REGIONS.find(q=>q.id===stateRegion(st));return !!(r&&r.map&&CFG.regions[r.id]&&W.startZones&&W.startZones[st]&&W.zones.some(z=>z.st===st));}
function drawStartMap(){const el=$('#cities');const IS=window.INDIA_STATES;if(!IS){el.innerHTML='';return;}
  if(!startPick&&!hadSave){const z=W.zones.find(q=>q.id===W.startZones.MH);if(z)startPick={st:'MH',zone:z};}
  const sel=startPick?startPick.st.toLowerCase():'';
  el.innerHTML=`<div class="smap"><svg viewBox="${IS.viewBox}" role="img" aria-label="Map of India. Tap a bright state to start there.">${IS.states.map(q=>{const st=q.id.toUpperCase(),ok=statePlayable(st);return `<path data-st="${st}" d="${q.d}" class="${ok?'ok':'no'}${q.id===sel?' on':''}"><title>${esc(q.name)}${ok?'':' · coming soon'}</title></path>`;}).join('')}</svg></div><div class="spick" id="spick"></div>`;
  el.querySelector('svg').onclick=e=>{const p=e.target.closest('path[data-st]');if(!p)return;const st=p.dataset.st;const q=IS.states.find(x=>x.id===st.toLowerCase());if(!statePlayable(st)){toast(`${esc(q?q.name:st)} opens in a coming update`,'#d6c8e4');return;}
    const z=W.zones.find(x=>x.id===W.startZones[st]);startPick={st,zone:z};el.querySelectorAll('path.on').forEach(x=>x.classList.remove('on'));p.classList.add('on');pickRow();};
  pickRow();}
function pickRow(){const el=$('#spick');if(!el)return;const go=$('#go');
  if(!startPick){el.innerHTML=`<p>Tap a bright state to travel there, or continue where you left off.</p>`;go.textContent='Continue';return;}
  const st=startPick.st,zs=W.zones.filter(z=>z.st===st).sort((a,b)=>({big:0,mid:1,small:2}[a.size]-{big:0,mid:1,small:2}[b.size]));
  el.innerHTML=`<b>${esc(W.states[st])}</b><div class="chips">${zs.slice(0,8).map(z=>`<button class="chip${z===startPick.zone?' on':''}" data-z="${z.id}">${esc(z.name)}</button>`).join('')}</div>`;
  el.onclick=e=>{const id=e.target.dataset.z;if(!id)return;startPick.zone=W.zones.find(z=>z.id===id);pickRow();};
  go.textContent=(hadSave?'Go to ':'Start in ')+startPick.zone.name;}
function startSpot(z){const cx=z.x0+z.nx*40,cz=z.z0+z.nz*40;const r=nearestRoadPoint(cx,cz,400);if(!r)return{x:cx,z:cz,h:0};return{x:r.x,z:r.z,h:Math.atan2(r.e.dx,r.e.dz)};}
$('#newGame').onclick=e=>{if(e.target.dataset.sure){P=newSave();store.set('ib.save.v3',P);location.reload();}else{e.target.dataset.sure=1;e.target.textContent='Tap again to reset';}};
let camSnap=true;
function begin(){setAvatar();document.body.classList.remove('pre');$('#intro').hidden=true;initAudio();if(ac&&ac.state==='suspended')ac.resume();started=true;camSnap=true;$('#c').focus();applyOutfit();
  if(!startedOnce){startedOnce=true;P.challans=[];
    P.cars.forEach((c,i)=>{if(c.x!=null)spawnOwned(i,c.x,c.z,c.h||0);});
    if(P.pos){if(P.inCar!=null&&P.cars[P.inCar]){const v=ownedVeh[P.inCar]||spawnOwned(P.inCar,P.pos.x,P.pos.z,P.pos.h);v.pos.set(P.pos.x,0,P.pos.z);v.h=P.pos.h;enterVehicle(v);}else{player.mode='foot';player.pos.set(P.pos.x,0,P.pos.z);player.h=P.pos.h;avatar.visible=true;}}
    else{const sp=startPick?startSpot(startPick.zone):{x:2940,z:8736,h:Math.PI/2};const v=ownedVeh[0]||spawnOwned(0,sp.x,sp.z,sp.h);v.pos.set(sp.x,0,sp.z);v.h=sp.h;enterVehicle(v);startPick=null;}
    P.cars.forEach((c,i)=>{if(!ownedVeh[i]&&!c.garage){const [x,z,h]=[2900+i*7,8747,Math.PI/2];spawnOwned(i,x,z,h);}});
    if(startPick){const sp=startSpot(startPick.zone);const v=player.mode==='drive'?player.veh:null;teleport(sp.x,sp.z,sp.h);if(v){v.pos.set(sp.x,0,sp.z);v.h=sp.h;v.v=0;enterVehicle(v);}startPick=null;}
    setPedCount(CFG.peds);hooks.start.forEach(f=>{try{f();}catch(e){console.error(e);}});
    const latest=CFG.changelog.concat(CHANGELOG).map(c=>c.v).sort((a,b)=>String(b).localeCompare(String(a),undefined,{numeric:true}))[0];if(P.seenVersion!==latest)setTimeout(()=>{if(!sheetOpen())whatsNew(true);},900);}
  toast(`${CFG.name} · ${areaName()}`,'#ffc93c');}
$('#go').onclick=()=>{if(!P.name)return profileSheet(true,begin);begin();};

/* ================= feature API ================= */
const api={colliders,cost,rawCost,storeOwned,roadSpotNear,THREE,scene,camera,renderer,player,vehicles,peds,pois,SPEC,WORLD:W,REGIONS,FURN,HTYPE,inter,avatar,outfitParts,mapCanvas,MAPS,
  get CFG(){return CFG;},get P(){return P;},get clock(){return clockH;},get gameDay(){return gameDay;},get inside(){return inside;},get muted(){return muted;},get audio(){return ac;},get started(){return started;},get weather(){return wx.cur;},get camMode(){return camMode;},
  toast,big,openSheet,closeSheet,rowHtml,spend,earn,inr,price,esc,addWanted,damage,save,makeVeh,removeVeh,spawnOwned,ownedVeh,buyVehicle,ppos,edgePos,box,boxRot,addStatic,flushStatic,LMat,buildPerson,addSign,
  addPoi(o){const p=makePoi(o);return p;},addApp,addMission,addPrompt,addFirstPrompt(f){firstPrompts.push(f);},poiHandlers,speedMods,on,emit,openWait,closeWait,startActivity,startQueue,startSleep,teleport,nearestRoadPoint,roadAt,drivable,isWater,isLand,zoneAt,stateAt,
  fareMultAt,activeFestivals,activeEvents,addChallan,istISO,istText,bayTime,gameMin,enterVehicle,exitVehicle,applyOutfit,homeById,buildInterior,nearestPoi,phoneSheet,profileSheet,hornSfx,areaName,
  onUpdate(f){hooks.update.push(f);},onStart(f){hooks.start.push(f);if(startedOnce)f();},onAfterRender(f){hooks.afterRender.push(f);},onKey(code,f){hooks.key[code]=f;},setMap(f){hooks.map=f;},setBayGame(f){hooks.bayGame=f;},setEscape(f){hooks.escape=f;},set photo(v){hooks.photo=v;},get photo(){return hooks.photo;},
  PICON,PLABEL,findRoute,get route(){return nav.route;},menuSheet,settingsSheet,get curMission(){return curMission;},
  CONG,sigState,sigJunction,
  blocks,get db(){return db;},get adminOK(){return adminOK;},buildVeh,nameOk,ageFromDob:IBCONF.ageFromDob,get adSlots(){return SLOTS;},updBillboards,billboardMeshes,adSheet,pickBillboard,personErr,personFields,refreshBillboards,openApp,set introClick(f){hooks.introClick=f;},set introLabel(f){hooks.introLabel=f;setAvatar();},cloudConfig,hubSheet,supportSheet,setAvatar,addProfileRows(f){profileRows.push(f);},set profileEdit(f){hooks.profileEdit=f;},set displayName(f){hooks.displayName=f;setAvatar();},set userEmail(f){hooks.userEmail=f;},setCfgBackend(b){cfgBackend=b;adminOK=!!(b&&b.admin);adminLocal=false;},get hadSave(){return hadSave;},
  setDirty(){dirty=true;},MR,mpick,clamp,hash,canvasTex,EDGES,ROADS,laneRandom:randomLaneNear,lanePos,uiLock};
window.BB=api;
const queued=Array.isArray(window.BBFeatures)?window.BBFeatures:[];window.BBFeatures={push(f){try{f(api);}catch(e){console.error('Feature failed',e);}}};queued.forEach(f=>window.BBFeatures.push(f));
flushStatic();

/* ================= boot + loop ================= */
applyTheme();tickClock();renderIntro();document.title=CFG.name;updWeap();renderStars();updSky(1);updSun(new THREE.Vector3(2900,0,8700));
camera.position.set(3150,60,8950);
const camPos=new THREE.Vector3(),camLook=new THREE.Vector3(),tmp=new THREE.Vector3();
let last=performance.now(),orbit=0,frame=0;
function loop(ms){requestAnimationFrame(loop);const now=ms/1000;const rdt=Math.min(1,Math.max(0,(ms-last)/1000));const dt=Math.min(.05,rdt);last=ms;frame++;tickClock();
  if(!started){orbit+=dt*.05;updSky(dt);const cx=2990,cz=8800;camera.position.set(cx+Math.cos(orbit)*170,60+Math.sin(orbit*.7)*12,cz+Math.sin(orbit)*150);camera.lookAt(cx-30,10,cz-40);updSun(camera.position);if(frame%15===1)updChunks(cx,cz);if(frame%20===1){updLabels();updBillboards(cx,cz);}
    if(frame%40===0)$('#today').textContent=`${istText()} · Bay time ${bayTime()}`;renderer.render(scene,camera);return;}
  updSky(dt);
  if(sheetOpen()||waitOpen()){tickWait(rdt);updNeeds(rdt);updHud();renderer.render(inside?inter.scene:scene,camera);for(const f of hooks.afterRender)f();return;}
  if(CFG.weather==='auto'&&wx.cur==='monsoon'&&Math.random()<.004)wx.flash=1;wx.flash=Math.max(0,wx.flash-dt*5);
  overT=Math.max(0,overT-dt);player.fireCd=Math.max(0,player.fireCd-dt);player.hitCd=Math.max(0,player.hitCd-dt);if(fireHeld&&P.weapon==='pistol')fire();
  if(inside){updFoot(dt,inter);}
  else{updTraffic(dt);updPeds(dt,now);updAnimals(dt,now);updTrains(dt);updPlanes(dt);updPolice(dt,now);
    if(overT<=0&&!hooks.photo){if(player.mode==='drive'&&player.veh)updDrive(dt,now);else updFoot(dt,null);}
    for(const v of vehicles)if(v.state==='parked'&&v.fallen)v.m.rotation.set(0,v.h,Math.PI/2.2,'YXZ');
    seaTex.offset.x+=dt*.004;seaTex.offset.y+=dt*.002;for(const f of flags)f.rotation.y=Math.sin(now*3+f.position.x)*.25;
    marker.rotation.y+=dt;beamMat.opacity=.22+Math.sin(now*3)*.07;for(const p of pois){if(p.sp)p.ring.material.opacity=.55+Math.sin(now*4)*.3;}
    if(frame%20===0)updDiscover();if(frame%20===5)updLabels();if(frame%15===2)updChunks(ppos().x,ppos().z);if(frame%60===3)updBillboards(ppos().x,ppos().z);if(frame%3===1)fadeBoards();
    if(sir)sir.g.gain.value=muted?0:(vehicles.some(v=>v.state==='police'&&!v.dead&&v.pos.distanceTo(ppos())<90)?.03:0);
    const an=areaName();if(frame%30===0&&an!==lastArea){const z=zoneAt(ppos().x,ppos().z,30);if(z&&!lastArea.startsWith(z.name)&&lastArea)toast(`Welcome to ${z.name} · ${W.states[z.st]}`,'#ffc93c');if(z)emit('zone',z);lastArea=an;$('#area').textContent=an;}}
  updNeeds(rdt);updSmoke(dt);
  for(const f of hooks.update){try{f(dt,now);}catch(e){console.error(e);}}
  for(let i=tracers.length-1;i>=0;i--){tracers[i].t-=dt;if(tracers[i].t<=0){scene.remove(tracers[i].l);tracers[i].l.geometry.dispose();tracers.splice(i,1);}}flash.intensity=Math.max(0,flash.intensity-dt*40);
  if(frame%6===0){curMission=evalMission();showMission(curMission);}
  if(frame%10===0)updNav(dt*10);
  if(frame%8===0&&!inside)updSignals();congT+=rdt;if(congT>20){congT=0;updCongestion();}
  arrow.visible=false;
  if(frame%5===0)updPrompt();updHud();if(frame%2===0&&!inside)drawMini(now);
  if(dirty&&ms-lastSave>15000){lastSave=ms;save();}
  /* camera */
  const P0=ppos();
  if(hooks.photo){hooks.photo(dt);}
  else if(inside){if(camMode===2){camera.position.set(player.pos.x,1.65,player.pos.z);camera.lookAt(player.pos.x+Math.sin(player.h)*5,1.5,player.pos.z+Math.cos(player.h)*5);}
    else{tmp.set(player.pos.x*.5,camMode===1?11:7.5,inter.d/2+(camMode===1?3:5.5));if(camSnap)camPos.copy(tmp);camPos.lerp(tmp,1-Math.exp(-dt*4));camera.position.copy(camPos);camera.lookAt(player.pos.x*.7,.6,player.pos.z*.7);}camSnap=false;}
  else{const drv=player.mode==='drive'&&player.veh;const hh=drv?player.veh.h:player.h;fwd.set(Math.sin(hh),0,Math.cos(hh));
    orbitIdle+=dt;const mv=drv?Math.abs(player.veh.v):Math.abs(player.v);if(!drag.on&&orbitIdle>2.5&&mv>1.5){const k=Math.min(1,dt*1.6);camYaw-=camYaw*k;camPitch-=camPitch*k;}
    const lx=Math.sin(hh+camYaw),lz=Math.cos(hh+camYaw);
    if(camMode===2){if(drv){const f=player.veh.spec.fp;const c=Math.cos(hh),s=Math.sin(hh);camera.position.set(P0.x+f[0]*c+f[2]*s,f[1],P0.z-f[0]*s+f[2]*c);camera.lookAt(camera.position.x+lx*10,f[1]-.2-camPitch*6,camera.position.z+lz*10);}
      else{camera.position.set(P0.x+fwd.x*.15,1.95,P0.z+fwd.z*.15);camera.lookAt(P0.x+lx*10,1.8-camPitch*6,P0.z+lz*10);}camLook.copy(P0);}
    else{const por=camera.aspect<1?1.2:1;const back=(camMode===1?22:drv?player.veh.spec.cam+3.5:4.6)*por,up=(camMode===1?20:drv?3.6+player.veh.spec.len*.15:2.5)*por;const cp=Math.cos(camPitch*.9);tmp.set(P0.x-lx*back*cp,P0.y+up+Math.sin(camPitch*.9)*back*.9,P0.z-lz*back*cp);
      if(camSnap){camPos.copy(tmp);camLook.copy(P0);}camPos.lerp(tmp,1-Math.exp(-dt*(camMode?3:5)));camera.position.copy(camPos);if(player.shake>0){player.shake-=dt;camera.position.x+=(Math.random()-.5)*player.shake;camera.position.y+=(Math.random()-.5)*player.shake;}
      tmp.set(P0.x+lx*(camMode?6:drv?5:2),P0.y+(camMode?0:drv?1.6:1.4),P0.z+lz*(camMode?6:drv?5:2));camLook.lerp(tmp,1-Math.exp(-dt*8));camera.lookAt(camLook);}camSnap=false;updSun(P0);}
  updRain(dt,camera.position.x,camera.position.y,camera.position.z);
  renderer.render(inside?inter.scene:scene,camera);for(const f of hooks.afterRender)f();}
requestAnimationFrame(loop);
addEventListener('pagehide',()=>{if(started)save();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started)save();});
})();
