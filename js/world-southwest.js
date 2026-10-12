// South-West India: Goa, Karnataka and Kerala, joined to the West map as one continuous world.
// Loaded after world-west.js. It extends window.WORLD in place: the map grows south to Kanyakumari,
// and the land outline swaps the old south edge for the Konkan, Kanara and Malabar coasts.
// Same units as the West map: metres, x grows east, z grows south. Zones are 80 m blocks.
(function () {
  const W = window.WORLD;
  if (!W || W.southwest) return;
  W.southwest = true;
  W.id = 'india'; W.name = 'West and South-West India';
  W.H = 19200;
  Object.assign(W.states, { GA: 'Goa', KA: 'Karnataka', KL: 'Kerala', TN: 'Tamil Nadu', AP: 'Andhra Pradesh', TS: 'Telangana' });

  // ---------- land ----------
  // The West outline ran [8400,0] → [8400,11000] → [3250,11000] → north up the coast.
  // Replace the straight south edge with the east side going down to Kanyakumari and the coast coming back north.
  const south = [[8400, 18000], [7600, 18500], [7000, 18800], [6620, 18960]];
  const coastNorthward = [ // Kanyakumari to the Goa–Maharashtra border, south to north
    [6400,18830],[6200,18700],[6110,18610],[6040,18510],[5950,18420],[5860,18300],[5800,18200],[5720,18080],[5650,17950],[5580,17780],[5530,17600],
    [5505,17450],[5490,17300],[5470,17150],[5455,17020],[5440,16930],[5390,16760],[5320,16560],[5260,16380],[5210,16220],[5160,16050],[5110,15900],
    [5070,15760],[5050,15700],[4990,15560],[4930,15420],[4860,15300],[4800,15220],[4740,15130],[4700,15060],[4590,14880],[4500,14700],[4440,14600],
    [4400,14500],[4360,14400],[4300,14250],[4260,14100],[4230,13950],[4205,13800],[4185,13660],[4170,13560],[4150,13420],[4110,13250],[4040,13060],
    [3990,12990],[3960,12940],[3970,12860],[3940,12760],[3900,12660],[3850,12560],[3820,12500],[3760,12420],[3690,12330],[3640,12250],[3590,12170],
    [3550,12100],[3520,12030],[3480,11950],[3440,11880],[3400,11830],[3380,11770],[3395,11730],[3385,11690],[3380,11600],[3370,11530],[3355,11490],
    [3345,11440],[3330,11380],[3305,11300],[3290,11200],[3270,11100]];
  const i0 = W.land.findIndex(p => p[0] === 8400 && p[1] === 11000);
  if (i0 >= 0) W.land.splice(i0, 1, ...south, ...coastNorthward);

  // Rough state outlines, for the area name when you are outside a city.
  W.statePolys = [
    { st: 'GA', pts: [[3260,11040],[3600,11120],[3880,11360],[4380,11480],[4440,11860],[4000,12120],[3700,12300],[3500,12150],[3300,11500]] },
    { st: 'KL', pts: [[4330,14420],[4720,14440],[5020,14820],[5480,15260],[5720,15620],[5960,16100],[6160,16460],[6460,16700],[6460,17300],[6600,18000],[6720,19100],[5400,19100],[4280,14520]] },
    { st: 'KA', pts: [[3700,10700],[4300,10560],[4700,9950],[5200,9880],[5800,9300],[6350,8820],[6950,8900],[7050,9800],[7150,10800],[7350,11800],[7450,13000],[7450,13650],[7050,14600],[6400,14860],[6000,15320],[5480,15260],[5020,14820],[4720,14440],[4330,14420],[3700,12300],[4000,12120],[4440,11860],[4380,11480],[3880,11360],[3760,11100]] },
    { st: 'TN', pts: [[6400,14860],[7050,14600],[8400,14600],[8400,18000],[6720,19100],[6600,18000],[6460,17300],[6460,16700],[6160,16460],[5960,16100],[5720,15620],[5480,15260],[6000,15320]] },
    { st: 'AP', pts: [[7150,10800],[8400,10900],[8400,14600],[7050,14600],[7450,13650],[7450,13000],[7350,11800]] },
    { st: 'TS', pts: [[6950,8900],[8400,8500],[8400,10900],[7150,10800],[7050,9800]] }
  ];

  const add = (k, list) => { W[k] = (W[k] || []).concat(list); };

  add('islands', [
    { name: "St Mary's Island", x: 4128, z: 13640, r: 24 }, { name: 'Netrani Island', x: 3885, z: 12965, r: 15 },
    { name: 'Grande Island', x: 3335, z: 11790, r: 18 }, { name: 'Pathiramanal', x: 5772, z: 17470, r: 13 },
    { name: 'Vivekananda Rock', x: 6575, z: 19010, r: 16 }, { name: 'Thiruvalluvar Rock', x: 6618, z: 19022, r: 11 }
  ]);
  add('lakes', [
    { name: 'Ulsoor Lake', x: 6880, z: 14000, rx: 24, rz: 20 }, { name: 'KRS Reservoir', x: 5690, z: 14470, rx: 70, rz: 36 },
    { name: 'Linganamakki Reservoir', x: 4560, z: 13000, rx: 100, rz: 34 }, { name: 'Tungabhadra Reservoir', x: 5380, z: 12060, rx: 90, rz: 56 },
    { name: 'Vembanad Lake', x: 5770, z: 17440, rx: 36, rz: 200 }, { name: 'Ashtamudi Lake', x: 5920, z: 17945, rx: 70, rz: 32 },
    { name: 'Malampuzha Dam', x: 5900, z: 16110, rx: 50, rz: 24 }, { name: 'Periyar Lake', x: 6330, z: 17505, rx: 50, rz: 28 },
    { name: 'Mayem Lake', x: 3700, z: 11420, rx: 22, rz: 16 }, { name: 'Idukki Reservoir', x: 6400, z: 17160, rx: 46, rz: 30 },
    { name: 'Kunduvada Lake', x: 5150, z: 12560, rx: 18, rz: 14 }
  ]);
  add('rivers', [
    { name: 'Mandovi', w: 34, pts: [[3820,11470],[3700,11490],[3580,11505],[3460,11510],[3340,11510]] },
    { name: 'Zuari', w: 40, pts: [[3960,11800],[3820,11765],[3680,11745],[3540,11735],[3370,11730]] },
    { name: 'Kali', w: 30, pts: [[4000,12230],[3880,12280],[3760,12300],[3660,12300]] },
    { name: 'Sharavathi', w: 26, pts: [[4700,12880],[4500,12850],[4310,12810],[4120,12770],[3930,12770]] },
    { name: 'Netravati', w: 30, pts: [[4800,14330],[4600,14320],[4450,14315],[4300,14300]] },
    { name: 'Krishna', w: 50, pts: [[4300,10520],[4800,10560],[5300,10660],[5800,10720],[6400,10820],[7000,10920],[8400,11150]] },
    { name: 'Tungabhadra', w: 36, pts: [[5300,12350],[5450,12050],[5490,11800],[5530,11680],[5700,11620],[5900,11580],[6200,11520],[6600,11400],[7100,11150]] },
    { name: 'Kaveri', w: 34, pts: [[4980,14720],[5250,14640],[5550,14545],[5800,14535],[6050,14535],[6300,14560],[6500,14650],[6800,14800],[7200,14980],[8400,15350]] },
    { name: 'Bharathapuzha', w: 30, pts: [[5800,16260],[5600,16290],[5400,16300],[5250,16300]] },
    { name: 'Periyar', w: 30, pts: [[6250,17100],[6000,17000],[5850,16950],[5640,16940],[5450,16950]] },
    { name: 'Pamba', w: 24, pts: [[6200,17620],[6000,17640],[5850,17620],[5790,17600]] }
  ]);

  add('biomes', [
    { kind: 'laterite', x: 3700, z: 11500, rx: 300, rz: 250 }, { kind: 'ghats', x: 4250, z: 11950, rx: 260, rz: 420 },
    { kind: 'ghats', x: 4500, z: 12900, rx: 300, rz: 450 }, { kind: 'ghats', x: 4750, z: 13800, rx: 260, rz: 500 },
    { kind: 'coffee', x: 5150, z: 14350, rx: 260, rz: 300 }, { kind: 'coffee', x: 5200, z: 13750, rx: 200, rz: 150 },
    { kind: 'ghats', x: 5350, z: 15100, rx: 260, rz: 260 }, { kind: 'forest', x: 5850, z: 15250, rx: 260, rz: 170 },
    { kind: 'tea', x: 6230, z: 16950, rx: 200, rz: 160 }, { kind: 'ghats', x: 6300, z: 17400, rx: 220, rz: 380 },
    { kind: 'ghats', x: 6450, z: 18000, rx: 200, rz: 300 }, { kind: 'paddy', x: 5680, z: 17650, rx: 110, rz: 140 },
    { kind: 'paddy', x: 5300, z: 16450, rx: 120, rz: 120 }, { kind: 'coconut', x: 5300, z: 16000, rx: 200, rz: 700 },
    { kind: 'coconut', x: 5700, z: 17900, rx: 220, rz: 450 }, { kind: 'coconut', x: 4400, z: 14500, rx: 160, rz: 450 },
    { kind: 'deccan', x: 5400, z: 10600, rx: 1300, rz: 700 }, { kind: 'deccan', x: 6200, z: 9500, rx: 700, rz: 500 },
    { kind: 'scrub', x: 5800, z: 12300, rx: 700, rz: 500 }, { kind: 'scrub', x: 6100, z: 11800, rx: 400, rz: 200 },
    { kind: 'forest', x: 6900, z: 16500, rx: 500, rz: 600 }, { kind: 'scrub', x: 7600, z: 13000, rx: 700, rz: 1400 }
  ]);
  add('hills', [
    { x: 4150, z: 11900, rx: 180, rz: 360, n: 26, h: [40, 110] }, { x: 4430, z: 12500, rx: 200, rz: 260, n: 24, h: [40, 100] },
    { x: 4620, z: 13300, rx: 200, rz: 300, n: 30, h: [50, 120] }, { x: 4700, z: 13870, rx: 160, rz: 200, n: 22, h: [60, 140] },
    { x: 4850, z: 14250, rx: 160, rz: 160, n: 18, h: [50, 120] }, { x: 5000, z: 14700, rx: 220, rz: 200, n: 24, h: [50, 120] },
    { x: 5250, z: 15150, rx: 200, rz: 200, n: 22, h: [50, 130] }, { x: 6050, z: 16800, rx: 260, rz: 200, n: 30, h: [70, 170] },
    { x: 6380, z: 17350, rx: 140, rz: 300, n: 26, h: [60, 150] }, { x: 6400, z: 17950, rx: 160, rz: 300, n: 26, h: [50, 130] },
    { x: 5250, z: 13560, rx: 120, rz: 80, n: 10, h: [70, 140] }, { x: 6480, z: 13600, rx: 90, rz: 70, n: 6, h: [50, 90] },
    { x: 6250, z: 14250, rx: 120, rz: 80, n: 10, h: [30, 70] }, { x: 5900, z: 11650, rx: 160, rz: 90, n: 16, h: [15, 35] },
    { x: 5600, z: 12620, rx: 140, rz: 100, n: 10, h: [25, 50] }, { x: 6250, z: 15050, rx: 60, rz: 50, n: 4, h: [40, 70] },
    { x: 7000, z: 16200, rx: 400, rz: 300, n: 26, h: [50, 120] }, { x: 3700, z: 12150, rx: 70, rz: 60, n: 5, h: [25, 45] }
  ]);
  add('forests', [
    { x: 4250, z: 11950, rx: 240, rz: 400, n: 360, kind: 'green' }, { x: 4500, z: 12900, rx: 280, rz: 420, n: 380, kind: 'green' },
    { x: 4750, z: 13800, rx: 240, rz: 480, n: 360, kind: 'green' }, { x: 5300, z: 15100, rx: 240, rz: 240, n: 240, kind: 'green' },
    { x: 5850, z: 15250, rx: 240, rz: 160, n: 300, kind: 'dry' }, { x: 6300, z: 17400, rx: 200, rz: 360, n: 320, kind: 'green' },
    { x: 6430, z: 18000, rx: 180, rz: 280, n: 220, kind: 'green' }, { x: 5150, z: 14350, rx: 240, rz: 280, n: 260, kind: 'green' },
    { x: 6900, z: 16500, rx: 450, rz: 550, n: 260, kind: 'dry' }
  ]);
  // Coconut groves along the Goa, Kanara and Malabar coasts.
  add('palms', [
    { x: 3400, z: 11420, rx: 70, rz: 160, n: 60 }, { x: 3520, z: 12000, rx: 60, rz: 160, n: 60 }, { x: 3880, z: 12650, rx: 60, rz: 180, n: 45 },
    { x: 4150, z: 13400, rx: 50, rz: 250, n: 55 }, { x: 4440, z: 14650, rx: 70, rz: 200, n: 60 }, { x: 4900, z: 15420, rx: 80, rz: 220, n: 70 },
    { x: 5230, z: 16150, rx: 80, rz: 300, n: 90 }, { x: 5420, z: 16800, rx: 60, rz: 160, n: 50 }, { x: 5580, z: 17700, rx: 80, rz: 200, n: 90 },
    { x: 5800, z: 18150, rx: 80, rz: 120, n: 50 }, { x: 6120, z: 18560, rx: 60, rz: 60, n: 30 }, { x: 5700, z: 17300, rx: 60, rz: 160, n: 45 }
  ]);

  add('zones', [
    // Goa
    { id: 'arambol', name: 'Arambol', st: 'GA', x0: 3320, z0: 11250, nx: 2, nz: 1, style: 'goa', size: 'small', food: 'GA', specials: { '0,0': 'beachBlock' } },
    { id: 'mapusa', name: 'Mapusa', st: 'GA', x0: 3560, z0: 11290, nx: 2, nz: 1, style: 'goa', size: 'small', food: 'GA', specials: { '1,0': 'marketBlock:Mapusa Friday Market' } },
    { id: 'calangute', name: 'Calangute–Baga', st: 'GA', x0: 3370, z0: 11400, nx: 2, nz: 1, style: 'goa', size: 'small', food: 'GA', specials: { '0,0': 'beachBlock' } },
    { id: 'panaji', name: 'Panaji', st: 'GA', x0: 3410, z0: 11540, nx: 4, nz: 2, style: 'goa', size: 'mid', food: 'GA',
      specials: { '1,0': 'goaChurch', '2,0': 'fontainhas', '0,1': 'maidan', '3,1': 'marketBlock:Panaji Market', '2,1': 'mall:Mall De Goa' } },
    { id: 'oldgoa', name: 'Old Goa', st: 'GA', x0: 3780, z0: 11540, nx: 1, nz: 1, style: 'goa', size: 'small', food: 'GA', specials: { '0,0': 'bomJesus' } },
    { id: 'ponda', name: 'Ponda', st: 'GA', x0: 3940, z0: 11590, nx: 2, nz: 1, style: 'goa', size: 'small', food: 'GA', specials: {} },
    { id: 'vasco', name: 'Vasco da Gama', st: 'GA', x0: 3440, z0: 11780, nx: 2, nz: 1, style: 'goa', size: 'small', food: 'GA', station: true, specials: {} },
    { id: 'margao', name: 'Margao', st: 'GA', x0: 3640, z0: 12020, nx: 3, nz: 1, style: 'goa', size: 'mid', food: 'GA', specials: { '1,0': 'goaChurch:Holy Spirit Church', '2,0': 'maidan' } },
    { id: 'mollem', name: 'Mollem', st: 'GA', x0: 4200, z0: 11700, nx: 1, nz: 1, style: 'hill', size: 'small', food: 'GA', station: true, specials: {} },
    { id: 'palolem', name: 'Palolem', st: 'GA', x0: 3620, z0: 12170, nx: 2, nz: 1, style: 'goa', size: 'small', food: 'GA', specials: { '0,0': 'beachBlock' } },
    // Southern Maharashtra, on the way to Karnataka
    { id: 'kolhapur', name: 'Kolhapur', st: 'MH', x0: 3740, z0: 10380, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'MH', specials: {} },
    // Karnataka: north
    { id: 'belagavi', name: 'Belagavi', st: 'KA', x0: 3960, z0: 11080, nx: 3, nz: 3, style: 'mid', size: 'mid', food: 'KA', specials: { '1,1': 'fortWalls:Belagavi Fort' } },
    { id: 'hubballi', name: 'Hubballi–Dharwad', st: 'KA', x0: 4420, z0: 11500, nx: 4, nz: 3, style: 'mid', size: 'big', food: 'KA', specials: { '2,1': 'biz', '0,0': 'marketBlock:Dharwad Pedha Lane' } },
    { id: 'hosapete', name: 'Hosapete', st: 'KA', x0: 5560, z0: 11740, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'KA', specials: {} },
    { id: 'ballari', name: 'Ballari', st: 'KA', x0: 6060, z0: 11820, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'KA', specials: { '0,0': 'fortWalls:Ballari Fort' } },
    { id: 'vijayapura', name: 'Vijayapura', st: 'KA', x0: 4980, z0: 10120, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'KA', specials: { '1,0': 'golGumbaz' } },
    { id: 'kalaburagi', name: 'Kalaburagi', st: 'KA', x0: 5940, z0: 9620, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'KA', specials: { '1,1': 'fortWalls:Gulbarga Fort' } },
    { id: 'bidar', name: 'Bidar', st: 'KA', x0: 6540, z0: 9040, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'KA', specials: { '1,0': 'fortWalls:Bidar Fort' } },
    { id: 'davanagere', name: 'Davanagere', st: 'KA', x0: 5180, z0: 12480, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'KA', specials: { '1,1': 'marketBlock:Benne Dosa Street' } },
    { id: 'chitradurga', name: 'Chitradurga', st: 'KA', x0: 5600, z0: 12760, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'KA', specials: {} },
    { id: 'tumakuru', name: 'Tumakuru', st: 'KA', x0: 6180, z0: 13600, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'KA', specials: {} },
    // Karnataka: Bengaluru and the south
    { id: 'bengaluru', name: 'Bengaluru', st: 'KA', x0: 6440, z0: 13880, nx: 7, nz: 6, style: 'metro', size: 'big', food: 'KA', tall: true,
      specials: { '3,0': 'bangalorePalace', '3,1': 'vidhanaSoudha', '3,2': 'maidan', '4,1': 'wankhede:rcb', '5,1': 'lakePark', '4,2': 'biz', '4,3': 'mall:Orion Mall', '5,2': 'biz',
        '2,4': 'lalbagh', '2,2': 'policeHQ', '1,1': 'hospitalBlock', '0,3': 'marketBlock:KR Market', '6,2': 'techPark:Whitefield Tech Park', '5,5': 'techPark:Electronic City', '6,0': 'techPark:Manyata Tech Park' } },
    { id: 'shivamogga', name: 'Shivamogga', st: 'KA', x0: 4880, z0: 13020, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'KA', specials: {} },
    { id: 'chikkamagaluru', name: 'Chikkamagaluru', st: 'KA', x0: 5060, z0: 13640, nx: 2, nz: 1, style: 'hill', size: 'small', food: 'KA', specials: {} },
    { id: 'hassan', name: 'Hassan', st: 'KA', x0: 5340, z0: 13960, nx: 2, nz: 2, style: 'town', size: 'mid', food: 'KA', specials: {} },
    { id: 'madikeri', name: 'Madikeri (Coorg)', st: 'KA', x0: 5040, z0: 14540, nx: 2, nz: 1, style: 'hill', size: 'small', food: 'KA', specials: {} },
    { id: 'mysuru', name: 'Mysuru', st: 'KA', x0: 5740, z0: 14600, nx: 5, nz: 4, style: 'mid', size: 'big', food: 'KA',
      specials: { '2,1': 'mysorePalace', '1,2': 'marketBlock:Devaraja Market', '3,2': 'maidan', '0,0': 'hospitalBlock', '4,3': 'goaChurch:St Philomena\'s Church', '4,0': 'mall:Mall of Mysore' } },
    { id: 'mandya', name: 'Mandya', st: 'KA', x0: 6040, z0: 14400, nx: 2, nz: 1, style: 'town', size: 'small', food: 'KA', station: true, specials: {} },
    // Karnataka coast
    { id: 'karwar', name: 'Karwar', st: 'KA', x0: 3770, z0: 12330, nx: 2, nz: 1, style: 'town', size: 'small', food: 'KA', station: true, specials: {} },
    { id: 'gokarna', name: 'Gokarna', st: 'KA', x0: 3890, z0: 12560, nx: 1, nz: 1, style: 'town', size: 'small', food: 'KA', specials: {} },
    { id: 'murudeshwar', name: 'Murudeshwar', st: 'KA', x0: 4040, z0: 12880, nx: 1, nz: 1, style: 'town', size: 'small', food: 'KA', station: true, specials: {} },
    { id: 'udupi', name: 'Udupi–Manipal', st: 'KA', x0: 4230, z0: 13620, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'KA', specials: { '1,0': 'krishnaMatha', '2,1': 'hospitalBlock' } },
    { id: 'mangaluru', name: 'Mangaluru', st: 'KA', x0: 4320, z0: 14030, nx: 4, nz: 3, style: 'mid', size: 'big', food: 'KA',
      specials: { '0,1': 'beachBlock', '2,1': 'keralaTemple:Kadri Temple', '1,2': 'hospitalBlock', '3,0': 'mall:Forum Fiza Mall', '2,0': 'goaChurch:St Aloysius Chapel' } },
    // Kerala
    { id: 'kasaragod', name: 'Kasaragod', st: 'KL', x0: 4440, z0: 14460, nx: 2, nz: 1, style: 'kerala', size: 'small', food: 'KL', station: true, specials: {} },
    { id: 'kannur', name: 'Kannur', st: 'KL', x0: 4830, z0: 15080, nx: 3, nz: 2, style: 'kerala', size: 'mid', food: 'KL', specials: {} },
    { id: 'kalpetta', name: 'Kalpetta (Wayanad)', st: 'KL', x0: 5330, z0: 15360, nx: 2, nz: 1, style: 'hill', size: 'small', food: 'KL', specials: {} },
    { id: 'kozhikode', name: 'Kozhikode', st: 'KL', x0: 5140, z0: 15700, nx: 4, nz: 3, style: 'mid', size: 'big', food: 'KL',
      specials: { '1,1': 'tankPark:Mananchira Square', '2,0': 'marketBlock:SM Street', '3,2': 'hospitalBlock', '0,2': 'mall:HiLITE Mall' } },
    { id: 'palakkad', name: 'Palakkad', st: 'KL', x0: 5800, z0: 16180, nx: 2, nz: 2, style: 'kerala', size: 'mid', food: 'KL', specials: { '1,1': 'fortWalls:Palakkad Fort' } },
    { id: 'guruvayur', name: 'Guruvayur', st: 'KL', x0: 5330, z0: 16330, nx: 1, nz: 1, style: 'kerala', size: 'small', food: 'KL', station: true, specials: { '0,0': 'keralaTemple:Guruvayur Temple' } },
    { id: 'thrissur', name: 'Thrissur', st: 'KL', x0: 5440, z0: 16440, nx: 3, nz: 2, style: 'kerala', size: 'mid', food: 'KL', specials: { '1,0': 'keralaTemple:Vadakkunnathan Temple' } },
    { id: 'kochi', name: 'Kochi', st: 'KL', x0: 5510, z0: 16980, nx: 4, nz: 3, style: 'metro', size: 'big', food: 'KL', tall: true,
      specials: { '0,0': 'fontainhas:Fort Kochi', '1,1': 'biz', '2,1': 'biz', '3,2': 'hospitalBlock', '2,2': 'mall:Lulu Mall', '3,0': 'techPark:Infopark' } },
    { id: 'munnar', name: 'Munnar', st: 'KL', x0: 6160, z0: 16880, nx: 2, nz: 1, style: 'hill', size: 'small', food: 'KL', specials: {} },
    { id: 'thekkady', name: 'Thekkady', st: 'KL', x0: 6250, z0: 17360, nx: 1, nz: 1, style: 'hill', size: 'small', food: 'KL', specials: {} },
    { id: 'kottayam', name: 'Kottayam', st: 'KL', x0: 5850, z0: 17380, nx: 2, nz: 2, style: 'kerala', size: 'mid', food: 'KL', specials: {} },
    { id: 'alappuzha', name: 'Alappuzha', st: 'KL', x0: 5540, z0: 17460, nx: 2, nz: 2, style: 'kerala', size: 'mid', food: 'KL', specials: { '0,0': 'beachBlock' } },
    { id: 'kollam', name: 'Kollam', st: 'KL', x0: 5810, z0: 18020, nx: 3, nz: 2, style: 'kerala', size: 'mid', food: 'KL', specials: {} },
    { id: 'varkala', name: 'Varkala', st: 'KL', x0: 5900, z0: 18260, nx: 1, nz: 1, style: 'kerala', size: 'small', food: 'KL', station: true, specials: {} },
    { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', st: 'KL', x0: 6090, z0: 18290, nx: 4, nz: 3, style: 'mid', size: 'big', food: 'KL',
      specials: { '2,1': 'padmanabhaswamy', '1,0': 'maidan', '3,0': 'techPark:Technopark', '0,1': 'hospitalBlock', '2,2': 'policeHQ', '1,2': 'mall:Lulu Mall Thiruvananthapuram' } }
  ]);

  add('highways', [
    // NH66, the west coast road, from the Konkan to Kanyakumari
    { name: 'NH66 Konkan–Goa', pts: [[3120,10390],[3190,10600],[3260,10850],[3330,11050],[3450,11150],[3520,11230],[3560,11310]] },
    { name: 'NH66 Atal Setu', pts: [[3600,11370],[3575,11450],[3560,11540]] },
    { name: 'NH66 Zuari Bridge', pts: [[3650,11700],[3700,11760],[3830,11860],[3860,11960],[3860,12020]] },
    { name: 'NH66 Margao–Karwar', pts: [[3800,12100],[3820,12240],[3850,12330]] },
    { name: 'NH66 Karwar–Honnavar', pts: [[3850,12410],[3930,12560]] },
    { name: 'NH66 Gokarna–Murudeshwar', pts: [[3970,12640],[4010,12760],[4040,12880]] },
    { name: 'NH66 Bhatkal–Udupi', pts: [[4080,12960],[4100,13080],[4170,13300],[4210,13480],[4250,13620]] },
    { name: 'NH66 Udupi–Mangaluru', pts: [[4330,13780],[4350,13900],[4360,14030]] },
    { name: 'NH66 Mangaluru–Kasaragod', pts: [[4400,14270],[4420,14380],[4460,14460]] },
    { name: 'NH66 Kasaragod–Kannur', pts: [[4520,14540],[4600,14760],[4720,14950],[4860,15080]] },
    { name: 'NH66 Kannur–Kozhikode', pts: [[4950,15240],[5000,15420],[5100,15580],[5160,15700]] },
    { name: 'NH66 Kozhikode–Guruvayur', pts: [[5240,15940],[5270,16100],[5320,16250],[5350,16330]] },
    { name: 'NH66 Guruvayur–Kochi', pts: [[5370,16410],[5410,16620],[5460,16800],[5530,16980]] },
    { name: 'NH66 Kochi–Alappuzha', pts: [[5570,17220],[5580,17340],[5590,17460]] },
    { name: 'NH66 Alappuzha–Kollam', pts: [[5620,17620],[5680,17780],[5760,17920],[5830,18020]] },
    { name: 'NH66 Kollam–Thiruvananthapuram', pts: [[5900,18180],[5960,18260],[6040,18280],[6090,18300]] },
    { name: 'Kovalam Road', pts: [[6170,18530],[6150,18580]] },
    { name: 'Kanyakumari Road', pts: [[6410,18400],[6520,18500],[6600,18880]] },
    // Goa local roads
    { name: 'Arambol Road', pts: [[3480,11290],[3560,11300]] },
    { name: 'Calangute Road', pts: [[3530,11440],[3570,11440]] },
    { name: 'NH748 Panaji–Ponda', pts: [[3730,11620],[3780,11620],[3860,11620],[3940,11630]] },
    { name: 'NH748 Ponda–Mollem', pts: [[4100,11640],[4200,11720]] },
    { name: 'NH748 Anmod Ghat', pts: [[4280,11700],[4300,11560],[4240,11440],[4140,11320]] },
    { name: 'NH366 Vasco–Verna', pts: [[3600,11820],[3700,11810],[3755,11803]] },
    { name: 'Mopa Link Road', pts: [[3700,11244],[3700,11290]] },
    { name: 'Colva Road', pts: [[3640,12060],[3560,12010]] },
    { name: 'Palolem Road', pts: [[3780,12210],[3812,12210]] },
    { name: 'Dudhsagar Jeep Track', pts: [[4280,11760],[4340,11790],[4370,11800]] },
    // NH48, Pune to Bengaluru
    { name: 'NH48 Pune–Kolhapur', pts: [[4700,9500],[4650,9800],[4500,10050],[4200,10250],[3980,10420]] },
    { name: 'NH48 Kolhapur–Belagavi', pts: [[3860,10540],[3950,10800],[4040,11080]] },
    { name: 'NH48 Belagavi–Dharwad', pts: [[4200,11200],[4320,11320],[4420,11500]] },
    { name: 'NH48 Hubballi–Davanagere', pts: [[4740,11740],[4900,11950],[5050,12200],[5180,12480]] },
    { name: 'NH48 Davanagere–Chitradurga', pts: [[5420,12600],[5500,12700],[5600,12780]] },
    { name: 'NH48 Chitradurga–Tumakuru', pts: [[5760,12920],[5950,13200],[6100,13450],[6180,13620]] },
    { name: 'NH48 Tumakuru–Bengaluru', pts: [[6340,13740],[6400,13820],[6440,13900]] },
    // Bengaluru
    { name: 'NH44 Airport Road', pts: [[6800,13624],[6800,13760],[6800,13880]] },
    { name: 'Bengaluru–Mysuru Expressway', kind: 'exp', pts: [[6440,14300],[6300,14380],[6200,14430]] },
    { name: 'Bengaluru–Mysuru Expressway (Mandya)', kind: 'exp', pts: [[6040,14450],[5960,14520],[5900,14600]] },
    { name: 'NH75 Bengaluru–Hassan', pts: [[6440,14040],[6200,14000],[5900,13980],[5500,14040]] },
    { name: 'NH75 Shiradi Ghat', pts: [[5340,14040],[5150,14080],[4980,14120],[4800,14140],[4640,14150]] },
    { name: 'Nandi Hills Road', pts: [[6620,13620],[6560,13590],[6520,13570]] },
    { name: 'Electronic City Elevated Tollway', kind: 'exp', pts: [[6880,14360],[6960,14480],[7050,14600]] },
    // Karnataka north and the Deccan
    { name: 'Pune–Vijayapura Highway', pts: [[4800,9300],[5000,9600],[5060,10120]] },
    { name: 'Vijayapura–Kalaburagi Road', pts: [[5220,10200],[5600,9900],[5940,9700]] },
    { name: 'Kalaburagi–Bidar Road', pts: [[6180,9620],[6400,9300],[6540,9200]] },
    { name: 'Bidar–Aurangabad Road', pts: [[6620,9040],[6580,8700],[6540,8300],[6500,8100],[6460,7980]] },
    { name: 'NH50 Vijayapura–Hosapete', pts: [[5140,10280],[5300,10800],[5450,11300],[5600,11740]] },
    { name: 'NH67 Hubballi–Hosapete', pts: [[4740,11600],[5100,11650],[5400,11720],[5560,11790]] },
    { name: 'Hampi Road', pts: [[5680,11740],[5720,11700],[5760,11690]] },
    { name: 'Hosapete–Ballari Road', pts: [[5720,11820],[5900,11840],[6060,11860]] },
    { name: 'Ballari–Bengaluru (NH44)', pts: [[6140,11980],[6400,12500],[6700,13100],[6800,13500]] },
    { name: 'Hubballi–Karwar Road', pts: [[4420,11700],[4250,11950],[4050,12200],[3930,12330]] },
    // Malnad and the ghats
    { name: 'Honnavar–Jog Falls Road', pts: [[3990,12740],[4150,12790],[4280,12840]] },
    { name: 'Shivamogga–Jog Falls Road', pts: [[4880,13040],[4700,12940],[4500,12890],[4330,12860]] },
    { name: 'Shivamogga–Davanagere Road', pts: [[5120,13040],[5200,12800],[5260,12640]] },
    { name: 'Agumbe Ghat', pts: [[4900,13180],[4720,13380],[4560,13520],[4470,13660]] },
    { name: 'Shivamogga–Chikkamagaluru Road', pts: [[5040,13180],[5100,13450],[5120,13640]] },
    { name: 'Chikkamagaluru–Hassan Road', pts: [[5220,13700],[5300,13850],[5380,13960]] },
    { name: 'Mysuru–Madikeri Road', pts: [[5740,14680],[5500,14640],[5300,14600],[5200,14580]] },
    { name: 'Sampaje Ghat', pts: [[5040,14560],[4880,14420],[4740,14300],[4640,14230]] },
    { name: 'NH766 Mysuru–Bandipur', pts: [[5900,14920],[5880,15100],[5860,15300]] },
    { name: 'NH766 Bandipur–Wayanad', pts: [[5860,15300],[5650,15380],[5490,15400]] },
    { name: 'Thamarassery Ghat', pts: [[5330,15420],[5300,15560],[5250,15640],[5280,15700]] },
    { name: 'Mysuru–Chamundi Hill Road', pts: [[6140,14900],[6200,14930],[6230,14950]] },
    // Kerala
    { name: 'NH544 Thrissur–Palakkad', pts: [[5680,16500],[5760,16380],[5800,16300]] },
    { name: 'NH544 Thrissur–Kochi', pts: [[5520,16600],[5500,16800],[5530,16980]] },
    { name: 'NH85 Kochi–Munnar', pts: [[5830,17020],[6000,16960],[6160,16920]] },
    { name: 'Munnar–Thekkady Road', pts: [[6240,16960],[6280,17150],[6290,17360]] },
    { name: 'NH183 Kollam–Kottayam', pts: [[6050,18020],[6060,17800],[5990,17620],[5930,17540]] },
    { name: 'NH183 Kottayam–Kumily', pts: [[6010,17460],[6150,17420],[6250,17400]] },
    { name: 'MC Road Kochi–Kottayam', pts: [[5830,17220],[5840,17300],[5860,17380]] },
    { name: 'Sabarimala Road', pts: [[6010,17540],[6120,17560],[6200,17570]] },
    { name: 'Athirappilly Road', pts: [[5680,16560],[5740,16640],[5790,16700]] },
    { name: 'Wayanad–Kannur Road', pts: [[5330,15400],[5200,15330],[5100,15250],[5070,15240]] },
    { name: 'Kasaragod–Bekal Road', pts: [[4520,14540],[4490,14590]] },
    { name: 'Palakkad–Coimbatore Road', pts: [[5960,16260],[6200,16280],[6500,16300]] },
    { name: 'Fatorda Stadium Road', pts: [[3880,12100],[3896,12150],[3908,12150]] },
    { name: 'Kanteerava Stadium Road', pts: [[7000,14080],[7034,14080]] },
    { name: 'Kaloor Stadium Road', pts: [[5830,17110],[5859,17110]] },
    { name: 'Mangaluru–Kasaragod Coastal Link', pts: [[4640,14190],[4800,14300],[4900,14450]] }
  ]);

  add('airports', [
    { id: 'GOX', name: 'Mopa Airport (Goa)', zone: 'mapusa', x: 3700, z: 11180, L: 320, side: 1, access: [[3700,11244],[3700,11300]] },
    { id: 'GOI', name: 'Dabolim Airport (Goa)', zone: 'vasco', x: 3640, z: 11920, L: 300, side: 1, access: [[3640,11984],[3640,12020]] },
    { id: 'IXG', name: 'Belagavi Airport', zone: 'belagavi', x: 4300, z: 11000, L: 260, side: 1, access: [[4300,11064],[4300,11120],[4200,11120]] },
    { id: 'HBX', name: 'Hubballi Airport', zone: 'hubballi', x: 4600, z: 11420, L: 280, side: 1, access: [[4600,11484],[4600,11500]] },
    { id: 'BLR', name: 'Kempegowda Airport (Bengaluru)', zone: 'bengaluru', x: 6800, z: 13560, L: 440, side: 1, access: [[6800,13624],[6800,13640]] },
    { id: 'MYQ', name: 'Mysuru Airport', zone: 'mysuru', x: 5560, z: 14800, L: 260, side: 1, access: [[5560,14864],[5560,14920],[5740,14920]] },
    { id: 'IXE', name: 'Mangaluru Airport', zone: 'mangaluru', x: 4760, z: 13960, L: 300, side: 1, access: [[4760,14024],[4760,14110],[4640,14110]] },
    { id: 'GBI', name: 'Kalaburagi Airport', zone: 'kalaburagi', x: 6300, z: 9850, L: 260, side: -1, access: [[6300,9786],[6300,9700],[6180,9700]] },
    { id: 'CNN', name: 'Kannur Airport', zone: 'kannur', x: 5300, z: 15060, L: 280, side: 1, access: [[5300,15124],[5300,15160],[5050,15160]] },
    { id: 'CCJ', name: 'Calicut Airport', zone: 'kozhikode', x: 5420, z: 16080, L: 280, side: -1, access: [[5420,16016],[5420,15940]] },
    { id: 'COK', name: 'Cochin Airport', zone: 'kochi', x: 5720, z: 16860, L: 300, side: -1, access: [[5720,16796],[5720,16770],[5500,16770]] },
    { id: 'TRV', name: 'Thiruvananthapuram Airport', zone: 'thiruvananthapuram', x: 6330, z: 18620, L: 280, side: -1, access: [[6330,18556],[6330,18530]] }
  ]);

  add('landmarks', [
    // Goa
    { kind: 'aguadaFort', x: 3362, z: 11452 }, { kind: 'chaporaFort', x: 3334, z: 11368 }, { kind: 'seCathedral', x: 3820, z: 11668 },
    { kind: 'mangueshi', x: 3990, z: 11540 }, { kind: 'dudhsagar', x: 4400, z: 11800 }, { kind: 'beachShacks', x: 3530, z: 11990 },
    { kind: 'beachShacks', x: 3366, z: 11365 }, { kind: 'casinoBoats', x: 3540, z: 11510 },
    // Karnataka
    { kind: 'hampi', x: 5800, z: 11680 }, { kind: 'jogFalls', x: 4310, z: 12812 }, { kind: 'murudeshwar', x: 3998, z: 12930 },
    { kind: 'nandiHills', x: 6490, z: 13560 }, { kind: 'kempegowda', x: 6960, z: 13652 }, { kind: 'chitradurgaFort', x: 5700, z: 12680 },
    { kind: 'belurTemple', x: 5280, z: 13860 }, { kind: 'gommateshwara', x: 5700, z: 14200 }, { kind: 'chamundiHill', x: 6230, z: 14980 },
    { kind: 'krsDam', x: 5785, z: 14472 }, { kind: 'srirangapatna', x: 5960, z: 14495 }, { kind: 'goldenTemple', x: 5300, z: 14800 },
    { kind: 'parkGate:BANDIPUR TIGER RESERVE', x: 5875, z: 15150 }, { kind: 'lighthouse:Kaup', x: 4228, z: 13860 },
    { kind: 'omBeach', x: 3922, z: 12690 },
    // Kerala
    { kind: 'bekalFort', x: 4470, z: 14612 }, { kind: 'stAngeloFort', x: 4778, z: 15150 }, { kind: 'chineseNets', x: 5466, z: 17040 },
    { kind: 'houseboats', x: 5770, z: 17380 }, { kind: 'houseboats', x: 5765, z: 17560 }, { kind: 'athirappilly', x: 5800, z: 16720 },
    { kind: 'sabarimala', x: 6220, z: 17585 }, { kind: 'jatayu', x: 6130, z: 17830 }, { kind: 'varkalaCliff', x: 5874, z: 18300 },
    { kind: 'lighthouse:Kovalam', x: 6130, z: 18598 }, { kind: 'lighthouse:Alappuzha', x: 5528, z: 17532 }, { kind: 'idukkiDam', x: 6350, z: 17160 },
    { kind: 'teaFactory', x: 6195, z: 17012 }, { kind: 'beachShacks', x: 6125, z: 18565 }, { kind: 'parkGate:PERIYAR TIGER RESERVE', x: 6330, z: 17450 },
    { kind: 'kanyakumari', x: 6600, z: 18910 },
    { kind: 'stadiumOval:goa', x: 3962, z: 12150 }, { kind: 'stadiumOval:blr', x: 7092, z: 14080 }, { kind: 'stadiumOval:ker', x: 5922, z: 17110 }
  ]);

  add('places', [
    // Goa
    ['Arambol Beach', 3330, 11290], ['Chapora Fort', 3345, 11372], ['Anjuna Flea Market', 3365, 11345], ['Calangute Beach', 3378, 11420], ['Fort Aguada', 3378, 11468],
    ['Mapusa Friday Market', 3680, 11330], ['Mopa Airport', 3700, 11244], ['Mayem Lake', 3700, 11420], ['Immaculate Conception Church', 3530, 11580], ['Fontainhas Latin Quarter', 3610, 11580],
    ['Miramar Beach', 3395, 11620], ['Basilica of Bom Jesus', 3820, 11580], ['Se Cathedral', 3820, 11668], ['Mangueshi Temple', 3990, 11540], ['Dudhsagar Falls', 4400, 11800],
    ['Colva Beach', 3530, 11990], ['Palolem Beach', 3650, 12210], ['Grande Island', 3335, 11790], ['Mandovi Casino Boats', 3540, 11510],
    // Karnataka
    ['Belagavi Fort', 4080, 11200], ['Hubballi Junction', 4580, 11620], ['Hampi Stone Chariot', 5800, 11680], ['Gol Gumbaz', 5100, 10160], ['Gulbarga Fort', 6060, 9740],
    ['Bidar Fort', 6660, 9080], ['Chitradurga Fort', 5700, 12680], ['Jog Falls', 4310, 12812], ['Murudeshwar Shiva Statue', 3998, 12930], ['Om Beach, Gokarna', 3922, 12690],
    ["St Mary's Island", 4128, 13640], ['Udupi Sri Krishna Matha', 4350, 13660], ['Kaup Lighthouse', 4228, 13860], ['Panambur Beach', 4360, 14150], ['Kadri Temple', 4520, 14150],
    ['Agumbe Sunset Point', 4560, 13520], ['Belur Chennakeshava Temple', 5280, 13860], ['Shravanabelagola', 5700, 14200], ['Vidhana Soudha', 6720, 14000], ['Cubbon Park', 6720, 14080],
    ['Lalbagh Glasshouse', 6640, 14240], ['Bangalore Palace', 6720, 13920], ['Ulsoor Lake', 6880, 14000], ['Chinnaswamy Stadium', 6800, 14000], ['Electronic City', 6880, 14320],
    ['Nandi Hills', 6490, 13560], ['Statue of Prosperity', 6960, 13652], ['Mysore Palace', 5960, 14720], ['Chamundi Hill', 6230, 14980], ['Brindavan Gardens', 5785, 14472],
    ['Srirangapatna Fort', 5960, 14495], ['Namdroling Golden Temple', 5300, 14800], ['Raja\'s Seat, Madikeri', 5120, 14580], ['Bandipur Tiger Reserve', 5875, 15150], ['Kudremukh', 4700, 13870],
    // Kerala
    ['Bekal Fort', 4470, 14612], ['St Angelo Fort', 4778, 15150], ['Muzhappilangad Drive-in Beach', 4840, 15270], ['Kozhikode Beach', 5100, 15800], ['Mananchira Square', 5260, 15820],
    ['Edakkal Caves', 5480, 15330], ['Guruvayur Temple', 5370, 16370], ['Vadakkunnathan Temple', 5560, 16480], ['Athirappilly Falls', 5800, 16720], ['Malampuzha Dam', 5900, 16110],
    ['Chinese Fishing Nets', 5466, 17040], ['Fort Kochi', 5550, 17020], ['Munnar Tea Gardens', 6230, 16950], ['Idukki Arch Dam', 6350, 17160], ['Periyar Tiger Reserve', 6330, 17450],
    ['Sabarimala', 6220, 17585], ['Kumarakom Backwaters', 5810, 17400], ['Alappuzha Houseboats', 5770, 17560], ['Alappuzha Beach', 5530, 17500], ['Jatayu Earth\'s Center', 6130, 17830],
    ['Ashtamudi Lake', 5920, 17945], ['Varkala Cliff', 5874, 18300], ['Padmanabhaswamy Temple', 6290, 18410], ['Kovalam Beach', 6130, 18598], ['Kanyakumari', 6600, 18910], ['Fatorda Stadium', 3962, 12150], ['Sree Kanteerava Stadium', 7092, 14080], ['Jawaharlal Nehru Stadium, Kochi', 5922, 17110]
  ]);

  add('tolls', [[6250, 14405, 'Kaniminike Toll'], [5980, 14505, 'Srirangapatna Toll'], [6960, 14480, 'Electronic City Toll'], [4320, 11320, 'Hattargi Toll'], [5510, 16700, 'Paliyekkara Toll'], [5990, 13200, 'Chitradurga Toll']]);
  add('speedCams', [[6330, 14370], [6000, 14490], [5200, 12520], [4500, 10060], [5410, 16620]]);
  add('checkpoints', [[3300, 11000], [4400, 14420], [5870, 15320], [4300, 11550]]);
  add('floods', [[6600, 14200], [5600, 17150], [5150, 15860], [4400, 14180]]);
  add('ferries', [
    { a: 'Panaji jetty', ax: 3480, az: 11540, b: 'Betim jetty', bx: 3480, bz: 11478, za: 'panaji', zb: 'calangute' },
    { a: 'Fort Kochi jetty', ax: 5505, az: 17000, b: 'Vypin jetty', bx: 5455, bz: 16925, za: 'kochi', zb: 'kochi' },
    { a: 'Malpe jetty', ax: 4205, az: 13650, b: "St Mary's Island", bx: 4133, bz: 13628, za: 'udupi', zb: 'udupi' },
    { a: 'Alappuzha boat jetty', ax: 5716, az: 17540, b: 'Kumarakom boat jetty', bx: 5826, bz: 17420, za: 'alappuzha', zb: 'kottayam' }
  ]);

  add('homes', [
    { id: 'fontainhas', zone: 'panaji', name: 'Fontainhas Portuguese house', type: 'portuguese', price: 220000 },
    { id: 'assagao', zone: 'mapusa', name: 'Assagao villa with pool', type: 'villa', price: 450000 },
    { id: 'palolemhut', zone: 'palolem', name: 'Palolem beach hut', type: 'hut', price: 40000 },
    { id: 'blrflat', zone: 'bengaluru', name: 'Bengaluru tech apartment', type: 'flat', price: 120000 },
    { id: 'indiranagar', zone: 'bengaluru', name: 'Indiranagar bungalow', type: 'bungalow', price: 320000 },
    { id: 'mysuruheritage', zone: 'mysuru', name: 'Mysuru heritage house', type: 'haveli', price: 180000 },
    { id: 'coorgestate', zone: 'madikeri', name: 'Coorg coffee estate homestay', type: 'cottage', price: 260000 },
    { id: 'gokarnacot', zone: 'gokarna', name: 'Gokarna beach cottage', type: 'hut', price: 60000 },
    { id: 'hampiguest', zone: 'hosapete', name: 'Hampi riverside guesthouse', type: 'cottage', price: 90000 },
    { id: 'nalukettu', zone: 'thrissur', name: 'Thrissur nalukettu', type: 'nalukettu', price: 280000 },
    { id: 'kochiflat', zone: 'kochi', name: 'Kochi high-rise flat', type: 'flat', price: 140000 },
    { id: 'houseboat', zone: 'alappuzha', name: 'Alappuzha houseboat home', type: 'houseboat', price: 200000 },
    { id: 'munnarbung', zone: 'munnar', name: 'Munnar tea estate bungalow', type: 'cottage', price: 240000 },
    { id: 'varkalavilla', zone: 'varkala', name: 'Varkala cliff villa', type: 'villa', price: 380000 },
    { id: 'fishercot', zone: 'kollam', name: 'Kollam fisher cottage', type: 'hut', price: 35000 }
  ]);

  Object.assign(W.menus, {
    GA: [['xitkodi','Fish curry rice','Xit kodi, the everyday Goan lunch',120,{hunger:60,bladder:-6},'meal'],['ravafish','Rava fried fish','Kingfish in semolina crust',180,{hunger:45},'meal'],
      ['xacuti','Chicken xacuti','Roasted coconut and spices with poi',200,{hunger:65},'meal'],['balchao','Prawn balchão','Fiery pickled prawns with pao',220,{hunger:50},'meal'],
      ['rosomelette','Ros omelette','Omelette in xacuti gravy with pao',70,{hunger:35},'snack'],['bebinca','Bebinca','Layered coconut cake',60,{hunger:14,energy:6},'snack'],
      ['solkadhi','Sol kadhi','Kokum and coconut cooler',30,{hunger:4,bladder:-12},'drink'],['cashew','Cashew juice','Fresh from the orchard',40,{hunger:4,energy:6,bladder:-10},'drink']],
    KA: [['masaladosa','Masala dosa','Crisp dosa with potato palya',60,{hunger:40},'meal'],['bennedosa','Benne dosa','Davanagere butter dosa',70,{hunger:42},'meal'],
      ['idlivada','Idli vada','With sambar and chutney',45,{hunger:30},'snack'],['bisibele','Bisi bele bath','Hot lentil rice with ghee',80,{hunger:55,energy:4},'meal'],
      ['udupimeals','Udupi meals','On a banana leaf',120,{hunger:75,energy:6,bladder:-8},'meal'],['ghee','Chicken ghee roast','Mangaluru style, with neer dosa',220,{hunger:65},'meal'],
      ['mysorepak','Mysore pak','Melt-in-the-mouth sweet',40,{hunger:10,energy:8},'snack'],['filter','Filter coffee','Frothy, in a davara-tumbler',25,{hunger:3,energy:14,bladder:-8},'drink'],
      ['majjige','Majjige','Spiced buttermilk',20,{hunger:3,bladder:-12},'drink']],
    KL: [['puttu','Puttu kadala','Steamed rice cake with black chickpea curry',60,{hunger:40},'meal'],['appam','Appam and stew','Lacy appam with vegetable stew',80,{hunger:45},'meal'],
      ['porotta','Porotta beef fry','Flaky porotta, spicy fry',150,{hunger:65},'meal'],['sadhya','Kerala sadhya','A full meal on a banana leaf',180,{hunger:85,energy:8,bladder:-8},'meal'],
      ['karimeen','Karimeen pollichathu','Pearl spot in banana leaf',260,{hunger:55},'meal'],['biryani','Thalassery biryani','Fragrant kaima rice',190,{hunger:75},'meal'],
      ['pazhampori','Pazhampori','Banana fritters',20,{hunger:16},'snack'],['halwa','Kozhikode halwa','From SM Street',40,{hunger:10,energy:8},'snack'],
      ['chaya','Chaya','Pulled milk tea',12,{hunger:3,energy:12,bladder:-8},'drink'],['sulaimani','Sulaimani','Lemon black tea',15,{hunger:2,energy:10,bladder:-8},'drink'],
      ['coconut','Coconut water','Straight from the shell',40,{hunger:4,bladder:-14},'drink']]
  });
  W.foodNames = Object.assign(W.foodNames || {}, {
    GA: ['Coconut stall', 'Goan taverna', 'Fish thali shack'], KA: ['Darshini', 'Udupi hotel', 'Military hotel'], KL: ['Chaya kada', 'Thattukada', 'Kerala meals hotel']
  });

  // Where a new player starts in each playable state.
  W.startZones = Object.assign(W.startZones || {}, { MH: 'mumbai', GJ: 'ahmedabad', RJ: 'jaipur', DD: 'daman', DN: 'silvassa', GA: 'panaji', KA: 'bengaluru', KL: 'kochi' });
})();
