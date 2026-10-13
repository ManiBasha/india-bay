// Game settings shared by the game and the /admin page.
// The admin page saves changes for every player; these are the starting values.
(function () {
const REGIONS=[
  {id:'west',name:'West',states:'Maharashtra, Gujarat, Rajasthan, Dadra & Nagar Haveli and Daman & Diu',map:true},
  {id:'north',name:'North',states:'Delhi, Punjab, Haryana, Chandigarh, Himachal Pradesh, Uttarakhand, J&K, Ladakh'},
  {id:'central',name:'Central',states:'Uttar Pradesh, Madhya Pradesh, Chhattisgarh'},
  {id:'east',name:'East',states:'West Bengal, Bihar, Jharkhand, Odisha'},
  {id:'northeast',name:'Northeast',states:'Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Sikkim'},
  {id:'southwest',name:'South-West',states:'Karnataka, Kerala, Goa',map:true},
  {id:'southeast',name:'South-East',states:'Tamil Nadu, Andhra Pradesh, Telangana, Puducherry, Andaman & Nicobar'}];
const FEST_DEFAULT=[
  {name:'Navratri',type:'navratri',where:'GJ,MH,RJ,DD,DN',start:'2026-10-11',end:'2026-10-20',mult:1.2},
  {name:'Diwali',type:'diwali',where:'all',start:'2026-11-06',end:'2026-11-10',mult:1.5,gift:1000},
  {name:'Uttarayan',type:'uttarayan',where:'GJ',start:'2027-01-14',end:'2027-01-15',mult:1.2},
  {name:'Holi',type:'holi',where:'all',start:'2027-03-21',end:'2027-03-22',mult:1.3},
  {name:'Ganpati',type:'ganpati',where:'MH',start:'2027-09-04',end:'2027-09-14',mult:1.3},
  // Beta v1.01.04, from the state plans (v:2 = added in this update). Lunar-calendar dates are approximate: check them in Admin → Festivals.
  {v:2,name:'Makar Sankranti kites',type:'uttarayan',where:'RJ',start:'2027-01-14',end:'2027-01-14',mult:1.1},
  {v:2,name:'Shiv Jayanti',type:'jayanti',where:'MH',start:'2027-02-19',end:'2027-02-19',mult:1.1},
  {v:2,name:'Rajasthan Day',type:'stateday',where:'RJ',start:'2027-03-30',end:'2027-03-30',mult:1},
  {v:2,name:'Gudi Padwa',type:'gudi',where:'MH',start:'2027-04-07',end:'2027-04-07',mult:1.1,gift:200},
  {v:2,name:'Gangaur',type:'gangaur',where:'RJ',start:'2027-04-09',end:'2027-04-10',mult:1.1},
  {v:2,name:'Maharashtra Day',type:'stateday',where:'MH',start:'2027-05-01',end:'2027-05-01',mult:1},
  {v:2,name:'Gujarat Day',type:'stateday',where:'GJ',start:'2027-05-01',end:'2027-05-01',mult:1},
  {v:2,name:'Teej',type:'teej',where:'RJ',start:'2027-08-05',end:'2027-08-06',mult:1.1},
  {v:2,name:'Narali Purnima',type:'other',where:'MH',start:'2027-08-17',end:'2027-08-17',mult:1},
  {v:2,name:'Navroz (Parsi New Year)',type:'other',where:'GJ,MH',start:'2027-08-16',end:'2027-08-16',mult:1},
  {v:2,name:'Dahi Handi',type:'dahihandi',where:'MH,GJ',start:'2027-08-25',end:'2027-08-26',mult:1.2},
  {v:2,name:'Pola',type:'pola',where:'MH',start:'2027-08-31',end:'2027-08-31',mult:1}];
const EVENT_DEFAULT=[{name:'Rann Utsav',zone:'bhuj',start:'2026-11-01',end:'2027-02-28',mult:1.2,kind:'fair'},{name:'Juhu beach party',zone:'mumbai',start:'2026-10-10',end:'2026-10-18',mult:1.5},
  {v:2,name:'Marwar Festival',zone:'jodhpur',start:'2026-10-25',end:'2026-10-26',kind:'stage',mult:1.2},{v:2,name:'Kota Dussehra Fair',zone:'kota',start:'2026-10-20',end:'2026-11-08',kind:'fair',mult:1.2},{v:2,name:'Pushkar Camel Fair',zone:'ajmer',start:'2026-11-17',end:'2026-11-24',kind:'fair',mult:1.4},{v:2,name:'Vautha Fair',zone:'ahmedabad',start:'2026-11-23',end:'2026-11-27',kind:'fair',mult:1.1},{v:2,name:'Kumbhalgarh Festival',zone:'udaipur',start:'2026-12-01',end:'2026-12-03',kind:'stage',mult:1.1},{v:2,name:'Ajmer Sharif Urs',zone:'ajmer',start:'2026-12-11',end:'2026-12-17',kind:'urs',mult:1.3},{v:2,name:'Kankaria Carnival',zone:'ahmedabad',start:'2026-12-25',end:'2026-12-31',kind:'fair',mult:1.2},{v:2,name:'Mount Abu Winter Festival',zone:'mountabu',start:'2026-12-29',end:'2026-12-31',kind:'stage',mult:1.2},{v:2,name:'Saptak Music Festival',zone:'ahmedabad',start:'2027-01-01',end:'2027-01-13',kind:'stage',mult:1},{v:2,name:'Bikaner Camel Festival',zone:'bikaner',start:'2027-01-10',end:'2027-01-11',kind:'fair',mult:1.3},{v:2,name:'Mumbai Marathon',zone:'mumbai',start:'2027-01-17',end:'2027-01-17',kind:'marathon',mult:1.1},{v:2,name:'Jaipur Literature Festival',zone:'jaipur',start:'2027-01-21',end:'2027-01-25',kind:'arts',mult:1.2},{v:2,name:'Modhera Dance Festival',zone:'modhera',start:'2027-01-21',end:'2027-01-23',kind:'stage',mult:1.1},{v:2,name:'Kala Ghoda Arts Festival',zone:'mumbai',start:'2027-01-30',end:'2027-02-07',kind:'arts',mult:1.1},{v:2,name:'Baneshwar Fair',zone:'banswara',start:'2027-02-17',end:'2027-02-21',kind:'fair',mult:1.2},{v:2,name:'Jaisalmer Desert Festival',zone:'jaisalmer',start:'2027-02-18',end:'2027-02-20',kind:'fair',mult:1.4},{v:2,name:'Bhavnath Mahashivratri Fair',zone:'junagadh',start:'2027-03-02',end:'2027-03-06',kind:'fair',mult:1.2},{v:2,name:'Dang Darbar',zone:'saputara',start:'2027-03-15',end:'2027-03-18',kind:'fair',mult:1.1},{v:2,name:'Pandharpur Wari (palkhi from Pune)',zone:'pune',start:'2027-06-27',end:'2027-07-04',kind:'wari',mult:1.1},{v:2,name:'Pandharpur Wari (Ashadhi Ekadashi)',zone:'pandharpur',start:'2027-07-05',end:'2027-07-17',kind:'wari',mult:1.3},{v:2,name:'Ahmedabad Rath Yatra',zone:'ahmedabad',start:'2027-07-05',end:'2027-07-05',kind:'rath',mult:1.3},{v:2,name:'Nashik Kumbh Mela (Simhastha)',zone:'nashik',start:'2027-07-29',end:'2027-09-24',kind:'fair',mult:1.4},{v:2,name:'Tarnetar Fair',zone:'rajkot',start:'2027-09-04',end:'2027-09-06',kind:'fair',mult:1.2},{v:2,name:'Mount Mary Fair, Bandra',zone:'mumbai',start:'2027-09-12',end:'2027-09-19',kind:'fair',mult:1.1},{v:2,name:'Ambaji Bhadarvi Poonam',zone:'ambaji',start:'2027-09-12',end:'2027-09-15',kind:'wari',mult:1.2}];
const BILL_DEFAULT=[];   // collaborator ads are added in /admin; with none running, the game shows its own ads
const DEFAULTS={defV:2,name:'India Bay',tagline:'Open-world India: drive from Rajasthan to Kerala',announce:'',theme:'kesar',accent:'#ffc93c',
  timeSpeed:1,timeOffset:0,challansOn:false,voiceChat:true,baygramOn:true,referBonus:10000,weather:'auto',traffic:30,peds:40,police:'normal',weapons:true,needs:true,
  foodHrs:30,wcHrs:24,awakeHrs:16,
  act:{sleep:480,meal:30,snack:10,drink:5,cook:30,tv:60,toilet:5},
  queue:{petrol:20,cng:40,atm:15,toilet:5,ticket:20,hospital:30,checkin:30},
  travel:{sleeper:[400,360],ac:[1200,300],flight:[4500,120],bus:[250,420],bottaxi:[2500,240],ferry:[300,90],local:[10,40],metro:[30,40],bullet:[3000,90]},
  fuel:{petrol:100,diesel:90,cng:80},challan:{licence:5000,helmet:1000,puc:10000,insurance:2000,speeding:2000,queue:500,signal:1000},toll:150,
  priceMul:1,fareMul:1,startCash:500,prices:{},gifts:[{name:'Christmas gift',message:'Merry Christmas from India Bay!',start:'2026-12-25',end:'2026-12-25',gift:500},{name:'New Year gift',message:'Happy New Year from India Bay!',start:'2027-01-01',end:'2027-01-01',gift:500},{name:'Republic Day gift',message:'Happy Republic Day!',start:'2027-01-26',end:'2027-01-26',gift:260}],regions:{west:true,southwest:true},festivals:FEST_DEFAULT,events:EVENT_DEFAULT,billboards:BILL_DEFAULT,changelog:[]};
const THEMES={kesar:{label:'Sunset kesar',accent:'#ffc93c',panel:'rgba(20,15,38,.66)',edge:'rgba(255,214,150,.22)',sheet:'#211a3a',sheet2:'#2c2350'},neon:{label:'Bollywood neon',accent:'#ff4fa3',panel:'rgba(14,6,32,.72)',edge:'rgba(255,79,163,.38)',sheet:'#1c0f33',sheet2:'#2b1648'},monsoon:{label:'Monsoon teal',accent:'#3fd0c9',panel:'rgba(8,26,32,.7)',edge:'rgba(63,208,201,.32)',sheet:'#0f2a30',sheet2:'#173b42'},chalk:{label:'Chalk and ink',accent:'#f4f1ea',panel:'rgba(16,16,20,.74)',edge:'rgba(244,241,234,.26)',sheet:'#1b1b20',sheet2:'#2a2a31'}};
function mergeCfg(base,over){const o=Object.assign({},base,over||{});for(const k of ['act','queue','travel','fuel','challan','regions','prices'])o[k]=Object.assign({},base[k],(over&&over[k])||{});for(const k of ['festivals','events','billboards','changelog','gifts'])o[k]=Array.isArray(over&&over[k])?over[k]:base[k];
  // festivals and events added to the defaults in a later update join a saved list once (the admin can still delete them)
  const seen=+((over&&over.defV)||0);if(over&&seen<(base.defV||0))for(const k of ['festivals','events'])if(Array.isArray(over[k])){const names=new Set(over[k].map(f=>f.name));o[k]=over[k].concat((base[k]||[]).filter(f=>(f.v||0)>seen&&!names.has(f.name)));}
  o.defV=Math.max(seen,base.defV||0);return o;}
// Ad categories (spec: billboard ads). kids:true = shown to players under 18 and guests without a date of birth.
const AD_CATS=[['food','Food and food delivery',1],['education','Education and coaching',1],['sports','Sports gear, cricket',1],['games','Games (no real money)',1],['public','Public service (road safety, health)',1],
  ['tech','Mobiles and tech',0],['fashion','Fashion',0],['twowheel','Two-wheelers',0],['streaming','Streaming and entertainment',0],['travel','Travel and hotels',0],['jobs','Jobs and careers',0],['cars','Cars',0],['home','Home and appliances',0],['banking','Banking and insurance',0]];
const AD_BLOCKED=['real-money gaming','betting','alcohol','tobacco','loans','crypto','dating'];
const kidSafe=c=>!!(AD_CATS.find(x=>x[0]===c)||[])[2];
const adBlocked=c=>!!c&&!AD_CATS.some(x=>x[0]===c);
const adLabel=c=>(AD_CATS.find(x=>x[0]===c)||[0,'Ad'])[1];
const AGE_GROUPS=['all','under 18','18-24','25-34','35-49','50+'];
function ageOK(group,age){if(!group||group==='all')return true;if(age==null)return false;
  if(group==='under 18')return age<18;if(group==='50+')return age>=50;const m=/^(\d+)-(\d+)$/.exec(group);return m?age>=+m[1]&&age<=+m[2]:true;}
function ageFromDob(dob){if(!dob)return null;const d=new Date(dob+'T00:00:00');if(isNaN(d))return null;const n=new Date();let a=n.getFullYear()-d.getFullYear();if(n.getMonth()<d.getMonth()||(n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()))a--;return a;}
const STATE_OPTS=[['all','All states'],['MH','Maharashtra'],['GJ','Gujarat'],['RJ','Rajasthan'],['DD','Daman & Diu'],['DN','Dadra & Nagar Haveli'],['GA','Goa'],['KA','Karnataka'],['KL','Kerala']];
// zones: list of zone ids, or [id, name] pairs (the admin page passes names so it can show them)
function lists(zonesIn){const zones=zonesIn.map(z=>Array.isArray(z)?z[0]:z),zoneOpts=[['all','All cities']].concat(zonesIn.map(z=>Array.isArray(z)?z:[z,z]));return{festivals:[['name','Name','text'],['type','Type',['navratri','diwali','uttarayan','holi','ganpati','durga','onam','christmas','eid','pongal','gudi','gangaur','teej','dahihandi','pola','jayanti','stateday','other']],['where','States','multi',STATE_OPTS],['start','Start','date'],['end','End','date'],['mult','Fare ×','number'],['gift','Gift to every player (₹)','number',{min:0,max:100000,step:50}]],
  events:[['name','Name','text'],['zone','City',zones],['kind','Kind',['','fair','stage','arts','wari','rath','urs','marathon']],['start','Start','date'],['end','End','date'],['mult','Fare ×','number']],
  billboards:[['advertiser','Advertiser (brand)','text'],['text','Ad text (use | for a second line)','text'],['category','Category',AD_CATS.map(c=>c[0])],['link','Click link (https://…)','text'],['fg','Text colour','color'],['bg','Background (not green or blue: those are road-sign colours and get swapped)','color'],['zone','Cities','multi',zoneOpts],['ages','Show to ages (adults)',AGE_GROUPS],['start','From','date'],['end','To','date']],
  gifts:[['name','Name (shown to players)','text'],['message','Message','text'],['start','From','date'],['end','To','date'],['gift','Gift to every player (₹)','number',{min:0,max:1000000,step:50}]],
  changelog:[['v','Version','text'],['date','Date','date'],['notes','Notes','text']]};}
window.IBCONF={STATE_OPTS,AD_CATS,AD_BLOCKED,kidSafe,adBlocked,adLabel,REGIONS,FEST_DEFAULT,EVENT_DEFAULT,BILL_DEFAULT,DEFAULTS,THEMES,mergeCfg,AGE_GROUPS,ageOK,ageFromDob,lists};
})();
