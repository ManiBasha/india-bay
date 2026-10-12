
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
function activeFestivals(st){const iso=istISO();return CFG.festivals.filter(f=>f.start&&f.end&&f.start<=iso&&f.end>=iso&&(()=>{const ws=String(f.where||'all').split(',').map(s=>s.trim());return ws.includes('all')||ws.includes(st);})());}
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
function leaveHome(silent){if(!inside)return;const poi=inside.poi;const ven=inside.venue;if(ven){inter.scene.background=new THREE.Color('#120d1f');if(ven.onExit)try{ven.onExit();}catch(e){}}inter.scene.remove(avatar);scene.add(avatar);inside=null;const o=1.8;player.pos.set(poi.x+Math.sin(poi.rot)*o,0,poi.z+Math.cos(poi.rot)*o);player.h=poi.rot;camSnap=true;}
// Venues: walk-in interiors for stadiums, malls and attractions, built by features.
// o = {poi, name, w, d, bg, build(group) -> interior points [{k,name,x,z}], onAction(k), onExit(), start:{x,z,h}, title, hint}
function enterVenue(o){if(inside)leaveHome(true);if(player.mode==='drive')exitVehicle(true);if(inter.group)inter.scene.remove(inter.group);const g=new THREE.Group();inter.w=o.w;inter.d=o.d;
  const pts=o.build(g)||[];pts.push({k:'door',name:o.exitName||'Exit · go outside',x:(o.exit||{x:0}).x,z:(o.exit||{z:o.d/2-1}).z});inter.scene.add(g);inter.group=g;inter.pois=pts;inter.scene.background=new THREE.Color(o.bg||'#120d1f');
  inside={poi:o.poi,venue:o,home:{name:o.name}};player.mode='foot';const st=o.start||{x:0,z:o.d/2-2,h:Math.PI};player.pos.set(st.x,0,st.z);player.h=st.h;scene.remove(avatar);inter.scene.add(avatar);avatar.visible=true;camSnap=true;emit('enterVenue',o);}
function homeAction(k){if(inside&&inside.venue){if(k==='door')return leaveHome();return inside.venue.onAction&&inside.venue.onAction(k);}if(k==='door')return leaveHome();
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
const ORDER={phone:['map','swiggy','zomato','baycart','sports','baypay','roadside','radio','baygame','camera','baygram','story'],menu:['garage','jobs','wardrobe','business'],settings:['whatsnew','ach','admin']};
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
function applyConfig(c){const prev=CFG;CFG=mergeCfg(DEFAULTS,c);applyTheme();document.title=CFG.name;renderIntro();if(started){setPedCount(Math.round(CFG.peds*botScale));}
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
  <details><summary>Travel tickets and times</summary>${Object.keys(C.travel).map(k=>`<div class="pair">${num('travel.'+k+'.0',{sleeper:'Train sleeper',ac:'Train AC',flight:'Flight',bus:'Bus',bottaxi:'Bot taxi',ferry:'Ferry',local:'Mumbai local',metro:'Metro'}[k]+' ticket (₹)',0,100000,10)}${num('travel.'+k+'.1','Longest trip (real seconds)',5,1800,5)}</div>`).join('')}<p class="note">Shorter trips take less time, scaled by distance.</p></details>
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
  if(inside)add(inside.venue?{pri:100,k:inside.venue.name,t:inside.venue.title||'Have a look around',m:inside.venue.hint||'Walk up to things and press E'}:{pri:100,k:inside.home.name,t:'Home sweet home',m:'Walk to the bed, kitchen or door'});
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
function nearInterior(){let b=null,bd=inside&&inside.venue?2.4:1.4;for(const p of inter.pois){const d=Math.hypot(player.pos.x-p.x,player.pos.z-p.z);if(d<bd){bd=d;b=p;}}return b;}

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
  if(bounds){player.pos.x=clamp(nx,-bounds.w/2+.4,bounds.w/2-.4);player.pos.z=clamp(nz,-bounds.d/2+.4,bounds.d/2-.3);const vb=inside&&inside.venue&&inside.venue.blk;if(vb)for(const r of vb){const q=player.pos;if(q.x>r[0]-.35&&q.x<r[2]+.35&&q.z>r[1]-.35&&q.z<r[3]+.35){const dl=q.x-r[0]+.35,dr=r[2]+.35-q.x,du=q.z-r[1]+.35,dd=r[3]+.35-q.z,m=Math.min(dl,dr,du,dd);if(m===dl)q.x=r[0]-.35;else if(m===dr)q.x=r[2]+.35;else if(m===du)q.z=r[1]-.35;else q.z=r[3]+.35;}}}
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
  let spawns=0;while(n<Math.round(CFG.traffic*botScale)&&spawns<3){spawns++;const v=spawnTraffic(started);if(v){const c=CONG[v.lane.e.id];if(Math.random()>.35+c){removeVeh(v);continue;}v.lane.vmax*=1-.55*c;n++;}}}
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
    setPedCount(Math.round(CFG.peds*botScale));hooks.start.forEach(f=>{try{f();}catch(e){console.error(e);}});
    const latest=CFG.changelog.concat(CHANGELOG).map(c=>c.v).sort((a,b)=>String(b).localeCompare(String(a),undefined,{numeric:true}))[0];if(P.seenVersion!==latest)setTimeout(()=>{if(!sheetOpen())whatsNew(true);},900);}
  toast(`${CFG.name} · ${areaName()}`,'#ffc93c');}
$('#go').onclick=()=>{if(!P.name)return profileSheet(true,begin);begin();};

/* ================= feature API ================= */
// Fewer bot cars and people when real players are around (set by online play).
let botScale=1;function setBotScale(k){k=clamp(k,.2,1);if(Math.abs(k-botScale)<.04)return;botScale=k;if(started)setPedCount(Math.round(CFG.peds*botScale));}
const api={onFire:f=>fireHooks.push(f),setBotScale,get botScale(){return botScale;},openPoi:p=>openPoi(p),foodSheet:p=>foodSheet(p),colliders,cost,rawCost,enterVenue,leaveVenue:()=>leaveHome(),interScene:inter.scene,get insideVenue(){return inside&&inside.venue;},storeOwned,roadSpotNear,THREE,scene,camera,renderer,player,vehicles,peds,pois,SPEC,WORLD:W,REGIONS,FURN,HTYPE,inter,avatar,outfitParts,mapCanvas,MAPS,
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
    else if(inside.venue&&(inter.w>16||inter.d>16)){const bk=camMode===1?12:6,up=camMode===1?9:3.4;tmp.set(clamp(player.pos.x-Math.sin(player.h)*bk,-inter.w/2+.5,inter.w/2-.5),up,clamp(player.pos.z-Math.cos(player.h)*bk,-inter.d/2+.5,inter.d/2-.5));if(camSnap)camPos.copy(tmp);camPos.lerp(tmp,1-Math.exp(-dt*5));camera.position.copy(camPos);camera.lookAt(player.pos.x+Math.sin(player.h)*3,1.4,player.pos.z+Math.cos(player.h)*3);}
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
