
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
const SKY=[[0,'#0f1436','#1d2448',.16,'#9fb2ff',.42,1],[5,'#0f1436','#1d2448',.16,'#9fb2ff',.42,1],[6.3,'#f2a1a7','#e9a99a',.5,'#ffb38a',.5,.4],[8,'#8ec5ee','#bcd8ea',.95,'#fff1d6',.75,0],[16,'#8ec5ee','#c9dcea',.95,'#fff1d6',.75,0],[17.6,'#f3a65a','#f0a868',.95,'#ffb36b',.7,0],[18.6,'#d8606a','#c86a70',.6,'#ff8a5c',.55,.35],[19.6,'#3a2a5c','#3b2f5a',.25,'#9f8cff',.42,.85],[21,'#0f1436','#1d2448',.16,'#9fb2ff',.42,1],[24,'#0f1436','#1d2448',.16,'#9fb2ff',.42,1]];
const cB=new THREE.Color(),greyC=new THREE.Color(),lampOff=new THREE.Color(0x666055),lampOn=new THREE.Color(0xffd27a);let nightF=0;
const nightFill=new THREE.PointLight(0xffd9a8,0,70,1.4);scene.add(nightFill);   // the warm glow of nearby street lights around you
function updSky(dt){const target=CFG.weather==='auto'?autoWeather():CFG.weather;if(target!==wx.cur){wx.cur=target;emit('weather',target);}const Wt=WX[target]||WX.clear;const k=Math.min(1,dt*.8);for(const f of ['dim','fn','ff','rain','grey'])wx[f]+=(Wt[f]-wx[f])*k;
  let i=0;while(i<SKY.length-2&&SKY[i+1][0]<=clockH)i++;const a=SKY[i],b=SKY[i+1];const t=(clockH-a[0])/(b[0]-a[0]||1);nightF=a[6]+(b[6]-a[6])*t;greyC.set(0x8b9099).multiplyScalar(.2+.8*(1-nightF));
  scene.background.set(a[1]).lerp(cB.set(b[1]),t).lerp(greyC,wx.grey);scene.fog.color.set(a[2]).lerp(cB.set(b[2]),t).lerp(greyC,wx.grey);scene.fog.near=wx.fn;scene.fog.far=wx.ff;
  sun.intensity=(a[3]+(b[3]-a[3])*t)*wx.dim;sun.color.set(a[4]).lerp(cB.set(b[4]),t);hemi.intensity=(a[5]+(b[5]-a[5])*t)*(.55+.45*wx.dim)+wx.flash*2.5;hemi.color.copy(scene.fog.color).lerp(cB.set('#ffffff'),.4);
  const night=Math.max(nightF,(1-wx.dim)*.45);for(const m of styleCache.values())m.emissiveIntensity=night*.95;M.lamp.color.copy(lampOff).lerp(lampOn,night);poolMat.opacity=night*.62;nightFill.intensity=inside?0:night*.85;if(!inside){const pp=ppos();nightFill.position.set(pp.x,14,pp.z);}headL.intensity=player.mode==='drive'&&!inside?night*2.2:0;
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
let godMode=false;function damage(n,why){if(inside||godMode)return;P.health=Math.max(0,P.health-n);if(P.health<=0)knockedOut(why);}
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
function addChallan(amt,why){if(!CFG.challansOn)return;P.challans=P.challans||[];P.challans.push({amt:price(amt),why,day:istISO()});dirty=true;toast(`🚨 e-challan ${inr(price(amt))} · ${why}`,'#ff9f1c');emit('challan',{amt,why});} // traffic fines: only when the admin turns challans on

/* ================= entering and leaving vehicles ================= */
function enterVehicle(v){if(v.repairing){toast('Still with the mechanic · see the timer at the top','#ff9f1c');return;}if(v.state==='traffic'){ejectDriver(v);addWanted(1,'Carjacking');if(v.m.userData.driver&&v.spec.two){v.m.remove(v.m.userData.driver);v.m.userData.driver=null;}}
  else if(v.state==='police'){if(!v.dead)addWanted(2,'Stole a police jeep');}
  if(v.fallen){v.fallen=false;}v.state='player';v.lane=null;v.v=0;player.veh=v;player.mode='drive';
  const ride=!!(v.spec.two||v.spec.pedal);avatar.visible=ride;if(v.m.userData.driver&&!v.spec.two)v.m.userData.driver.visible=true;
  v.m.add(headL);v.m.add(headT);headL.position.set(0,1.3,v.spec.len/2);headT.position.set(0,0,v.spec.len/2+12);
  emit('enterVehicle',v);toast(v.owned?`Your ${v.spec.label}`:v.spec.label,'#ffc93c');updAvatarGear();}
function exitVehicle(force){const v=player.veh;if(!v)return;if(!force&&Math.abs(v.v)>4){toast('Slow down to get out','#ff9f1c');return;}if(!force&&v.pos.y>1){toast('No stopping on the flyover · get out after the ramp','#ff9f1c');return;}
  v.state='parked';v.v=0;v.m.remove(headL);v.m.remove(headT);scene.add(headL);scene.add(headT);headL.intensity=0;if(v.m.userData.driver&&!v.spec.two)v.m.userData.driver.visible=false;
  const sx=Math.cos(v.h),sz=-Math.sin(v.h);let px=v.pos.x+sx*(v.spec.wid/2+.9),pz=v.pos.z+sz*(v.spec.wid/2+.9);if(!drivable(px,pz)){px=v.pos.x-sx*(v.spec.wid/2+.9);pz=v.pos.z-sz*(v.spec.wid/2+.9);}
  player.pos.set(px,0,pz);player.h=v.h;player.mode='foot';player.veh=null;avatar.visible=true;avatar.rotation.set(0,player.h,0);collide(player.pos,.4,true);emit('exitVehicle',v);updAvatarGear();
  if(v.company)return;const extra=vehicles.filter(q=>q.state==='parked'&&!q.owned&&!q.company);if(extra.length>8){extra.sort((a,b)=>b.pos.distanceTo(player.pos)-a.pos.distanceTo(player.pos));removeVeh(extra[0]);}}
function nearestVeh(){let best=null,bd=1e9;for(const v of vehicles){if(v.state==='player'||v.state==='procession')continue;const s=segDist(player.pos.x,player.pos.z,v);const lim=v.spec.wid/2+1.8;if(s.d<lim&&s.d<bd){bd=s.d;best=v;}}return best;}
function fallOff(v,impact){exitVehicle(true);v.fallen=true;v.m.rotation.set(0,v.h,Math.PI/2.2,'YXZ');player.knock=1.6;const dmg=impact*(P.helmet?.45:1.4);damage(dmg,'Fell off');toast(P.helmet?'You fell off · the helmet saved you':'You fell off · buy a helmet!','#ff5d73');emit('fall');}

/* ================= outfits ================= */
const shirtMat=AU.body.material=LMat(P.outfit.topCol);AU.arms.forEach(a=>a.children[0].material=shirtMat);const legMat=LMat(P.outfit.botCol);AU.legs.forEach(l=>l.children[0].material=legMat);if(AU.hips)AU.hips.material=legMat;
function applyOutfit(){const o=P.outfit;shirtMat.color.set(o.topCol||'#e8573e');legMat.color.set(o.botCol||'#2d3142');outfitParts.kurta.visible=o.top==='kurta';outfitParts.kurta.material.color.set(o.topCol);
  outfitParts.saree.visible=outfitParts.pallu.visible=o.top==='saree';outfitParts.saree.material.color.set(o.topCol);outfitParts.pallu.material.color.set(o.topCol);AU.legs.forEach(l=>l.visible=o.top!=='saree'||player.mode==='drive');
  outfitParts.sneakers.forEach(s=>s.visible=o.shoes==='sneakers'&&o.top!=='saree');outfitParts.glasses.visible=!!o.glasses;updAvatarGear();}
/* your look (Settings → My look): man or woman, skin tone, face shape, hair style and colour, beard, build and height */
const LOOK_DEF={female:false,skin:'#a0673f',face:'oval',hair:'short',hairC:'#141010',beard:'none',build:'average',height:'average',bindi:true,specs:'none',hat:'none',hatC:'#e8572a',nose:'medium',brows:'normal'};
function applyLook(){const L=P.look=Object.assign({},LOOK_DEF,P.look||{});const hairs=L.female?LOOKS.female.hair:LOOKS.male.hair;if(!hairs.includes(L.hair))L.hair=hairs[0];if(L.female)L.beard='none';
  AU.skinM.color.set(L.skin);AU.hairM.color.set(L.hairC);AU.female=L.female;AU.look=L;
  for(const ch of [...AU.headG.children]){AU.headG.remove(ch);ch.geometry.dispose();}const hm=AU.mk(headParts(L,L.skin,L.hairC,L.female),AU.headG);AU.hair=hm.hair||{visible:true};
  const k=BUILDK(L.build);const bp=bodyParts(L,{dress:'shirt',shirt:'#ffffff',pants:'#000000'});
  const geo=r=>merge(bp.filter(q=>q[0]===r).map(([r2,gg,cc,sx,sy,sz,x,y,z,rx,rz])=>{const g=gg.clone();g.scale(sx,sy,sz);if(rx)g.rotateX(rx);if(rz)g.rotateZ(rz);g.translate(x,y,z);return g;}));
  AU.body.geometry.dispose();AU.body.geometry=geo('shirt');AU.hips.geometry.dispose();AU.hips.geometry=geo('pants');if(AU.belt){AU.belt.visible=!L.female;AU.belt.scale.set(k,1,k);}
  AU.legs.forEach((l,i)=>l.position.x=(i?1:-1)*.1*k);AU.arms.forEach((a,i)=>a.position.x=(i?1:-1)*.3*k);avatar.scale.setScalar(L.height==='tall'?1.04:L.height==='short'?.95:1);
  outfitParts.kurta.scale.set(1.05*k,1,.7*k);outfitParts.saree.scale.set(1.04*k,1,.74*k);updAvatarGear();emit('look',L);}
// a short code so other players see your look online: m/f + skin, face, hair, hair colour, beard, build, height
function lookCode(){const L=Object.assign({},LOOK_DEF,P.look||{});const hairs=L.female?LOOKS.female.hair:LOOKS.male.hair;const ix=(a,v)=>Math.max(0,a.indexOf(v));
  return (L.female?'f':'m')+[ix(SKIN,L.skin),ix(LOOKS.face,L.face),ix(hairs,L.hair),ix(HAIRC,L.hairC),ix(LOOKS.beard,L.beard),ix(LOOKS.build,L.build),ix(LOOKS.height,L.height),ix(LOOKS.specs,L.specs),ix(LOOKS.hat,L.hat),ix(LOOKS.nose,L.nose),ix(LOOKS.brows,L.brows)].join('');}
function decodeLook(s){if(!/^[mf][0-9]{7,12}$/.test(s||''))return null;const f=s[0]==='f',d=s.slice(1).split('').map(Number);const hairs=f?LOOKS.female.hair:LOOKS.male.hair;
  return{female:f,skin:SKIN[d[0]]||SKIN[3],face:LOOKS.face[d[1]]||'oval',hair:hairs[d[2]]||hairs[0],hairC:HAIRC[d[3]]||HAIRC[0],beard:f?'none':LOOKS.beard[d[4]]||'none',build:LOOKS.build[d[5]]||'average',height:LOOKS.height[d[6]]||'average',specs:LOOKS.specs[d[7]]||'none',hat:LOOKS.hat[d[8]]||'none',nose:LOOKS.nose[d[9]]||'medium',brows:LOOKS.brows[d[10]]||'normal'};}
applyLook();
// Settings → My look: the camera turns round to face you while you change things
const SWN=['Deep brown','Dark','Brown','Wheatish brown','Warm','Wheatish','Light','Fair'],HCN=['Black','Soft black','Dark brown','Brown','Light brown','Grey','White','Henna'];
function frameLook(){const p=new THREE.Vector3();avatar.getWorldPosition(p);const h=player.mode==='drive'&&player.veh?player.veh.h:player.h;const fx=Math.sin(h),fz=Math.cos(h);const wide=innerWidth>=800;const d=wide?2.7:3.4;
  // face the avatar from the front, or from the side if a wall is in the way
  let ang=0;if(!inside){const tv=new THREE.Vector3();for(const a of [0,.5,-.5,1,-1,1.6,-1.6,2.3,-2.3,Math.PI]){const c=Math.cos(a),sn=Math.sin(a);const ux=fx*c+fz*sn,uz=-fx*sn+fz*c;let ok=true;for(const k of [.35,.7,1]){tv.set(p.x+ux*d*k,0,p.z+uz*d*k);if(collide(tv,.4,false)||vehicles.some(v=>Math.hypot(v.pos.x-tv.x,v.pos.z-tv.z)<(v.spec.len||3)/2+.8)){ok=false;break;}}if(ok){ang=a;break;}}}
  const c0=Math.cos(ang),s0=Math.sin(ang);const ux=fx*c0+fz*s0,uz=-fx*s0+fz*c0;
  camera.position.set(p.x+ux*d,p.y+(wide?1.45:1.6),p.z+uz*d);const rx=uz,rz=-ux;camera.lookAt(p.x+(wide?rx*.85:0),p.y+(wide?1.05:.15),p.z+(wide?rz*.85:0));}
function lookSheet(){const L=Object.assign({},LOOK_DEF,P.look||{});
  const chips=(key,list,names)=>`<div class="chips">${list.map((v,i)=>`<button class="chip${String(L[key])===v?' on':''}" data-lk="${key}" data-v="${v}">${esc(names?names[i]:v[0].toUpperCase()+v.slice(1))}</button>`).join('')}</div>`;
  const sw=(key,list,names)=>`<div class="chips swatch">${list.map((v,i)=>`<button class="chip sw${L[key]===v?' on':''}" data-lk="${key}" data-v="${v}" aria-label="${names[i]}" title="${names[i]}" style="--c:${v}"><i></i></button>`).join('')}</div>`;
  const hairs=L.female?LOOKS.female.hair:LOOKS.male.hair;
  const html=`<h3 class="sub">You are</h3>${chips('female',[false,true].map(String),['A man','A woman'])}
    <h3 class="sub">Skin tone</h3>${sw('skin',SKIN,SWN)}<h3 class="sub">Face shape</h3>${chips('face',LOOKS.face)}
    <h3 class="sub">Hair style</h3>${chips('hair',hairs)}<h3 class="sub">Hair colour</h3>${sw('hairC',HAIRC,HCN)}
    ${L.female?`<h3 class="sub">Bindi</h3>${chips('bindi',['true','false'],['Yes','No'])}`:`<h3 class="sub">Beard</h3>${chips('beard',LOOKS.beard)}`}
    <h3 class="sub">Nose</h3>${chips('nose',LOOKS.nose)}<h3 class="sub">Eyebrows</h3>${chips('brows',LOOKS.brows)}
    <h3 class="sub">Spectacles</h3>${chips('specs',LOOKS.specs,['None','Round','Square','Sunglasses'])}<h3 class="sub">Headwear</h3>${chips('hat',LOOKS.hat,['None','Cricket cap','Turban (pagdi)','Gandhi topi'])}
    ${L.hat!=='none'?`<div class="chips swatch">${['#e8572a','#f4c430','#c8102e','#f4f1ea','#2d6cdf','#ff8fd0','#1f8a4c','#1a1a1a'].map(v=>`<button class="chip sw${L.hatC===v?' on':''}" data-lk="hatC" data-v="${v}" aria-label="Headwear colour" style="--c:${v}"><i></i></button>`).join('')}</div>`:''}
    <h3 class="sub">Body type</h3>${chips('build',LOOKS.build)}<h3 class="sub">Height</h3>${chips('height',LOOKS.height)}
    <div class="btnrow2">${rowHtml('rand','Surprise me','A random new look','Random','ghost')}${rowHtml('ward','Clothes','Shirts, kurtas, sarees, shoes and glasses in the Wardrobe','Wardrobe','ghost')}</div>
    <p class="note">${player.mode==='drive'?'Step out of the vehicle to see yourself better. ':''}Other players see your look online.</p>`;
  const set=(k,v)=>{const q=P.look=Object.assign({},LOOK_DEF,P.look||{});q[k]=v;if(k==='female'){q.hair=(v?LOOKS.female.hair:LOOKS.male.hair)[0];if(v)q.beard='none';}dirty=true;applyLook();frameLook();lookSheet();};
  if($('#sheetWrap').hidden||!$('#sheetWrap').classList.contains('lookmode')){openSheet('🧑 My look','Changes show on you right away',html,null,()=>{$('#sheetWrap').classList.remove('lookmode');camSnap=true;});$('#sheetWrap').classList.add('lookmode');frameLook();}
  else $('#sbody').innerHTML=html;
  $('#sheet').onclick=e=>{const b=e.target.closest('[data-lk]');if(b){const k=b.dataset.lk,v=b.dataset.v;return set(k,v==='true'?true:v==='false'?false:v);}const id=e.target.dataset.id;
    if(id==='rand'){const f=!!(P.look&&P.look.female);P.look=Object.assign(randomLook(f),{skin:mpick(SKIN),hairC:mpick(HAIRC.slice(0,6)),height:mpick(LOOKS.height)});dirty=true;applyLook();frameLook();lookSheet();}
    if(id==='ward'){const a=apps.find(q=>q.id==='wardrobe');if(a)a.fn();}};}
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
function openWait(o){wait=Object.assign({t:0},o);wait.t0=Date.now()-wait.t*1000;if(o.persist){P.extra.wait=Object.assign({},o.persist,{t0:wait.t0,total:o.total});dirty=true;try{save();}catch(e){}}const el=$('#wait');el.hidden=false;el.innerHTML=`<div class="wcard"><div class="wk">${esc(o.kind||'Please wait')}</div><h2>${esc(o.title)}</h2><div class="wsub" id="wsub">${esc(o.sub||'')}</div><div class="wbar"><i id="wfill"></i></div><div class="wtime" id="wtime"></div>
  <div class="btnrow wbtns">${(o.buttons||[]).map(b=>`<button class="buy ghost" data-w="${b.id}">${esc(b.label)}</button>`).join('')}${hooks.bayGame?'<button class="buy ghost" data-w="__game">Play BayGame</button>':''}${o.cancel?`<button class="buy danger" data-w="__cancel">${esc(o.cancel)}</button>`:''}</div></div>`;
  el.onclick=e=>{const id=e.target.dataset&&e.target.dataset.w;if(!id)return;if(id==='__cancel'){const w=wait;closeWait();w.onCancel&&w.onCancel();return;}if(id==='__game'){hooks.bayGame();return;}const b=(wait.buttons||[]).find(x=>x.id===id);b&&b.fn();};for(const k in keys)keys[k]=false;}
function closeWait(){if(P.extra&&P.extra.wait){delete P.extra.wait;dirty=true;}wait=null;$('#wait').hidden=true;sleeping=false;}
// wall clock (Beta v1.01.11): the timer keeps going with the screen off or the browser closed
function tickWait(dt){if(!wait)return;const nt=(Date.now()-wait.t0)/1000;const d=Math.max(0,nt-wait.t);wait.t=nt;const f=Math.min(1,wait.t/wait.total);if(wait.onTick)wait.onTick(d,f);$('#wfill').style.width=(f*100)+'%';const left=Math.max(0,Math.ceil(wait.total-wait.t));$('#wtime').textContent=wait.timeText?wait.timeText(left,f):`${left}s left`;
  if(f>=1){const w=wait;closeWait();w.onDone&&w.onDone();}}
// Food also heals: health goes up by half of what the dish fills, when you are hurt.
function healFx(fx){const o=Object.assign({},fx);const h=Math.max(0,fx.hunger||0)*.5+(fx.energy||0)*.3;if(h>0)o.health=(o.health||0)+h;return o;}
function startActivity(o){if(player.stars&&!o.elapsed){toast('Lose the police first','#ff5d73');return;}const total=o.total||Math.max(2,o.minutes/Math.max(.05,CFG.timeSpeed));const t=Math.min(total,o.elapsed||0);let applied=o.applied!=null?o.applied:t/total;const eff=o.effects||{};
  const persist=o.noPersist?null:{type:'act',sleep:!!o.sleep,o:{kind:o.kind,title:o.title,sub:o.sub,minutes:o.minutes,effects:o.effects,cancelLabel:o.cancelLabel,total,sleep:o.sleep,resume:o.resume}};
  openWait({kind:o.kind||'Activity',title:o.title,sub:o.sub||`${o.minutes} game minutes`,total,t,persist,cancel:o.cancelLabel||'Stop',buttons:o.buttons,timeText:(l)=>`${l}s · Bay ${bayTime()}`,
    onTick:(dt,f)=>{const d=f-applied;applied=f;for(const k in eff)P[k]=clamp(P[k]+eff[k]*d,0,100);o.onTick&&o.onTick(dt,f);},onDone:()=>{dirty=true;o.onDone&&o.onDone();emit('activity',o);},onCancel:()=>{dirty=true;o.onCancel&&o.onCancel();}});}
const resumers={};function addResumer(k,f){resumers[k]=f;}
function resumeWait(){const r=P.extra&&P.extra.wait;if(!r||wait)return;delete P.extra.wait;const el=(Date.now()-r.t0)/1000;
  if(r.type==='act'){const o=Object.assign({},r.o,{elapsed:el,applied:Math.max(0,Math.min(1,((P.savedAt||r.t0)-r.t0)/1000/r.o.total))});if(o.resume&&resumers[o.resume.key])return resumers[o.resume.key](o.resume.data,o,r);if(o.sleep){sleeping=true;o.onDone=()=>{save();toast('Fully rested · game saved','#3ddc97');emit('sleep');};o.onCancel=()=>{save();};}
    toast(el>=o.total?`${esc(o.title)} · finished while you were away`:`Welcome back · ${esc(o.title)} continues`,'#d6c8e4');return startActivity(o);}
  if(resumers[r.type])resumers[r.type](r,el);}
function startSleep(title,sub){if(P.energy>85){toast('You are not sleepy yet','#d6c8e4');return;}const mins=CFG.act.sleep*(100-P.energy)/100;sleeping=true;
  startActivity({kind:'Sleeping',sleep:true,title,sub:sub+' · wake up any time',minutes:Math.max(20,mins),effects:{energy:100-P.energy,health:Math.max(0,(100-P.health)*.8*(100-P.energy)/100+(P.health<100?10:0))},cancelLabel:'Wake up',onDone:()=>{save();toast('Fully rested · game saved','#3ddc97');emit('sleep');},onCancel:()=>{save();toast('Up early · game saved','#d6c8e4');}});sleeping=true;}
const QLINES=['Bhaiya, jaldi karo!','Line mein raho, boss.','Ek minute, server down hai.','Chhutta nahi hai?','Uncle is paying in coins.'];
function startQueue(o){if(player.stars){toast('Lose the police first','#ff5d73');return;}const rush=(clockH>=8&&clockH<11)||(clockH>=17&&clockH<21);let ahead=o.ahead!=null?o.ahead:Math.floor(MR(0,rush?6:3));const svc=CFG.queue[o.place]||15;
  const total=Math.max(1,(ahead+1)*svc);openWait({kind:'Queue',title:o.title,sub:ahead?`${ahead} ${ahead===1?'person':'people'} ahead of you${rush?' · rush hour':''}`:'You are next',total,cancel:'Leave the queue',
    timeText:(l,f)=>{const pos=Math.ceil((1-f)*(ahead+1))-1;$('#wsub').textContent=pos>0?`${pos} ahead of you`:'Being served';return `~${l}s`;},
    buttons:[...(['petrol','cng'].includes(o.place)&&player.mode==='drive'?[{id:'honk',label:'Honk',fn:()=>{hornSfx();toast(mpick(QLINES),'#ffc93c');}}]:[]),{id:'cut',label:'Cut the queue',fn:()=>{closeWait();toast('Attendant: "Line mein aao!" · service refused','#ff5d73');}}],
    onDone:()=>{o.onServe&&o.onServe();}});}

/* ================= sheets ================= */
let sheetClose=null;const sheetOpen=()=>!$('#sheetWrap').hidden;
// Every sheet has ‹ Back: it returns to the sheet you came from (Settings, Phone, Menu, apps, shops…), or closes the
// first one. The phone's back gesture or button does the same.
let sheetStack=[],curSheet=null,navBack=false,histOn=false,skipPop=0;let pendingBack=0;
function openSheet(title,sub,body,bind,onClose){const was=sheetOpen();if(!was)sheetStack=[];else if(curSheet&&!navBack&&curSheet.title!==title){sheetStack.push(curSheet);if(sheetStack.length>12)sheetStack.shift();}
  curSheet={title,sub,body,bind,onClose};$('#sheet').onclick=null;$('#sheetWrap').classList.remove('lookmode');
  $('#sheet').innerHTML=($('#sheetWrap').classList.contains('phonemode')?`<div class="pstat"><b>${bayTime()}</b><i class="notch"></i><span>📶 4G 🔋</span></div>`:'')+`<div class="shead"><button class="back" aria-label="Back" title="Back" data-back>‹</button><div class="stt"><h2>${title}</h2><div class="sub">${sub||''}</div></div><button class="x" aria-label="Close" data-close>×</button></div><div id="sbody">${body}</div>`;
  $('#sheetWrap').hidden=false;sheetClose=onClose||null;for(const k in keys)keys[k]=false;$$('.pad button').forEach(b=>b.classList.remove('on'));$('#sheet').querySelector('[data-close]').onclick=closeSheet;
  $('#sheet').querySelector('[data-back]').onclick=e=>{e.stopPropagation();sheetBack();};
  if(pendingBack){clearTimeout(pendingBack);pendingBack=0;histOn=true;}   // a sheet that opens right after another closed reuses its history step
  if(!histOn){try{history.pushState({ibSheet:1},'');histOn=true;}catch(e){}}if(bind)bind($('#sheet'));}
function sheetBack(){const prev=sheetStack.pop();if(!prev)return closeSheet();if(sheetClose){const f=sheetClose;sheetClose=null;try{f();}catch(e){}}navBack=true;try{openSheet(prev.title,prev.sub,prev.body,prev.bind,prev.onClose);}finally{navBack=false;}}
function closeSheet(){$('#sheetWrap').hidden=true;$('#sheetWrap').classList.remove('phonemode');sheetStack=[];curSheet=null;if(histOn){histOn=false;clearTimeout(pendingBack);pendingBack=setTimeout(()=>{pendingBack=0;if(histOn)return;try{skipPop++;history.back();}catch(e){skipPop=Math.max(0,skipPop-1);}},80);}if(sheetClose){const f=sheetClose;sheetClose=null;f();}}
addEventListener('popstate',()=>{if(skipPop){skipPop--;return;}if(!histOn)return;histOn=false;if(sheetOpen()){sheetBack();if(sheetOpen()&&!histOn){try{history.pushState({ibSheet:1},'');histOn=true;}catch(e){}}}});
$('#sheetWrap').addEventListener('click',e=>{if(e.target.id==='sheetWrap')closeSheet();});
const uiLock=()=>sheetOpen()||waitOpen()||!started||howOpen();
function rowHtml(id,nm,sub,label,cls=''){return`<div class="row"><div class="nm">${nm}<small>${sub}</small></div><button class="buy ${cls}" data-id="${id}">${label}</button></div>`;}
function spend(n,allowBank){if(P.cash>=n){P.cash-=n;dirty=true;return true;}if(allowBank&&P.cash+P.bank>=n){P.bank-=n-P.cash;P.cash=0;dirty=true;return true;}toast(`Not enough ${allowBank?'money':'cash'} · you need ${inr(n)}`,'#ff5d73');return false;}
function earn(n,why){P.cash+=n;P.stats.earned+=n;dirty=true;emit('earn',{n,why});}

/* core shops */
const KIND_MIN=k=>CFG.act[k]||CFG.act.snack;
let parcelMode=false;
function foodSheet(poi){const list=W.menus[poi.extra]||W.menus.MH;openSheet(poi.name,`Cash ${inr(P.cash)} · Food ${Math.round(P.hunger)}%`,`<div class="chips"><button class="chip${parcelMode?'':' on'}" data-pm="0">🍽 Eat here</button><button class="chip${parcelMode?' on':''}" data-pm="1">📦 Parcel · keep for later</button></div>`+list.map(([id,nm,sub,p,fx,k])=>rowHtml(id,nm,parcelMode?`${sub} · packed to take away · keeps about 6 Bay hours`:`${sub} · ${KIND_MIN(k)} min`,inr(cost('food.'+poi.extra+'.'+id,p)))).join(''),
  s=>s.onclick=e=>{if(e.target.dataset.pm!=null){parcelMode=e.target.dataset.pm==='1';return foodSheet(poi);}const id=e.target.dataset.id;if(!id)return;const it=list.find(i=>i[0]===id);if(!spend(cost('food.'+poi.extra+'.'+id,it[3])))return;
    if(parcelMode){emit('parcel',{item:it,from:poi.name,kind:'fresh'});toast(`📦 ${it[1]} packed · in your food bag (Phone → Food bag)`,'#3ddc97');return foodSheet(poi);}closeSheet();emit('eat',it);startActivity({kind:'Eating',title:it[1],sub:poi.name,minutes:KIND_MIN(it[5]),effects:healFx(it[4]),onDone:()=>toast(`${it[1]} · tasty`,'#3ddc97')});});}
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
function realtySheet(poi){openSheet(poi.name,`Cash ${inr(P.cash)} · Bank ${inr(P.bank)}`,W.homes.filter(h=>!h.starter).map(h=>{const z=W.zones.find(q=>q.id===h.zone);return rowHtml(h.id,h.name,`${z?z.name:''} · ${HTYPE[h.type].toilet?'with bathroom':'shared toilet'}`,P.homes.includes(h.id)?'Owned':inr(cost('home.'+h.id,h.price)),P.homes.includes(h.id)?'ghost':'');}).join('')+`<p class="note">Homes are marked H on the map once you own them. Sleep, cook, decorate, hide from police, or rent them out.</p>`,
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
  openSheet(poi.name,`${player.stars?player.stars+' star'+(player.stars>1?'s':''):'No wanted level'}${ch?' · '+P.challans.length+' unpaid challan'+(P.challans.length>1?'s':''):''}`,(player.stars?rowHtml('fine','Surrender and pay','Clears your wanted level',inr(fine)):'')+(ch?rowHtml('ch',`Pay ${P.challans.length} e-challan${P.challans.length>1?'s':''}`,P.challans.slice(-3).map(c=>c.why).join(' · '),inr(ch)):'')||'<p class="note">Nothing to pay · drive safe.</p>',
  s=>s.onclick=e=>{const id=e.target.dataset.id;if(id==='fine'&&spend(fine,true)){player.stars=0;renderStars();emit('stars',0);toast('Fine paid · record clear','#3ddc97');policeSheet(poi);}if(id==='ch'&&spend(ch,true)){P.challans=[];save();toast('All challans paid','#3ddc97');policeSheet(poi);}});}
function lodgeSheet(poi){const p=poi.name.includes('dharamshala')?cost('svc.dharamshala',200):poi.name.includes('tent')||poi.name.includes('camp')?cost('svc.camp',1500):cost('svc.lodge',600);openSheet(poi.name,'Rooms by the night',rowHtml('sleep','Sleep here',`Energy ${Math.round(P.energy)}% · includes a bathroom`,inr(p)),s=>s.onclick=e=>{if(!e.target.dataset.id)return;if(P.energy>85){toast('You are not sleepy yet','#d6c8e4');return;}if(!spend(p))return;closeSheet();P.bladder=100;startSleep(poi.name,'Room booked');});}
function safariSheet(poi){const camel=poi.type==='camel';const p=camel?cost('svc.camel',500):cost('svc.safari',800);openSheet(poi.name,camel?'Ride into the dunes at sunset':'Open jeep safari with a guide',rowHtml('go',camel?'Camel ride':'Lion safari',camel?'20 game minutes':'40 game minutes',inr(p)),s=>s.onclick=e=>{if(!e.target.dataset.id||!spend(p))return;closeSheet();
  startActivity({kind:camel?'Camel safari':'Safari',title:camel?'Swaying over the dunes':'Searching for lions',minutes:camel?20:40,effects:{energy:-4},onDone:()=>{if(camel){toast('Sunset over the Thar · unforgettable','#ffc93c');emit('camel');}else{const n=Math.floor(MR(1,5));P.stats.lions+=n;toast(`You spotted ${n} Asiatic lion${n>1?'s':''}!`,'#ffc93c');emit('safari',n);}}});});}
function openPoi(poi){const T=poi.type;if(player.stars&&!['police','home'].includes(T)){toast('Lose the police first · or surrender at a police station','#ff5d73');return;}if(poi.onUse)return poi.onUse(poi,api);if(poiHandlers[T])return poiHandlers[T](poi,api);
  if(T==='food')return foodSheet(poi);if(T==='toilet'){if(P.bladder>90){toast('You do not need to go','#d6c8e4');return;}const p=cost('svc.toilet',5);if(P.cash<p){toast(`You need ${inr(p)}`,'#ff5d73');return;}return startQueue({place:'toilet',title:poi.name,onServe:()=>{P.cash-=p;startActivity({kind:'Toilet',title:poi.name,minutes:CFG.act.toilet,effects:{bladder:100}});}});}
  if(T==='bank')return bankSheet(poi);if(T==='guns')return gunSheet(poi);if(T==='cars')return carSheet(poi);if(T==='realty')return realtySheet(poi);if(T==='pump'||T==='cng')return fuelSheet(poi);
  if(T==='home'){if(P.homes.includes(poi.extra))return enterHome(poi);const h=homeById(poi.extra);if(h&&h.starter&&hooks.starterSheet)return hooks.starterSheet(h,poi);return openSheet(h.name,'For sale',rowHtml(h.id,h.name,'Buy it to sleep, cook, decorate and hide from the police',inr(cost('home.'+h.id,h.price))),s=>s.onclick=e=>{if(e.target.dataset.id)buyHome(h.id,()=>{closeSheet();enterHome(poi);});});}
  if(T==='hospital')return hospitalSheet(poi);if(T==='police')return policeSheet(poi);if(T==='lodge')return lodgeSheet(poi);if(T==='safari'||T==='camel')return safariSheet(poi);
  toast(`${poi.name} opens in a coming update`,'#d6c8e4');}

/* ================= phone ================= */
function addApp(a){apps.push(a);}
const ORDER={phone:['calls','messages','map','rewards','invite','swiggy','zomato','baycart','foodbag','sports','challans','baypay','roadside','radio','baygame','camera','baygram','story'],menu:['garage','addgarage','property','jobs','localwork','wardrobe','business'],settings:['online','look','steer','clock','features','film','ach','admin']};
function appGrid(group,skip){const smart=P.phone==='smart';const list=apps.filter(a=>(a.group||'phone')===group&&(!a.admin||adminOK)&&(!a.show||a.show())&&!(skip&&skip.includes(a.id))).sort((a,b)=>(ORDER[group].indexOf(a.id)+99)%99-(ORDER[group].indexOf(b.id)+99)%99);
  return `<div class="apps">${list.map(a=>`<button class="app${a.smart&&!smart?' locked':''}" data-app="${a.id}" style="--h:${appHue(a.id)}"><span>${esc(a.icon||'•')}</span>${esc(a.label)}</button>`).join('')}</div>`;}
function appClick(e){const b=e.target.closest('[data-app]');if(!b)return false;const a=apps.find(x=>x.id===b.dataset.app);if(a.smart&&P.phone!=='smart'){toast('Needs a smartphone · Mobile Point sells them','#ff9f1c');return true;}a.fn(api);return true;}
// The phone (Beta v1.01.11): a home screen of apps and folders on swipeable pages, with a dock that never moves.
// Everything that used to be in the ☰ menu lives here now. New apps from features join the end of the home screen.
const DOCK=['calls','messages','map','baygram'];
const HOME=[{f:'bay',label:'Bay',icon:'⭐',ids:['story','rewards','invite','ach']},{f:'food',label:'BayFood',icon:'🍛',ids:['foodbag','swiggy','zomato']},{f:'veh',label:'Vehicles',icon:'🚗',ids:['garage','addgarage','mechanic','roadside']},
  {f:'pay',label:'BayPay',icon:'💸',ids:['baypay','challans']},'bayradio',{f:'work',label:'Jobs',icon:'💼',ids:['jobs','localwork']},'traveler','baycart','sports','property','wardrobe','business','baygame','camera','themes','online','testtools'];
const HOME_HIDE=['radio'];   // opened from inside another app (BayRadio)
const appById=id=>apps.find(a=>a.id===id&&(!a.admin||adminOK)&&(!a.show||a.show()));
const appIcon=(a,cls='')=>`<button class="app${cls}${a.smart&&P.phone!=='smart'?' locked':''}" data-app="${a.id}" style="--h:${appHue(a.id)}"><span>${esc(a.icon||'•')}</span>${esc(a.label)}</button>`;
function homeItems(){const used=new Set(DOCK.concat(HOME_HIDE));const out=[];
  for(const it of HOME){if(typeof it==='string'){const a=appById(it);if(a){out.push(appIcon(a));used.add(it);}continue;}
    const L=it.ids.map(appById).filter(Boolean);it.ids.forEach(x=>used.add(x));if(!L.length)continue;
    out.push(`<button class="app folder" data-folder="${it.f}"><span class="fold">${L.slice(0,4).map(a=>`<i style="--h:${appHue(a.id)}">${esc(a.icon)}</i>`).join('')}</span>${esc(it.label)}</button>`);}
  for(const a of apps)if(!used.has(a.id)&&['phone','menu'].includes(a.group||'phone')&&appById(a.id)){out.push(appIcon(a));used.add(a.id);}
  return out;}
let phonePage=0;
function phoneSheet(){const smart=P.phone==='smart';$('#sheetWrap').classList.add('phonemode');
  const items=homeItems();const per=16;const pages=[];for(let i=0;i<items.length;i+=per)pages.push(items.slice(i,i+per));
  const dock=DOCK.map(appById).filter(Boolean);
  openSheet(smart?'India Bay':'📱 Keypad phone',`${istText()}`,`<div class="pclock"><b>${bayTime()}</b><small>Bay time · ${esc(areaName())}</small></div>`+
    `<div class="ppages" id="ppages">${pages.map(pg=>`<div class="ppage">${pg.join('')}</div>`).join('')}</div>`+(pages.length>1?`<div class="pdots">${pages.map((_,i)=>`<i data-pg="${i}"${i===phonePage?' class="on"':''}></i>`).join('')}</div>`:'')+
    (smart?'':'<p class="note">Locked apps need a smartphone. Buy one at any Mobile Point.</p>')+`<div class="pdock">${dock.map(a=>appIcon(a)).join('')}</div>`,
    s=>{s.onclick=e=>{const f=e.target.closest('[data-folder]');if(f)return folderSheet(f.dataset.folder);const d=e.target.closest('[data-pg]');if(d){const pp=s.querySelector('#ppages');pp.scrollTo({left:pp.clientWidth*(+d.dataset.pg),behavior:'smooth'});return;}appClick(e);};
      const dk=s.querySelector('.pdock');const sh=$('#sheet');if(dk&&sh)sh.appendChild(dk);   // pinned at the bottom, outside the scrolling area
      const pp=s.querySelector('#ppages');if(pp){requestAnimationFrame(()=>{pp.scrollLeft=pp.clientWidth*Math.min(phonePage,pages.length-1);});pp.onscroll=()=>{const k=Math.round(pp.scrollLeft/Math.max(1,pp.clientWidth));if(k!==phonePage){phonePage=k;s.querySelectorAll('.pdots i').forEach((x,i)=>x.classList.toggle('on',i===k));}};}});}
function folderSheet(f){const it=HOME.find(q=>q.f===f);if(!it)return;$('#sheetWrap').classList.add('phonemode');const L=it.ids.map(appById).filter(Boolean);
  openSheet(`${it.icon} ${it.label}`,'',`<div class="apps fapps">${L.map(a=>appIcon(a)).join('')}</div>`,s=>s.onclick=appClick);}
const appHue=id=>({map:140,swiggy:28,zomato:355,baycart:215,foodbag:40,sports:120,challans:200,baypay:250,roadside:30,radio:300,baygame:270,camera:210,baygram:320,story:45,rewards:50,invite:160,calls:130,messages:200,testtools:60,online:190})[id]??[...id].reduce((h,c)=>(h*31+c.charCodeAt(0))%360,7);
function menuSheet(){phoneSheet();}
// 🏠 back to the start screen (Beta v1.01.11): saves, then shows the main menu with Continue
function mainMenuSheet(){openSheet('🏠 Main menu','Your game is saved first',`<p class="note">Go back to the start screen to change city, read what's new or start a new game. You continue right where you are.</p><div class="stack"><button class="go" data-id="menu">Go to the main menu</button><button class="buy ghost" data-id="stay">Keep playing</button></div>`,
  s=>s.onclick=e=>{const id=e.target.dataset.id;if(id==='stay')return closeSheet();if(id==='menu'){save();emit('toMenu');closeSheet();toast('Saved · opening the main menu','#3ddc97');setTimeout(()=>location.reload(),900);}});}   // the old ☰ menu: everything is in the phone now
addApp({id:'garage',label:'Garage',icon:'🚗',group:'menu',fn:garageSheet});addApp({id:'features',label:'Features',icon:'✨',group:'settings',fn:()=>featuresSheet()});addApp({id:'look',label:'My look',icon:'🧑',group:'settings',fn:lookSheet});addApp({id:'admin',label:'Admin',icon:'🔑',group:'settings',admin:true,fn:()=>adminSheet()});
function garageSheet(){const pp=ppos();const homeNear=P.homes.map(id=>pois.find(q=>q.type==='home'&&q.extra===id)).find(q=>q&&Math.hypot(q.x-pp.x,q.z-pp.z)<45);
  openSheet('🚗 Garage',`${P.cars.length} vehicle${P.cars.length===1?'':'s'} · valet ${inr(cost('svc.valet',200))} brings one to the nearest road`,rowHtml('addv','＋ Add a vehicle','Get in the driver seat of any vehicle, then tap Add · you can name it','Add')+P.cars.map((c,i)=>{const v=ownedVeh[i];const d=v?Math.round(v.pos.distanceTo(pp)*2.4/100)/10:null;const val=Math.round(cost('veh.'+c.type,VALUE[c.type]||10000)*.5*Math.max(.3,(v?v.hp:c.hp)/100)/5)*5;
    const home=c.garage?homeById(c.garage):null;const here=home&&homeNear&&homeNear.extra===c.garage;const mods=[c.tune?'tuned':'',c.horn?'musical horn':'',c.neon?'underglow':''].filter(Boolean).join(', ');
    return `<div class="row"><div class="nm"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${c.color||'#9aa'};margin-right:6px;vertical-align:-1px"></span>${c.nick?'<b>'+esc(c.nick)+'</b> · ':''}${SPEC[c.type].label}${c.stolen?' · no papers':''}<small>${home?'In your garage at '+esc(home.name):v?d+' km away':'Not on the street'} · fuel ${Math.round(v?v.fuel:c.fuel)}% · body ${Math.round(v?v.hp:c.hp)}%${mods?' · '+mods:''}</small></div><div class="btnrow" style="gap:6px;flex-wrap:nowrap"><button class="buy ghost" data-ren="${i}" title="Name it" aria-label="Name it">✏</button>${here?`<button class="buy" data-out="${i}">Take out</button>`:`<button class="buy ghost" data-id="${i}">Deliver</button>`}${P.cars.length>1?`<button class="buy danger" data-sell="${i}">Sell ${inr(val)}</button>`:''}</div></div>`;}).join('')||'<p class="note">No vehicles yet. Visit Bay Motors or a two-wheeler dealer.</p>'+
    `<p class="note">Park in your own garage: drive up to a home you own and press E. A vehicle you take from the street can be kept too: park it in your garage, or get papers at a mechanic workshop.</p>`,
  s=>s.onclick=e=>{if(e.target.dataset.id==='addv'){return openApp('addgarage');}const rn=e.target.dataset.ren;if(rn!=null)return api.nameCar&&api.nameCar(+rn,garageSheet);const si=e.target.dataset.sell,out=e.target.dataset.out;if(out!=null){const k=+out;const c=P.cars[k];const hp=pois.find(q=>q.type==='home'&&q.extra===c.garage);const [x,z,h]=roadSpotNear(hp||player.pos);const v=spawnOwned(k,x,z,h);closeSheet();toast(`${SPEC[c.type].label} out of the garage`,'#3ddc97');return;}
    if(si!=null){const k=+si;const v=ownedVeh[k];if(player.veh&&player.veh===v){toast('Get out before selling it','#ff9f1c');return;}const c=P.cars[k];const val=Math.round(cost('veh.'+c.type,VALUE[c.type]||10000)*.5*Math.max(.3,(v?v.hp:c.hp)/100)/5)*5;
    if(v)removeVeh(v);ownedVeh.splice(k,1);P.cars.splice(k,1);ownedVeh.forEach((q,j)=>{if(q)q.ownedIdx=j;});earn(val,'sale');save();toast(`Sold for ${inr(val)}`,'#3ddc97');garageSheet();return;}const i=e.target.dataset.id;if(i==null)return;if(inside){toast('Go outside first','#ff9f1c');return;}if(player.veh===ownedVeh[+i]){toast('You are already in it','#d6c8e4');return;}const fee=cost('svc.valet',200);if(!spend(fee,true))return;const [x,z,h]=roadSpotNear(player.pos);spawnOwned(+i,x,z,h);closeSheet();toast(`${SPEC[P.cars[i].type].label} delivered · ${inr(fee)} valet`,'#3ddc97');});}
function settingsSheet(){const rOff=!(P.extra.radio&&P.extra.radio.on);openSheet('⚙ Settings',P.name?`Playing on this device as ${esc(P.name)}`:'Playing solo',appGrid('settings',['look','film','ach'])+rowHtml('sound','Sound',muted?'Off':'On',muted?'Turn on':'Turn off','ghost')+rowHtml('radio','Radio',rOff?'Off · stays off until you turn it on':'On · remembers your station · R switches',rOff?'Turn on':'Turn off','ghost')+rowHtml('howto','How to play','A short guide to the basics','Show','ghost')+(TESTMODE||(api.canTestPlay&&api.canTestPlay())?rowHtml('testplay','🧪 Play mode',TESTMODE?'TEST PLAY · separate save, everything unlocked':'Real play · testers can switch to test play',TESTMODE?'Back to real play':'Test play','ghost'):'')+rowHtml('help','Controls','Keyboard and touch','Show','ghost')+rowHtml('profile','Profile','Username and age','Edit','ghost')+(api.ONLINE&&api.ONLINE.signedIn?rowHtml('logout','Log out',api.ONLINE.guest?'Guest account · it cannot be recovered after logging out':'Signed in as @'+esc((hooks.displayName&&hooks.displayName())||P.name)+' · sign in again any time','Log out','danger'):'')+rowHtml('insta','📸 Follow us on Instagram','@indiabaygame · news, updates and the best player photos','Open','ghost')+rowHtml('suggest','Suggest a schedule change','Opening hours, festivals or events · goes to the admin','Write','ghost')+rowHtml('reset','Start a new game','Clears progress on this device','Reset','danger'),
  s=>s.onclick=e=>{if(appClick(e))return;const id=e.target.dataset.id;if(!id)return;if(id==='sound'){setMuted(!muted);settingsSheet();}if(id==='radio'){emit('radioSetting',rOff);settingsSheet();}if(id==='help')helpSheet();if(id==='howto'){closeSheet();howTo(0);}if(id==='profile'){if(hooks.profileEdit)hooks.profileEdit();else profileSheet(false);}if(id==='suggest')suggestSheet();if(id==='insta')window.open('https://www.instagram.com/indiabaygame/','_blank','noopener');if(id==='testplay')api.setTestMode(!TESTMODE);if(id==='logout'){if(!e.target.dataset.out){e.target.dataset.out=1;e.target.textContent='Tap again to log out';return;}api.ONLINE.signOut();}
    if(id==='reset'){if(e.target.dataset.sure){P=newSave();store.set(SAVEKEY,P);location.reload();}else{e.target.dataset.sure=1;e.target.textContent='Tap again';}}});}
/* profile hub: the 👤 button, in the game and on the start screen. Online play adds account rows through api.addProfileRows. */
const profileRows=[];
function setAvatar(){const u=(hooks.displayName&&hooks.displayName())||P.name;const n=P.fullName||u;const el=$('#pAv');if(el)el.textContent=n?n[0].toUpperCase():'👤';
  const ip=$('#introProf');if(ip){const lab=hooks.introLabel?hooks.introLabel():(u?u:'Profile');ip.innerHTML=`<span class="pav sm">${esc(n?n[0].toUpperCase():'👤')}</span><span>${esc(lab)}</span>`;}}
function openApp(id){const a=apps.find(x=>x.id===id);if(a)a.fn();}
// a headshot of your character for the profile, drawn once per look with a small separate renderer
let hsR=null,hsKey='',hsURL='';
function headshot(){try{const key=lookCode()+(P.wear&&P.wear.shirt||'');if(key===hsKey&&hsURL)return hsURL;
  if(!hsR){hsR=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});hsR.setSize(192,192,false);hsR.setPixelRatio(1);}
  const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xfff4e0,0x553322,1.05));const dl=new THREE.DirectionalLight(0xffffff,.7);dl.position.set(1.5,3,2.5);sc.add(dl);
  const L=Object.assign({},LOOK_DEF,P.look||{});const g=buildPerson('#2f6fd0',{look:Object.assign({},L),female:L.female});sc.add(g);g.rotation.y=-.35;g.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(g);const top=box.max.y,cx=(box.min.x+box.max.x)/2,cz=(box.min.z+box.max.z)/2;const ty=top-.2;
  const cam=new THREE.PerspectiveCamera(30,1,.05,20);cam.position.set(cx+.18,ty+.04,cz+1.15);cam.lookAt(cx,ty,cz);hsR.setClearColor(0x000000,0);hsR.render(sc,cam);
  hsURL=hsR.domElement.toDataURL('image/png');hsKey=key;g.traverse(o=>{if(o.geometry&&o.geometry.dispose&&!o.geometry.userData.shared)try{o.geometry.dispose();}catch(e){}});return hsURL;}catch(e){return '';}}
