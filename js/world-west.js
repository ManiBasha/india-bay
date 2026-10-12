// West India region map: Maharashtra, Gujarat, Rajasthan, Dadra & Nagar Haveli and Daman & Diu.
// Units are metres in a compressed world. x grows east, z grows south. North is low z.
// Zones are city grids: x0,z0 is the north-west corner, nx by nz blocks of 80 m.
window.WORLD = {
  id: 'west', name: 'West India', W: 8400, H: 11000,
  states: { MH: 'Maharashtra', GJ: 'Gujarat', RJ: 'Rajasthan', DD: 'Daman & Diu', DN: 'Dadra & Nagar Haveli' },

  // Land outline, clockwise. Everything outside is the Arabian Sea.
  land: [[0,0],[8400,0],[8400,11000],[3250,11000],[3150,10600],[3050,10150],[2950,9700],[2850,9400],[2880,9200],[3060,9150],[3200,9050],[3220,8800],[3160,8450],[3060,8460],[3050,8700],[3040,8960],[2960,9000],[2880,8980],[2820,8930],[2760,8860],[2700,8800],[2600,8760],[2520,8700],[2510,8500],[2500,8300],[2490,8100],[2520,7900],[2600,7800],[2700,7300],[2760,7000],[2850,6650],[2860,6500],[2900,6100],[2950,5750],[2900,5500],[2700,5550],[2550,5800],[2450,6100],[2350,6350],[2000,6450],[1600,6380],[1250,6200],[800,5950],[450,5600],[250,5250],[200,5000],[300,4800],[700,4700],[1200,4650],[1700,4600],[1500,4450],[1000,4400],[500,4350],[100,4250],[0,4150]],

  islands: [
    { name: 'Lake Palace', x: 3560, z: 3250, r: 24 }, { name: 'Jal Mahal', x: 5130, z: 650, r: 20 },
    { name: 'Statue islet', x: 4700, z: 6105, r: 34 }, { name: 'Kolaba Fort', x: 2830, z: 9520, r: 28 },
    { name: 'Haji Ali', x: 2462, z: 8600, r: 20 }
  ],
  lakes: [
    { name: 'Lake Pichola', x: 3560, z: 3250, rx: 90, rz: 200 }, { name: 'Fateh Sagar', x: 3700, z: 3010, rx: 70, rz: 50 },
    { name: 'Pushkar Lake', x: 4200, z: 1880, rx: 52, rz: 42 }, { name: 'Nakki Lake', x: 2900, z: 3700, rx: 38, rz: 30 },
    { name: 'Kankaria Lake', x: 3170, z: 5020, rx: 34, rz: 34 }, { name: 'Man Sagar', x: 5130, z: 650, rx: 90, rz: 60 },
    { name: 'Venna Lake', x: 4210, z: 10060, rx: 30, rz: 24 }, { name: 'Vanganga Lake', x: 3200, z: 7450, rx: 26, rz: 22 }
  ],
  rivers: [
    { name: 'Sabarmati', w: 56, pts: [[3000,4200],[3010,4660],[3010,5140],[2970,5400],[2905,5520]] },
    { name: 'Narmada', w: 70, pts: [[6200,6300],[5400,6150],[4750,6100],[4500,6120],[4000,6150],[3400,6200],[3100,6150],[2930,6120]] },
    { name: 'Tapi', w: 48, pts: [[3700,6420],[3300,6540],[3050,6580],[2870,6610]] },
    { name: 'Godavari', w: 28, pts: [[4200,7900],[4450,7880],[4700,7950],[5000,8050]] }
  ],

  // Biomes painted on the ground.
  biomes: [
    { kind: 'rann', x: 950, z: 3200, rx: 650, rz: 380 },
    { kind: 'desert', x: 1600, z: 1100, rx: 1700, rz: 1300 }, { kind: 'desert', x: 900, z: 2300, rx: 900, rz: 800 },
    { kind: 'scrub', x: 4300, z: 2500, rx: 1500, rz: 1300 },
    { kind: 'forest', x: 1800, z: 5780, rx: 380, rz: 230 }, { kind: 'forest', x: 6000, z: 2150, rx: 300, rz: 200 },
    { kind: 'forest', x: 4600, z: 6200, rx: 300, rz: 160 }, { kind: 'ghats', x: 3750, z: 9300, rx: 500, rz: 1100 },
    { kind: 'ghats', x: 6800, z: 7300, rx: 450, rz: 160 }
  ],
  hills: [
    { x: 3600, z: 8700, rx: 330, rz: 230, n: 38, h: [40, 95] }, { x: 4000, z: 9750, rx: 330, rz: 380, n: 42, h: [40, 110] },
    { x: 3450, z: 10050, rx: 200, rz: 300, n: 22, h: [30, 80] }, { x: 3950, z: 8350, rx: 240, rz: 140, n: 18, h: [30, 70] },
    { x: 6800, z: 7300, rx: 420, rz: 140, n: 26, h: [30, 70] }, { x: 3950, z: 2850, rx: 380, rz: 230, n: 32, h: [35, 80] },
    { x: 2980, z: 3500, rx: 230, rz: 160, n: 22, h: [50, 120] }, { x: 4700, z: 2300, rx: 280, rz: 330, n: 26, h: [30, 70] },
    { x: 5350, z: 430, rx: 330, rz: 130, n: 22, h: [30, 70] }, { x: 1360, z: 3260, rx: 70, rz: 50, n: 4, h: [30, 50] },
    { x: 2060, z: 5650, rx: 120, rz: 100, n: 6, h: [60, 110] }, { x: 2760, z: 1260, rx: 60, rz: 50, n: 3, h: [25, 35] }
  ],
  dunes: [{ x: 1050, z: 1300, rx: 220, rz: 220, n: 46 }, { x: 2000, z: 780, rx: 600, rz: 380, n: 50 }, { x: 800, z: 2000, rx: 450, rz: 450, n: 40 }],
  forests: [
    { x: 1800, z: 5780, rx: 380, rz: 230, n: 520, kind: 'dry' }, { x: 6000, z: 2150, rx: 300, rz: 200, n: 360, kind: 'dry' },
    { x: 3750, z: 9300, rx: 520, rz: 1050, n: 650, kind: 'green' }, { x: 4600, z: 6200, rx: 280, rz: 150, n: 180, kind: 'green' },
    { x: 6800, z: 7300, rx: 420, rz: 150, n: 160, kind: 'dry' }
  ],

  zones: [
    { id: 'mumbai', name: 'Mumbai', st: 'MH', x0: 2540, z0: 8100, nx: 6, nz: 10, style: 'metro', size: 'big', food: 'MH',
      specials: { '4,0': 'localStation:Andheri', '4,1': 'rail', '4,2': 'localStation:Bandra', '4,3': 'rail', '4,4': 'rail', '4,5': 'localStation:Dadar', '4,6': 'rail', '4,7': 'rail', '4,8': 'rail', '4,9': 'localStation:Churchgate',
        '5,8': 'csmt', '5,9': 'gateway', '3,8': 'maidan', '2,7': 'wankhede', '1,5': 'siddhivinayak', '2,4': 'policeHQ', '3,1': 'hospitalBlock', '3,2': 'biz', '5,2': 'biz', '3,3': 'biz', '5,3': 'biz', '0,0': 'beachBlock', '0,1': 'beachBlock' } },
    { id: 'pune', name: 'Pune', st: 'MH', x0: 4400, z0: 9100, nx: 5, nz: 5, style: 'mid', size: 'big', food: 'MH', specials: { '2,2': 'shaniwarWada', '1,3': 'dagdusheth' } },
    { id: 'lonavala', name: 'Lonavala', st: 'MH', x0: 3780, z0: 8920, nx: 3, nz: 2, style: 'hill', size: 'small', food: 'MH', station: true, specials: {} },
    { id: 'mahabaleshwar', name: 'Mahabaleshwar', st: 'MH', x0: 4170, z0: 10020, nx: 2, nz: 2, style: 'hill', size: 'small', food: 'MH', specials: {} },
    { id: 'alibaug', name: 'Alibaug', st: 'MH', x0: 2850, z0: 9420, nx: 2, nz: 2, style: 'town', size: 'small', food: 'MH', specials: {} },
    { id: 'ganpatipule', name: 'Ganpatipule', st: 'MH', x0: 3040, z0: 10310, nx: 2, nz: 1, style: 'town', size: 'small', food: 'MH', specials: {} },
    { id: 'nashik', name: 'Nashik', st: 'MH', x0: 4340, z0: 7790, nx: 4, nz: 4, style: 'town', size: 'mid', food: 'MH', specials: {} },
    { id: 'shirdi', name: 'Shirdi', st: 'MH', x0: 5170, z0: 7770, nx: 2, nz: 2, style: 'town', size: 'small', food: 'MH', station: true, specials: { '0,0': 'saiTemple' } },
    { id: 'aurangabad', name: 'Aurangabad', st: 'MH', x0: 6140, z0: 7740, nx: 4, nz: 4, style: 'town', size: 'mid', food: 'MH', specials: { '2,2': 'bibiMaqbara' } },
    { id: 'nagpur', name: 'Nagpur', st: 'MH', x0: 7640, z0: 7640, nx: 4, nz: 4, style: 'mid', size: 'big', food: 'MH', specials: { '1,1': 'zeroMile', '2,2': 'deekshabhoomi' } },
    { id: 'daman', name: 'Daman', st: 'DD', x0: 2730, z0: 7220, nx: 2, nz: 2, style: 'town', size: 'small', food: 'DD', specials: { '0,1': 'motiDamanFort' } },
    { id: 'silvassa', name: 'Silvassa', st: 'DN', x0: 3120, z0: 7370, nx: 2, nz: 2, style: 'town', size: 'small', food: 'DD', specials: {} },
    { id: 'surat', name: 'Surat', st: 'GJ', x0: 2900, z0: 6490, nx: 5, nz: 4, style: 'gujarat', size: 'big', food: 'GJ', tall: true, specials: { '3,3': 'diamondBourse' } },
    { id: 'vadodara', name: 'Vadodara', st: 'GJ', x0: 3430, z0: 5830, nx: 3, nz: 3, style: 'gujarat', size: 'mid', food: 'GJ', specials: { '1,1': 'laxmiVilas' } },
    { id: 'kevadia', name: 'Kevadia', st: 'GJ', x0: 4420, z0: 5960, nx: 2, nz: 1, style: 'town', size: 'small', food: 'GJ', specials: {} },
    { id: 'ahmedabad', name: 'Ahmedabad', st: 'GJ', x0: 2810, z0: 4660, nx: 6, nz: 6, style: 'gujarat', size: 'big', food: 'GJ',
      specials: { '2,0': 'riverfront', '2,1': 'riverfront', '2,2': 'riverfront:bridge', '2,3': 'riverfront', '2,4': 'riverfront', '2,5': 'riverfront', '1,0': 'sabarmatiAshram', '4,4': 'kankaria' } },
    { id: 'rajkot', name: 'Rajkot', st: 'GJ', x0: 1630, z0: 5180, nx: 3, nz: 3, style: 'gujarat', size: 'mid', food: 'GJ', specials: {} },
    { id: 'dwarka', name: 'Dwarka', st: 'GJ', x0: 300, z0: 4920, nx: 2, nz: 2, style: 'town', size: 'small', food: 'GJ', specials: { '0,0': 'dwarkadhish' } },
    { id: 'somnath', name: 'Somnath', st: 'GJ', x0: 1220, z0: 6040, nx: 2, nz: 1, style: 'town', size: 'small', food: 'GJ', specials: {} },
    { id: 'sasangir', name: 'Sasan Gir', st: 'GJ', x0: 1710, z0: 5810, nx: 1, nz: 1, style: 'town', size: 'small', food: 'GJ', specials: {} },
    { id: 'bhuj', name: 'Bhuj', st: 'GJ', x0: 980, z0: 3920, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'GJ', specials: { '1,0': 'ainaMahal' } },
    { id: 'mountabu', name: 'Mount Abu', st: 'RJ', x0: 2820, z0: 3620, nx: 2, nz: 2, style: 'hill', size: 'small', food: 'RJ', specials: { '1,0': 'dilwara' } },
    { id: 'udaipur', name: 'Udaipur', st: 'RJ', x0: 3640, z0: 3090, nx: 4, nz: 4, style: 'white', size: 'mid', food: 'RJ', specials: { '0,1': 'cityPalace' } },
    { id: 'ajmer', name: 'Ajmer–Pushkar', st: 'RJ', x0: 4280, z0: 1820, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'RJ', specials: { '2,1': 'ajmerDargah' } },
    { id: 'jaipur', name: 'Jaipur', st: 'RJ', x0: 5060, z0: 800, nx: 6, nz: 5, style: 'pink', size: 'big', food: 'RJ', specials: { '2,2': 'hawaMahal', '3,2': 'jantarMantar', '3,1': 'cityPalaceJaipur' } },
    { id: 'ranthambore', name: 'Sawai Madhopur', st: 'RJ', x0: 6110, z0: 2310, nx: 1, nz: 1, style: 'town', size: 'small', food: 'RJ', specials: {} },
    { id: 'jodhpur', name: 'Jodhpur', st: 'RJ', x0: 2840, z0: 1390, nx: 4, nz: 4, style: 'blue', size: 'mid', food: 'RJ', specials: { '1,1': 'ghantaGhar', '3,3': 'umaidBhawan' } },
    { id: 'jaisalmer', name: 'Jaisalmer', st: 'RJ', x0: 1380, z0: 1130, nx: 3, nz: 3, style: 'gold', size: 'mid', food: 'RJ', specials: { '1,1': 'jaisalmerFort', '2,0': 'patwonHaveli' } }
  ],

  // Roads between cities. Each list is a polyline of [x,z] points.
  highways: [
    { name: 'Mumbai–Pune Expressway', kind: 'exp', pts: [[3020,8420],[3250,8420],[3500,8600],[3700,8800],[3850,8960],[4050,9100],[4250,9200],[4400,9220]] },
    { name: 'NH48 Mumbai–Surat', pts: [[2780,8100],[2780,7900],[2760,7700],[2800,7450],[2810,7380]] },
    { name: 'NH48 Daman–Surat', pts: [[2810,7220],[2880,7150],[2870,6950],[2900,6810]] },
    { name: 'NH48 Surat–Vadodara', pts: [[3100,6490],[3200,6300],[3350,6150],[3500,6070]] },
    { name: 'Vadodara–Ahmedabad Expressway', kind: 'exp', pts: [[3550,5830],[3450,5600],[3250,5350],[3100,5140]] },
    { name: 'Mumbai–Nashik Highway', pts: [[3250,8420],[3500,8250],[3900,8100],[4340,8030]] },
    { name: 'Samruddhi Mahamarg', kind: 'exp', pts: [[4660,7950],[4900,7880],[5170,7850]] },
    { name: 'Samruddhi Shirdi–Aurangabad', kind: 'exp', pts: [[5330,7850],[5700,7900],[6140,7900]] },
    { name: 'Samruddhi Aurangabad–Nagpur', kind: 'exp', pts: [[6460,7900],[6900,7800],[7300,7750],[7640,7800]] },
    { name: 'Pune–Mahabaleshwar Road', pts: [[4600,9500],[4500,9750],[4350,9950],[4250,10020]] },
    { name: 'Mumbai–Alibaug Road', pts: [[3250,8420],[3260,8600],[3270,8900],[3240,9100],[3080,9260],[2980,9350],[2930,9420]] },
    { name: 'Konkan Coastal Road', pts: [[2930,9580],[2980,9800],[3050,10000],[3120,10310]] },
    { name: 'Pune–Shirdi Road', pts: [[4600,9100],[4800,8700],[5100,8200],[5250,7930]] },
    { name: 'Daman–Silvassa Road', pts: [[2890,7300],[3000,7400],[3120,7450]] },
    { name: 'Vadodara–Kevadia Road', pts: [[3670,5950],[4000,5980],[4420,6000]] },
    { name: 'Kevadia–Statue Road', pts: [[4580,6000],[4640,6040],[4660,6070]] },
    { name: 'Ahmedabad–Rajkot Highway', pts: [[2810,4900],[2500,5000],[2100,5150],[1870,5300]] },
    { name: 'Rajkot–Dwarka Highway', pts: [[1630,5300],[1200,5200],[800,5100],[460,5000]] },
    { name: 'Rajkot–Gir Road', pts: [[1750,5420],[1750,5810]] },
    { name: 'Gir–Somnath Road', pts: [[1750,5890],[1600,5980],[1380,6040]] },
    { name: 'Ahmedabad–Bhuj Highway', pts: [[2810,4740],[2400,4500],[2000,4250],[1600,4150],[1220,4000]] },
    { name: 'Bhuj–White Rann Road', pts: [[1100,3920],[1100,3600],[1100,3470]] },
    { name: 'Ahmedabad–Udaipur Highway', pts: [[3290,4740],[3500,4300],[3700,3800],[3800,3410]] },
    { name: 'Udaipur–Mount Abu Road', pts: [[3640,3250],[3300,3400],[2980,3700]] },
    { name: 'NH48 Udaipur–Ajmer', pts: [[3800,3090],[4000,2700],[4250,2300],[4400,1980]] },
    { name: 'NH48 Ajmer–Jaipur', pts: [[4520,1900],[4800,1550],[5050,1300],[5200,1200]] },
    { name: 'Ajmer–Jodhpur Highway', pts: [[4280,1900],[3800,1700],[3160,1550]] },
    { name: 'Jodhpur–Jaisalmer Highway', pts: [[2840,1550],[2400,1450],[1900,1300],[1620,1250]] },
    { name: 'Sam Dunes Road', pts: [[1380,1250],[1150,1280],[1020,1300]] },
    { name: 'Jaipur–Ranthambore Road', pts: [[5460,1200],[5800,1700],[6150,2310]] },
    { name: 'Amber Road', pts: [[5300,800],[5260,620],[5250,540]] },
    { name: 'Mehrangarh Road', pts: [[2840,1400],[2820,1340]] },
    { name: 'Ellora Road', pts: [[6200,7740],[6170,7660]] },
    { name: 'Ajanta Road', pts: [[6460,7760],[6520,7440]] },
    { name: 'Trimbak Road', pts: [[4340,7880],[4248,7948]] },
    { name: 'Pushkar Road', pts: [[4280,1860],[4250,1860]] },
    { name: 'GIFT City Road', pts: [[2890,4660],[2950,4520]] },
    { name: 'Stadium Road', pts: [[3130,4660],[3150,4600]] },
    { name: 'Adalaj Road', pts: [[2970,4660],[2988,4616]] },
    { name: 'Marine Drive', kind: 'coast', pts: [[2540,8690],[2610,8742],[2712,8780],[2775,8840],[2840,8905]] },
    { name: 'Bandra–Worli Sea Link', kind: 'bridge', pts: [[2540,8500],[2470,8460],[2450,8400],[2460,8330],[2540,8290]] },
    { name: 'Haji Ali causeway', kind: 'bridge', w: 6, pts: [[2540,8600],[2478,8600]] },
    { name: 'Tiger Point Road', pts: [[3900,8920],[3870,8850]] },
    { name: 'Arthur Seat Road', pts: [[4170,10100],[4080,10140]] },
    { name: 'Mumbai Football Arena Road', pts: [[3020,8200],[3040,8200]] },
    { name: 'Guru Shikhar Road', pts: [[2980,3620],[3036,3574]] }
  ],

  airports: [
    { id: 'BOM', name: 'Mumbai Airport', zone: 'mumbai', x: 2840, z: 8000, L: 440, side: 1, access: [[2840,8064],[2840,8100]] },
    { id: 'PNQ', name: 'Pune Airport', zone: 'pune', x: 4980, z: 8950, L: 380, side: 1, access: [[4980,9014],[4800,9014],[4800,9100]] },
    { id: 'NAG', name: 'Nagpur Airport', zone: 'nagpur', x: 7800, z: 8060, L: 380, side: -1, access: [[7800,7996],[7800,7960]] },
    { id: 'IXU', name: 'Aurangabad Airport', zone: 'aurangabad', x: 6300, z: 8150, L: 320, side: -1, access: [[6300,8086],[6300,8060]] },
    { id: 'STV', name: 'Surat Airport', zone: 'surat', x: 3100, z: 6900, L: 360, side: -1, access: [[3100,6836],[3100,6810]] },
    { id: 'BDQ', name: 'Vadodara Airport', zone: 'vadodara', x: 3850, z: 5800, L: 300, side: 1, access: [[3850,5864],[3700,5864],[3670,5830]] },
    { id: 'AMD', name: 'Ahmedabad Airport', zone: 'ahmedabad', x: 3600, z: 4620, L: 340, side: 1, access: [[3600,4684],[3290,4684]] },
    { id: 'HSR', name: 'Rajkot Airport', zone: 'rajkot', x: 1950, z: 5080, L: 300, side: 1, access: [[1950,5144],[1870,5180]] },
    { id: 'BHJ', name: 'Bhuj Airport', zone: 'bhuj', x: 1350, z: 3860, L: 280, side: 1, access: [[1350,3924],[1220,3960]] },
    { id: 'UDR', name: 'Udaipur Airport', zone: 'udaipur', x: 4150, z: 3500, L: 300, side: -1, access: [[4150,3436],[3960,3400]] },
    { id: 'JAI', name: 'Jaipur Airport', zone: 'jaipur', x: 5300, z: 1420, L: 340, side: -1, access: [[5300,1356],[5300,1200]] },
    { id: 'JDH', name: 'Jodhpur Airport', zone: 'jodhpur', x: 3250, z: 1820, L: 300, side: -1, access: [[3250,1756],[3160,1710]] },
    { id: 'JSA', name: 'Jaisalmer Airport', zone: 'jaisalmer', x: 1750, z: 1500, L: 280, side: -1, access: [[1750,1436],[1620,1370]] }
  ],

  // Landmarks outside the city grids, built in landmarks.js.
  landmarks: [
    { kind: 'seaLink', x: 2455, z: 8400 }, { kind: 'hajiAli', x: 2462, z: 8600 },
    { kind: 'tigerPoint', x: 3870, z: 8840 }, { kind: 'arthurSeat', x: 4070, z: 10145 },
    { kind: 'kolabaFort', x: 2830, z: 9520 }, { kind: 'ganpatipuleTemple', x: 3100, z: 10352 },
    { kind: 'ramkund', x: 4450, z: 7880 }, { kind: 'trimbak', x: 4215, z: 7975 },
    { kind: 'ellora', x: 6170, z: 7640 }, { kind: 'ajanta', x: 6525, z: 7420 },
    { kind: 'statueUnity', x: 4700, z: 6105 }, { kind: 'narmadaDam', x: 4820, z: 6100 },
    { kind: 'adalaj', x: 2992, z: 4588 }, { kind: 'stadium', x: 3150, z: 4560 }, { kind: 'giftCity', x: 2955, z: 4500 },
    { kind: 'somnathTemple', x: 1300, z: 6168 }, { kind: 'girGate', x: 1750, z: 5900 },
    { kind: 'tentCity', x: 1100, z: 3440 }, { kind: 'kalaDungar', x: 1350, z: 3260 },
    { kind: 'guruShikhar', x: 3055, z: 3552 }, { kind: 'lakePalace', x: 3560, z: 3250 },
    { kind: 'pushkarGhats', x: 4200, z: 1880 }, { kind: 'jalMahal', x: 5130, z: 650 }, { kind: 'amberFort', x: 5250, z: 500 },
    { kind: 'ranthamboreFort', x: 5945, z: 2120 }, { kind: 'mehrangarh', x: 2800, z: 1300 }, { kind: 'samCamp', x: 1000, z: 1320 },
    { kind: 'dumasBeach', x: 2880, z: 6560 }, { kind: 'stadiumMFA:mum', x: 3076, z: 8200 }, { kind: 'juhuBeach', x: 2505, z: 8180 }
  ],

  // Discoverable places. The first visit gives a reward.
  places: [
    ['Gateway of India', 2980, 8860], ['Mumbai Football Arena', 3076, 8200], ['CSMT Station', 2980, 8780], ['Marine Drive', 2712, 8780], ['Haji Ali Dargah', 2462, 8600], ['Bandra–Worli Sea Link', 2455, 8400],
    ['Juhu Beach', 2505, 8180], ['Siddhivinayak Temple', 2660, 8540], ['Wankhede Stadium', 2740, 8700], ['Shaniwar Wada', 4600, 9300], ['Dagdusheth Temple', 4520, 9380],
    ['Tiger Point', 3870, 8840], ["Arthur's Seat", 4070, 10145], ['Kolaba Fort', 2830, 9520], ['Ganpatipule Beach Temple', 3100, 10352], ['Ramkund Ghats', 4450, 7880],
    ['Trimbakeshwar Temple', 4215, 7975], ['Sai Temple, Shirdi', 5210, 7810], ['Ellora Caves', 6170, 7640], ['Ajanta Caves', 6525, 7420], ['Bibi Ka Maqbara', 6340, 7940],
    ['Zero Mile Stone', 7760, 7760], ['Deekshabhoomi', 7840, 7840], ['Moti Daman Fort', 2770, 7340], ['Dumas Beach', 2880, 6560], ['Surat Diamond Bourse', 3180, 6770],
    ['Laxmi Vilas Palace', 3550, 5950], ['Statue of Unity', 4700, 6105], ['Sabarmati Riverfront', 3010, 4900], ['Sabarmati Ashram', 2930, 4700], ['Kankaria Lake', 3170, 5020],
    ['Adalaj Stepwell', 2992, 4588], ['Ahmedabad Cricket Stadium', 3150, 4560], ['GIFT City', 2955, 4500], ['Dwarkadhish Temple', 340, 4960], ['Somnath Temple', 1300, 6168],
    ['Gir Forest', 1800, 5760], ['White Rann of Kutch', 950, 3250], ['Kala Dungar', 1350, 3260], ['Aina Mahal', 1100, 3960], ['Nakki Lake', 2900, 3700],
    ['Dilwara Temples', 2940, 3660], ['Guru Shikhar', 3055, 3552], ['City Palace, Udaipur', 3680, 3210], ['Lake Palace', 3560, 3250], ['Pushkar Lake', 4200, 1880],
    ['Ajmer Sharif Dargah', 4480, 1940], ['Hawa Mahal', 5260, 1000], ['Jantar Mantar', 5340, 1000], ['Jal Mahal', 5130, 650], ['Amber Fort', 5250, 500],
    ['Ranthambore', 6000, 2120], ['Mehrangarh Fort', 2800, 1300], ['Ghanta Ghar', 2960, 1510], ['Umaid Bhawan Palace', 3120, 1670], ['Jaisalmer Fort', 1500, 1250],
    ['Patwon Ki Haveli', 1580, 1170], ['Sam Sand Dunes', 1000, 1320]
  ],

  // Fun details on the road network.
  tolls: [[3600, 8700, 'Expressway Toll'], [2770, 7800, 'Dahisar Toll'], [3350, 5480, 'Expressway Toll'], [4600, 1650, 'Kishangarh Toll']],
  speedCams: [[3300, 8480], [4150, 9150], [3200, 5280], [5600, 7880]],
  checkpoints: [[2780, 7960], [3150, 8420], [3150, 5250], [5130, 1250], [4340, 9218]],
  floods: [[2700, 8420], [2860, 8260], [2620, 8660], [3100, 6650], [3130, 4980]],
  ferries: [{ a: 'Gateway jetty', ax: 3048, az: 8862, b: 'Mandwa jetty', bx: 2898, bz: 9205 }],

  // Each zone gets these services, placed on block edges.
  serviceSets: {
    big: ['bank', 'bank', 'food', 'food', 'food', 'toilet', 'toilet', 'pump', 'cng', 'hospital', 'police', 'rto', 'jobs', 'cars', 'bikes', 'clothes', 'furniture', 'mobile', 'guns', 'realty', 'mechanic', 'station', 'bus', 'lodge'],
    mid: ['bank', 'food', 'food', 'toilet', 'pump', 'hospital', 'police', 'mechanic', 'station', 'bus', 'lodge', 'clothes', 'mobile', 'bikes', 'jobs'],
    small: ['bank', 'food', 'toilet', 'pump', 'bus', 'lodge']
  },

  homes: [
    { id: 'chawl', zone: 'mumbai', name: 'Dadar chawl room', type: 'chawl', price: 15000 },
    { id: 'flat', zone: 'mumbai', name: 'Worli sea-view flat', type: 'flat', price: 150000 },
    { id: 'punebung', zone: 'pune', name: 'Koregaon bungalow', type: 'bungalow', price: 200000 },
    { id: 'lonavilla', zone: 'lonavala', name: 'Lonavala hill cottage', type: 'cottage', price: 160000 },
    { id: 'alibaugcot', zone: 'alibaug', name: 'Alibaug beach cottage', type: 'cottage', price: 180000 },
    { id: 'nagflat', zone: 'nagpur', name: 'Nagpur flat', type: 'flat', price: 70000 },
    { id: 'suratflat', zone: 'surat', name: 'Surat apartment', type: 'flat', price: 90000 },
    { id: 'amdpol', zone: 'ahmedabad', name: 'Old city pol house', type: 'pol', price: 60000 },
    { id: 'jaipurhaveli', zone: 'jaipur', name: 'Jaipur haveli', type: 'haveli', price: 250000 },
    { id: 'udaipurvilla', zone: 'udaipur', name: 'Lake-view villa', type: 'villa', price: 400000 },
    { id: 'jsmtent', zone: 'jaisalmer', name: 'Desert camp tent', type: 'tent', price: 30000 }
  ],

  menus: {
    MH: [['vadapav','Vada pav','Spicy potato fritter in a bun',20,{hunger:22,bladder:-4},'snack'],['misal','Misal pav','Fiery sprout curry with pav',60,{hunger:40},'meal'],['pavbhaji','Pav bhaji','Butter-loaded bhaji and pav',80,{hunger:50},'meal'],['poha','Kanda poha','Light breakfast',30,{hunger:20},'snack'],['cutting','Cutting chai','Half glass of sweet tea',10,{hunger:3,energy:12,bladder:-8},'drink'],['solkadhi','Sol kadhi','Kokum and coconut cooler',30,{hunger:4,bladder:-12},'drink']],
    GJ: [['dhokla','Khaman dhokla','Soft and spongy',40,{hunger:22},'snack'],['fafda','Fafda jalebi','Sunday-morning special',50,{hunger:28},'snack'],['gjthali','Gujarati thali','Dal, kadhi, rotli, shaak, rice',150,{hunger:70,energy:8,bladder:-8},'meal'],['khakhra','Khakhra','Crisp and light',30,{hunger:12},'snack'],['chaas','Masala chaas','Spiced buttermilk',20,{hunger:3,bladder:-12},'drink'],['cutting','Chai','Strong and sweet',10,{hunger:3,energy:12,bladder:-8},'drink']],
    RJ: [['daalbaati','Dal baati churma','Rajasthani classic',120,{hunger:70,bladder:-6},'meal'],['kachori','Pyaaz kachori','Flaky onion kachori',30,{hunger:22},'snack'],['mirchivada','Mirchi vada','Stuffed chilli fritter',25,{hunger:18},'snack'],['ghevar','Ghevar','Honeycomb sweet',60,{hunger:16,energy:6},'snack'],['lassi','Makhaniya lassi','Thick and creamy',40,{hunger:14,energy:8,bladder:-12},'drink'],['cutting','Chai','Masala chai',10,{hunger:3,energy:12,bladder:-8},'drink']],
    DD: [['fishthali','Fish thali','Coastal fish curry and rice',180,{hunger:70},'meal'],['bhel','Bhel puri','Tangy puffed rice',40,{hunger:18},'snack'],['coconut','Coconut water','Straight from the shell',40,{hunger:4,bladder:-14},'drink'],['kokum','Kokum sherbet','Sweet and sour',30,{hunger:3,bladder:-12},'drink']],
    HW: [['thali','Dhaba veg thali','Dal, sabzi, rice, roti',90,{hunger:60,energy:8,bladder:-8},'meal'],['biryani','Chicken biryani','A full plate',160,{hunger:80,bladder:-8},'meal'],['paratha','Aloo paratha','With butter and achaar',70,{hunger:45},'meal'],['lassi','Sweet lassi','Cold and thick',40,{hunger:14,energy:8,bladder:-12},'drink'],['cutting','Chai','Highway chai',10,{hunger:3,energy:12,bladder:-8},'drink']],
    BEACH: [['panipuri','Pani puri','Six puris with spicy water',30,{hunger:16,bladder:-6},'snack'],['bhel','Bhel puri','Tangy puffed rice',40,{hunger:18},'snack'],['ganna','Sugarcane juice','Fresh pressed',25,{hunger:5,energy:8,bladder:-12},'drink'],['gola','Gola','Shaved ice with kala khatta',25,{hunger:4,energy:6,bladder:-10},'drink'],['coconut','Coconut water','Straight from the shell',40,{hunger:4,bladder:-14},'drink']]
  }
};
