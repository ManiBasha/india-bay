
/* ================= places you can use ================= */
const PCOL={stadium:'#3ddc97',bank:'#3ddc97',food:'#ff9f1c',toilet:'#5fb4ff',pump:'#2fc4b2',cng:'#7fd858',hospital:'#ff6b6b',police:'#5f8bff',rto:'#c9a227',jobs:'#ffb347',cars:'#c38bff',bikes:'#ff8fd0',clothes:'#ff6fa8',furniture:'#d8a46a',mobile:'#6fc3ff',guns:'#ff5d73',realty:'#ffc93c',mechanic:'#9aa5b1',station:'#e07b39',bus:'#e85d5d',lodge:'#b38bff',home:'#ffe08a',airport:'#7ad0ff',local:'#ff9a3c',ferry:'#4fb3ff',safari:'#9bd36a',camel:'#e3b26a',cricket:'#3ddc97',mall:'#ff6fa8',metro:'#c38bff',helipad:'#ffd36a',activity:'#3fd0c9'};
const PICON={stadium:'⚽',bank:'🏦',food:'🍛',toilet:'🚻',pump:'⛽',cng:'🟢',hospital:'🏥',police:'🚓',rto:'🪪',jobs:'💼',cars:'🚗',bikes:'🏍',clothes:'👕',furniture:'🛋',mobile:'📱',guns:'🎯',realty:'🏘',mechanic:'🔧',station:'🚆',bus:'🚌',lodge:'🛏',home:'🏡',airport:'✈',local:'🚉',ferry:'⛴',safari:'🦁',camel:'🐪',cricket:'🏏',mall:'🛍',metro:'Ⓜ',helipad:'🚁',activity:'🪂'};
const PLABEL={stadium:'Football stadium',bank:'Bank and ATM',food:'Food and chai',toilet:'Public toilet',pump:'Petrol and diesel',cng:'CNG pump',hospital:'Hospital',police:'Police station',rto:'RTO (licences)',jobs:'Job agent',cars:'Car showroom',bikes:'Two-wheeler dealer',clothes:'Clothes shop',furniture:'Furniture',mobile:'Mobile shop',guns:'Gun shop',realty:'Homes for sale',mechanic:'Mechanic',station:'Railway station',bus:'Bus stand',lodge:'Lodge to sleep',home:'Home',airport:'Airport',local:'Mumbai local',ferry:'Ferry',safari:'Lion safari',camel:'Camel ride',cricket:'Cricket stadium',mall:'Shopping mall',metro:'Metro station',helipad:'Helipad',activity:'Adventure activity'};
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
  return CFG.billboards.filter(b=>b.advertiser&&String(b.advertiser).trim()&&(()=>{const zs=String(b.zone||'all').split(',').map(x=>x.trim());return zs.includes('all')||zs.includes(zid);})()&&(!b.start||b.start<=iso)&&(!b.end||b.end>=iso)&&!IBCONF.adBlocked(b.category)&&(kid?IBCONF.kidSafe(b.category):IBCONF.ageOK(b.ages,age)));}
function activeBillboards(zid){return collabAds(zid);}
function buildSlots(){SLOTS=[];
  // v4.2: no rooftop boards any more, only roadside ones (up to 6 on each city's roads)
  for(const [id,zd] of zoneData){
    const z=zd.z,x1=z.x0+z.nx*80,z1=z.z0+z.nz*80;let n=0;
    const maxN=z.size==='small'?2:z.size==='mid'?4:6;for(const e of EDGES){if(n>=maxN)break;if(e.kind!=='city'||e.len<60)continue;const mx=(e.ax+e.bx)/2,mz=(e.az+e.bz)/2;if(mx<z.x0-5||mx>x1+5||mz<z.z0-5||mz>z1+5)continue;
      const edge=Math.min(Math.abs(mx-z.x0),Math.abs(mx-x1),Math.abs(mz-z.z0),Math.abs(mz-z1));if(hash(e.id*1.7)>(edge>12?.25:.6))continue;
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
// Green and blue are kept for road signs (welcome and direction boards), so ads never use them as a background.
const AD_SAFE=['#7b2a5e','#c2185b','#e4572e','#ffc93c','#ffffff','#1d1433','#8d5a2b','#5b3fa0','#d9483b','#f6d7a7'];
function adBg(c){const col=new THREE.Color();try{col.set(c||'#ffffff');}catch(e){return '#ffffff';}const h={};col.getHSL(h);const hue=h.h*360;if(h.s>.22&&h.l>.12&&h.l<.82&&hue>=75&&hue<=255)return AD_SAFE[Math.floor(hash(hue*3.7+h.l*11)*AD_SAFE.length)%AD_SAFE.length];return c;}
function adFg(bg,fg){const col=new THREE.Color(bg);const L=.2126*col.r+.7152*col.g+.0722*col.b;const f=new THREE.Color(fg||'#ffffff');const Lf=.2126*f.r+.7152*f.g+.0722*f.b;return Math.abs(L-Lf)<.35?(L>.5?'#1d1433':'#ffffff'):fg;}
const postMat=LMat('#3b3a40'),frameMat=LMat('#202226');
function buildBoard(slot,n){const ad=slot.ad||(slot.ad=chooseAd(slot,n));if(!ad.safe){ad.safe=1;const nb=adBg(ad.bg);if(nb!==ad.bg){ad.bg=nb;ad.fg=adFg(nb,ad.fg);}}const g=new THREE.Group();g.position.set(slot.x,slot.y,slot.z);g.rotation.y=slot.rot;
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
function placeLane(v){lanePos(v.lane,_lp);v.pos.set(_lp.x,v.lane.e.fly?flyY(v.lane.e,v.lane.s):0,_lp.z);v.h=_lp.h;v.m.rotation.y=v.h;}
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
const fireHooks=[];function fire(){for(const f of fireHooks){try{if(f())return;}catch(e){}}if(player.mode!=='foot'||inside||player.fireCd>0||uiLock()||player.knock>0)return;const Wp=WEAP[P.weapon];
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