// Profile (Beta v1.01.11): headshot, email, username, money and achievements, then your look, film mode,
// test play, username and age, achievements and settings.
function hubSheet(){const ex=profileRows.map(f=>{try{return f();}catch(e){return null;}}).filter(Boolean)[0]||null;
  const u=(hooks.displayName&&hooks.displayName())||P.name||'',full=P.fullName||'',shown=full||u||'New player';const em=api.userEmail?api.userEmail():'';
  const row=r=>rowHtml(r.id,r.label,r.sub||'',r.btn,r.cls||'ghost');
  const end=ex?(ex.end||[]):(P.name||hadSave?[{id:'h_wipe',label:'🗑 Delete my data',sub:'Erases your player and progress on this device',btn:'Delete',cls:'danger'}]:[]);
  const hs=started||startedOnce?headshot():'';const achN=Object.keys(P.ach||{}).length;
  const film=api.FILM&&api.FILM.allowed&&api.FILM.allowed()&&started;
  openSheet('Profile','',`<div class="phead2"><div class="hshot">${hs?`<img src="${hs}" alt="">`:`<span>${esc(shown[0].toUpperCase())}</span>`}</div><div class="pinfo"><b>${esc(shown)}</b>${em?`<small class="pem">${esc(em)}</small>`:`<small class="pem">${esc(ex&&ex.sub||'Playing on this device')}</small>`}${u?`<small>@${esc(u)}</small>`:''}</div></div>`+
    (P.name?`<div class="pstats"><div><small>Cash</small><b>${inr(P.cash)}</b></div><div><small>Bank</small><b>${inr(P.bank)}</b></div><button type="button" data-id="h_ach"><small>Achievements</small><b>🏆 ${achN}</b></button></div>`:'')+
    (ex&&ex.top||[]).map(row).join('')+
    (started?rowHtml('h_look','🧑 My look','Face, hair, skin, build and clothes','Change','ghost'):'')+
    (film?rowHtml('h_film','🎬 Film mode','Cinematic cameras and video recording · F9','Start',''):'')+
    rowHtml('h_edit','✏ Username and age','Your username, name and date of birth','Edit','ghost')+
    rowHtml('h_ach','🏆 Achievements',`${achN} reached · see what is left`,'Open','ghost')+rowHtml('h_set','⚙ Settings','Sound, radio, steering, Bay clock and online','Open','ghost')+rowHtml('h_priv','🔒 Privacy policy','What we collect and why','Read','ghost')+rowHtml('h_sup','💬 Contact support','support@indiabaygame.com','Write','ghost')+
    end.map(row).join(''),
    s=>s.onclick=e=>{const b=e.target.closest('[data-id]');const id=b&&b.dataset.id;if(!id)return;if(id==='h_ach')return openApp('ach');if(id==='h_set')return settingsSheet();if(id==='h_priv')return window.open('privacy.html','_blank','noopener');if(id==='h_sup')return supportSheet();
      if(id==='h_look')return lookSheet();if(id==='h_film'){closeSheet();return setTimeout(()=>api.FILM.start(),150);}if(id==='h_edit'){if(hooks.profileEdit)return hooks.profileEdit();return profileSheet(false);}
      if(id==='h_wipe'){if(!e.target.dataset.sure){e.target.dataset.sure=1;e.target.textContent='Tap again to delete';return;}P=newSave();store.set(SAVEKEY,P);location.reload();return;}
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
  <label>Date of birth<input type="date" id="pf_dob" min="1900-01-01" max="${istISO()}" value="${esc(pre.dob||'')}"${pre.dob?' readonly aria-readonly="true" class="locked"':''}></label>${pre.dob?'<p class="note">Your date of birth is set and cannot be changed. If it is wrong, write to support (Settings → Contact support).</p>':''}<p class="note">Your name and date of birth stay private. We use your age to show suitable billboard ads in the game. <a href="privacy.html" target="_blank" rel="noopener">Privacy policy</a></p>`;}
function profileSheet(first,done){openSheet(first?'Welcome to India Bay':'Profile',first?'Create your player':'Saved on this device',`<form class="form" id="pf" novalidate><label>Username<input type="text" id="pf_name" maxlength="10" autocomplete="off" value="${esc(P.name)}" placeholder="Raju2026"></label><div class="note" id="pf_msg">Letters and numbers, up to 10. Other players see this name.</div>
  ${personFields(P)}<p class="note bad" id="pf_err" aria-live="polite"></p><div class="btnrow"><button class="go" type="submit" id="pf_go">${first?'Continue':'Save'}</button></div></form>`,s=>{const f=s.querySelector('#pf'),inp=s.querySelector('#pf_name'),msg=s.querySelector('#pf_msg'),er=s.querySelector('#pf_err');
    inp.oninput=()=>{const m=nameOk(inp.value);msg.textContent=m||'Looks good.';msg.className='note '+(m?'bad':'ok');};f.onsubmit=e=>{e.preventDefault();const m=nameOk(inp.value);if(m){msg.textContent=m;msg.className='note bad';return;}
      const full=s.querySelector('#pf_full').value.trim(),dob=s.querySelector('#pf_dob').value;const pe=personErr(full,dob);if(pe){er.textContent=pe;return;}
      P.name=inp.value;P.fullName=full;if(!P.dob)P.dob=dob;P.age18=IBCONF.ageFromDob(P.dob)>=18;save();refreshBillboards();setAvatar();closeSheet();done&&done();};});}
// What's new pops up once only when an update after Beta v1.0.0 adds notes (here or in Admin → Changelog)
// built-in notes, with the admin's edits on top (same version) and hidden entries left out
function clList(){const by={};for(const c of CHANGELOG)if(c&&c.v)by[c.v]=Object.assign({},c);for(const c of (CFG.changelog||[])){if(!c||!c.v)continue;const o=by[c.v]||{v:c.v};for(const k in c)if(c[k]!==''&&c[k]!=null)o[k]=c[k];by[c.v]=o;}
  return Object.values(by).filter(c=>c.show!=='Hide').sort((a,b)=>String(b.v).localeCompare(String(a.v),undefined,{numeric:true}));}
const clLines=n=>String(n||'').split(/\n| \| /).map(x=>x.trim()).filter(Boolean);
function whatsNew(auto,tab){const list=clList();if(!list.length&&auto)return;tab=tab||'new';
  const card=c=>`<div class="cl"><div class="clh"><b>${esc(c.v)}</b><small>${esc(c.date||'')}</small></div>${c.title?`<h3 class="sub">${esc(c.title)}</h3>`:''}${clLines(c.notes).map(l=>`<p>${esc(l)}</p>`).join('')}</div>`;
  const tabs=auto?'':`<div class="chips wtabs"><button class="chip${tab==='new'?' on':''}" data-wt="new">✨ What's new</button><button class="chip${tab==='feat'?' on':''}" data-wt="feat">🧭 All features</button></div>`;
  const body=tab==='feat'?`<p class="note">Everything you can do in India Bay · ${esc(VERSION)}</p>`+FEATURES.map(([i,h,d])=>`<div class="feat"><span>${i}</span><div><b>${esc(h)}</b><p>${esc(d)}</p></div></div>`).join(''):(auto?card(list[0]):list.map(card).join(''));
  openSheet(auto?`What's new in ${esc(list[0].v)}`:"What's new",auto?'Since you last played':`${list.length} updates · you have ${esc(VERSION)}`,tabs+body+(auto?rowHtml('all','Every update and all features','The full changelog and everything you can do','Open','ghost'):''),
    s=>s.onclick=e=>{const t=e.target.closest('[data-wt]');if(t)return whatsNew(false,t.dataset.wt);if(e.target.dataset.id==='all')whatsNew(false);},()=>{if(list[0]){P.seenVersion=list[0].v;dirty=true;}});}
// Settings → Features: what the game has (Beta v1.0.0 lists features, not a change history)
const FEATURES=[['🗺','A big open world','West and South-West India on one map: Mumbai, Pune, Ahmedabad, Jaipur, Udaipur, Goa, Bengaluru, Mysuru, Mangaluru, Kochi, Thiruvananthapuram, Lakshadweep and 140+ cities and towns, with real landmarks, highways, expressways, flyovers, ghats, beaches, backwaters and deserts.'],
  ['🚗','Drive anything','Cycles, scooters, bikes, autos, cars, SUVs and sports cars. Fuel and CNG pumps, mechanics, garages, RTO licences, helmets and traffic challans. Ride trains, the Mumbai–Ahmedabad bullet train, the metro on its elevated lines, buses, ferries, flights and helicopters, with the view out of the window.'],
  ['💼','Work and money','Food deliveries, auto and cab rides (accept the ones you want), 74 local trades and crafts in Local work, job boards, your own businesses and homes, the bank and BayPay.'],
  ['🍛','Live like a local','Regional food at every stall, Swiggy and Zomato delivery, BayCart shopping, a food bag for later, and needs for food, toilet and sleep. Buy homes, furniture and clothes.'],
  ['📖','Story in every city','Chapter-wise stories that follow the city you are in, 60+ achievements with unlock cards, and daily rewards that grow with your streak.'],
  ['🎉','Festivals','Diwali, Navratri garba, Ganpati, Holi, Uttarayan kites, Durga Puja, Onam boat races, Christmas, Eid and Pongal, plus fairs (Pushkar, Kumbh Mela), the Pandharpur wari, Rath Yatra, Gangaur, Teej, Dahi Handi and more, each in its own state or city, with mini-games.'],
  ['🏟','Sports','Watch football and IPL cricket from your seat inside the stadium, play kabaddi, and bet on matches (18+).'],
  ['🛍','Go inside','Shopping malls with a cinema, game zone and food court, and the insides of temples, churches, dargahs, palaces, forts and caves.'],
  ['🪂','Adventures','Paragliding, parasailing, scuba diving, snorkelling, surfing, rafting, kayaking, houseboats, hot-air balloons, ziplines, dune bashing, treks and helicopter joyrides.'],
  ['🦒','Wildlife and open zoos','Gir lions, Ranthambore tigers, desert camels and forest elephants in the wild; cows, dogs, goats, buffaloes, monkeys and peacocks on the streets (drive carefully). Nine open zoos with a safari ride.'],
  ['🌐','Play online','See other players, chat, send walkie-talkie voice messages and invite friends (you both get a bonus when they join).'],
  ['🧑','Be yourself','Settings → My look: skin tone, face, hair, beard, build and height. The Wardrobe has shirts, kurtas, sarees and more.'],
  ['📸','BayGram','Take photos and 15 to 60 second clips in the game, keep them in your gallery and post them to the BayGram feed for every player to see and like.'],
  ['📻','And more','Radio stations, photo mode, the minimap with zoom and a navigation view, and directions to anywhere.']];
function featuresSheet(){whatsNew(false,'feat');}
// How to play: a skippable guide on the first start (and any time from Settings)
const HOWTO=[['👋','Welcome to India Bay','An open world across West and South-West India. This short guide shows the basics. Skip it any time, and find it again in ⚙ Settings → How to play.'],
  ['🕹','Move and drive',isTouch?'Use ◀ ▶ to steer and GO / BACK to drive or walk. Drag the screen to look around. 🎥 switches the camera.':'W A S D to drive or walk, Shift to run, Space to brake. Drag with the mouse to look around. C switches the camera.'],
  ['🚪','Get in, get out, use things',isTouch?'Tap E to get in or out of a vehicle, and to use shops, food stalls, ATMs and doors when you are next to them.':'Press E to get in or out of a vehicle, and to use shops, food stalls, ATMs and doors when you are next to them.'],
  ['🍛','Look after yourself','Top left: ❤ health, 🍛 food, 🚻 toilet and 😴 sleep. Eat at stalls or order food, use public toilets, sleep at a lodge or your home. Keep food in your food bag for later.'],
  ['💼','Earn money','☰ Menu → Jobs for deliveries and rides. Accept the ones you want. Claim your daily reward every day to grow your streak.'],
  ['📱','Your phone','📱 Phone has the Map, Swiggy and Zomato, BayCart, BayPay, the Radio, Camera, Sports, Story and more.'],
  ['🧭','Find your way','Tap the minimap for the full map, pick a place and tap Directions, then follow the blue line. + and − under the minimap zoom it.'],
  ['📖','Stories, festivals and more','Every city has its own story chapters. Look out for festivals, stadiums, malls, zoos and adventures. Make yourself look the way you like in ⚙ Settings → My look.']];
function howTo(i){let el=$('#howto');if(!el){el=document.createElement('div');el.id='howto';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);}
  const [ic,h,d]=HOWTO[i],last=i===HOWTO.length-1;el.hidden=false;
  el.innerHTML=`<div class="hcard"><div class="hic">${ic}</div><small>How to play · ${i+1} of ${HOWTO.length}</small><h2>${esc(h)}</h2><p>${esc(d)}</p><div class="hdots">${HOWTO.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div>
    <div class="btnrow">${i?'<button class="buy ghost" data-h="back">Back</button>':''}<button class="buy ghost" data-h="skip">Skip</button><button class="go" data-h="next">${last?"Let's play":'Next'}</button></div></div>`;
  el.onclick=e=>{const k=e.target.dataset.h;if(!k)return;if(k==='back')return howTo(i-1);if(k==='next'&&!last)return howTo(i+1);el.hidden=true;P.extra.howto=istISO();dirty=true;emit('howto',k);};}
const howOpen=()=>{const el=$('#howto');return !!el&&!el.hidden;};

/* ================= admin ================= */
let adminOK=false,adminLocal=false,db=null,isOwner=false,cfgBackend=null;
function cloudConfig(d){d=Object.assign({},d);delete d.updatedAt;store.set('ib.cfg',d);savedCFG=mergeCfg(DEFAULTS,d);if(!$('#adm'))applyConfig(d);}
function applyTheme(){const pt=P&&P.extra&&P.extra.theme;const T=THEMES[pt]||THEMES[CFG.theme]||THEMES.kesar;const s=document.documentElement.style;s.setProperty('--acc',pt?T.accent:(CFG.accent||T.accent));if(T.wall)s.setProperty('--wall',T.wall);else s.removeProperty('--wall');document.documentElement.dataset.ibtheme=pt||CFG.theme||'kesar';s.setProperty('--panel',T.panel);s.setProperty('--panel-edge',T.edge);s.setProperty('--sheet',T.sheet);s.setProperty('--sheet-2',T.sheet2);}
function applyConfig(c){const prev=CFG;CFG=mergeCfg(DEFAULTS,c);applyTheme();document.title=CFG.name;renderIntro();if(started){setPedCount(Math.round(CFG.peds*botScale));}
  if(JSON.stringify(prev.billboards)!==JSON.stringify(CFG.billboards))refreshBillboards();if(!CFG.weapons&&!WEAP[P.weapon].melee)P.weapon='fist';if(CFG.police==='off'&&player.stars){player.stars=0;renderStars();}updWeap();emit('config',CFG);}
const getPath=(o,p)=>p.split('.').reduce((a,k)=>a==null?a:a[k],o);
function setPath(o,p,v){const k=p.split('.');let a=o;for(let i=0;i<k.length-1;i++){a[k[i]]=Array.isArray(a[k[i]])?a[k[i]].slice():Object.assign({},a[k[i]]);a=a[k[i]];}a[k[k.length-1]]=v;}
const LISTS=IBCONF.lists(W.zones.map(z=>z.id));
function adminSheet(){const C=JSON.parse(JSON.stringify(CFG));let work=Object.assign({},C,{changelog:IBCONF.fullChangelog(C.changelog)});
  const num=(p,label,min,max,step)=>`<label>${label}<input type="number" data-p="${p}" min="${min}" max="${max}" step="${step}" value="${getPath(C,p)}"></label>`;
  const txt=(p,label,max)=>`<label>${label}<input type="text" data-p="${p}" maxlength="${max}" value="${esc(getPath(C,p))}"></label>`;
  const ck=(p,label)=>`<label class="ck"><input type="checkbox" data-p="${p}" data-t="b"${getPath(C,p)?' checked':''}> ${label}</label>`;
  const sel=(p,label,opts)=>`<label>${label}<select data-p="${p}">${opts.map(([v,l])=>`<option value="${v}"${String(v)===String(getPath(C,p))?' selected':''}>${l}</option>`).join('')}</select></label>`;
  const rng=(p,label,min,max,step)=>`<label>${label} · <span class="val" data-v="${p}"></span><input type="range" data-p="${p}" min="${min}" max="${max}" step="${step}" value="${getPath(C,p)}"></label>`;
  const list=name=>{const cols=LISTS[name];return `<div class="ltable" data-list="${name}">${(work[name]||[]).map((row,i)=>`<div class="lrow">${cols.map(([k,l,t])=>Array.isArray(t)?`<label>${l}<select data-l="${name}" data-i="${i}" data-k="${k}">${t.map(o=>`<option${o===row[k]?' selected':''}>${o}</option>`).join('')}</select></label>`:`<label>${l}<input type="${t}" data-l="${name}" data-i="${i}" data-k="${k}" value="${esc(row[k])}"${t==='number'?' step="0.1" min="0.5" max="3"':''}></label>`).join('')}<button type="button" class="buy danger" data-del="${name}" data-i="${i}">Remove</button></div>`).join('')}<button type="button" class="buy ghost" data-add="${name}">Add</button></div>`;};
  const body=()=>`<form class="form" id="adm" autocomplete="off" novalidate>
  <details open><summary>Announcements</summary><label>Announcement on the start screen<textarea data-p="announce" maxlength="240" placeholder="Diwali update: double fares this week">${esc(C.announce)}</textarea></label><p class="note">News with dates shows on the start screen ticker and in Phone → BayRadio.</p>${list('news')}</details>
  <details><summary>Bay clock and weather</summary>${rng('timeSpeed','Time speed (game minutes per real second)',0,10,0.5)}${num('timeOffset','Clock shift (game minutes)',-1440,1440,10)}${sel('weather','Weather',[['auto','Follows the season and changes every 4 game hours'],['clear','Always clear'],['cloudy','Cloudy'],['rain','Rain'],['monsoon','Monsoon storm'],['fog','Fog']])}</details>
  <details><summary>Needs and activity times</summary>${ck('needs','Hunger, toilet and sleep needs')}${num('foodHrs','Food lasts (game hours)',2,48,1)}${num('wcHrs','Bladder lasts (game hours)',2,48,1)}${num('awakeHrs','Awake time before exhausted (game hours)',4,48,1)}
   ${['sleep','meal','snack','drink','cook','tv','toilet'].map(k=>num('act.'+k,{sleep:'Full sleep',meal:'Meal',snack:'Snack',drink:'Drink',cook:'Cooking',tv:'TV cricket',toilet:'Toilet'}[k]+' (game minutes)',1,720,1)).join('')}</details>
  <details><summary>Queues (real seconds per person)</summary>${Object.keys(C.queue).map(k=>num('queue.'+k,{petrol:'Petrol pump',cng:'CNG pump',atm:'ATM',toilet:'Public toilet',ticket:'Railway ticket counter',hospital:'Hospital',checkin:'Airport check-in'}[k],1,300,1)).join('')}</details>
  <details><summary>Travel tickets and times</summary>${Object.keys(C.travel).map(k=>`<div class="pair">${num('travel.'+k+'.0',{sleeper:'Train sleeper',ac:'Train AC',flight:'Flight',bus:'Bus',bottaxi:'Bot taxi',ferry:'Ferry',local:'Mumbai local',metro:'Metro'}[k]+' ticket (₹)',0,100000,10)}${num('travel.'+k+'.1','Longest trip (real seconds)',5,1800,5)}</div>`).join('')}<p class="note">Shorter trips take less time, scaled by distance.</p></details>
  <details><summary>Streets and police</summary>${rng('traffic','Traffic vehicles near the player',0,60,1)}${rng('peds','Pedestrians near the player',0,80,1)}${sel('police','Police',[['off','Off'],['easy','Easy'],['normal','Normal'],['hard','Hard']])}${ck('weapons','Weapons and bank robbery')}${ck('challansOn','Traffic challans (red lights, speed cameras, no helmet)')}${ck('voiceChat','Voice messages between players')}${ck('filmOn','Film mode for every player (Profile → Film mode)')}</details>
  <details><summary>Economy</summary>${rng('priceMul','Prices ×',0.5,3,0.1)}${rng('fareMul','Job pay ×',0.5,3,0.1)}${num('startCash','Starting cash for new players (₹)',0,10000000,100)}${num('fuel.petrol','Petrol ₹/L',10,500,1)}${num('fuel.diesel','Diesel ₹/L',10,500,1)}${num('fuel.cng','CNG ₹/L',10,500,1)}${num('toll','Toll (₹)',0,5000,10)}
</details>
  <details><summary>Festivals</summary><p class="note">Real dates in India time. Check dates each year: they follow the Hindu calendar.</p>${list('festivals')}</details>
  <details><summary>Happening now events</summary>${list('events')}</details>
  <details><summary>Billboards</summary><p class="note">Text billboards on rooftops in the chosen city. Image uploads need the online storage (R2).</p>${list('billboards')}</details>
  <details><summary>Changelog</summary><p class="note">Every version is listed. Change any text, or set Players see it to Hide. Use | between lines in Notes. A new entry with a higher version shows players a What's new pop-up once.</p>${list('changelog')}</details>
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
    if(t>-et&&t<1+et&&u>-eu&&u<1+eu){if(!!e.fly!==!!f.fly){const g=e.fly?e:f,tg=e.fly?t:u,sg=g.s0+clamp(tg,0,1)*g.len;if(sg>8&&sg<g.fly.len-8)continue;}ts.push(clamp(t,0,1)*e.len);}}
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
function sigStop(c){const e=c.lane.e;if(e.kind!=='city'){if(e.fly)return Infinity;const ex=c.lane.dir>0?e.bx:e.ax,ez=c.lane.dir>0?e.bz:e.az;const d=c.lane.dir>0?e.len-c.lane.s:c.lane.s;if(d>34)return Infinity;const j=hwjAt(ex,ez,14);if(!j)return Infinity;return sigState(j.x,j.z,hwjAxis(j,Math.atan2(e.dx*c.lane.dir,e.dz*c.lane.dir)))==='g'?Infinity:d-11;}const ew=Math.abs(e.dx)>.5;const f=ew?Math.sign(e.dx*c.lane.dir):Math.sign(e.dz*c.lane.dir);const zz=zoneAt(c.pos.x,c.pos.z);if(!zz||zz.size==='small')return Infinity;
  const a=ew?c.pos.x:c.pos.z,base=ew?zz.x0:zz.z0;let k=f>0?Math.ceil((a-base)/80):Math.floor((a-base)/80);let jc=base+k*80;let d=(jc-a)*f;if(d<9){k+=f;jc=base+k*80;d=(jc-a)*f;}if(d>32)return Infinity;
  const jx=ew?jc:c.pos.x,jz=ew?c.pos.z:jc;const J=sigJunction(jx,jz);if(!J)return Infinity;return sigState(J.x,J.z,ew?'ew':'ns')==='g'?Infinity:d-11;}
const sigMats={r:new THREE.MeshBasicMaterial({color:0xff2a2a}),a:new THREE.MeshBasicMaterial({color:0xffb000}),g:new THREE.MeshBasicMaterial({color:0x2aff6a})};
const sigPool=[];for(let k=0;k<14;k++){const grp=new THREE.Group();const heads=[];for(const [cx,cz,faces] of [[9.5,-9.5,[Math.PI,Math.PI/2]],[-9.5,9.5,[0,-Math.PI/2]]]){const pole=new THREE.Mesh(G.cyl,M.pole);pole.scale.set(.14,5,.14);pole.position.set(cx,2.5,cz);grp.add(pole);
  for(const ry of faces){const hd=new THREE.Group();hd.position.set(cx,4.6,cz);hd.rotation.y=ry;const box=new THREE.Mesh(G.box,VM.black);box.scale.set(.5,1.4,.35);box.position.z=.3;hd.add(box);const lamp=new THREE.Mesh(G.box,sigMats.g);lamp.scale.set(.36,.36,.08);lamp.position.z=.5;hd.add(lamp);grp.add(hd);heads.push({lamp,axis:Math.abs(Math.sin(ry))>.5?'ew':'ns'});}}
  grp.visible=false;scene.add(grp);sigPool.push({grp,heads,key:''});}
let sigNear=[];const redSeen=new Map();
/* Beta v1.01.07: signals where three or more roads meet outside the city grids (highway junctions, town entries) */
const HWJ=[];{const ends=new Map();for(const e of EDGES){if(e.fly||e.kind==='service')continue;for(const [x,z,dir] of [[e.ax,e.az,-1],[e.bx,e.bz,1]]){const k=Math.round(x/12)+','+Math.round(z/12);let a=ends.get(k);if(!a)ends.set(k,a=[]);a.push({e,x,z,h:Math.atan2(-e.dx*dir,-e.dz*dir)});}}
  for(const a of ends.values()){const roads=new Set(a.map(q=>q.e.road));if(a.length<3||roads.size<2)continue;const x=a[0].x,z=a[0].z;const zz=zoneAt(x,z,-1);if(zz&&zz.size!=='small'){const i=Math.round((x-zz.x0)/80),j=Math.round((z-zz.z0)/80);if(i>0&&j>0&&i<zz.nx&&j<zz.nz)continue;}
    if(a.every(q=>q.e.kind==='city')||isWater(x,z))continue;const th=Math.atan2(a[0].e.dx,a[0].e.dz);HWJ.push({x,z,th,app:a});}}
const hwjAt=(x,z,r)=>{let best=null,bd=r;for(const j of HWJ){const d=Math.abs(j.x-x)+Math.abs(j.z-z);if(d<bd){bd=d;best=j;}}return best;};
const hwjAxis=(j,h)=>Math.abs(Math.cos(h-j.th))>.7?'ns':'ew';
const hwSigPool=[];for(let k=0;k<12;k++){const grp=new THREE.Group();const pole=new THREE.Mesh(G.cyl,M.pole);pole.scale.set(.14,5,.14);pole.position.y=2.5;grp.add(pole);const hd=new THREE.Group();hd.position.y=4.6;const box=new THREE.Mesh(G.box,VM.black);box.scale.set(.5,1.4,.35);hd.add(box);const lamp=new THREE.Mesh(G.box,sigMats.g);lamp.scale.set(.36,.36,.08);lamp.position.z=.2;hd.add(lamp);grp.add(hd);grp.visible=false;scene.add(grp);hwSigPool.push({grp,lamp});}
function updHwSignals(){const pp=ppos();const list=[];for(const j of HWJ){const d=Math.abs(j.x-pp.x)+Math.abs(j.z-pp.z);if(d<300)for(const q of j.app)list.push([d,j,q]);}list.sort((a,b)=>a[0]-b[0]);
  hwSigPool.forEach((p,k)=>{const it=list[k];if(!it||inside){p.grp.visible=false;return;}const [,j,q]=it;const ax=Math.sin(q.h),az=Math.cos(q.h);const w=q.e.w/2+1.6;p.grp.visible=true;p.grp.position.set(j.x-ax*10+az*w,0,j.z-az*10-ax*w);p.grp.rotation.y=q.h+Math.PI;
    const st=sigState(j.x,j.z,hwjAxis(j,q.h));p.lamp.material=sigMats[st];p.lamp.position.y=st==='r'?.42:st==='a'?0:-.42;});}
function updSignals(){const pp=ppos();const list=[];const zz=zoneAt(pp.x,pp.z,100);if(zz&&zz.size!=='small'&&!inside){for(let i=1;i<zz.nx;i++)for(let j=1;j<zz.nz;j++){const x=zz.x0+i*80,z=zz.z0+j*80;const d=Math.abs(x-pp.x)+Math.abs(z-pp.z);if(d<360&&!isWater(x,z))list.push([d,x,z]);}}
  list.sort((a,b)=>a[0]-b[0]);sigNear=list.slice(0,sigPool.length);sigPool.forEach((p,k)=>{const j=sigNear[k];if(!j){p.grp.visible=false;return;}p.grp.visible=true;p.grp.position.set(j[1],0,j[2]);for(const h of p.heads){const st=sigState(j[1],j[2],h.axis);h.lamp.material=sigMats[st];h.lamp.position.y=st==='r'?.42:st==='a'?0:-.42;}});}
function checkRedLight(now){if(player.mode!=='drive'||!player.veh)return;const v=player.veh;if(Math.abs(v.v)<4)return;const J=sigJunction(v.pos.x,v.pos.z);if(!J)return;if(Math.abs(v.pos.x-J.x)>7||Math.abs(v.pos.z-J.z)>7)return;
  const axis=Math.abs(Math.sin(v.h))>Math.abs(Math.cos(v.h))?'ew':'ns';const key=J.x+','+J.z;if(sigState(J.x,J.z,axis)!=='r'||now-(redSeen.get(key)||-99)<30)return;redSeen.set(key,now);addChallan(cost('fine.signal',CFG.challan.signal||1000),'Jumped a red light');}

function navAhead(dist){const R=nav.route;if(!R||R.length<2)return null;let acc=0;for(let i=0;i<R.length-1;i++){const l=Math.hypot(R[i+1][0]-R[i][0],R[i+1][1]-R[i][1]);if(acc+l>=dist){const t=(dist-acc)/l;return[R[i][0]+(R[i+1][0]-R[i][0])*t,R[i][1]+(R[i+1][1]-R[i][1])*t];}acc+=l;}return R[R.length-1];}

/* ================= toasts ================= */
let toastT;function toast(html,color){const t=$('#toast');t.innerHTML=html;t.style.color=color||'#fff4e2';t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2400);}
let bigT;function big(txt,col){const b=$('#big');b.textContent=txt;b.style.color=col;b.classList.add('show');$('#dim').style.opacity=.55;clearTimeout(bigT);bigT=setTimeout(()=>{b.classList.remove('show');$('#dim').style.opacity=0;},2000);}

/* ================= input ================= */
const keys={up:false,down:false,left:false,right:false,run:false};
const km={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'down',ShiftLeft:'run',ShiftRight:'run'};
addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea,select'))return;if(e.code==='Escape'){if(howOpen()){$('#howto').hidden=true;P.extra.howto=istISO();dirty=true;return;}if(hooks.escape&&hooks.escape())return;if(sheetOpen()){closeSheet();return;}}if(uiLock())return;
  if(km[e.code]){keys[km[e.code]]=true;e.preventDefault();}if(e.repeat)return;
  if(e.code==='KeyE'||e.code==='KeyF')useAction();if(e.code==='KeyJ')fire();if(e.code==='KeyQ')cycleWeapon();if(e.code==='KeyH')horn();if(e.code==='KeyC')cycleCam();if(e.code==='KeyM')phoneSheet();if(e.code==='KeyI')phoneSheet();if(e.code==='KeyO')settingsSheet();if(hooks.key[e.code])hooks.key[e.code]();});
addEventListener('keyup',e=>{if(km[e.code])keys[km[e.code]]=false;});addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
/* drag to orbit the camera (mouse on PC, finger on phones); a short click still attacks */
let camYaw=0,camPitch=0,orbitIdle=9;const drag={on:false,id:null,x:0,y:0,moved:0,btn:0,touch:false};const cv0=$('#c');
cv0.addEventListener('pointerdown',e=>{if(!started||uiLock()||hooks.photo)return;Object.assign(drag,{on:true,id:e.pointerId,x:e.clientX,y:e.clientY,moved:0,btn:e.button,touch:e.pointerType!=='mouse'});try{cv0.setPointerCapture(e.pointerId);}catch(_){}});
cv0.addEventListener('pointermove',e=>{if(!drag.on||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;drag.moved+=Math.abs(dx)+Math.abs(dy);if(drag.moved<4)return;camYaw=wrapA(camYaw-dx*.007);camPitch=clamp(camPitch+dy*.004,-.4,.9);orbitIdle=0;});
const endDrag=e=>{if(!drag.on||e.pointerId!==drag.id)return;drag.on=false;if(drag.moved<6&&drag.btn===0&&!uiLock()&&e.type==='pointerup'){if(pickBillboard(e.clientX,e.clientY))return;if(!drag.touch)fire();}};cv0.addEventListener('pointerup',endDrag);cv0.addEventListener('pointercancel',endDrag);
$$('.pad button[data-k]').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();keys[k]=true;b.classList.add('on');try{b.setPointerCapture(e.pointerId);}catch(_){}};const off=()=>{keys[k]=false;b.classList.remove('on');};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);b.addEventListener('contextmenu',e=>e.preventDefault());});
/* Taps on buttons in menus and pop-ups: some phones only sent a click after a long press. A quick tap (finger
   moved under 12 px, under 700 ms) now presses the button straight away; the browser's own click that may follow is ignored. */
{let tp=null,lastSyn=null;const TAPS='#sheetWrap,#wait,#offer,#cine,#intro,#achPop,#chatbar,#howto,#miniZ,.hud';
  addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;const b=e.target.closest&&e.target.closest('button,[data-id],[data-app],[data-tab],[data-c],a.go');tp=b&&b.closest(TAPS)?{b,x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId}:null;},true);
  addEventListener('pointerup',e=>{const q=tp;tp=null;if(!q||e.pointerId!==q.id)return;if(Math.hypot(e.clientX-q.x,e.clientY-q.y)>12||performance.now()-q.t>700||!q.b.isConnected||q.b.disabled)return;
    lastSyn={b:q.b,t:performance.now(),x:e.clientX,y:e.clientY};const ev=new MouseEvent('click',{bubbles:true,cancelable:true,clientX:e.clientX,clientY:e.clientY});q.b.dispatchEvent(ev);},true);
  addEventListener('click',e=>{if(!e.isTrusted||!lastSyn)return;if(performance.now()-lastSyn.t<800){const b=e.target.closest&&e.target.closest('button,[data-id],[data-app],[data-tab],[data-c],a.go');if(b===lastSyn.b||!b||Math.hypot(e.clientX-lastSyn.x,e.clientY-lastSyn.y)<30){e.stopImmediatePropagation();e.preventDefault();}}},true);}
document.addEventListener('contextmenu',e=>{if(!(e.target.closest&&e.target.closest('input,textarea,select,a')))e.preventDefault();});document.addEventListener('selectstart',e=>{if(!(e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]')))e.preventDefault();});
let fireHeld=false;
$$('.pad button[data-act]').forEach(b=>{const a=b.dataset.act;b.addEventListener('contextmenu',e=>e.preventDefault());
  b.addEventListener('pointerdown',e=>{e.preventDefault();if(uiLock())return;b.classList.add('on');if(a==='use')useAction();if(a==='fire'){fireHeld=true;fire();}if(a==='gun')cycleWeapon();if(a==='horn')horn();});
  const off=()=>{b.classList.remove('on');if(a==='fire')fireHeld=false;};b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);});
let camMode=0;const CAMS=['Chase camera','Far camera','First-person camera'];function cycleCam(){camMode=(camMode+1)%3;$('#camBtn').title=CAMS[camMode];toast(CAMS[camMode],'#d6c8e4');camSnap=true;camYaw=0;camPitch=0;}
$('#camBtn').onclick=cycleCam;$('#menuBtn').onclick=()=>{if(started&&!uiLock())mainMenuSheet();};$('#phoneBtn').onclick=()=>{if(started&&!uiLock())phoneSheet();};$('#setBtn').onclick=()=>{if(started&&!uiLock())hubSheet();};$('#supLink').onclick=e=>{e.preventDefault();supportSheet();};if($('#introMute')){$('#introMute').onclick=e=>{e.stopPropagation();setMuted(!muted);};setTimeout(()=>setMuted(muted),0);}$('#introProf').onclick=()=>{if(hooks.introClick)hooks.introClick();else hubSheet();};$('#mission').onclick=()=>{missionHide=performance.now()+5000;};$('#nav').onclick=()=>{missionHide=performance.now()+5000;};
$('#mini').addEventListener('click',()=>{if(started&&!uiLock()&&hooks.map)hooks.map();});$$('#miniZ [data-mz]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();if(started)setMiniZoom(b.dataset.mz==='in'?1.4:1/1.4);}));hooks.key.Equal=()=>setMiniZoom(1.4);hooks.key.Minus=()=>setMiniZoom(1/1.4);
let curPrompt=null;
function useAction(){if(uiLock()||overT>0||player.knock>0)return;updPrompt();if(curPrompt&&curPrompt.first){curPrompt.fn();return;}
  if(inside){const ip=nearInterior();if(ip)homeAction(ip.k);return;}
  if(player.mode==='drive'){if(curPrompt&&curPrompt.poi&&curPrompt.poi.drive&&Math.abs(player.veh.v)<2){openPoi(curPrompt.poi);return;}exitVehicle();return;}
  if(curPrompt&&curPrompt.poi){openPoi(curPrompt.poi);return;}if(curPrompt&&curPrompt.fn){curPrompt.fn();return;}const v=nearestVeh();if(v)enterVehicle(v);}
function nearInterior(){let b=null,bd=inside&&inside.venue?2.4:1.4;for(const p of inter.pois){const d=Math.hypot(player.pos.x-p.x,player.pos.z-p.z);if(d<bd){bd=d;b=p;}}return b;}

/* ================= audio ================= */
let ac=null,eng=null,sir=null,muted=store.get('ib.muted')===true,noiseBuf=null;
function setMuted(m){muted=!!m;store.set('ib.muted',muted);emit('mute',muted);const b=$('#introMute');if(b){b.textContent=muted?'🔇':'🔊';b.setAttribute('aria-label',muted?'Sound off · tap to turn on':'Sound on · tap to mute');}}
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
// Flyovers: a vehicle that drives onto a flyover ramp follows the deck height; parapets keep it on the deck.
function flyUpd(v){if(v.flyR){const h=onRoadOf(v.flyR,v.pos.x,v.pos.z);const y=flyY(h.e,h.t),half=v.flyR.w/2;
    if(y>1&&h.lat>half-.5){const k=(half-.5)/h.lat;v.pos.x=h.px+(v.pos.x-h.px)*k;v.pos.z=h.pz+(v.pos.z-h.pz)*k;v.v*=.85;}
    if(y<.3&&h.lat>half+.5){v.flyR=null;v.pos.y=0;return;}v.pos.y=y;return;}
  for(const id of edgesNear(v.pos.x,v.pos.z)){const f=EDGES[id];if(!f.fly)continue;let t=(v.pos.x-f.ax)*f.dx+(v.pos.z-f.az)*f.dz;if(t<0||t>f.len)continue;const lat=Math.abs((v.pos.x-f.ax)*f.dz-(v.pos.z-f.az)*f.dx);
    if(lat<f.w/2&&flyY(f,t)<1.2&&Math.abs(Math.sin(v.h)*f.dx+Math.cos(v.h)*f.dz)>.6){v.flyR=f.fly;v.pos.y=flyY(f,t);return;}}v.pos.y=0;}
function updDrive(dt,now){const v=player.veh,sp=v.spec;const dead=v.hp<=0,dry=sp.fuel&&v.fuel<=0;const acc=dead||dry?0:sp.acc;
  if(keys.up&&acc)v.v+=(v.v<0?30:acc)*dt;if(keys.down)v.v-=(v.v>.5?32:acc?10:0)*dt;if(!keys.up&&!keys.down||(!acc&&v.v>0)){v.v-=Math.sign(v.v)*Math.min(Math.abs(v.v),(acc?5:3)*dt);}
  const road=roadAt(v.pos.x,v.pos.z,.5);const paved=!road&&zoneAt(v.pos.x,v.pos.z);let maxv=sp.max*(wx.rain>.3?.92:1)*(road?1:paved?.7:sp.two?.5:.58);for(const f of speedMods){try{maxv*=f(v);}catch(e){}}
  if(sp.pedal&&P.energy<10)maxv*=.5;v.v=clamp(v.v,sp.two?-2:-8,maxv);
  const st=steerIn!=null?steerIn:(keys.left?1:0)-(keys.right?1:0);v.steer+=(st-v.steer)*Math.min(1,dt*(steerIn!=null?12:8));v.h+=v.steer*sp.turn*clamp(Math.abs(v.v)/7,0,1)*Math.sign(v.v)*(1-.35*Math.abs(v.v)/sp.max)*dt;
  const nx=v.pos.x+Math.sin(v.h)*v.v*dt,nz=v.pos.z+Math.cos(v.h)*v.v*dt;const fx=Math.sin(v.h),fz=Math.cos(v.h);
  let crash=0;if(drivable(nx+fx*sp.len/2,nz+fz*sp.len/2)&&drivable(nx,nz)){v.pos.x=nx;v.pos.z=nz;}else{crash=Math.abs(v.v);v.v*=-.2;}
  flyUpd(v);const hit=v.pos.y>1.5?null:collide(v.pos,Math.min(1.6,sp.wid/2+.2),false);if(hit){crash=Math.max(crash,Math.abs(v.v));v.v*=Math.abs(v.v)>3?-.3:.5;}
  const half=sp.len/2-sp.wid/2;
  for(const o of vehicles){if(o===v)continue;if(Math.abs(o.pos.x-v.pos.x)>14||Math.abs(o.pos.z-v.pos.z)>14||Math.abs(o.pos.y-v.pos.y)>2)continue;for(const t of [-half,0,half]){const px=v.pos.x+fx*t,pz=v.pos.z+fz*t;const s=segDist(px,pz,o);const min=o.spec.wid/2+sp.wid/2;
      if(s.d<min&&s.d>.001){const k=(min-s.d)/s.d;v.pos.x+=s.dx*k;v.pos.z+=s.dz*k;if(Math.abs(v.v)>5&&now-lastBump>1.2){lastBump=now;crash=Math.max(crash,Math.abs(v.v));if(o.state==='police')addWanted(1,'Rammed police');else if(o.state==='traffic'){o.stopT=3;if(P.cash>=50){P.cash-=50;toast('Bump · −₹50 settled on the spot','#ff5d73');}}}v.v*=.4;break;}}}
  for(const p of peds){if(p.state==='down'||!p.g.visible)continue;const s=segDist(p.x+(p.ox||0),p.z+(p.oz||0),v);if(s.d<sp.wid/2+.45){if(Math.abs(v.v)>5)knockPed(p,'Hit a pedestrian');else{p.x+=s.dx/(s.d||1)*.5;p.z+=s.dz/(s.d||1)*.5;}}}
  for(const c of cows.concat(animals)){if(c.area?!c.g.visible:!c.active)continue;if(c.state==='down'||Math.abs(c.x-v.pos.x)>12||Math.abs(c.z-v.pos.z)>12||v.pos.y>1.5)continue;const sz=STRAY_SIZE[c.kind]||.7;const s=segDist(c.x,c.z,v);if(s.d<sp.wid/2+sz){const big=c.kind==='elephant'?3:sz>=.9?1.4:.6;v.pos.x-=s.dx/(s.d||1)*.6;v.pos.z-=s.dz/(s.d||1)*.6;
    if(Math.abs(v.v)>3&&now-lastBump>.8){lastBump=now;const imp=Math.abs(v.v);crash=Math.max(crash,imp*big);hurtAnimal(c,imp,'vehicle');}v.v*=c.kind==='elephant'?-.3:sz>=.9?.2:.6;}}
  if(crash>4){if(crash>8)fleeFrom(v.pos.x,v.pos.z,18);player.shake=Math.min(.8,crash*.03);v.hp=Math.max(0,v.hp-crash*1.1);damage(sp.two||sp.pedal?0:crash*.2,'Crash');hornSfx();emit('crash',{v,impact:crash});if(v.hp<=0)toast('Engine dead · call a mechanic from Phone → Garage, or walk','#ff5d73');
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
let steerIn=null;   // analog steering from the wheel, slider or tilt controls (features/steering.js); null = arrow keys
function updFoot(dt,bounds){if(player.knock>0){player.knock-=dt;avatar.position.set(player.pos.x,.35,player.pos.z);avatar.rotation.set(-Math.PI/2,player.h,0,'YXZ');if(player.knock<=0)avatar.rotation.set(0,player.h,0);return;}
  const tired=(P.energy<=0?.6:1)*(P.health<25?.6:1);player.run=keys.run||keys.up&&isTouch;const target=keys.up?(player.run?7.5:4.2)*tired:keys.down?-2.4:0;player.v+=(target-player.v)*Math.min(1,dt*10);
  const st=(keys.left?1:0)-(keys.right?1:0);player.h+=st*3*dt;const nx=player.pos.x+Math.sin(player.h)*player.v*dt,nz=player.pos.z+Math.cos(player.h)*player.v*dt;
  if(bounds){player.pos.x=clamp(nx,-bounds.w/2+.4,bounds.w/2-.4);player.pos.z=clamp(nz,-bounds.d/2+.4,bounds.d/2-.3);const vb=inside&&inside.venue&&inside.venue.blk;if(vb)for(const r of vb){const q=player.pos;if(q.x>r[0]-.35&&q.x<r[2]+.35&&q.z>r[1]-.35&&q.z<r[3]+.35){const dl=q.x-r[0]+.35,dr=r[2]+.35-q.x,du=q.z-r[1]+.35,dd=r[3]+.35-q.z,m=Math.min(dl,dr,du,dd);if(m===dl)q.x=r[0]-.35;else if(m===dr)q.x=r[2]+.35;else if(m===du)q.z=r[1]-.35;else q.z=r[3]+.35;}}}
  else{if(drivable(nx,nz)){player.pos.x=nx;player.pos.z=nz;}collide(player.pos,.4,true);for(const o of vehicles){if(Math.abs(o.pos.x-player.pos.x)>8||Math.abs(o.pos.z-player.pos.z)>8)continue;const s=segDist(player.pos.x,player.pos.z,o);const min=o.spec.wid/2+.4;if(s.d<min&&s.d>.001){const k=(min-s.d)/s.d;player.pos.x+=s.dx*k;player.pos.z+=s.dz*k;}}}
  player.anim=Math.max(0,player.anim-dt);const ph=performance.now()/1000*(player.run?13:9),sw=Math.min(1,Math.abs(player.v)/4)*.7;
  AU.legs[0].rotation.x=Math.sin(ph)*sw;AU.legs[1].rotation.x=-Math.sin(ph)*sw;AU.arms[0].rotation.x=-Math.sin(ph)*sw;AU.arms[1].rotation.x=player.anim>0?-1.5:(P.weapon==='fist'?Math.sin(ph)*sw:-.5);
  avatar.position.set(player.pos.x,inside?0:.3,player.pos.z);avatar.rotation.set(0,player.h,0);avatar.visible=camMode!==2;if(eng)eng.g.gain.value=0;}
const JCL=new Map();let TIDN=0;
function updTraffic(dt){const pp=ppos();const fp=player.mode==='foot'?player.pos:null;let n=0;
  for(const c of vehicles.slice()){if(c.state!=='traffic')continue;n++;if(c.pos.distanceTo(pp)>390){removeVeh(c);n--;continue;}const l=c.lane;let target=c.stopT>0?0:l.vmax;c.stopT=Math.max(0,c.stopT-dt);let blocked=null;
    if(!c.tid)c.tid=++TIDN;const fx=Math.sin(c.h),fz=Math.cos(c.h);const look=c.spec.len/2+6;
    // cars ignore oncoming cars (lanes can touch where roads meet) and a car stuck behind traffic for 6 s squeezes through,
    // so junctions at the ends of highways never lock up
    c.ghostT=Math.max(0,(c.ghostT||0)-dt);let jam=false;
    if(!(c.ghostT>0))for(const o of vehicles){if(o===c)continue;const dx=o.pos.x-c.pos.x,dz=o.pos.z-c.pos.z;if(Math.abs(dx)>30||Math.abs(dz)>30||Math.abs(o.pos.y-c.pos.y)>2)continue;const along=dx*fx+dz*fz,lat=Math.abs(-dx*fz+dz*fx);
      const dot=Math.sin(o.h)*fx+Math.cos(o.h)*fz;if(o.state==='traffic'&&dot<-.3)continue;
      // crossing traffic: the vehicle that got there first (lower number) goes, the other waits its turn
      if(o.state==='traffic'&&Math.abs(dot)<.6&&(o.tid||0)>c.tid)continue;
      if(along>0&&along<look+o.spec.len/2&&lat<2.4){target=Math.min(target,o.state==='traffic'?o.v*.8:0);if(o.state!=='traffic')blocked=o;else jam=true;}}
    if(jam&&c.v<.4){c.jamT=(c.jamT||0)+dt;if(c.jamT>7){c.jamT=0;if(c.pos.distanceTo(pp)>45){removeVeh(c);n--;continue;}else if(c.jamT===0&&(c.jamN=(c.jamN||0)+1)>2)c.ghostT=2;}}else{c.jamT=0;c.jamN=0;}
    for(const q of [fp,...cows.filter(k=>k.active)]){if(!q)continue;const dx=q.x-c.pos.x,dz=q.z-c.pos.z;const along=dx*fx+dz*fz,lat=Math.abs(-dx*fz+dz*fx);if(along>0&&along<look+2&&lat<2.4)target=0;}
    if(blocked&&c.v<.5){c.blockT+=dt;if(c.blockT>9&&c.pos.distanceTo(pp)>60){removeVeh(c);n--;continue;}}else c.blockT=0;
    if(frame%3===0)c.sigD=sigStop(c);if(c.sigD!=null&&c.sigD<Infinity)target=Math.min(target,c.sigD<1?0:Math.max(0,c.sigD*.7));
    if(c.turn&&c.turn.wait){const T=c.turn;const o=JCL.get(T.key);if(o&&o!==c&&vehicles.includes(o)&&o.turn&&o.turn.key===T.key&&(T.waited=(T.waited||0)+dt)<8)target=0;else{T.wait=false;JCL.set(T.key,c);}}
    c.v+=clamp(target-c.v,-20*dt,5*dt);
    if(c.turn&&!c.turn.wait){const T=c.turn;T.t=Math.min(1,T.t+c.v*dt/T.len);const t=T.t,u=1-t;let x,z,tx,tz;
      if(T.c2){x=u*u*u*T.p0[0]+3*u*u*t*T.c[0]+3*u*t*t*T.c2[0]+t*t*t*T.p2[0];z=u*u*u*T.p0[1]+3*u*u*t*T.c[1]+3*u*t*t*T.c2[1]+t*t*t*T.p2[1];tx=3*u*u*(T.c[0]-T.p0[0])+6*u*t*(T.c2[0]-T.c[0])+3*t*t*(T.p2[0]-T.c2[0]);tz=3*u*u*(T.c[1]-T.p0[1])+6*u*t*(T.c2[1]-T.c[1])+3*t*t*(T.p2[1]-T.c2[1]);}
      else{x=u*u*T.p0[0]+2*u*t*T.c[0]+t*t*T.p2[0];z=u*u*T.p0[1]+2*u*t*T.c[1]+t*t*T.p2[1];tx=2*u*(T.c[0]-T.p0[0])+2*t*(T.p2[0]-T.c[0]);tz=2*u*(T.c[1]-T.p0[1])+2*t*(T.p2[1]-T.c[1]);}
      c.pos.set(x,(T.y0||0)+((T.y2||0)-(T.y0||0))*t,z);if(Math.abs(tx)+Math.abs(tz)>1e-6)c.h=Math.atan2(tx,tz);c.m.rotation.y=c.h;if(T.t>=1){if(JCL.get(T.key)===c)JCL.delete(T.key);c.turn=null;placeLane(c);}}
    else if(!c.turn){l.s+=l.dir*c.v*dt;const left=l.dir>0?l.e.len-l.s:l.s;const TR=Math.min(9,l.e.len*.4);
      if(left<=TR){const pk={e:l.e,s:l.s,dir:l.dir};nextLane(pk);
        if(pk.dead){// a road that ends: far from you the vehicle simply leaves; near you it makes a proper U-turn
          if(c.pos.distanceTo(pp)>70){removeVeh(c);n--;continue;}const h0=c.h,fx2=Math.sin(h0),fz2=Math.cos(h0),r=Math.max(2.4,l.e.lane*1.2+1.2);lanePos({e:l.e,s:l.s,dir:-l.dir},_lp);
          c.turn={p0:[c.pos.x,c.pos.z],c:[c.pos.x+fx2*r*1.4,c.pos.z+fz2*r*1.4],c2:[_lp.x+fx2*r*1.4,_lp.z+fz2*r*1.4],p2:[_lp.x,_lp.z],t:0,len:r*3.4+2,key:'u'+(c.tid||(c.tid=++TIDN)),y0:c.pos.y,y2:c.pos.y};l.dir=-l.dir;}
        else{const s1=pk.dir>0?Math.min(Math.min(9,pk.e.len*.4),pk.e.len):Math.max(0,pk.e.len-Math.min(9,pk.e.len*.4));const p0=[c.pos.x,c.pos.z],h0=c.h;lanePos({e:pk.e,s:s1,dir:pk.dir},_lp);const p2=[_lp.x,_lp.z],h2=_lp.h;
          const d=Math.hypot(p2[0]-p0[0],p2[1]-p0[1]);let dh=h2-h0;dh=Math.atan2(Math.sin(dh),Math.cos(dh));const k=d*.45;const cc=Math.abs(dh)<.15?[(p0[0]+p2[0])/2,(p0[1]+p2[1])/2]:null;
          const ex=l.dir>0?l.e.bx:l.e.ax,ez=l.dir>0?l.e.bz:l.e.az;const key=Math.round(ex/10)+','+Math.round(ez/10);const busy=pk.e.road!==l.e.road||Math.abs(dh)>.5;
          c.turn=cc?{p0,c:cc,p2,t:0,len:Math.max(1,d)}:{p0,c:[p0[0]+Math.sin(h0)*k,p0[1]+Math.cos(h0)*k],c2:[p2[0]-Math.sin(h2)*k,p2[1]-Math.cos(h2)*k],p2,t:0,len:Math.max(1,d*(1+Math.abs(dh)*.25))};c.turn.key=busy?key:'s'+(c.tid||(c.tid=++TIDN));c.turn.y0=c.pos.y;c.turn.y2=pk.e.fly?flyY(pk.e,s1):0;
          if(busy){const o=JCL.get(key);if(o&&o!==c&&vehicles.includes(o)&&o.turn&&o.turn.key===key){c.turn.wait=true;}else JCL.set(key,c);}
          l.e=pk.e;l.dir=pk.dir;l.s=s1;}}
      if(!c.turn)placeLane(c);}c.m.visible=Math.abs(c.pos.x-pp.x)+Math.abs(c.pos.z-pp.z)<Math.max(240,scene.fog.far*.6);for(const w of c.m.userData.wheels)w.rotation.x+=c.v*dt/.4;}
  let spawns=0;while(n<Math.round(CFG.traffic*botScale)&&spawns<3){spawns++;const v=spawnTraffic(started);if(v){const c=CONG[v.lane.e.id];if(Math.random()>.35+c){removeVeh(v);continue;}v.lane.vmax*=1-.55*c;n++;}}}
// people jump out of the way of a speeding vehicle (yours or traffic) and run from fights and gunfire
function dodgeCheck(p,dt){if(p.state==='down'||p.state==='idle')return;p.ox=p.ox||0;p.oz=p.oz||0;let hx=0,hz=0;
  const near=[];if(player.mode==='drive'&&player.veh)near.push(player.veh);for(const v of vehicles)if(v.state==='traffic'&&Math.abs(v.pos.x-p.x)<20&&Math.abs(v.pos.z-p.z)<20)near.push(v);
  for(const v of near){const sp=Math.abs(v.v);if(sp<6)continue;const fx=Math.sin(v.h)*Math.sign(v.v),fz=Math.cos(v.h)*Math.sign(v.v);const dx=p.x+p.ox-v.pos.x,dz=p.z+p.oz-v.pos.z;const along=dx*fx+dz*fz,lat=-dx*fz+dz*fx;
    if(along>0&&along<sp*1.6+4&&Math.abs(lat)<2.6){const s=lat>=0?1:-1;hx+=-fz*s*6;hz+=fx*s*6;if(v===player.veh&&!p.yell&&Math.random()<.4){p.yell=1;p.wave=true;setTimeout(()=>{p.wave=false;p.yell=0;},1600);}}}
  if(hx||hz){p.ox=clamp(p.ox+hx*dt,-4,4);p.oz=clamp(p.oz+hz*dt,-4,4);if(p.state==='walk'){p.state='flee';p.fleeT=1.4;}}else{p.ox*=Math.max(0,1-dt*.8);p.oz*=Math.max(0,1-dt*.8);}}
function updPeds(dt,t){const pp=ppos();for(const p of peds){if(p.state==='idle'){if(Math.random()<.02)placePed(p,40);continue;}dodgeCheck(p,dt);
    if(p.state==='down'){p.downT-=dt;if(p.downT<=0)placePed(p,50);p.g.position.set(p.x,.45,p.z);continue;}
    if(Math.abs(p.x-pp.x)>240||Math.abs(p.z-pp.z)>240){placePed(p,60);continue;}
    if(p.state==='run'){p.x+=p.vx*dt;p.z+=p.vz*dt;p.runT-=dt;if(p.runT<=0)placePed(p,50);}
    else{const sp=p.state==='flee'?4.6:p.sp;if(p.state==='flee'){p.fleeT-=dt;if(p.fleeT<=0)p.state='walk';}p.t+=p.dir*sp*dt;if(Math.abs(p.t)>27){p.t=Math.sign(p.t)*27;p.dir*=-1;}edgeXY(p);}
    const far=Math.abs(p.x-pp.x)>110||Math.abs(p.z-pp.z)>110;p.g.visible=!far&&!inside;if(far)continue;const fast=p.state!=='walk';p.g.position.set(p.x+(p.ox||0),.3+Math.abs(Math.sin(t*(fast?12:7)+p.ph))*.08,p.z+(p.oz||0));p.g.rotation.set(0,p.state==='run'?Math.atan2(p.vx,p.vz):p.ry,0);
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
// minimap zoom (+ and − under the map) and, while navigating, a look-ahead view: you sit low on the map so more of the road ahead shows
let miniZoom=clamp(+store.get('ib.miniZoom')||1,.4,3),navOn=false;
function setMiniZoom(f){miniZoom=clamp(miniZoom*f,.4,3);store.set('ib.miniZoom',miniZoom);toast(`Map zoom ×${miniZoom.toFixed(1)}`,'#5fb4ff');}
function drawMini(now){const Wd=224,p0=ppos(),h=player.mode==='drive'&&player.veh?player.veh.h:player.h;const spd=player.mode==='drive'&&player.veh?Math.abs(player.veh.v):0;const radius=(nav.route?(spd>18?520:spd>9?340:220):(spd>18?700:spd>9?450:300))/miniZoom;const ppm=(Wd/2)/radius;
  if(!!nav.route!==navOn){navOn=!!nav.route;document.body.classList.toggle('navon',navOn);}const ahead=navOn?.38:0;const pp={x:p0.x+Math.sin(h)*radius*ahead,z:p0.z+Math.cos(h)*radius*ahead};
  mc.save();mc.fillStyle='#2a6f97';mc.fillRect(0,0,Wd,Wd);mc.translate(Wd/2,Wd/2);mc.rotate(Math.PI+h);mc.scale(ppm*MAPS,ppm*MAPS);mc.drawImage(mapCanvas,-pp.x/MAPS,-pp.z/MAPS);mc.restore();
  mc.save();mc.translate(Wd/2,Wd/2);mc.rotate(Math.PI+h);for(const e of EDGES){const c=CONG[e.id];if(c<.42)continue;if(Math.max(e.ax,e.bx)<pp.x-radius||Math.min(e.ax,e.bx)>pp.x+radius||Math.max(e.az,e.bz)<pp.z-radius||Math.min(e.az,e.bz)>pp.z+radius)continue;mc.strokeStyle=c>.7?'#e8473a':'#ff9f1c';mc.lineWidth=Math.max(2.5,e.w*ppm*.6);mc.lineCap='round';mc.beginPath();mc.moveTo((e.ax-pp.x)*ppm,(e.az-pp.z)*ppm);mc.lineTo((e.bx-pp.x)*ppm,(e.bz-pp.z)*ppm);mc.stroke();}if(nav.route){mc.lineJoin=mc.lineCap='round';for(const [col,w] of [['#ffffff',11],['#2f7bff',6.5]]){mc.strokeStyle=col;mc.lineWidth=w;mc.beginPath();nav.route.forEach(([x,z],i)=>{const X=(x-pp.x)*ppm,Z=(z-pp.z)*ppm;i?mc.lineTo(X,Z):mc.moveTo(X,Z);});mc.stroke();}}mc.font='13px "Baloo 2", sans-serif';mc.textAlign='center';mc.textBaseline='middle';
  const icon=(x,z,col,txt,rr=7,clampIt)=>{let dx=(x-pp.x)*ppm,dz=(z-pp.z)*ppm;const d=Math.hypot(dx,dz),lim=Wd/2-10;if(d>lim){if(!clampIt)return;dx*=lim/d;dz*=lim/d;}mc.save();mc.translate(dx,dz);mc.rotate(-Math.PI-h);mc.fillStyle=col;mc.beginPath();mc.arc(0,0,rr,0,6.29);mc.fill();if(txt){mc.fillStyle='#1a1430';mc.fillText(txt,0,1);}mc.restore();};
  for(const p of pois){if(Math.abs(p.x-pp.x)>radius*1.2||Math.abs(p.z-pp.z)>radius*1.2)continue;if(p.type==='home'&&!P.homes.includes(p.extra))continue;if(radius>400&&!['pump','cng','airport','station','home','hospital'].includes(p.type))continue;icon(p.x,p.z,p.color,p.icon,8);}
  for(const v of vehicles){if(v.state!=='police')continue;icon(v.pos.x,v.pos.z,Math.floor(now*6)%2?'#ff3b3b':'#3b6bff',null,5,true);}
  if(curMission&&curMission.target){const tg=curMission.target;icon(tg.x,tg.z,'#'+(tg.col||0x3ddc97).toString(16).padStart(6,'0'),null,8,true);}
  mc.restore();mc.save();mc.translate(Wd/2,Wd/2+ahead*Wd/2);mc.fillStyle=CFG.accent||'#ffc93c';mc.strokeStyle='#1a1430';mc.lineWidth=2;mc.beginPath();mc.moveTo(0,-11);mc.lineTo(8,9);mc.lineTo(0,4);mc.lineTo(-8,9);mc.closePath();mc.fill();mc.stroke();mc.restore();}
function updLabels(){const pp=ppos();for(const p of pois){const d=Math.abs(p.x-pp.x)+Math.abs(p.z-pp.z);if(d<160&&!p.sp&&!inside){p.sp=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTex(p.name,p.color)}));p.sp.scale.set(9,2,1);p.sp.position.set(p.x,5,p.z);scene.add(p.sp);}
  else if(p.sp&&(d>230)){scene.remove(p.sp);p.sp.material.map.dispose();p.sp.material.dispose();p.sp=null;}}}
function updDiscover(){const pp=ppos();for(const [name,x,z] of W.places){if(P.discovered[name])continue;if(Math.hypot(x-pp.x,z-pp.z)<55){P.discovered[name]=istISO();earn(price(100),'discover');dirty=true;toast(`Discovered: ${esc(name)} · +${inr(price(100))}`,'#ffc93c');emit('discover',name);}}}

/* ================= intro ================= */
// admin announcements that are inside their dates (Admin → Announcements)
function activeNews(){const d=istISO();return (CFG.news||[]).filter(n=>n&&(n.title||n.text)&&(!n.start||n.start<=d)&&(!n.end||n.end>=d));}
function renderIntro(){$('#gName').textContent=CFG.name;$('#gTag').textContent=CFG.tagline;const a=$('#ann');const fest=activeFestivals('MH').concat(activeFestivals('GJ'),activeFestivals('RJ')).filter((f,i,arr)=>arr.indexOf(f)===i);const ev=activeEvents();
  const lines=[];if(CFG.announce)lines.push(esc(CFG.announce));for(const n of activeNews())lines.push(esc(n.title?n.title+(n.text?': '+n.text:''):n.text));if(fest.length)lines.push('Festival now: '+fest.map(f=>esc(f.name)).join(', '));if(ev.length)lines.push('Happening now: '+ev.map(e=>esc(e.name)).join(', '));a.hidden=!lines.length;a.innerHTML=lines.join('<br>');
  $('#today').textContent=`${istText()} · Bay time ${bayTime()}`;
  drawStartMap();
  pickRow();$('#newGame').hidden=!hadSave;setAvatar();}
/* start screen: India map, tap a state to start there */
var startPick=null;
const stateRegion=st=>{const IS=window.INDIA_STATES;const q=IS&&IS.states.find(x=>x.id===st.toLowerCase());return q?q.region:null;};
function statePlayable(st){const r=REGIONS.find(q=>q.id===stateRegion(st));return !!(r&&r.map&&CFG.regions[r.id]&&W.startZones&&W.startZones[st]&&W.zones.some(z=>z.st===st));}
function drawStartMap(){const el=$('#cities');const IS=window.INDIA_STATES;if(!IS){el.innerHTML='';return;}
  const sel=startPick?startPick.st.toLowerCase():'';
  el.innerHTML=`<div class="smap"><svg viewBox="${IS.viewBox}" role="img" aria-label="Map of India. Tap a bright state to start there.">${IS.states.map(q=>{const st=q.id.toUpperCase(),ok=statePlayable(st);return `<path data-st="${st}" d="${q.d}" class="${ok?'ok':'no'}${q.id===sel?' on':''}"><title>${esc(q.name)}${ok?'':' · coming soon'}</title></path>`;}).join('')}</svg></div><div class="spick" id="spick"></div>`;
  el.querySelector('svg').onclick=e=>{const p=e.target.closest('path[data-st]');if(!p)return;const st=p.dataset.st;const q=IS.states.find(x=>x.id===st.toLowerCase());if(!statePlayable(st)){toast(`${esc(q?q.name:st)} opens in a coming update`,'#d6c8e4');return;}
    const z=W.zones.find(x=>x.id===W.startZones[st]);startPick={st,zone:z};el.querySelectorAll('path.on').forEach(x=>x.classList.remove('on'));p.classList.add('on');pickRow();};
  pickRow();}
function pickRow(){const el=$('#spick');if(!el)return;const go0=$('#go'),go=go0.querySelector('.gt')||go0;
  if(!startPick){const lz=lastZone();el.innerHTML=hadSave?`<p>Continue where you left off${lz?' in <b>'+esc(lz.name)+'</b>':''}, or tap a bright state to travel somewhere new.</p>`:`<p><b>Choose your city</b> · tap a bright state, then a city.</p>`;go.textContent=hadSave?(lz?'Continue in '+lz.name:'Continue'):'Start';return;}
  const st=startPick.st,zs=W.zones.filter(z=>z.st===st).sort((a,b)=>({big:0,mid:1,small:2}[a.size]-{big:0,mid:1,small:2}[b.size]));
  el.innerHTML=`<b>${esc(W.states[st])}</b><div class="chips">${zs.slice(0,8).map(z=>`<button class="chip${z===startPick.zone?' on':''}" data-z="${z.id}">${esc(z.name)}</button>`).join('')}</div>`;
  el.onclick=e=>{const id=e.target.dataset.z;if(!id)return;startPick.zone=W.zones.find(z=>z.id===id);pickRow();};
  go.textContent=(hadSave?'Go to ':'Start at ')+startPick.zone.name;}
function lastZone(){if(!hadSave||!P.pos)return null;return zoneAt(P.pos.x,P.pos.z,300)||W.zones.slice().sort((a,b)=>Math.hypot(a.x0+a.nx*40-P.pos.x,a.z0+a.nz*40-P.pos.z)-Math.hypot(b.x0+b.nx*40-P.pos.x,b.z0+b.nz*40-P.pos.z))[0];}
function startSpot(z){const cx=z.x0+z.nx*40,cz=z.z0+z.nz*40;const r=nearestRoadPoint(cx,cz,400);if(!r)return{x:cx,z:cz,h:0};return{x:r.x,z:r.z,h:Math.atan2(r.e.dx,r.e.dz)};}
$('#newGame').onclick=e=>{const b=$('#newGame');if(b.dataset.sure){P=newSave();store.set(SAVEKEY,P);location.reload();return;}
  openSheet('🆕 Start a new game?','Your player starts again from the beginning',`<p class="note">Your money, homes, vehicles, story and achievements are reset${P.name?' for <b>'+esc(P.name)+'</b>':''}. This cannot be undone.</p><div class="stack"><button class="buy danger" data-id="yes">Yes, start a new game</button><button class="go" data-id="no">No, keep playing</button></div>`,
    s=>s.onclick=ev=>{const id=ev.target.dataset.id;if(id==='no')return closeSheet();if(id==='yes'){closeSheet();b.dataset.sure='1';setTimeout(()=>b.click(),120);}});};
let camSnap=true;
function begin(){setAvatar();document.body.classList.remove('pre');$('#intro').hidden=true;initAudio();if(ac&&ac.state==='suspended')ac.resume();started=true;camSnap=true;$('#c').focus();applyLook();applyOutfit();
  if(!startedOnce){startedOnce=true;if(!CFG.challansOn||!Array.isArray(P.challans))P.challans=[];
    P.cars.forEach((c,i)=>{if(c.x!=null)spawnOwned(i,c.x,c.z,c.h||0);});
    if(P.pos){if(P.inCar!=null&&P.cars[P.inCar]){const v=ownedVeh[P.inCar]||spawnOwned(P.inCar,P.pos.x,P.pos.z,P.pos.h);v.pos.set(P.pos.x,0,P.pos.z);v.h=P.pos.h;enterVehicle(v);}else{player.mode='foot';player.pos.set(P.pos.x,0,P.pos.z);player.h=P.pos.h;avatar.visible=true;}}
    else{const sp=startPick?startSpot(startPick.zone):{x:2940,z:8736,h:Math.PI/2};const v=ownedVeh[0]||spawnOwned(0,sp.x,sp.z,sp.h);v.pos.set(sp.x,0,sp.z);v.h=sp.h;enterVehicle(v);startPick=null;}
    P.cars.forEach((c,i)=>{if(!ownedVeh[i]&&!c.garage){const [x,z,h]=[2900+i*7,8747,Math.PI/2];spawnOwned(i,x,z,h);}});
    if(startPick){const sp=startSpot(startPick.zone);const v=player.mode==='drive'?player.veh:null;teleport(sp.x,sp.z,sp.h);if(v){v.pos.set(sp.x,0,sp.z);v.h=sp.h;v.v=0;enterVehicle(v);}startPick=null;}
    setPedCount(Math.round(CFG.peds*botScale));hooks.start.forEach(f=>{try{f();}catch(e){console.error(e);}});
    const latest=(clList()[0]||{}).v;if(!P.extra.howto)setTimeout(()=>howTo(0),700);else if(latest&&P.seenVersion!==latest)setTimeout(()=>{if(!sheetOpen())whatsNew(true);},900);}
  toast(`${CFG.name} · ${areaName()}`,'#ffc93c');}
{const v=$('#ver');if(v)v.textContent=VERSION;}
$('#go').onclick=()=>{if(!P.name)return profileSheet(true,begin);begin();};

/* ================= feature API ================= */
// Fewer bot cars and people when real players are around (set by online play).
let botScale=1;function setBotScale(k){k=clamp(k,.2,1);if(Math.abs(k-botScale)<.04)return;botScale=k;if(started)setPedCount(Math.round(CFG.peds*botScale));}
const api={onFire:f=>fireHooks.push(f),setBotScale,get botScale(){return botScale;},openPoi:p=>openPoi(p),foodSheet:p=>foodSheet(p),colliders,cost,rawCost,enterVenue,leaveVenue:()=>leaveHome(),interScene:inter.scene,get insideVenue(){return inside&&inside.venue;},storeOwned,roadSpotNear,THREE,scene,camera,renderer,player,vehicles,peds,pois,SPEC,WORLD:W,REGIONS,FURN,HTYPE,inter,avatar,outfitParts,mapCanvas,MAPS,
  get CFG(){return CFG;},get P(){return P;},get clock(){return clockH;},get gameDay(){return gameDay;},get inside(){return inside;},get muted(){return muted;},setMuted,get testMode(){return TESTMODE;},setTestMode(on){save();store.set('ib.testmode',!!on);sessionStorage.setItem('ib.cloudLoaded','1');location.reload();},get god(){return godMode;},set god(v){godMode=!!v;},get audio(){return ac;},get started(){return started;},get weather(){return wx.cur;},get camMode(){return camMode;},
  toast,big,openSheet,closeSheet,rowHtml,spend,earn,inr,price,esc,addWanted,damage,save,makeVeh,removeVeh,spawnOwned,ownedVeh,buyVehicle,ppos,edgePos,box,boxRot,addStatic,flushStatic,LMat,buildPerson,addSign,
  addPoi(o){const p=makePoi(o);return p;},addApp,addMission,addPrompt,addFirstPrompt(f){firstPrompts.push(f);},poiHandlers,speedMods,on,emit,openWait,closeWait,startActivity,startQueue,startSleep,teleport,nearestRoadPoint,roadAt,drivable,isWater,isLand,zoneAt,stateAt,
  fareMultAt,activeFestivals,activeEvents,addChallan,istISO,istText,bayTime,gameMin,enterVehicle,exitVehicle,applyOutfit,homeById,buildInterior,nearestPoi,phoneSheet,profileSheet,hornSfx,areaName,
  onUpdate(f){hooks.update.push(f);},onStart(f){hooks.start.push(f);if(startedOnce)f();},onAfterRender(f){hooks.afterRender.push(f);},onKey(code,f){hooks.key[code]=f;},setMap(f){hooks.map=f;},setBayGame(f){hooks.bayGame=f;},setEscape(f){hooks.escape=f;},set photo(v){hooks.photo=v;},set viewAt(f){hooks.viewAt=f;},get tourSpots(){return TOUR;},get photo(){return hooks.photo;},
  PICON,PLABEL,findRoute,get route(){return nav.route;},menuSheet,settingsSheet,get curMission(){return curMission;},
  CONG,sigState,sigJunction,
  blocks,get db(){return db;},get adminOK(){return adminOK;},buildVeh,nameOk,ageFromDob:IBCONF.ageFromDob,get adSlots(){return SLOTS;},updBillboards,billboardMeshes,adSheet,pickBillboard,personErr,personFields,refreshBillboards,openApp,set introClick(f){hooks.introClick=f;},set starterSheet(f){hooks.starterSheet=f;},enterHome,homeById,set introLabel(f){hooks.introLabel=f;setAvatar();},cloudConfig,hubSheet,supportSheet,setAvatar,addProfileRows(f){profileRows.push(f);},set profileEdit(f){hooks.profileEdit=f;},set displayName(f){hooks.displayName=f;setAvatar();},set userEmail(f){hooks.userEmail=f;},setCfgBackend(b){cfgBackend=b;adminOK=!!(b&&b.admin);adminLocal=false;},get hadSave(){return hadSave;},
  setDirty(){dirty=true;},buildPlane,addAdSlot,setSteer(v){steerIn=v==null?null:clamp(v,-1,1);},addCol,applyLook,lookCode,decodeLook,lookSheet,LOOKS,buildAnimal,animGait,ASPEC,get strays(){return cows;},animals,MR,mpick,clamp,hash,canvasTex,EDGES,ROADS,laneRandom:randomLaneNear,lanePos,uiLock};
api.addResumer=addResumer;api.resumeWait=resumeWait;api.getWait=()=>wait;api.applyTheme=applyTheme;api.phoneSheet=phoneSheet;api.folderSheet=folderSheet;api.HOME=HOME;api.activeNews=activeNews;api.clList=clList;api.clLines=clLines;api.THEMES=THEMES;api.garageSheet=garageSheet;api.needCity=()=>!hadSave&&!startPick;api.startName=()=>startPick?startPick.zone.name:(lastZone()||{}).name||'';api.openCityPick=()=>{const p=$('#iMapPanel');if(p)p.classList.add('open');document.body.classList.add('imap');const s=$('#spick');if(s){s.classList.remove('flash');void s.offsetWidth;s.classList.add('flash');}};api.lastZone=lastZone;api.howTo=howTo;api.whatsNew=whatsNew;api.featuresSheet=featuresSheet;window.BB=api;
const queued=Array.isArray(window.BBFeatures)?window.BBFeatures:[];window.BBFeatures={push(f){try{f(api);}catch(e){console.error('Feature failed',e);}}};queued.forEach(f=>window.BBFeatures.push(f));
flushStatic();

/* ================= boot + loop ================= */
applyTheme();tickClock();renderIntro();document.title=CFG.name;updWeap();renderStars();updSky(1);updSun(new THREE.Vector3(2900,0,8700));
camera.position.set(3150,60,8950);
const camPos=new THREE.Vector3(),camLook=new THREE.Vector3(),tmp=new THREE.Vector3();
let last=performance.now(),orbit=0,frame=0;
/* the start screen tour (Beta v1.01.05): the camera glides round famous places, one after another */
const TOUR_SPOTS=[['Gateway of India','Mumbai',170,58,10],['Hawa Mahal','Jaipur',120,40,14],['Statue of Unity','Kevadia',260,90,60],['Marine Drive','Mumbai',200,50,6],['Mysore Palace','Mysuru',140,46,16],['Jaisalmer Fort','Jaisalmer',160,55,18],['Chinese Fishing Nets','Fort Kochi',110,30,6],['Murudeshwar Shiva Statue','Murudeshwar',170,60,30],['Bandra–Worli Sea Link','Mumbai',230,70,10],['Mehrangarh Fort','Jodhpur',190,70,24]];
const TOUR=TOUR_SPOTS.map(([n,c,r,h,ly])=>{const p=(W.places||[]).find(q=>q[0]===n);return p?{name:`${n}, ${c}`,cx:p[1],cz:p[2],r,h,ly}:null;}).filter(Boolean);
let tourI=0,tourT=0,tourA=0;
{const lz=lastZone();if(lz&&P.pos){TOUR.unshift({name:'Where you left off · '+lz.name,cx:P.pos.x,cz:P.pos.z,r:110,h:42,ly:4});setTimeout(()=>{const n=$('#tourName');if(n)n.textContent=TOUR[0].name;},0);}}
function tourShot(rdt){if(!TOUR.length)return{cx:2990,cz:8800,r:170,h:60,ly:10,a:orbit+=rdt*.05};tourT+=rdt;tourA+=rdt*.07;
  if(tourT>13){tourT=0;tourI=(tourI+1)%TOUR.length;tourA=Math.random()*6;const n=$('#tourName');if(n){n.textContent=TOUR[tourI].name;const c=$('#tourCap');if(c){c.classList.remove('in');void c.offsetWidth;c.classList.add('in');}}}
  const q=TOUR[tourI];const k=Math.min(1,tourT/1.2,(13-tourT)/1.2);const v=$('#intro');if(v)v.style.setProperty('--fade',String(1-Math.max(0,k)));return Object.assign({a:tourA},q);}
function loop(ms){requestAnimationFrame(loop);const now=ms/1000;const rdt=Math.min(1,Math.max(0,(ms-last)/1000));const dt=Math.min(.05,rdt);last=ms;frame++;tickClock();
  if(!started){const T=tourShot(rdt);updSky(dt);camera.position.set(T.cx+Math.cos(T.a)*T.r,T.h+Math.sin(T.a*.7)*6,T.cz+Math.sin(T.a)*T.r);camera.lookAt(T.cx,T.ly,T.cz);updSun(camera.position);if(frame%15===1)updChunks(T.cx,T.cz);if(frame%20===1){updLabels();updBillboards(T.cx,T.cz);}
    if(frame%40===0)$('#today').textContent=`${istText()} · Bay time ${bayTime()}`;renderer.render(scene,camera);return;}
  updSky(dt);
  if(sheetOpen()||waitOpen()){tickWait(rdt);updNeeds(rdt);updHud();renderer.render(inside?inter.scene:scene,camera);for(const f of hooks.afterRender)f();return;}
  if(CFG.weather==='auto'&&wx.cur==='monsoon'&&Math.random()<.004)wx.flash=1;wx.flash=Math.max(0,wx.flash-dt*5);
  overT=Math.max(0,overT-dt);player.fireCd=Math.max(0,player.fireCd-dt);player.hitCd=Math.max(0,player.hitCd-dt);if(fireHeld&&P.weapon==='pistol')fire();
  if(inside){updFoot(dt,inter);}
  else{updTraffic(dt);updPeds(dt,now);updAnimals(dt,now);updTrains(dt);updPlanes(dt);updPolice(dt,now);
    if(overT<=0&&(!hooks.photo||hooks.photo.live)){if(player.mode==='drive'&&player.veh)updDrive(dt,now);else updFoot(dt,null);}
    for(const v of vehicles)if(v.state==='parked'&&v.fallen)v.m.rotation.set(0,v.h,Math.PI/2.2,'YXZ');
    seaTex.offset.x+=dt*.004;seaTex.offset.y+=dt*.002;for(const f of flags)f.rotation.y=Math.sin(now*3+f.position.x)*.25;
    marker.rotation.y+=dt;beamMat.opacity=.22+Math.sin(now*3)*.07;for(const p of pois){if(p.sp)p.ring.material.opacity=.55+Math.sin(now*4)*.3;}
    if(frame%20===0)updDiscover();if(frame%20===5)updLabels();if(frame%15===2){const vp=hooks.viewAt?hooks.viewAt():ppos();updChunks(vp.x,vp.z);}if(frame%60===3){const vp=hooks.viewAt?hooks.viewAt():ppos();updBillboards(vp.x,vp.z);}if(frame%3===1)fadeBoards();
    if(sir)sir.g.gain.value=muted?0:(vehicles.some(v=>v.state==='police'&&!v.dead&&v.pos.distanceTo(ppos())<90)?.03:0);
    const an=areaName();if(frame%30===0&&an!==lastArea){const z=zoneAt(ppos().x,ppos().z,30);if(z)emit('zone',z);lastArea=an;$('#area').textContent=an;}}
  updNeeds(rdt);updSmoke(dt);
  for(const f of hooks.update){try{f(dt,now);}catch(e){console.error(e);}}
  for(let i=tracers.length-1;i>=0;i--){tracers[i].t-=dt;if(tracers[i].t<=0){scene.remove(tracers[i].l);tracers[i].l.geometry.dispose();tracers.splice(i,1);}}flash.intensity=Math.max(0,flash.intensity-dt*40);
  if(frame%6===0){curMission=evalMission();showMission(curMission);}
  if(frame%10===0)updNav(dt*10);
  if(frame%8===0&&!inside){updSignals();updHwSignals();}if(frame%4===0&&CFG.challansOn&&!inside)checkRedLight(now);congT+=rdt;if(congT>20){congT=0;updCongestion();}
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
