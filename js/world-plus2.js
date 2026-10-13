// Beta v1.01.04 map pass, part 2 of the Maharashtra, Gujarat and Rajasthan plans (loaded after world-plus.js):
// 45 more cities and towns with their link roads, the Delhi–Mumbai, Amritsar–Jamnagar and Ahmedabad–Dholera
// expressways (with flyovers where they cross other roads), Atal Setu, the Mumbai Coastal Road, Sudarshan Setu,
// and the route of the Mumbai–Ahmedabad bullet train (built in features/bullet.js).
// The city spots and link roads were laid out by a checker that keeps every town on land, away from other towns,
// airports and landmarks, and every new road free of crossings with the old ones.
(function () {
  const W = window.WORLD;
  if (!W || W.plus104) return;
  W.plus104 = true;
  const add = (k, list) => { W[k] = (W[k] || []).concat(list); };
  // a road that ends on another road joins it at a new vertex there (a real T junction)
  function splitAt(name, pt) { let best = null; for (const h of W.highways) { if (h.name !== name) continue; for (let i = 0; i < h.pts.length - 1; i++) { const a = h.pts[i], b = h.pts[i + 1]; const dx = b[0] - a[0], dz = b[1] - a[1]; const t = ((pt[0] - a[0]) * dx + (pt[1] - a[1]) * dz) / (dx * dx + dz * dz); if (t <= 0 || t >= 1) continue; const d = Math.hypot(a[0] + dx * t - pt[0], a[1] + dz * t - pt[1]); if (d < 2 && (!best || d < best.d)) best = { h, i, d }; } } if (best) best.h.pts.splice(best.i + 1, 0, pt); }

  add('zones', [
    { id: 'thane', name: 'Thane', st: 'MH', x0: 3160, z0: 8070, nx: 3, nz: 2, style: 'metro', size: 'mid', food: 'MH', specials: {} },
    { id: 'navimumbai', name: 'Navi Mumbai', st: 'MH', x0: 3310, z0: 8630, nx: 2, nz: 2, style: 'mid', size: 'mid', food: 'MH', specials: {} },
    { id: 'kalyan', name: 'Kalyan–Dombivli', st: 'MH', x0: 3450, z0: 8330, nx: 2, nz: 2, style: 'mid', size: 'mid', food: 'MH', specials: {}, station: true },
    { id: 'vasai', name: 'Vasai–Virar', st: 'MH', x0: 2750, z0: 7810, nx: 2, nz: 1, style: 'mid', size: 'mid', food: 'MH', specials: {} },
    { id: 'matheran', name: 'Matheran', st: 'MH', x0: 3520, z0: 8870, nx: 1, nz: 1, style: 'hill', size: 'small', food: 'MH', specials: {} },
    { id: 'ahilyanagar', name: 'Ahilyanagar', st: 'MH', x0: 5380, z0: 8570, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'MH', specials: {} },
    { id: 'jalgaon', name: 'Jalgaon', st: 'MH', x0: 6130, z0: 6720, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'MH', specials: {} },
    { id: 'dhule', name: 'Dhule', st: 'MH', x0: 5380, z0: 6870, nx: 2, nz: 2, style: 'town', size: 'small', food: 'MH', specials: {} },
    { id: 'akola', name: 'Akola', st: 'MH', x0: 6620, z0: 7580, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'MH', specials: {} },
    { id: 'chikhaldara', name: 'Chikhaldara', st: 'MH', x0: 6810, z0: 7000, nx: 1, nz: 1, style: 'hill', size: 'small', food: 'MH', specials: {} },
    { id: 'chandrapur', name: 'Chandrapur', st: 'MH', x0: 8120, z0: 8600, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'MH', specials: {} },
    { id: 'nanded', name: 'Nanded', st: 'MH', x0: 7040, z0: 8460, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'MH', specials: {'1,0': 'hazurSahib'} },
    { id: 'latur', name: 'Latur', st: 'MH', x0: 6380, z0: 8730, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'MH', specials: {} },
    { id: 'tuljapur', name: 'Tuljapur', st: 'MH', x0: 5890, z0: 9040, nx: 1, nz: 1, style: 'town', size: 'small', food: 'MH', specials: {'0,0': 'bhavani'} },
    { id: 'sangli', name: 'Sangli–Miraj', st: 'MH', x0: 4350, z0: 10600, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'MH', specials: {} },
    { id: 'panchgani', name: 'Panchgani', st: 'MH', x0: 4240, z0: 9850, nx: 1, nz: 1, style: 'hill', size: 'small', food: 'MH', specials: {} },
    { id: 'anand', name: 'Anand', st: 'GJ', x0: 3430, z0: 5360, nx: 2, nz: 2, style: 'gujarat', size: 'mid', food: 'GJ', specials: {} },
    { id: 'nadiad', name: 'Nadiad', st: 'GJ', x0: 3380, z0: 5130, nx: 2, nz: 1, style: 'gujarat', size: 'small', food: 'GJ', specials: {} },
    { id: 'dakor', name: 'Dakor', st: 'GJ', x0: 3650, z0: 5210, nx: 1, nz: 1, style: 'town', size: 'small', food: 'GJ', specials: {'0,0': 'whiteTemple'} },
    { id: 'bharuch', name: 'Bharuch', st: 'GJ', x0: 3180, z0: 5900, nx: 2, nz: 2, style: 'gujarat', size: 'mid', food: 'GJ', specials: {} },
    { id: 'navsari', name: 'Navsari', st: 'GJ', x0: 3080, z0: 7010, nx: 2, nz: 1, style: 'gujarat', size: 'small', food: 'GJ', specials: {} },
    { id: 'valsad', name: 'Valsad', st: 'GJ', x0: 3020, z0: 7200, nx: 2, nz: 1, style: 'gujarat', size: 'small', food: 'GJ', specials: {} },
    { id: 'vapi', name: 'Vapi', st: 'GJ', x0: 2670, z0: 7570, nx: 2, nz: 1, style: 'gujarat', size: 'small', food: 'GJ', specials: {} },
    { id: 'mehsana', name: 'Mehsana', st: 'GJ', x0: 2780, z0: 4130, nx: 2, nz: 2, style: 'gujarat', size: 'mid', food: 'GJ', specials: {} },
    { id: 'modhera', name: 'Modhera', st: 'GJ', x0: 2610, z0: 4230, nx: 1, nz: 1, style: 'town', size: 'small', food: 'GJ', specials: {'0,0': 'modhera'} },
    { id: 'vadnagar', name: 'Vadnagar', st: 'GJ', x0: 3030, z0: 4030, nx: 1, nz: 1, style: 'town', size: 'small', food: 'GJ', specials: {'0,0': 'kirtiToran'} },
    { id: 'palanpur', name: 'Palanpur', st: 'GJ', x0: 2680, z0: 3870, nx: 2, nz: 2, style: 'gujarat', size: 'mid', food: 'GJ', specials: {} },
    { id: 'ambaji', name: 'Ambaji', st: 'GJ', x0: 3080, z0: 3810, nx: 1, nz: 1, style: 'town', size: 'small', food: 'GJ', specials: {'0,0': 'whiteTemple'} },
    { id: 'gandhidham', name: 'Gandhidham–Kandla', st: 'GJ', x0: 1280, z0: 4160, nx: 2, nz: 2, style: 'gujarat', size: 'mid', food: 'GJ', specials: {} },
    { id: 'mandvi', name: 'Mandvi', st: 'GJ', x0: 660, z0: 4260, nx: 2, nz: 1, style: 'town', size: 'small', food: 'GJ', specials: {} },
    { id: 'morbi', name: 'Morbi', st: 'GJ', x0: 1740, z0: 4570, nx: 2, nz: 2, style: 'gujarat', size: 'mid', food: 'GJ', specials: {} },
    { id: 'palitana', name: 'Palitana', st: 'GJ', x0: 2190, z0: 5930, nx: 1, nz: 1, style: 'town', size: 'small', food: 'GJ', specials: {'0,0': 'whiteTemple'} },
    { id: 'dholera', name: 'Dholera', st: 'GJ', x0: 2390, z0: 5310, nx: 2, nz: 2, style: 'gujarat', size: 'small', food: 'GJ', specials: {} },
    { id: 'alwar', name: 'Alwar', st: 'RJ', x0: 5990, z0: 450, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'RJ', specials: {'1,0': 'fortWalls'} },
    { id: 'bharatpur', name: 'Bharatpur', st: 'RJ', x0: 6900, z0: 820, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'RJ', specials: {} },
    { id: 'sikar', name: 'Sikar', st: 'RJ', x0: 4720, z0: 470, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'RJ', specials: {} },
    { id: 'mandawa', name: 'Mandawa', st: 'RJ', x0: 4770, z0: 100, nx: 1, nz: 1, style: 'town', size: 'small', food: 'RJ', specials: {'0,0': 'patwonHaveli'} },
    { id: 'tonk', name: 'Tonk', st: 'RJ', x0: 5440, z0: 1920, nx: 2, nz: 1, style: 'town', size: 'small', food: 'RJ', specials: {} },
    { id: 'bhilwara', name: 'Bhilwara', st: 'RJ', x0: 4500, z0: 2540, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'RJ', specials: {} },
    { id: 'nathdwara', name: 'Nathdwara', st: 'RJ', x0: 3930, z0: 2910, nx: 2, nz: 1, style: 'town', size: 'small', food: 'RJ', specials: {'1,0': 'statueBelief'} },
    { id: 'ranakpur', name: 'Ranakpur', st: 'RJ', x0: 3520, z0: 2780, nx: 1, nz: 1, style: 'town', size: 'small', food: 'RJ', specials: {'0,0': 'ranakpur'} },
    { id: 'pali', name: 'Pali', st: 'RJ', x0: 3230, z0: 2060, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'RJ', specials: {} },
    { id: 'osian', name: 'Osian', st: 'RJ', x0: 2870, z0: 1160, nx: 1, nz: 1, style: 'gold', size: 'small', food: 'RJ', specials: {'0,0': 'vitthal'} },
    { id: 'barmer', name: 'Barmer', st: 'RJ', x0: 1720, z0: 2240, nx: 2, nz: 2, style: 'gold', size: 'mid', food: 'RJ', specials: {} },
    { id: 'banswara', name: 'Banswara', st: 'RJ', x0: 4440, z0: 4300, nx: 2, nz: 1, style: 'town', size: 'small', food: 'RJ', specials: {} }
  ]);

  const links = [
    { name: "Thane link road (NH48 Mumbai–Surat)", pts: [[3160, 8070], [3102.8, 8026.4]], split: "NH48 Mumbai–Surat" },
    { name: "Thane link road (Mumbai–Nashik Highway)", pts: [[3400, 8230], [3440.9, 8290.2]], split: "Mumbai–Nashik Highway" },
    { name: "Navi Mumbai link road (Mumbai–Alibaug Road)", pts: [[3310, 8710], [3263.7, 8711.5]], split: "Mumbai–Alibaug Road" },
    { name: "Navi Mumbai link road (Old Mumbai–Pune Highway (Lonavala))", pts: [[3470, 8710], [3560, 8710]], split: "Old Mumbai–Pune Highway (Lonavala)" },
    { name: "Kalyan–Dombivli link road (Mumbai–Nashik Highway)", pts: [[3450, 8330], [3425.6, 8300.6]], split: "Mumbai–Nashik Highway" },
    { name: "Vasai–Virar link road (NH48 Mumbai–Surat)", pts: [[2910, 7810], [2988.4, 7751.2]], split: "NH48 Mumbai–Surat" },
    { name: "Matheran link road (Old Mumbai–Pune Highway (Lonavala))", pts: [[3600, 8870], [3638.5, 8817.1]], split: "Old Mumbai–Pune Highway (Lonavala)" },
    { name: "Ahilyanagar–Solapur Road", pts: [[5620, 8730], [5618.4, 8767.6], [5600, 9200]] },
    { name: "Ahilyanagar link road (Ahilyanagar–Solapur Road)", pts: [[5540, 8730], [5618.4, 8767.6]], split: "Ahilyanagar–Solapur Road" },
    { name: "Jalgaon–Chhatrapati Sambhajinagar Road", pts: [[6210, 6880], [6300, 7480], [6300, 7740]] },
    { name: "Dhule–Jalgaon Road", pts: [[5540, 6950], [6130, 6880]] },
    { name: "Akola link road (Ajanta Road)", pts: [[6620, 7660], [6481.5, 7632.3]], split: "Ajanta Road" },
    { name: "Chikhaldara–Amravati Road", pts: [[6890, 7080], [7050, 7440]] },
    { name: "Chandrapur–Nagpur Road", pts: [[8280, 8600], [7960, 7880]] },
    { name: "Nanded link road (Bidar–Aurangabad Road)", pts: [[7040, 8540], [6568.7, 8587.1]], split: "Bidar–Aurangabad Road" },
    { name: "Latur link road (Bidar–Aurangabad Road)", pts: [[6540, 8810], [6592.2, 8803.9]], split: "Bidar–Aurangabad Road" },
    { name: "Tuljapur–Solapur Road", pts: [[5890, 9120], [5840, 9200]] },
    { name: "Sangli–Miraj link road (NH48 Satara–Kolhapur)", pts: [[4350, 10600], [4265.5, 10329.5]], split: "NH48 Satara–Kolhapur" },
    { name: "Panchgani link road (Pune–Mahabaleshwar Road)", pts: [[4320, 9930], [4339.3, 9957.5]], split: "Pune–Mahabaleshwar Road" },
    { name: "Anand–Ahmedabad Road", pts: [[3430, 5360], [3347.6, 5230.6], [3290, 5140]] },
    { name: "Nadiad link road (Anand–Ahmedabad Road)", pts: [[3380, 5210], [3347.6, 5230.6]], split: "Anand–Ahmedabad Road" },
    { name: "Dakor–Anand Road", pts: [[3650, 5290], [3590, 5360]] },
    { name: "Bharuch–Vadodara Road", pts: [[3340, 5980], [3430, 5990]] },
    { name: "Bharuch link road (NH48 Surat–Vadodara)", pts: [[3340, 6060], [3379.6, 6134.2]], split: "NH48 Surat–Vadodara" },
    { name: "Navsari–Daman Road", pts: [[3080, 7090], [2987.9, 7153], [2890, 7220]] },
    { name: "Valsad link road (Navsari–Daman Road)", pts: [[3020, 7200], [2987.9, 7153]], split: "Navsari–Daman Road" },
    { name: "Vapi link road (NH48 Mumbai–Surat)", pts: [[2830, 7570], [2860.9, 7551.5]], split: "NH48 Mumbai–Surat" },
    { name: "Mehsana–Gandhinagar Road", pts: [[2940, 4290], [3060, 4370]] },
    { name: "Modhera–Mehsana Road", pts: [[2690, 4230], [2780, 4130]] },
    { name: "Vadnagar–Mehsana Road", pts: [[3030, 4110], [2940, 4210]] },
    { name: "Palanpur–Mount Abu Road", pts: [[2840, 3870], [2820, 3780]] },
    { name: "Palanpur–Mehsana Road", pts: [[2760, 4030], [2780, 4130]] },
    { name: "Ambaji–Vadnagar Road", pts: [[3080, 3890], [3110, 4030]] },
    { name: "Gandhidham–Kandla link road (Ahmedabad–Bhuj Highway)", pts: [[1440, 4160], [1465, 4096.7]], split: "Ahmedabad–Bhuj Highway" },
    { name: "Gandhidham–Kandla–Bhuj Road", pts: [[1280, 4160], [1220, 4080]] },
    { name: "Mandvi–Bhuj Road", pts: [[820, 4260], [980, 4080]] },
    { name: "Morbi link road (Ahmedabad–Bhuj Highway)", pts: [[1900, 4570], [2071.9, 4294.9]], split: "Ahmedabad–Bhuj Highway" },
    { name: "Morbi link road (Ahmedabad–Bhuj Highway)", pts: [[1820, 4570], [1905.9, 4226.5]], split: "Ahmedabad–Bhuj Highway" },
    { name: "Palitana–Bhavnagar Road", pts: [[2270, 5930], [2280, 5820]] },
    { name: "Dholera link road (Ahmedabad–Bhavnagar Highway)", pts: [[2550, 5470], [2580.5, 5495.1]], split: "Ahmedabad–Bhavnagar Highway" },
    { name: "Alwar–Jaipur Road", pts: [[5990, 610], [5540, 800]] },
    { name: "Bharatpur–Alwar Road", pts: [[6900, 820], [6230, 530]] },
    { name: "Sikar–Jaipur Road", pts: [[4880, 630], [5060, 800]] },
    { name: "Mandawa–Sikar Road", pts: [[4770, 180], [4800, 470]] },
    { name: "Tonk link road (NH52 Jaipur–Bundi)", pts: [[5600, 2000], [5640, 2020]], split: "NH52 Jaipur–Bundi" },
    { name: "Bhilwara–Chittorgarh Road", pts: [[4500, 2700], [4500, 2950]] },
    { name: "Nathdwara link road (NH48 Udaipur–Ajmer)", pts: [[3930, 2910], [3900.2, 2894.7]], split: "NH48 Udaipur–Ajmer" },
    { name: "Ranakpur–Udaipur Road", pts: [[3520, 2860], [3640, 3090]] },
    { name: "Pali–Jodhpur Road", pts: [[3230, 2060], [2920, 1710]] },
    { name: "Osian–Jodhpur Road", pts: [[2870, 1240], [2840, 1390]] },
    { name: "Barmer–Jaisalmer Road", pts: [[1720, 2240], [1540, 1370]] },
    { name: "Banswara link road (Ahmedabad–Udaipur Highway)", pts: [[4440, 4300], [3629.7, 3975.9]], split: "Ahmedabad–Udaipur Highway" }
  ];
  for (const r of links) { if (r.split) splitAt(r.split, r.pts[1]); delete r.split; }
  add('highways', links);

  // expressways: plain stretches and flyovers, joined end to end, plus the interchange roads to the towns
  add('highways', [
    { name: "Delhi–Mumbai Expressway", kind: 'exp', pts: [[6400, 20], [6415, 492]] },
    { name: "Delhi–Mumbai Expressway flyover over Bharatpur–Alwar Road", kind: 'exp', fly: true, pts: [[6415, 492], [6420, 650], [6411, 731]] },
    { name: "Delhi–Mumbai Expressway", kind: 'exp', pts: [[6411, 731], [6406.1, 776.5], [6398.6, 846.3], [6350, 1300], [6300, 1900], [6330, 2450], [6311.6, 2490], [6100, 2950], [6028.1, 3141.8], [5950, 3350], [5600, 4000], [5100, 4600], [4700, 5100], [4100, 5500], [4060, 5750], [4024, 5864]] },
    { name: "Delhi–Mumbai Expressway flyover over Vadodara–Ekta Nagar Road", kind: 'exp', fly: true, pts: [[4024, 5864], [3952, 6093]] },
    { name: "Delhi–Mumbai Expressway", kind: 'exp', pts: [[3952, 6093], [3950, 6100], [3700, 6300], [3500, 6700], [3400, 7000], [3346.9, 7132.8], [3300, 7250], [3353.4, 7428], [3360, 7450], [3330, 7700], [3480, 7950], [3500, 8250]] },
    { name: "Amritsar–Jamnagar Expressway", kind: 'exp', pts: [[3420, 20], [3366, 365]] },
    { name: "Amritsar–Jamnagar Expressway flyover over Bikaner Airport", kind: 'exp', fly: true, pts: [[3366, 365], [3328, 601]] },
    { name: "Amritsar–Jamnagar Expressway", kind: 'exp', pts: [[3328, 601], [3292.9, 623.3], [3177, 697]] },
    { name: "Amritsar–Jamnagar Expressway flyover over NH62 Jodhpur–Bikaner", kind: 'exp', fly: true, pts: [[3177, 697], [2975, 826]] },
    { name: "Amritsar–Jamnagar Expressway", kind: 'exp', pts: [[2975, 826], [2700, 1000], [2602.5, 1341.3], [2594, 1371]] },
    { name: "Amritsar–Jamnagar Expressway flyover over Jodhpur–Jaisalmer Highway", kind: 'exp', fly: true, pts: [[2594, 1371], [2528, 1602]] },
    { name: "Amritsar–Jamnagar Expressway", kind: 'exp', pts: [[2528, 1602], [2500, 1700], [2000, 2250], [2006.2, 2306], [2050, 2700], [2150, 3300], [2050, 3900], [2004, 4128]] },
    { name: "Amritsar–Jamnagar Expressway flyover over Ahmedabad–Bhuj Highway and Morbi link road (Ahmedabad–Bhuj Highway)", kind: 'exp', fly: true, pts: [[2004, 4128], [1950, 4400], [2000, 4560], [1994, 4574]] },
    { name: "Amritsar–Jamnagar Expressway", kind: 'exp', pts: [[1994, 4574], [1953.2, 4672.1], [1900, 4800], [1500, 4880], [1240, 4880]] },
    { name: "Ahmedabad–Dholera Expressway", kind: 'exp', pts: [[3050, 5140], [2950, 5330], [2785, 5373]] },
    { name: "Ahmedabad–Dholera Expressway flyover over Ahmedabad–Bhavnagar Highway", kind: 'exp', fly: true, pts: [[2785, 5373], [2720, 5390], [2550, 5390]] },
    { name: "Alwar interchange (Delhi–Mumbai Expressway)", pts: [[6150, 610], [6406.1, 776.5]] },
    { name: "Kota interchange (Delhi–Mumbai Expressway)", pts: [[5890, 3090], [6028.1, 3141.8]] },
    { name: "Vadodara interchange (Vadodara–Ahmedabad Expressway)", pts: [[3510, 5830], [3542, 5811.6]] },
    { name: "Bharuch interchange (Vadodara–Ahmedabad Expressway)", pts: [[3260, 5900], [3434, 5580]] },
    { name: "Navsari interchange (Delhi–Mumbai Expressway)", pts: [[3240, 7090], [3346.9, 7132.8]] },
    { name: "Silvassa interchange (Delhi–Mumbai Expressway)", pts: [[3280, 7450], [3353.4, 7428]] },
    { name: "Bikaner interchange (Amritsar–Jamnagar Expressway)", pts: [[3240, 540], [3292.9, 623.3]] },
    { name: "Barmer interchange (Amritsar–Jamnagar Expressway)", pts: [[1880, 2320], [2006.2, 2306]] },
    { name: "Jodhpur interchange (Amritsar–Jamnagar Expressway)", pts: [[2840, 1470], [2602.5, 1341.3]] },
    { name: "Morbi interchange (Amritsar–Jamnagar Expressway)", pts: [[1900, 4650], [1953.2, 4672.1]] },
    { name: "Bharatpur interchange (Delhi–Mumbai Expressway)", pts: [[6900, 900], [6398.6, 846.3]] },
    { name: "Sawai Madhopur interchange (Delhi–Mumbai Expressway)", pts: [[6190, 2390], [6311.6, 2490]] }
  ]);

  // Mumbai and coast: Atal Setu (Mumbai Trans Harbour Link), the Mumbai Coastal Road, Sudarshan Setu to Bet Dwarka
  splitAt('Haji Ali causeway', [2500, 8600]);
  add('highways', [
    { name: 'Atal Setu (Mumbai Trans Harbour Link)', kind: 'bridge', pts: [[3020, 8660], [3140, 8690], [3263.7, 8711.5]] },
    { name: 'Mumbai Coastal Road', kind: 'bridge', pts: [[2540, 8690], [2505, 8645], [2500, 8600], [2500, 8550], [2540, 8500]] },
    { name: 'Sudarshan Setu (Okha–Bet Dwarka)', kind: 'bridge', w: 10, pts: [[300, 4920], [275, 4875], [245, 4840]] }
  ]);
  add('tolls', [[6380, 1700, 'Delhi–Mumbai Expressway Toll'], [3550, 6550, 'Delhi–Mumbai Expressway Toll'], [2600, 1300, 'Amritsar–Jamnagar Expressway Toll'], [2060, 3500, 'Amritsar–Jamnagar Expressway Toll']]);
  add('speedCams', [[6340, 2200], [5300, 4400], [2100, 3000], [3420, 6900]]);

  // the Mumbai–Ahmedabad bullet train: a viaduct with 12 stations (stations sit on the line)
  W.bullet = { name: 'Mumbai–Ahmedabad bullet train',
    pts: [[3070, 8400], [3140, 8290], [3140, 8000], [3060, 7860], [2930, 7620], [2925, 7560], [2950, 7300], [2985, 7100], [3000, 6900], [3340, 6860], [3345, 6650], [3345, 6400], [3385, 6120], [3390, 5980], [3395, 5800], [3400, 5440], [3350, 5300], [3330, 5100], [3330, 4950], [3330, 4700]],
    stations: [['Mumbai BKC', 3070, 8400], ['Thane', 3140, 8290], ['Virar', 3060, 7860], ['Boisar', 2930, 7620], ['Vapi', 2930, 7480], ['Bilimora', 2985, 7100], ['Surat', 3345, 6650], ['Bharuch', 3385, 6120], ['Vadodara', 3395, 5800], ['Anand', 3400, 5440], ['Ahmedabad', 3330, 4950], ['Sabarmati', 3330, 4700]] };

  // places to discover, at a block of their town (i, j) or just outside it (dx, dz from the town's corner)
  const zp = (name, id, i, j) => { const z = W.zones.find(q => q.id === id); return z ? [name, z.x0 + i * 80 + 40, z.z0 + j * 80 + 40] : null; };
  add('places', [
    zp('Upvan Lake, Thane', 'thane', 2, 1), zp('Charlotte Lake, Matheran', 'matheran', 0, 0), zp('Ahilyanagar Fort', 'ahilyanagar', 1, 1),
    zp('Takht Sachkhand Sri Hazur Sahib', 'nanded', 1, 0), zp('Tulja Bhavani Temple', 'tuljapur', 0, 0), zp('Gavilgarh Fort, Chikhaldara', 'chikhaldara', 0, 0),
    zp('Table Land, Panchgani', 'panchgani', 0, 0), zp('Amul Dairy, Anand', 'anand', 1, 1), zp('Ranchhodraiji Temple, Dakor', 'dakor', 0, 0), zp('Narmada riverfront, Bharuch', 'bharuch', 1, 1),
    zp('Modhera Sun Temple', 'modhera', 0, 0), zp('Kirti Toran, Vadnagar', 'vadnagar', 0, 0), zp('Ambaji Temple', 'ambaji', 0, 0), zp('Shatrunjaya Hill, Palitana', 'palitana', 0, 0),
    zp('Kandla Port', 'gandhidham', 1, 1), zp('Mandvi Beach and dhow yard', 'mandvi', 0, 0), zp('Mani Mandir, Morbi', 'morbi', 1, 1), zp('Dholera Smart City', 'dholera', 1, 1),
    zp('Bala Quila, Alwar', 'alwar', 1, 0), zp('Keoladeo National Park, Bharatpur', 'bharatpur', 1, 1), zp('Painted havelis, Mandawa', 'mandawa', 0, 0), zp('Statue of Belief, Nathdwara', 'nathdwara', 1, 0),
    zp('Ranakpur Jain Temple', 'ranakpur', 0, 0), zp('Osian temples', 'osian', 0, 0), zp('Junagarh, Barmer', 'barmer', 1, 1), zp('Tadoba gate, Chandrapur', 'chandrapur', 2, 1),
    ['Mukundra Hills tunnel', 5950, 3350], ['Sudarshan Setu', 275, 4875], ['Atal Setu', 3140, 8690]
  ].filter(Boolean));
})();
