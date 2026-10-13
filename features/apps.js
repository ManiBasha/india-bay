// Shopping on the phone: order food on Swiggy or Zomato and anything else on BayCart.
// Orders arrive after a delivery time; food is eaten when it arrives, goods go to you or your home.
window.BBFeatures.push(function (bb) {
  const P = () => bb.P, W = bb.WORLD;
  const orders = []; // { app, item, eta (Bay minutes left), done }
  const FOODAPP = { swiggy: { name: 'Swiggy', icon: '🧡', col: '#fc8019' }, zomato: { name: 'Zomato', icon: '❤️', col: '#e23744' } };
  function zone() { const p = bb.ppos(); return bb.zoneAt(p.x, p.z, 150); }
  function menuHere() { const z = zone(); const key = z ? z.food : 'HW'; return { key, list: (W.menus[key] || W.menus.MH), z }; }
  const appPrice = (key, row) => { const base = bb.cost('food.' + key + '.' + row[0], row[3]); return Math.round(base * (1 + bb.rawCost('app.foodmarkup', 10) / 100) / 5) * 5; };
  const fmtEta = m => `${Math.max(1, Math.ceil(m))} min`;
  function foodApp(id) { const A = FOODAPP[id]; const { key, list, z } = menuHere(); const fee = bb.cost('app.fooddelivery', 35); const rest = z ? bb.pois.filter(p => p.type === 'food' && p.zone === z) : [];
    const pending = orders.filter(o => o.app === A.name && !o.done);
    bb.openSheet(`${A.icon} ${A.name}`, z ? `Delivering in ${bb.esc(z.name)} · delivery ${bb.inr(fee)}` : 'Outside the city · highway dhabas deliver', (pending.length ? `<p class="note">On the way: ${pending.map(o => `${bb.esc(o.item[1])} · ${fmtEta(o.eta)}`).join(', ')}</p>` : '') +
      list.map((r, i) => bb.rowHtml('f' + i, bb.esc(r[1]), `${bb.esc(rest.length ? rest[i % rest.length].name : 'Highway dhaba')} · ${bb.esc(r[2])}`, bb.inr(appPrice(key, r) + fee))).join('') +
      '<p class="note">When your order arrives you can eat it right away or keep it in your food bag for later. Food also brings your health back.</p>',
      s => s.onclick = e => { const k = e.target.dataset.id; if (!k) return; const r = list[+k.slice(1)]; const total = appPrice(key, r) + fee; if (!bb.spend(total, true)) return;
        const eta = 20 + Math.random() * 25; orders.push({ app: A.name, kind: 'food', item: r, eta, done: false, col: A.col }); bb.closeSheet(); bb.toast(`${A.name} · ${bb.esc(r[1])} ordered · arriving in about ${fmtEta(eta)}`, A.col); bb.emit('order', { app: A.name }); }); }
  const CART = [['helmet', 'Helmet', 'Falls hurt less on bikes', '⛑'], ['medkit', 'First-aid kit', 'Health +30 when it arrives', '🩹'], ['fuelcan', 'Fuel can', 'Adds 30% fuel to your vehicle', '⛽'], ['repairkit', 'Repair kit', 'Body +25% on your vehicle', '🧰'],
    ['energy', 'Energy drink pack', 'Energy +25', '🥤'], ['sunglasses', 'Sunglasses', 'Into your wardrobe', '🕶'], ['cap', 'Cricket cap', 'Into your wardrobe', '🧢'], ['sneakers', 'Sneakers', 'Into your wardrobe', '👟'],
    ['plant', 'House plant', 'Delivered to your home', '🪴'], ['lamp', 'Brass lamp', 'Delivered to your home', '🪔'],
    ['rte', 'Ready-to-eat meal', 'Packed · keeps 3 Bay days · food +35', '🍱'], ['biscuits', 'Biscuits pack', 'Packed · keeps 3 Bay days · food +15', '🍪'], ['chips', 'Chips packet', 'Packed · keeps 3 Bay days · food +12', '🥔'],
    ['chikki', 'Peanut chikki', 'Packed · keeps 3 Bay days · food +12, energy +5', '🥜'], ['bananas', 'Bananas', 'Fresh fruit · keeps 1 Bay day · food +18', '🍌']];
  // packed food goes into the food bag: [id, name, desc, price, effects, kind]
  const PACKED = { rte: ['rte', 'Ready-to-eat meal', '', 0, { hunger: 35 }, 'meal'], biscuits: ['biscuits', 'Biscuits pack', '', 0, { hunger: 15 }, 'snack'], chips: ['chips', 'Chips packet', '', 0, { hunger: 12 }, 'snack'],
    chikki: ['chikki', 'Peanut chikki', '', 0, { hunger: 12, energy: 5 }, 'snack'], bananas: ['bananas', 'Bananas', '', 0, { hunger: 18, energy: 3 }, 'snack'] };
  function cartApp() { const fee = bb.cost('cart.delivery', 40); const pending = orders.filter(o => o.app === 'BayCart' && !o.done);
    bb.openSheet('🛒 BayCart', `Everything delivered · ${bb.inr(fee)} delivery`, (pending.length ? `<p class="note">On the way: ${pending.map(o => `${bb.esc(o.item[1])} · ${fmtEta(o.eta)}`).join(', ')}</p>` : '') +
      CART.map(([id, nm, sub, ic]) => bb.rowHtml(id, `${ic} ${nm}`, sub, bb.inr(bb.cost('cart.' + id) + fee))).join('') + '<p class="note">Want to earn instead? Become a BayCart delivery agent in Menu → Jobs.</p>',
      s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; const it = CART.find(c => c[0] === id); if (['plant', 'lamp'].includes(id) && !P().homes.length) return bb.toast('Buy a home first · this is delivered to your home', '#ff9f1c');
        if (id === 'helmet' && P().helmet) return bb.toast('You already have a helmet', '#d6c8e4');
        if (!bb.spend(bb.cost('cart.' + id) + fee, true)) return; const eta = 30 + Math.random() * 40; orders.push({ app: 'BayCart', kind: 'cart', item: it, eta, done: false, col: '#2a62c9' }); bb.closeSheet(); bb.toast(`BayCart · ${it[1]} ordered · arriving in about ${fmtEta(eta)}`, '#5fb4ff'); bb.emit('order', { app: 'BayCart' }); }); }
  function deliver(o) { const p = P(); o.done = true;
    if (o.kind === 'food') { const r = o.item; // ask: eat it now, or keep it in the food bag for later
      if (bb.FOODBAG) return bb.FOODBAG.arrived(r, o.app, o.col);
      return; }
    if (PACKED[o.item[0]]) { bb.emit('parcel', { item: PACKED[o.item[0]], from: 'BayCart', kind: o.item[0] === 'bananas' ? 'fruit' : 'packed' }); bb.toast(`📦 BayCart · ${bb.esc(o.item[1])} delivered · in your food bag`, '#5fb4ff'); return; }
    const id = o.item[0], v = bb.player.veh || bb.ownedVeh.filter(Boolean).sort((a, b) => a.pos.distanceTo(bb.ppos()) - b.pos.distanceTo(bb.ppos()))[0];
    if (id === 'helmet') { p.helmet = true; bb.emit('buy', { kind: 'helmet' }); }
    else if (id === 'medkit') p.health = Math.min(100, p.health + 30);
    else if (id === 'energy') p.energy = Math.min(100, p.energy + 25);
    else if (id === 'fuelcan') { if (v && v.spec.fuel) v.fuel = Math.min(100, v.fuel + 30); }
    else if (id === 'repairkit') { if (v) v.hp = Math.min(100, v.hp + 25); }
    else if (['sunglasses', 'cap', 'sneakers'].includes(id)) { const k = id === 'sunglasses' ? 'glasses' : id; if (!p.wardrobe.includes(k)) p.wardrobe.push(k); }
    else if (['plant', 'lamp'].includes(id)) { const h = p.homes[0]; p.furniture[h] = (p.furniture[h] || []); if (!p.furniture[h].includes(id)) p.furniture[h].push(id); }
    bb.setDirty(); bb.toast(`📦 BayCart · ${bb.esc(o.item[1])} delivered${['plant', 'lamp'].includes(id) ? ' to your home' : ''}`, '#5fb4ff'); }
  bb.onUpdate(dt => { if (!orders.length) return; const gm = dt * (bb.CFG.timeSpeed || 1); for (const o of orders) { if (o.done) continue; o.eta -= gm;
      // the rider sets off a little before the order is due and hands it over in person
      if (o.eta <= 16 && !o.sent && bb.VISIT) { o.sent = true; const role = /swiggy/i.test(o.app) ? 'swiggy' : /zomato/i.test(o.app) ? 'zomato' : 'baycart'; bb.VISIT.send({ role, label: `Your ${o.app} order`, onArrive: () => { if (!o.done) deliver(o); } }); }
      if (o.eta <= (o.sent ? -150 : 0) && !document.querySelector('#wait:not([hidden])')) deliver(o); } if (orders.length > 20) orders.splice(0, orders.length - 20); });
  bb.addApp({ id: 'swiggy', label: 'Swiggy', icon: '🧡', fn: () => foodApp('swiggy') });
  bb.addApp({ id: 'zomato', label: 'Zomato', icon: '❤️', fn: () => foodApp('zomato') });
  bb.addApp({ id: 'baycart', label: 'BayCart', icon: '🛒', fn: cartApp });
  // Everyone has a smartphone from the start.
  bb.onStart(() => { if (P().phone !== 'smart') { P().phone = 'smart'; bb.setDirty(); } });
});
