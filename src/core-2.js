
/* ================= places you can use ================= */
const PCOL={bank:'#3ddc97',food:'#ff9f1c',toilet:'#5fb4ff',pump:'#2fc4b2',cng:'#7fd858',hospital:'#ff6b6b',police:'#5f8bff',rto:'#c9a227',jobs:'#ffb347',cars:'#c38bff',bikes:'#ff8fd0',clothes:'#ff6fa8',furniture:'#d8a46a',mobile:'#6fc3ff',guns:'#ff5d73',realty:'#ffc93c',mechanic:'#9aa5b1',station:'#e07b39',bus:'#e85d5d',lodge:'#b38bff',home:'#ffe08a',airport:'#7ad0ff',local:'#ff9a3c',ferry:'#4fb3ff',safari:'#9bd36a',camel:'#e3b26a'};
const PICON={bank:'🏦',food:'🍛',toilet:'🚻',pump:'⛽',cng:'🟢',hospital:'🏥',police:'🚓',rto:'🪪',jobs:'💼',cars:'🚗',bikes:'🏍',clothes:'👕',furniture:'🛋',mobile:'📱',guns:'🎯',realty:'🏘',mechanic:'🔧',station:'🚆',bus:'🚌',lodge:'🛏',home:'🏡',airport:'✈',local:'🚉',ferry:'⛴',safari:'🦁',camel:'🐪'};
const PLABEL={bank:'Bank and ATM',food:'Food and chai',toilet:'Public toilet',pump:'Petrol and diesel',cng:'CNG pump',hospital:'Hospital',police:'Police station',rto:'RTO (licences)',jobs:'Job agent',cars:'Car showroom',bikes:'Two-wheeler dealer',clothes:'Clothes shop',furniture:'Furniture',mobile:'Mobile shop',guns:'Gun shop',realty:'Homes for sale',mechanic:'Mechanic',station:'Railway station',bus:'Bus stand',lodge:'Lodge to sleep',home:'Home',airport:'Airport',local:'Mumbai local',ferry:'Ferry',safari:'Lion safari',camel:'Camel ride'};
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
    if(s.type==='food'&&!name){const nm=FOODNAME[z.food]||FOODNAME.MH;name=nm[foodN%3];extra=foodN===2?'HW':z.food;foodN++;}
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
const billboardMeshes=[];
function playerAge(){return IBCONF.ageFromDob(P&&P.dob);}
function activeBillboards(zid){const iso=istISO(),age=playerAge();return CFG.billboards.filter(b=>(b.zone==='all'||b.zone===zid)&&(!b.start||b.start<=iso)&&(!b.end||b.end>=iso)&&IBCONF.ageOK(b.ages,age));}
function refreshBillboards(){for(const m of billboardMeshes){scene.remove(m);m.material.map.dispose();m.material.dispose();}billboardMeshes.length=0;zoneBB.clear();}
const zoneBB=new Map();
function updBillboards(px,pz){for(const [id,zd] of zoneData){const z=zd.z;const cx=z.x0+z.nx*40,cz=z.z0+z.nz*40;const near=Math.hypot(cx-px,cz-pz)<900;const has=zoneBB.has(id);
  if(near&&!has){const list=activeBillboards(id);const arr=[];if(list.length){const roofs=zd.tallRoofs.slice(0,Math.min(6,zd.tallRoofs.length));roofs.forEach(([x,h,zz],i)=>{const b=list[i%list.length];const m=new THREE.Mesh(new THREE.PlaneGeometry(14,7),new THREE.MeshBasicMaterial({map:signTex(b.text,b.fg,b.bg,256,128),side:THREE.DoubleSide}));m.position.set(x,h+5.5,zz);m.rotation.y=(i%2)?Math.PI/2:0;scene.add(m);arr.push(m);billboardMeshes.push(m);});}zoneBB.set(id,arr);}
  else if(!near&&has&&Math.hypot(cx-px,cz-pz)>1300){for(const m of zoneBB.get(id)){scene.remove(m);m.material.map.dispose();m.material.dispose();billboardMeshes.splice(billboardMeshes.indexOf(m),1);}zoneBB.delete(id);}}}

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
function buildVeh(type,colorMat){const g=new THREE.Group();let w;g.userData={};
  if(type==='cycle'){const f=colorMat||mpick([VM.red,VM.blue,VM.black,VM.green]);part(G.box,f,.06,.06,1.1,0,.75,0,g);part(G.box,f,.06,.6,.06,0,.6,-.15,g);part(G.box,f,.06,.55,.06,0,.65,.45,g);part(G.box,VM.black,.55,.05,.05,0,1.05,.5,g);part(G.box,VM.seat,.18,.06,.28,0,.98,-.18,g);
    w=wheels(g,[[0,.33,.62],[0,.33,-.62]],1,G.thin);}
  else if(type==='rickshaw'){part(G.box,VM.black,.08,.08,1.4,0,.8,.7,g);part(G.box,VM.seat,.2,.06,.3,0,1.02,.85,g);part(G.box,mpick([VM.blue,VM.green,VM.maroon]),1.3,.5,.8,0,.85,-.55,g);part(G.box,VM.seat,1.2,.15,.6,0,1.15,-.55,g);
    const hood=new THREE.Mesh(new THREE.SphereGeometry(.75,10,6,0,Math.PI,0,Math.PI/2),LMat('#2a2a2a'));hood.rotation.y=Math.PI/2;hood.scale.set(1,1.2,.9);hood.position.set(0,1.3,-.75);hood.castShadow=true;g.add(hood);
    w=wheels(g,[[0,.33,1.35],[-.68,.33,-.55],[.68,.33,-.55]],1,G.thin);}
  else if(type==='bike'||type==='sportsbike'){const sp=type==='sportsbike';const b=colorMat||(sp?mpick([VM.red,VM.blue,VM.yellow,VM.green]):mpick([VM.black,VM.red,VM.maroon,VM.blue]));
    part(G.box,b,.34,.36,1.15,0,.72,0,g);part(G.box,b,.38,.26,.55,0,.98,.25,g);part(G.box,VM.seat,.3,.1,.6,0,.98,-.32,g);part(G.box,VM.chrome,.06,.06,.5,.16,.45,-.55,g);part(G.box,VM.black,.7,.05,.05,0,1.15,.66,g);part(G.sph,VM.light,.12,.12,.08,0,1.02,.82,g);part(G.box,VM.tail,.18,.06,.04,0,.85,-.86,g);
    if(sp){const fr=part(G.box,b,.42,.42,.5,0,1.05,.62,g);fr.rotation.x=-.5;}w=wheels(g,[[0,.36,.72],[0,.36,-.7]],sp?1.05:1);}
  else if(type==='auto'){const body=colorMat||(Math.random()<.7?VM.green:mpick([VM.black,VM.blue]));
    part(G.box,body,1.6,.45,3,0,.6,0,g);part(G.box,body,1.45,.95,.8,0,1.25,1.15,g);part(G.box,VM.yellow,1.75,.16,2.7,0,2.3,-.05,g);part(G.box,VM.yellow,1.75,1.45,.14,0,1.6,-1.35,g);
    for(const [x,z] of [[-.82,1.1],[.82,1.1],[-.82,-1.3],[.82,-1.3]])part(G.box,VM.black,.08,1.5,.08,x,1.55,z,g);
    part(G.box,VM.glass,1.3,.75,.05,0,1.95,1.5,g);part(G.box,VM.seat,1.4,.5,.7,0,1.1,-.75,g);part(G.sph,VM.light,.16,.16,.1,0,1.2,1.57,g);part(G.box,VM.tail,.25,.12,.05,-.6,.75,-1.52,g);part(G.box,VM.tail,.25,.12,.05,.6,.75,-1.52,g);
    const d=new THREE.Group();part(G.sph,VM.skin,.24,.28,.24,0,1.95,.45,d);part(G.sph,VM.hair,.25,.15,.25,0,2.1,.43,d);part(G.box,VM.white,.6,.6,.35,0,1.45,.45,d);g.add(d);g.userData.driver=d;
    const pax=new THREE.Group();part(G.box,VM.red,.55,.55,.35,0,1.45,-.75,pax);part(G.sph,VM.skin,.23,.27,.23,0,1.95,-.75,pax);pax.visible=false;g.add(pax);g.userData.pax=pax;
    w=wheels(g,[[0,.36,1.2],[-.82,.36,-.9],[.82,.36,-.9]]);}
  else if(['taxi','car','suv','police','sports','sedan'].includes(type)){let b,top,bw=1.85,bh=.7,by=.75,ch=.65,cl=2.2,cw=1.65;
    if(type==='taxi'){b=VM.black;top=VM.yellow;}else if(type==='police'){b=VM.white;top=VM.white;bw=2;bh=.95;by=.95;ch=.8;cl=2.8;cw=1.9;}
    else if(type==='suv'){b=colorMat||mpick([VM.black,VM.silver,VM.white,VM.red]);top=b;bw=2;bh=.95;by=.95;ch=.8;cl=2.8;cw=1.9;}
    else if(type==='sports'){b=colorMat||mpick([VM.red,VM.yellow,VM.orange]);top=b;bh=.55;by=.6;ch=.45;cl=1.8;cw=1.6;}
    else if(type==='sedan'){b=colorMat||mpick([VM.white,VM.silver,VM.maroon,VM.black,VM.teal]);top=b;cl=2.3;}
    else{b=colorMat||mpick([VM.white,VM.silver,VM.red,VM.blue]);top=b;}
    const L=SPEC[type].len-.1;part(G.box,b,bw,bh,L,0,by,0,g);part(G.box,top,cw,ch,cl,0,by+bh/2+ch/2,type==='sedan'?-.1:-.2,g);part(G.box,VM.glass,cw-.15,ch*.75,.05,0,by+bh/2+ch/2,cl/2-.15,g);
    if(type==='taxi')part(G.box,VM.yellow,.7,.25,.35,0,by+bh/2+ch+.12,-.1,g);if(type==='sports')part(G.box,b,1.8,.08,.5,0,by+bh/2+.35,-L/2+.2,g);
    if(type==='police'){part(G.box,VM.blue,2.02,.2,L+.02,0,by,0,g);const r=part(G.box,VM.sirR,.6,.2,.35,-.35,by+bh/2+ch+.1,-.2,g),bl=part(G.box,VM.sirB,.6,.2,.35,.35,by+bh/2+ch+.1,-.2,g);g.userData.lights=[r,bl];
      const p=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.4),new THREE.MeshBasicMaterial({map:policeTex}));p.position.set(1.01,by+.1,0);p.rotation.y=Math.PI/2;g.add(p);const p2=p.clone();p2.position.x=-1.01;p2.rotation.y=-Math.PI/2;g.add(p2);}
    part(G.box,VM.light,.35,.18,.05,-.62,by+.1,L/2+.01,g);part(G.box,VM.light,.35,.18,.05,.62,by+.1,L/2+.01,g);part(G.box,VM.tail,.35,.15,.05,-.62,by+.1,-L/2-.01,g);part(G.box,VM.tail,.35,.15,.05,.62,by+.1,-L/2-.01,g);
    const wz=L/2-.8,wx2=bw/2-.05;w=wheels(g,[[-wx2,.36,wz],[wx2,.36,wz],[-wx2,.36,-wz],[wx2,.36,-wz]],type==='suv'||type==='police'?1.15:1);}
  else if(type==='bus'){const dd=Math.random()<.5,h=dd?4.4:2.9;part(G.box,VM.red,2.55,h,10.4,0,.55+h/2,0,g);part(G.box,VM.glass,2.6,.8,9.6,0,.55+h-0.9,0,g);if(dd)part(G.box,VM.glass,2.6,.8,9.6,0,.55+h/2-0.6,0,g);
    part(G.box,VM.white,2.6,.35,10.45,0,1.2,0,g);part(G.box,VM.light,.4,.2,.05,-.9,1.1,5.21,g);part(G.box,VM.light,.4,.2,.05,.9,1.1,5.21,g);w=wheels(g,[[-1.2,.45,3.6],[1.2,.45,3.6],[-1.2,.45,-3.6],[1.2,.45,-3.6]],1.25);}
  else{part(G.box,VM.orange,2.3,2.1,2,0,1.6,2.7,g);part(G.box,VM.glass,2,.8,.05,0,2.1,3.71,g);part(G.box,mpick([VM.blue,VM.yellow,VM.green]),2.4,2.6,5.4,0,1.9,-.9,g);
    const back=new THREE.Mesh(new THREE.PlaneGeometry(2.3,2.4),new THREE.MeshLambertMaterial({map:hornTex}));back.position.set(0,1.9,-3.61);back.rotation.y=Math.PI;g.add(back);w=wheels(g,[[-1.1,.45,2.6],[1.1,.45,2.6],[-1.1,.45,-2.4],[1.1,.45,-2.4]],1.25);}
  g.userData.wheels=w;bakeVeh(g);return g;}
