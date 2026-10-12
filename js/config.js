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
  {name:'Ganpati',type:'ganpati',where:'MH',start:'2027-09-04',end:'2027-09-14',mult:1.3}];
const EVENT_DEFAULT=[{name:'Rann Utsav',zone:'bhuj',start:'2026-11-01',end:'2027-02-28',mult:1.2},{name:'Juhu beach party',zone:'mumbai',start:'2026-10-10',end:'2026-10-18',mult:1.5}];
const BILL_DEFAULT=[];   // collaborator ads are added in /admin; with none running, the game shows its own ads
const DEFAULTS={name:'India Bay',tagline:'Open-world India: drive from Rajasthan to Kerala',announce:'',theme:'kesar',accent:'#ffc93c',
  timeSpeed:1,timeOffset:0,weather:'auto',traffic:30,peds:40,police:'normal',weapons:true,needs:true,
  foodHrs:30,wcHrs:24,awakeHrs:16,
  act:{sleep:480,meal:30,snack:10,drink:5,cook:30,tv:60,toilet:5},
  queue:{petrol:20,cng:40,atm:15,toilet:5,ticket:20,hospital:30,checkin:30},
  travel:{sleeper:[400,360],ac:[1200,300],flight:[4500,120],bus:[250,420],bottaxi:[2500,240],ferry:[300,90],local:[10,40]},
  fuel:{petrol:100,diesel:90,cng:80},challan:{licence:5000,helmet:1000,puc:10000,insurance:2000,speeding:2000,queue:500,signal:1000},toll:150,
  priceMul:1,fareMul:1,startCash:500,prices:{},gifts:[{name:'Christmas gift',message:'Merry Christmas from India Bay!',start:'2026-12-25',end:'2026-12-25',gift:500},{name:'New Year gift',message:'Happy New Year from India Bay!',start:'2027-01-01',end:'2027-01-01',gift:500},{name:'Republic Day gift',message:'Happy Republic Day!',start:'2027-01-26',end:'2027-01-26',gift:260}],regions:{west:true,southwest:true},festivals:FEST_DEFAULT,events:EVENT_DEFAULT,billboards:BILL_DEFAULT,changelog:[]};
const THEMES={kesar:{label:'Sunset kesar',accent:'#ffc93c',panel:'rgba(20,15,38,.66)',edge:'rgba(255,214,150,.22)',sheet:'#211a3a',sheet2:'#2c2350'},neon:{label:'Bollywood neon',accent:'#ff4fa3',panel:'rgba(14,6,32,.72)',edge:'rgba(255,79,163,.38)',sheet:'#1c0f33',sheet2:'#2b1648'},monsoon:{label:'Monsoon teal',accent:'#3fd0c9',panel:'rgba(8,26,32,.7)',edge:'rgba(63,208,201,.32)',sheet:'#0f2a30',sheet2:'#173b42'},chalk:{label:'Chalk and ink',accent:'#f4f1ea',panel:'rgba(16,16,20,.74)',edge:'rgba(244,241,234,.26)',sheet:'#1b1b20',sheet2:'#2a2a31'}};
function mergeCfg(base,over){const o=Object.assign({},base,over||{});for(const k of ['act','queue','travel','fuel','challan','regions','prices'])o[k]=Object.assign({},base[k],(over&&over[k])||{});for(const k of ['festivals','events','billboards','changelog','gifts'])o[k]=Array.isArray(over&&over[k])?over[k]:base[k];return o;}
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
function lists(zones){return{festivals:[['name','Name','text'],['type','Type',['navratri','diwali','uttarayan','holi','ganpati','durga','onam','christmas','eid','pongal','other']],['where','States (MH,GJ,RJ,DD,DN or all)','text'],['start','Start','date'],['end','End','date'],['mult','Fare ×','number'],['gift','Gift to every player (₹)','number',{min:0,max:100000,step:50}]],
  events:[['name','Name','text'],['zone','City',zones],['start','Start','date'],['end','End','date'],['mult','Fare ×','number']],
  billboards:[['advertiser','Advertiser (brand)','text'],['text','Ad text (use | for a second line)','text'],['category','Category',AD_CATS.map(c=>c[0])],['link','Click link (https://…)','text'],['fg','Text colour','color'],['bg','Background','color'],['zone','City',['all'].concat(zones)],['ages','Show to ages (adults)',AGE_GROUPS],['start','From','date'],['end','To','date']],
  gifts:[['name','Name (shown to players)','text'],['message','Message','text'],['start','From','date'],['end','To','date'],['gift','Gift to every player (₹)','number',{min:0,max:1000000,step:50}]],
  changelog:[['v','Version','text'],['date','Date','date'],['notes','Notes','text']]};}
window.IBCONF={AD_CATS,AD_BLOCKED,kidSafe,adBlocked,adLabel,REGIONS,FEST_DEFAULT,EVENT_DEFAULT,BILL_DEFAULT,DEFAULTS,THEMES,mergeCfg,AGE_GROUPS,ageOK,ageFromDob,lists};
})();
