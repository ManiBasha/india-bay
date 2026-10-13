// Beta v1.01.03 map pass, from the Maharashtra, Gujarat, Rajasthan and Lakshadweep build plans.
// Loaded after world-southwest.js. Adds the main missing cities, their roads, airports and landmarks,
// fixes names that changed, and adds the Lakshadweep islands (ship from Kochi, flight to Agatti).
// Same units as the rest of the map: metres, x grows east, z grows south, 80 m blocks.
(function () {
  const W = window.WORLD;
  if (!W || W.plus103) return;
  W.plus103 = true;
  const add = (k, list) => { W[k] = (W[k] || []).concat(list); };
  const zone = id => W.zones.find(z => z.id === id);
  W.states.LD = 'Lakshadweep';

  /* ---------- names that changed ---------- */
  const rn = (id, name) => { const z = zone(id); if (z) z.name = name; };
  // Kolhapur (already on the map): the Mahalaxmi temple; NH48 now runs Pune → Satara → Kolhapur
  { const k = zone('kolhapur'); if (k) k.specials = Object.assign(k.specials || {}, { '1,0': 'mahalaxmi' }); }
  { const i = W.highways.findIndex(h => h.name === 'NH48 Pune–Kolhapur');
    const nh = [{ name: 'NH48 Pune–Satara', pts: [[4700, 9500], [4650, 9800], [4520, 10060]] }, { name: 'NH48 Satara–Kolhapur', pts: [[4500, 10220], [4360, 10300], [4200, 10350], [3980, 10420]] }];
    if (i >= 0) W.highways.splice(i, 1, ...nh); else W.highways.push(...nh); }
  // NH66 down the Konkan coast now passes through Ratnagiri and Malvan
  { const i = W.highways.findIndex(h => h.name === 'NH66 Konkan–Goa');
    const nh = [{ name: 'NH66 Konkan Highway (Ganpatipule–Ratnagiri)', pts: [[3120, 10390], [3170, 10460], [3230, 10520]] },
      { name: 'NH66 Konkan Highway (Ratnagiri–Malvan)', pts: [[3280, 10680], [3320, 10760], [3340, 10830]] },
      { name: 'NH66 Konkan–Goa', pts: [[3400, 10910], [3420, 11050], [3450, 11150], [3520, 11230], [3534, 11290], [3560, 11290]] }];
    if (i >= 0) W.highways.splice(i, 1, ...nh); }
  rn('aurangabad', 'Chhatrapati Sambhajinagar');
  rn('kevadia', 'Ekta Nagar (Kevadia)');
  for (const a of W.airports) {
    if (a.id === 'IXU') a.name = 'Chhatrapati Sambhajinagar Airport';
    if (a.id === 'BOM') a.name = 'Chhatrapati Shivaji Maharaj Airport, Mumbai';
    if (a.id === 'NAG') a.name = 'Dr Babasaheb Ambedkar Airport, Nagpur';
    if (a.id === 'AMD') a.name = 'Sardar Vallabhbhai Patel Airport, Ahmedabad';
  }
  for (const h of W.highways) {
    if (h.name === 'Samruddhi Shirdi–Aurangabad') h.name = 'Samruddhi Shirdi–Sambhajinagar';
    if (h.name === 'Samruddhi Aurangabad–Nagpur') h.name = 'Samruddhi Sambhajinagar–Nagpur';
    if (h.name === 'Vadodara–Kevadia Road') h.name = 'Vadodara–Ekta Nagar Road';
  }

  /* ---------- new cities and towns ---------- */
  add('zones', [
    // Maharashtra
    { id: 'satara', name: 'Satara', st: 'MH', x0: 4440, z0: 10060, nx: 2, nz: 2, style: 'town', size: 'small', food: 'MH', specials: {} },
    { id: 'ratnagiri', name: 'Ratnagiri', st: 'MH', x0: 3200, z0: 10520, nx: 2, nz: 2, style: 'town', size: 'small', food: 'MH', specials: {} },
    { id: 'malvan', name: 'Malvan', st: 'MH', x0: 3300, z0: 10830, nx: 2, nz: 1, style: 'town', size: 'small', food: 'MH', specials: {} },
    { id: 'solapur', name: 'Solapur', st: 'MH', x0: 5600, z0: 9200, nx: 3, nz: 3, style: 'town', size: 'mid', food: 'MH', specials: { '1,1': 'fortWalls' } },
    { id: 'pandharpur', name: 'Pandharpur', st: 'MH', x0: 5240, z0: 9480, nx: 2, nz: 1, style: 'town', size: 'small', food: 'MH', specials: { '0,0': 'vitthal' } },
    { id: 'amravati', name: 'Amravati', st: 'MH', x0: 7050, z0: 7440, nx: 3, nz: 2, style: 'town', size: 'mid', food: 'MH', specials: {} },
    // Gujarat
    { id: 'gandhinagar', name: 'Gandhinagar', st: 'GJ', x0: 3060, z0: 4290, nx: 3, nz: 2, style: 'gujarat', size: 'mid', food: 'GJ', specials: { '1,0': 'akshardham' } },
    { id: 'bhavnagar', name: 'Bhavnagar', st: 'GJ', x0: 2280, z0: 5660, nx: 3, nz: 2, style: 'gujarat', size: 'mid', food: 'GJ', specials: {} },
    { id: 'jamnagar', name: 'Jamnagar', st: 'GJ', x0: 1000, z0: 4800, nx: 3, nz: 2, style: 'gujarat', size: 'mid', food: 'GJ', specials: { '1,0': 'lakhota' } },
    { id: 'junagadh', name: 'Junagadh', st: 'GJ', x0: 1380, z0: 5640, nx: 2, nz: 2, style: 'town', size: 'small', food: 'GJ', specials: { '1,0': 'mahabat' } },
    { id: 'porbandar', name: 'Porbandar', st: 'GJ', x0: 700, z0: 5600, nx: 2, nz: 1, style: 'town', size: 'small', food: 'GJ', specials: { '0,0': 'kirtiMandir' } },
    { id: 'saputara', name: 'Saputara', st: 'GJ', x0: 4260, z0: 7420, nx: 2, nz: 1, style: 'hill', size: 'small', food: 'GJ', specials: {} },
    { id: 'diu', name: 'Diu', st: 'DD', x0: 1700, z0: 6250, nx: 2, nz: 1, style: 'town', size: 'small', food: 'DD', specials: { '1,0': 'fortWalls' } },
    // Rajasthan
    { id: 'bikaner', name: 'Bikaner', st: 'RJ', x0: 3000, z0: 300, nx: 3, nz: 3, style: 'gold', size: 'mid', food: 'RJ', specials: { '1,1': 'junagarh' } },
    { id: 'chittorgarh', name: 'Chittorgarh', st: 'RJ', x0: 4500, z0: 2950, nx: 3, nz: 2, style: 'town', size: 'small', food: 'RJ', specials: { '1,0': 'vijayStambh' } },
    { id: 'bundi', name: 'Bundi', st: 'RJ', x0: 5340, z0: 2520, nx: 2, nz: 1, style: 'blue', size: 'small', food: 'RJ', specials: {} },
    { id: 'kota', name: 'Kota', st: 'RJ', x0: 5650, z0: 2850, nx: 3, nz: 3, style: 'town', size: 'mid', food: 'RJ', specials: {} },
    // Lakshadweep (islands are enlarged so a small town fits; the lagoons are painted around them)
    { id: 'kavaratti', name: 'Kavaratti', st: 'LD', x0: 2354, z0: 16390, nx: 2, nz: 1, style: 'town', size: 'small', food: 'LD', island: true, specials: { '1,0': 'ujraMosque' } },
    { id: 'agatti', name: 'Agatti', st: 'LD', x0: 1923, z0: 16040, nx: 1, nz: 1, style: 'town', size: 'small', food: 'LD', island: true, specials: {} },
    { id: 'minicoy', name: 'Minicoy', st: 'LD', x0: 2743, z0: 18680, nx: 1, nz: 1, style: 'town', size: 'small', food: 'LD', island: true, specials: {} }
  ]);

  add('islands', [
    { name: 'Kavaratti', x: 2434, z: 16430, r: 130 }, { name: 'Agatti', x: 2043, z: 16130, r: 175 },
    { name: 'Bangaram', x: 2210, z: 15900, r: 55 }, { name: 'Kadmat', x: 2560, z: 15760, r: 60 },
    { name: 'Andrott', x: 3300, z: 16190, r: 70 }, { name: 'Kalpeni', x: 3290, z: 16920, r: 60 },
    { name: 'Minicoy', x: 2783, z: 18720, r: 110 }, { name: 'Sindhudurg Fort', x: 3210, z: 10880, r: 24 }, { name: 'Bet Dwarka', x: 240, z: 4830, r: 30 }
  ]);
  // shallow turquoise lagoons around the Lakshadweep islands
  W.lagoons = (W.lagoons || []).concat([[2434, 16430, 175], [2043, 16130, 215], [2210, 15900, 90], [2560, 15760, 95], [3300, 16190, 105], [3290, 16920, 95], [2783, 18720, 150]]);
  W.statePolys = (W.statePolys || []).concat([{ st: 'LD', pts: [[1700, 15500], [3600, 15500], [3600, 19100], [1700, 19100]] }]);

  add('hills', [
    { x: 1600, z: 5700, rx: 70, rz: 60, n: 5, h: [60, 110] },   // Girnar
    { x: 4380, z: 7360, rx: 160, rz: 60, n: 10, h: [30, 70] },  // Saputara hills
    { x: 4300, z: 2700, rx: 140, rz: 90, n: 8, h: [30, 60] }    // the Aravalli near Kumbhalgarh
  ]);
  add('lakes', [{ name: 'Rankala Lake', x: 3780, z: 10600, rx: 30, rz: 24 }, { name: 'Lakhota Lake', x: 1120, z: 4780, rx: 40, rz: 18 }]);

  /* ---------- roads ---------- */
  add('highways', [
    // Maharashtra
    { name: 'Ratnagiri–Kolhapur Road (Amba ghat)', pts: [[3360, 10580], [3550, 10500], [3740, 10440]] },
    { name: 'Pune–Solapur Highway (NH65)', pts: [[4800, 9300], [5000, 9380], [5240, 9440], [5300, 9480]] },
    { name: 'Pandharpur–Solapur Road', pts: [[5400, 9520], [5500, 9450], [5600, 9400]] },
    { name: 'Samruddhi Amravati link', pts: [[7170, 7600], [7240, 7680], [7300, 7750]] },
    // Gujarat
    { name: 'Gandhinagar–Ahmedabad Road', pts: [[3220, 4450], [3240, 4560], [3240, 4660]] },
    { name: 'Ahmedabad–Bhavnagar Highway', pts: [[2850, 5140], [2700, 5350], [2560, 5520], [2440, 5660]] },
    { name: 'Rajkot–Jamnagar Highway', pts: [[1630, 5240], [1400, 5100], [1240, 4920]] },
    { name: 'Rajkot–Junagadh Highway', pts: [[1700, 5420], [1560, 5540], [1480, 5640]] },
    { name: 'Junagadh–Somnath Road', pts: [[1440, 5800], [1380, 5930], [1320, 6040]] },
    { name: 'NH51 Coastal Highway (Porbandar–Somnath)', pts: [[860, 5680], [1000, 5850], [1150, 5980], [1240, 6040]] },
    { name: 'NH51 Coastal Highway (Dwarka–Porbandar)', pts: [[420, 5080], [500, 5300], [640, 5480], [760, 5600]] },
    { name: 'NH51 Coastal Highway (Somnath–Diu)', pts: [[1380, 6090], [1540, 6200], [1700, 6290]] },
    { name: 'Nashik–Saputara Road', pts: [[4420, 7790], [4400, 7650], [4360, 7500]] },
    // Rajasthan
    { name: 'NH62 Jodhpur–Bikaner', pts: [[3000, 1390], [3050, 1000], [3100, 540]] },
    { name: 'NH27 Udaipur–Chittorgarh', pts: [[3960, 3200], [4250, 3100], [4500, 3030]] },
    { name: 'NH27 Chittorgarh–Kota', pts: [[4740, 3030], [5200, 3000], [5650, 2970]] },
    { name: 'NH52 Jaipur–Bundi', pts: [[5800, 1700], [5600, 2100], [5420, 2520]] },
    { name: 'NH52 Bundi–Kota', pts: [[5460, 2600], [5560, 2740], [5700, 2850]] },
    // Lakshadweep island roads (no link to the mainland: take the ship or the flight)
  ]);

  add('airports', [
    { id: 'KLH', name: 'Kolhapur Airport', zone: 'kolhapur', x: 4120, z: 10620, L: 240, side: -1, access: [[4120, 10556], [3980, 10520]] },
    { id: 'SSE', name: 'Solapur Airport', zone: 'solapur', x: 5760, z: 9520, L: 240, side: -1, access: [[5760, 9456], [5760, 9440]] },
    { id: 'BHU', name: 'Bhavnagar Airport', zone: 'bhavnagar', x: 2340, z: 5590, L: 200, side: 1, access: [[2340, 5654], [2340, 5660]] },
    { id: 'JGA', name: 'Jamnagar Airport', zone: 'jamnagar', x: 1500, z: 4880, L: 260, side: 1, access: [[1500, 4944], [1240, 4944]] },
    { id: 'PBD', name: 'Porbandar Airport', zone: 'porbandar', x: 1000, z: 5560, L: 220, side: 1, access: [[1000, 5624], [860, 5624]] },
    { id: 'BKB', name: 'Bikaner Airport', zone: 'bikaner', x: 3500, z: 420, L: 260, side: 1, access: [[3500, 484], [3240, 484]] },
    { id: 'KQH', name: 'Kishangarh Airport (Ajmer)', zone: 'ajmer', x: 4400, z: 1700, L: 220, side: 1, access: [[4400, 1764], [4400, 1820]] },
    { id: 'AGX', name: 'Agatti Airport (Lakshadweep)', zone: 'agatti', x: 2093, z: 16195, L: 190, side: -1, access: [[2093, 16131], [2093, 16100], [2003, 16100]] }
  ]);

  add('ferries', [
    { a: 'Kochi wharf (Lakshadweep ship)', ax: 5470, az: 17060, b: 'Kavaratti jetty', bx: 2560, bz: 16440, za: 'kochi', zb: 'kavaratti', ship: true },
    { a: 'Kavaratti lagoon jetty', ax: 2310, az: 16400, b: 'Agatti jetty', bx: 2215, bz: 16160, za: 'kavaratti', zb: 'agatti' },
    { a: 'Malvan jetty', ax: 3290, az: 10870, b: 'Sindhudurg Fort', bx: 3232, bz: 10880, za: 'malvan', zb: 'malvan' },
    { a: 'Okha jetty', ax: 300, az: 4880, b: 'Bet Dwarka', bx: 240, bz: 4830, za: 'dwarka', zb: 'dwarka' }
  ]);

  add('landmarks', [
    { kind: 'fortWalls', x: 3210, z: 10880 },            // Sindhudurg sea fort
    { kind: 'lighthouse:Minicoy', x: 2800, z: 18810 },
    { kind: 'lagoonBeach', x: 2440, z: 16515 }, { kind: 'lagoonBeach', x: 2210, z: 15900 }, { kind: 'lagoonBeach', x: 2560, z: 15760 },
    { kind: 'lagoonBeach', x: 2720, z: 18795 }, { kind: 'lagoonBeach', x: 3300, z: 16190 }, { kind: 'lagoonBeach', x: 3290, z: 16920 },
    { kind: 'kumbhalgarh', x: 4300, z: 2620 }, { kind: 'lonarCrater', x: 6900, z: 8250 }
  ]);
  add('lakes', [{ name: 'Lonar Crater Lake', x: 6900, z: 8250, rx: 34, rz: 34 }]);

  add('places', [
    ['Mahalaxmi Temple, Kolhapur', 3860, 10420], ['Rankala Lake', 3780, 10600], ['Sindhudurg Fort', 3210, 10880], ['Tarkarli Beach', 3340, 10920],
    ['Vitthal Temple, Pandharpur', 5280, 9520], ['Bhuikot Fort, Solapur', 5720, 9320], ['Lonar Crater Lake', 6900, 8250], ['Thibaw Palace, Ratnagiri', 3280, 10560],
    ['Akshardham, Gandhinagar', 3180, 4330], ['Lakhota Lake, Jamnagar', 1120, 4780], ['Girnar Hill', 1600, 5700], ['Mahabat Maqbara', 1500, 5680],
    ['Kirti Mandir, Porbandar', 740, 5640], ['Diu Fort', 1820, 6290], ['Saputara Lake', 4340, 7460], ['Bet Dwarka', 240, 4830], ['Bhavnagar Takhteshwar Temple', 2400, 5700],
    ['Junagarh Fort, Bikaner', 3120, 420], ['Vijay Stambh, Chittorgarh', 4620, 2990], ['Kumbhalgarh Fort', 4300, 2620], ['Taragarh, Bundi', 5420, 2560], ['Chambal Riverfront, Kota', 5770, 2970],
    ['Kavaratti Lagoon', 2440, 16515], ['Ujra Mosque, Kavaratti', 2474, 16430], ['Agatti Airport', 2093, 16195], ['Bangaram Island', 2210, 15900], ['Kadmat Island', 2560, 15760],
    ['Minicoy Lighthouse', 2800, 18810], ['Andrott Island', 3300, 16190], ['Kalpeni Island', 3290, 16920]
  ]);
  add('tolls', [[4655, 9780, 'Khed-Shivapur Toll'], [5600, 2100, 'Jaipur–Kota Toll'], [2700, 5350, 'Bhavnagar Highway Toll']]);
  add('speedCams', [[4675, 9650], [5520, 2280], [1450, 5060]]);

  add('homes', [
    { id: 'kolhapurwada', zone: 'kolhapur', name: 'Kolhapur wada house', type: 'haveli', price: 110000 },
    { id: 'malvancot', zone: 'malvan', name: 'Malvan konkan cottage', type: 'cottage', price: 120000 },
    { id: 'gnrflat', zone: 'gandhinagar', name: 'Gandhinagar sector flat', type: 'flat', price: 85000 },
    { id: 'bikanerhaveli', zone: 'bikaner', name: 'Bikaner sandstone haveli', type: 'haveli', price: 140000 },
    { id: 'kavarattihut', zone: 'kavaratti', name: 'Kavaratti coral-stone house', type: 'hut', price: 160000 }
  ]);

  W.menus.LD = [['tunacurry', 'Tuna curry rice', 'Island tuna in coconut gravy', 140, { hunger: 60, bladder: -6 }, 'meal'], ['maspodi', 'Mas podi', 'Dried tuna flakes with coconut', 80, { hunger: 30 }, 'snack'],
    ['octopus', 'Octopus fry', 'Spicy, from the lagoon', 200, { hunger: 50 }, 'meal'], ['kilanji', 'Kilanji', 'Thin rice crepes with coconut jaggery', 50, { hunger: 26, energy: 4 }, 'snack'],
    ['coconut', 'Tender coconut', 'Straight from the island palms', 30, { hunger: 4, bladder: -14 }, 'drink'], ['sulaimani', 'Sulaimani', 'Lemon black tea', 15, { hunger: 2, energy: 10, bladder: -8 }, 'drink']];
  W.foodNames = Object.assign(W.foodNames || {}, { LD: ['Island canteen', 'Lagoon café', 'Tuna kitchen'] });

  // Lakshadweep rules from the plan: an entry permit for visitors, and no dogs on the islands (there are none)
  W.rules = Object.assign(W.rules || {}, { LD: { permit: 300, permitName: 'Lakshadweep entry permit', noDogs: true } });
})();