function bakeVeh(g){const keep=new Set(g.userData.wheels||[]);if(g.userData.lights)g.userData.lights.forEach(m=>keep.add(m));const by=new Map();
  for(const c of g.children.slice()){if(!c.isMesh||keep.has(c)||c.material.transparent||c.material.map)continue;c.updateMatrix();const geo=c.geometry.clone();geo.applyMatrix4(c.matrix);if(!geo.index){}const k=c.material.uuid;if(!by.has(k))by.set(k,{mat:c.material,geos:[]});by.get(k).geos.push(geo);g.remove(c);}
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
function addRider(v){const r=new THREE.Group();part(G.box,mpick(riderMat),.5,.6,.3,0,1.35,-.15,r);part(G.sph,VM.skin,.2,.24,.2,0,1.85,-.12,r);if(v.type!=='cycle')part(G.sph,mpick([VM.black,VM.red,VM.white]),.25,.25,.27,0,1.9,-.12,r);v.m.add(r);v.m.userData.driver=r;}

/* ================= player ================= */
function buildPerson(shirt){const g=new THREE.Group();const legM=LMat('#2d3142');
  const body=part(G.box,shirt,.62,.72,.36,0,1.15,0,g);const head=part(G.sph,VM.skin,.22,.26,.22,0,1.72,0,g);const hair=part(G.sph,VM.hair,.23,.13,.23,0,1.84,-.02,g);
  const legs=[-.16,.16].map(x=>{const p=new THREE.Group();p.position.set(x,.8,0);part(G.box,legM,.22,.8,.24,0,-.4,0,p);g.add(p);return p;});
  const arms=[-.42,.42].map(x=>{const p=new THREE.Group();p.position.set(x,1.45,0);part(G.box,shirt,.17,.66,.18,0,-.32,0,p);g.add(p);return p;});
  g.userData={legs,arms,body,head,hair,legM};return g;}
const avatar=buildPerson(LMat('#e8573e'));scene.add(avatar);avatar.visible=false;
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
  outfit:{top:'shirt',topCol:'#e8573e',botCol:'#2d3142',shoes:'chappal',glasses:false,cap:false},wardrobe:['shirt'],furniture:{},phone:'basic',challans:[],
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
function spawnOwned(i,x,z,h){if(ownedVeh[i])removeVeh(ownedVeh[i]);const c=P.cars[i];const v=makeVeh(c.type,x,z,h,'parked',{fuel:c.fuel,hp:c.hp});v.owned=true;v.ownedIdx=i;ownedVeh[i]=v;return v;}
function roadSpotNear(p){const r=nearestRoadPoint(p.x,p.z,300);if(!r)return[p.x,p.z,0];const e=r.e;const nx=e.dz,nz=-e.dx;const o=e.w/2+1.4;return[r.x+nx*o,r.z+nz*o,Math.atan2(e.dx,e.dz)];}

/* ================= pedestrians, cows, wildlife ================= */
const peds=[];const pedCols=['#d9483b','#e8a628','#2f7fc1','#9b4fb5','#3aa66b','#ff6fa8','#f4f1ea','#1f8a8a','#c96a2a'].map(c=>LMat(c));
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
function updWeap(){const Wp=WEAP[P.weapon]||WEAP.fist;$('#weap').textContent=Wp.ammo?`${Wp.name} · ${P.ammo[Wp.ammo]}`:Wp.name;for(const k in gunMeshes)gunMeshes[k].visible=k===P.weapon;}
