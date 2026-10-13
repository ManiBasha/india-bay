// Price list for every item in the game, shared by the game and the /admin page.
// Each entry is [key, label, default price in ₹]. The admin can change any price in /admin → Time and prices;
// changed prices are saved in the game settings as prices[key]. The Prices × setting still multiplies all of them.
// Load after the world files so homes and food menus can be listed from the map data.
window.PRICES = (function () {
  const W = window.WORLD || { homes: [], menus: {} };
  const groups = [
    ['Vehicles', [['veh.cycle', 'Cycle', 4000], ['veh.rickshaw', 'Cycle rickshaw', 15000], ['veh.bike', 'Motorbike', 65000], ['veh.sportsbike', 'Sports bike', 180000], ['veh.auto', 'Auto rickshaw', 12000],
      ['veh.car', 'Hatchback', 45000], ['veh.sedan', 'Sedan', 85000], ['veh.suv', 'SUV', 120000], ['veh.sports', 'Sports coupe', 250000], ['veh.taxi', 'Taxi (resale value)', 40000]]],
    ['Workshop and garage', [['mod.paint', 'Paint job', 3000], ['mod.tune', 'Engine tune (+10% speed)', 15000], ['mod.horn', 'Musical horn', 1200], ['mod.neon', 'Underglow lights', 5000],
      ['svc.repair', 'Repair, per 1% of body damage', 40], ['svc.service', 'Quick service', 400], ['svc.roadfuel', 'Roadside fuel delivery', 500], ['svc.tow', 'Tow and patch-up', 1500], ['svc.callmech', 'Mechanic called to your vehicle (full repair)', 2500], ['svc.valet', 'Garage valet (bring a vehicle to you)', 200], ['svc.papers', 'Papers for a vehicle you took', 5000]]],
    ['Licences', [['lic.two', 'Two-wheeler licence', 1500], ['lic.three', 'Auto rickshaw licence', 1000], ['lic.lmv', 'Car licence (LMV)', 2500], ['lic.heavy', 'Heavy vehicle licence', 6000]]],
    ['Daily life', [['svc.hospital', 'Hospital treatment', 300], ['svc.toilet', 'Public toilet', 5], ['svc.lodge', 'Lodge room', 600], ['svc.dharamshala', 'Dharamshala room', 200], ['svc.camp', 'Tent or desert camp', 1500],
      ['svc.safari', 'Lion safari', 800], ['svc.camel', 'Camel ride', 500], ['svc.helmet', 'Helmet', 800], ['svc.cyclerent', 'Rent a cycle for deliveries', 50], ['svc.ko', 'Hospital fee after a knockout', 1000]]],
    ['Clothes', [['cloth.shirt', 'Shirt', 600], ['cloth.tshirt', 'T-shirt', 400], ['cloth.kurta', 'Kurta', 1200], ['cloth.saree', 'Saree', 2500], ['cloth.sneakers', 'Sneakers', 2500], ['cloth.glasses', 'Sunglasses', 800], ['cloth.cap', 'Cricket cap', 300], ['cloth.bottom', 'Jeans or trousers', 900]]],
    ['Furniture', [['furn.sofa', 'Sofa set', 18000], ['furn.tv', 'LED TV', 25000], ['furn.plant', 'Tulsi and money plant', 800], ['furn.rug', 'Jaipur dhurrie rug', 4500], ['furn.lamp', 'Brass lamp', 2500], ['furn.shelf', 'Bookshelf', 7000],
      ['furn.painting', 'Madhubani painting', 6000], ['furn.jhoola', 'Wooden jhoola swing', 22000], ['furn.puja', 'Puja shelf', 3500], ['furn.dining', 'Dining table', 15000]]],
    ['Weapons', [['gun.bat', 'Cricket bat', 600], ['gun.pistol', 'Pistol', 8000], ['gun.shotgun', 'Shotgun', 20000], ['gun.ammoP', 'Pistol rounds (24)', 600], ['gun.ammoS', 'Shotgun shells (12)', 900]]],
    ['Football', [['fb.stands', 'Match ticket, stands', 300], ['fb.vip', 'Match ticket, VIP box', 1500], ['fb.jersey', 'Home jersey', 999], ['fb.club', 'Fan club membership', 500], ['fb.snack', 'Stadium snack', 80]]],
    ['Cricket and bets', [['cr.stands', 'Cricket ticket, stands', 400], ['cr.vip', 'Cricket ticket, VIP box', 2000], ['cr.jersey', 'IPL team jersey', 1299], ['st.tour', 'Stadium tour (no match)', 150], ['bet.min', 'Smallest bet (18+)', 50], ['bet.max', 'Biggest bet (18+)', 10000]]],
    ['Malls and famous places', [['mall.movie', 'Movie ticket', 250], ['mall.popcorn', 'Popcorn and cola', 180], ['mall.bowling', 'Bowling game', 200], ['mall.vr', 'VR ride', 300], ['att.ticket', 'Fort, palace, cave or monument ticket', 50], ['att.guide', 'Guided tour', 200], ['att.donate', 'Offering at a temple, church or dargah', 51]]],
    ['Adventure activities', [['adv.paraglide', 'Paragliding', 2500], ['adv.parasail', 'Parasailing', 1200], ['adv.jetski', 'Jet ski ride', 800], ['adv.scuba', 'Scuba diving', 4500], ['adv.snorkel', 'Snorkelling', 1000], ['adv.surf', 'Surfing lesson', 1500], ['adv.kayak', 'Kayaking', 600], ['adv.raft', 'White-water rafting', 1800], ['adv.coracle', 'Coracle ride', 300],
      ['adv.houseboat', 'Houseboat cruise', 3500], ['adv.dolphin', 'Dolphin boat trip', 500], ['adv.bamboo', 'Bamboo rafting', 1500], ['adv.balloon', 'Hot-air balloon ride', 12000], ['adv.zip', 'Zipline', 1600], ['adv.dunes', 'Dune bashing', 1500], ['adv.trek', 'Guided trek', 200], ['adv.teatour', 'Tea estate tour', 600], ['adv.elephant', 'Elephant camp', 900]]],
    ['Zoos', [['zoo.ticket', 'Zoo entry ticket', 100], ['zoo.safari', 'Zoo battery-car safari', 300]]],
    ['Helicopters', [['heli.joy', 'Helicopter joyride', 3500], ['heli.taxi', 'Heli taxi, base fare', 5000], ['heli.km', 'Heli taxi, per km', 40], ['heli.rent', 'Rent a helicopter for one flight', 6000], ['lic.heli', 'Helicopter pilot licence', 25000], ['veh.heli', 'Buy a helicopter', 4500000]]],
    ['Traffic challans (when switched on)', [['fine.signal', 'Jumping a red light', 1000], ['fine.speeding', 'Speeding past a camera', 2000], ['fine.helmet', 'Riding without a helmet', 1000]]],
    ['Invites and rewards', [['refer.bonus', 'Invite reward: friend joins with your link', 10000], ['refer.welcome', 'Welcome gift for the friend who joins', 2000], ['daily.base', 'Daily reward, day 1 (grows with the streak)', 200]]],
    ['Festivals', [['fest.reward', 'Festival game reward (full score)', 200], ['fest.kite', 'Kite and manja', 50], ['fest.crackers', 'Diyas and crackers', 300]]],
    ['Business', [['biz.0', 'Chai stall', 50000], ['biz.1', 'Chai cafe upgrade', 150000], ['biz.2', 'Chai chain upgrade', 500000], ['biz.3', 'Chai franchise upgrade', 2000000]]],
    ['BayCart (online shopping)', [['cart.helmet', 'Helmet', 900], ['cart.medkit', 'First-aid kit (+30 health)', 450], ['cart.fuelcan', 'Fuel can (+30% tank)', 700], ['cart.repairkit', 'Repair kit (+25% body)', 1200],
      ['cart.energy', 'Energy drink pack', 150], ['cart.sunglasses', 'Sunglasses', 700], ['cart.cap', 'Cricket cap', 250], ['cart.sneakers', 'Sneakers', 2200], ['cart.plant', 'House plant (to your home)', 700], ['cart.lamp', 'Brass lamp (to your home)', 2300], ['cart.rte', 'Ready-to-eat meal (packed)', 120], ['cart.biscuits', 'Biscuits pack', 30], ['cart.chips', 'Chips packet', 20], ['cart.chikki', 'Peanut chikki', 25], ['cart.bananas', 'Bananas', 50], ['cart.delivery', 'Delivery fee', 40]]],
    ['Food apps', [['app.fooddelivery', 'Swiggy or Zomato delivery fee', 35], ['app.foodmarkup', 'App price on top of menu price, per ₹100', 10]]]
  ];
  const homes = (W.homes || []).filter(h => !h.starter).map(h => ['home.' + h.id, h.name, h.price]);
  homes.unshift(['home.move', 'Move your free starter home to another city', 5000]);
  if (homes.length) groups.splice(3, 0, ['Homes', homes]);
  const MENU = { MH: 'Maharashtra', GJ: 'Gujarat', RJ: 'Rajasthan', DD: 'Daman and coast', HW: 'Highway dhaba', BEACH: 'Beach stalls', GA: 'Goa', KA: 'Karnataka', KL: 'Kerala' };
  for (const [k, list] of Object.entries(W.menus || {})) groups.push(['Food · ' + (MENU[k] || k), list.map(r => ['food.' + k + '.' + r[0], r[1], r[3]])]);
  const DEF = {}; for (const [, list] of groups) for (const [k, , v] of list) DEF[k] = v;
  return { groups, DEF };
})();
