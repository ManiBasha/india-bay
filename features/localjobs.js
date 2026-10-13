// Local work (Beta v1.01.04): the trades, crafts, farm, port and tourism jobs of Maharashtra, Gujarat and Rajasthan
// from the state build plans. Each one has a 💼 work site in its town (shown on the map); walk up and press E.
//   craft  · a timing game: tap when the marker is in the green (weaving, polishing, printing, drumming…)
//   carry  · fetch and carry against the clock (fish crates, grapes, salt, marble, ship scrap…)
//   drive  · take the company vehicle on a route (container truck, safari jeep, kaali-peeli taxi, milk run…)
//   shift  · put in a few hours (banker, IT, tutor, guide, miner…); time passes and you get paid
// Menu → Local work lists every job in the state you are in, with the pay and directions.
window.BBFeatures.push(function (bb) {
  const W = bb.WORLD, P = () => bb.P, esc = bb.esc;
  // [id, name, icon, zone, kind, pay, extra]
  const G = [
    // Maharashtra
    ['motorman', 'Mumbai local motorman', '🚆', 'mumbai', 'shift', 1400, { h: 6, line: 'You drive the 8:14 fast local from Churchgate to Virar' }],
    ['best', 'BEST bus conductor', '🎫', 'mumbai', 'shift', 900, { h: 5, line: 'Tickets, change and "pudhe chala!"' }],
    ['kaalipeeli', 'Kaali-peeli taxi driver', '🚕', 'mumbai', 'drive', 700, { veh: 'taxi', stops: 3, line: 'The black-and-yellow Premier taxi, meter down' }],
    ['stunt', 'Film studio stunt rider', '🎬', 'mumbai', 'drive', 1500, { veh: 'sportsbike', stops: 4, fast: true, line: 'Hit every mark before the director yells cut' }],
    ['sassoon', 'Sassoon Dock fish porter', '🐟', 'mumbai', 'carry', 650, { n: 5, item: 'fish crate', line: 'Crates from the boats to the auction floor' }],
    ['jnpt', 'JNPT container trucker', '🚛', 'navimumbai', 'drive', 3200, { veh: 'truck', to: ['pune', 'nashik', 'surat'], line: 'A 40-foot container from the port' }],
    ['bkc', 'BKC banker', '🏦', 'mumbai', 'shift', 2200, { h: 8, line: 'Spreadsheets, calls and a cutting chai at 4' }],
    ['trader', 'Stock trader', '📈', 'mumbai', 'craft', 1800, { verb: 'Buy low, sell high', line: 'Tap when the price is in the green' }],
    ['hinjewadi', 'Hinjewadi IT shift', '💻', 'pune', 'shift', 2000, { h: 8, line: 'Stand-up, code review and a long traffic jam home' }],
    ['chakan', 'Chakan auto parts line', '⚙', 'pune', 'craft', 900, { verb: 'Press and weld', line: 'Fit every part as it comes down the line' }],
    ['dholtasha', 'Dhol-tasha drummer', '🥁', 'pune', 'craft', 800, { verb: 'Beat the dhol', line: 'Practice for the Ganpati procession' }],
    ['sugarcane', 'Sugarcane cutter', '🎋', 'kolhapur', 'craft', 700, { verb: 'Swing the koyta', line: 'Cut the cane low and clean' }],
    ['chappal', 'Kolhapuri chappal maker', '🩴', 'kolhapur', 'craft', 750, { verb: 'Stitch the leather', line: 'Hand-stitched, plaited straps' }],
    ['kusti', 'Kusti wrestler (talim)', '🤼', 'kolhapur', 'craft', 900, { verb: 'Grapple', line: 'Red earth pit, langot on, the guru watches' }],
    ['grapes', 'Nashik grape picker', '🍇', 'nashik', 'carry', 650, { n: 5, item: 'crate of grapes', line: 'From the vines to the cold store' }],
    ['winery', 'Nashik winery guide', '🍷', 'nashik', 'shift', 1000, { h: 4, line: 'Vineyard walks for weekend visitors (tasting is 21+)' }],
    ['mango', 'Alphonso mango packer', '🥭', 'ratnagiri', 'craft', 750, { verb: 'Grade and pack', line: 'Only the perfect hapus go in the box' }],
    ['orange', 'Nagpur orange picker', '🍊', 'nagpur', 'carry', 650, { n: 5, item: 'basket of oranges', line: 'From the orchard to the tempo' }],
    ['cotton', 'Vidarbha cotton farmer', '🌱', 'akola', 'carry', 600, { n: 4, item: 'cotton bale', line: 'White gold to the ginning mill' }],
    ['paithani', 'Paithani weaver', '🧵', 'aurangabad', 'craft', 1000, { verb: 'Throw the shuttle', line: 'Silk and gold zari, peacock motifs' }],
    ['chaddar', 'Solapur chaddar loom', '🛏', 'solapur', 'craft', 750, { verb: 'Work the loom', line: 'The famous Solapur bedsheets' }],
    ['idol', 'Ganpati idol maker', '🐘', 'alibaug', 'craft', 900, { verb: 'Shape and paint', line: 'Eco-friendly shadu clay idols for the pandals' }],
    ['lavani', 'Lavani dancer', '💃', 'pune', 'craft', 900, { verb: 'Dance to the dholki', line: 'Nauvari saree, ghungroo, fast beats' }],
    ['tadoba', 'Tadoba safari driver', '🐅', 'chandrapur', 'drive', 1200, { veh: 'suv', stops: 4, line: 'Gypsy safari: watch for the tigress at the water hole' }],
    ['horse', 'Matheran horse guide', '🐎', 'matheran', 'carry', 600, { n: 3, item: 'tourist on your horse', line: 'No cars in Matheran: lead tourists from Dasturi to the points' }],
    ['fortguide', 'Fort trek guide', '🥾', 'mahabaleshwar', 'shift', 800, { h: 4, line: 'Pratapgad trek with a school group' }],
    ['coal', 'Chandrapur coal miner', '⛏', 'chandrapur', 'shift', 1300, { h: 8, line: 'Hard hat, lamp and a long shift underground' }],
    ['vadapav', 'Vada pav stall', '🍔', 'mumbai', 'craft', 600, { verb: 'Fry and serve', line: 'Hot vadas, green chutney, the office rush' }],
    // Gujarat
    ['diamond', 'Diamond cutter and polisher', '💎', 'surat', 'craft', 1300, { verb: 'Polish the facet', line: 'A steady hand on the wheel' }],
    ['textile', 'Surat textile market trader', '🧶', 'surat', 'shift', 1200, { h: 6, line: 'Saree bundles, bargaining and chai' }],
    ['alang', 'Alang ship-breaker', '🚢', 'bhavnagar', 'carry', 900, { n: 5, item: 'steel plate', line: 'Cut steel from the beached ships to the yard (helmet on)' }],
    ['crane', 'Kandla port crane operator', '🏗', 'gandhidham', 'craft', 1200, { verb: 'Lower the container', line: 'Line it up on the truck below' }],
    ['tiles', 'Morbi tile factory', '🧱', 'morbi', 'craft', 800, { verb: 'Press the tiles', line: 'Ceramic tiles for the whole country' }],
    ['dairy', 'Anand dairy milk collector', '🥛', 'anand', 'drive', 700, { veh: 'bike', stops: 4, line: 'Collect milk cans from the village cooperatives' }],
    ['cumin', 'Unjha cumin trader', '🌿', 'mehsana', 'shift', 1100, { h: 5, line: 'The biggest jeera market in the world' }],
    ['maldhari', 'Maldhari herder', '🐃', 'sasangir', 'carry', 600, { n: 4, item: 'buffalo back to the ness', line: 'Bring the herd home before the lions come out' }],
    ['salt', 'Agariya salt farmer', '🧂', 'gandhidham', 'carry', 650, { n: 5, item: 'sack of salt', line: 'Rake the salt pans of the Little Rann' }],
    ['veraval', 'Veraval fisherman', '🎣', 'somnath', 'craft', 750, { verb: 'Haul the net', line: 'Pull together on the beat' }],
    ['dhow', 'Mandvi dhow builder', '⛵', 'mandvi', 'craft', 1000, { verb: 'Hammer the planks', line: 'Wooden ships built by hand, as for 400 years' }],
    ['patola', 'Patan patola weaver', '🎨', 'mehsana', 'craft', 1100, { verb: 'Weave the double ikat', line: 'Every thread is dyed before it is woven' }],
    ['bandhani', 'Jamnagar bandhani tier', '🔴', 'jamnagar', 'craft', 700, { verb: 'Tie the dots', line: 'Thousands of tiny knots before the dye' }],
    ['ajrakh', 'Kutch ajrakh printer', '🟦', 'bhuj', 'craft', 800, { verb: 'Stamp the block', line: 'Indigo and madder, stamp by stamp' }],
    ['kites', 'Ahmedabad kite maker', '🪁', 'ahmedabad', 'craft', 600, { verb: 'Glue and string', line: 'Thousands of kites before Uttarayan' }],
    ['girsafari', 'Gir lion safari driver', '🦁', 'sasangir', 'drive', 1200, { veh: 'suv', stops: 4, line: 'Asiatic lions: engine off, cameras out' }],
    ['wildass', 'Little Rann wild ass safari', '🫏', 'morbi', 'drive', 1000, { veh: 'suv', stops: 3, line: 'Across the cracked salt flats' }],
    ['tenthost', 'Rann Utsav tent host', '⛺', 'bhuj', 'shift', 1000, { h: 5, line: 'Welcome drinks, folk music and the white desert at full moon' }],
    ['unity', 'Statue of Unity guide', '🗿', 'kevadia', 'shift', 900, { h: 4, line: 'Groups up to the viewing gallery' }],
    ['chhakdo', 'Chhakdo driver', '🛺', 'rajkot', 'drive', 600, { veh: 'auto', stops: 3, line: 'The big Saurashtra shared rickshaw' }],
    ['gift', 'GIFT City banker', '🏦', 'gandhinagar', 'shift', 2200, { h: 8, line: 'International finance from the tall towers' }],
    ['farsan', 'Farsan shop', '🥨', 'ahmedabad', 'craft', 650, { verb: 'Fry the fafda', line: 'Fafda, jalebi and khaman for the Sunday queue' }],
    ['garbadhol', 'Garba dhol player', '🪘', 'vadodara', 'craft', 900, { verb: 'Keep the beat', line: 'Nine nights of garba need a strong dhol' }],
    ['solar', 'Khavda solar technician', '☀', 'bhuj', 'carry', 900, { n: 4, item: 'solar panel', line: 'Fix and clean the panels in the world\'s biggest renewables park' }],
    // Rajasthan
    ['camelsafari', 'Camel safari guide', '🐪', 'jaisalmer', 'carry', 700, { n: 3, item: 'tourist on your camel', line: 'Out to the dunes for the sunset' }],
    ['camphost', 'Desert camp host', '🏕', 'jaisalmer', 'shift', 900, { h: 5, line: 'Bonfire, dal baati and folk dancers' }],
    ['dunejeep', 'Dune jeep driver', '🚙', 'jaisalmer', 'drive', 1000, { veh: 'suv', stops: 4, fast: true, line: 'Dune bashing for thrill seekers' }],
    ['manganiyar', 'Manganiyar musician', '🎻', 'jaisalmer', 'craft', 800, { verb: 'Play the kamaicha', line: 'Folk songs under the fort' }],
    ['kalbelia', 'Kalbelia dancer', '💃', 'jodhpur', 'craft', 800, { verb: 'Spin and dance', line: 'Black skirts swirling to the been' }],
    ['kathputli', 'Kathputli puppeteer', '🪆', 'jaipur', 'craft', 700, { verb: 'Work the strings', line: 'Amar Singh Rathore rides again' }],
    ['bluepottery', 'Blue pottery maker', '🏺', 'jaipur', 'craft', 800, { verb: 'Paint the pot', line: 'Cobalt blue on white quartz' }],
    ['blockprint', 'Sanganer block printer', '🖌', 'jaipur', 'craft', 750, { verb: 'Stamp the block', line: 'Hand block prints on cotton' }],
    ['gems', 'Jaipur gem cutter', '💍', 'jaipur', 'craft', 1200, { verb: 'Cut the stone', line: 'Emeralds and garnets in the Johari Bazaar' }],
    ['marble', 'Makrana marble cutter', '🪨', 'ajmer', 'carry', 800, { n: 4, item: 'marble slab', line: 'The marble of the Taj, from the quarry to the yard' }],
    ['sambhar', 'Sambhar salt worker', '🧂', 'ajmer', 'carry', 650, { n: 5, item: 'basket of salt', line: 'India\'s biggest inland salt lake' }],
    ['zinc', 'Zinc mine worker', '⛏', 'bhilwara', 'shift', 1300, { h: 8, line: 'Deep in the Rajpura-Dariba mines' }],
    ['bhadla', 'Bhadla solar park technician', '☀', 'jodhpur', 'carry', 900, { n: 4, item: 'solar panel', line: 'Sand off the panels before noon' }],
    ['oilfield', 'Barmer oil field worker', '🛢', 'barmer', 'shift', 1500, { h: 8, line: 'Twelve-hour shift on the rig' }],
    ['mustard', 'Mustard farmer', '🌼', 'alwar', 'carry', 600, { n: 4, item: 'bundle of mustard', line: 'Yellow fields as far as you can see' }],
    ['dhaba', 'Highway dhaba', '🍛', 'ajmer', 'craft', 700, { verb: 'Serve the truckers', line: 'Dal, roti and charpai naps on NH48' }],
    ['roadways', 'Rajasthan Roadways driver', '🚌', 'jaipur', 'drive', 1800, { veh: 'bus', to: ['ajmer', 'kota', 'sikar'], line: 'The blue-and-white state bus to the next town' }],
    ['palace', 'Palace guide', '🏰', 'udaipur', 'shift', 900, { h: 4, line: 'Stories of the Mewar kings' }],
    ['ranthambore', 'Ranthambore safari driver', '🐯', 'ranthambore', 'drive', 1200, { veh: 'suv', stops: 4, line: 'Zone 3: the lake by the old fort' }],
    ['pushkar', 'Pushkar fair trader', '🐫', 'ajmer', 'craft', 900, { verb: 'Strike the deal', line: 'Camels, bangles and a good bargain' }],
    ['tutor', 'Kota coaching tutor', '📚', 'kota', 'shift', 1500, { h: 6, line: 'Physics doubts for JEE aspirants' }],
    ['mill', 'Bhilwara textile mill', '🏭', 'bhilwara', 'craft', 800, { verb: 'Mind the spindles', line: 'The textile city of India' }]];
  const GIGS = G.map(([id, name, icon, zone, kind, pay, x]) => Object.assign({ id, name, icon, zone, kind, pay }, x)).filter(g => W.zones.some(z => z.id === g.zone));
  const KIND = { craft: 'Craft · timing game', carry: 'Fetch and carry', drive: 'Driving', shift: 'Shift work' };
  /* work sites */
  const used = new Set();
  function siteIn(z, seed) { for (let k = 0; k < 40; k++) { const i = (seed * 7 + k * 3) % z.nx, j = (seed * 5 + k) % z.nz; const bx = z.x0 + i * 80 + 40, bz = z.z0 + j * 80 + 40; const side = ['n', 'e', 's', 'w'][(seed + k) % 4]; const t = [-18, 0, 18][(seed + k) % 3];
      const [x, zz, rot] = bb.edgePos(bx, bz, side, t, 26); const key = Math.round(x / 6) + ',' + Math.round(zz / 6); if (used.has(key) || bb.isWater(x, zz) || bb.isWater(bx, bz)) continue; used.add(key); return { x, z: zz, rot }; } return null; }
  GIGS.forEach((g, n) => { const z = W.zones.find(q => q.id === g.zone); const s = siteIn(z, n + 3); if (!s) return; g.site = s; g.zoneObj = z;
    bb.addPoi({ type: 'gig', name: `${g.icon} ${g.name}`, x: s.x, z: s.z, rot: s.rot, extra: g.id, zone: z }); });
  const ex = () => { const p = P(); p.extra = p.extra || {}; const e = p.extra.gigs = p.extra.gigs || {}; return e; };
  const payOf = g => Math.round(bb.cost('gig.' + g.id, g.pay) * (1 + Math.min(.5, (ex()[g.id] || 0) * .05)));   // a little more each time you have done it (up to +50%)
  function paid(g, frac, note) { const pay = Math.round(payOf(g) * Math.max(0, Math.min(1.3, frac))); if (pay <= 0) { bb.toast(`${g.name} · no pay this time${note ? ' · ' + note : ''}`, '#ff5d73'); return; }
    ex()[g.id] = (ex()[g.id] || 0) + 1; bb.earn(pay, 'job'); bb.save(); bb.toast(`+${bb.inr(pay)} · ${g.icon} ${g.name}${note ? '<br><span style="font-size:15px;font-weight:600">' + note + '</span>' : ''}`, '#3ddc97'); bb.emit('job', { type: 'gig:' + g.id, pay }); }
  /* craft: a timing bar over a camera that circles you */
  function timing(g, done) { if (!bb.CINE) return; const pp = bb.ppos(), h0 = bb.player.h; const R = { k: 0, hits: 0, round: 0, n: g.n || 8, pos: 0, dir: 1, w: .26, wait: 0, c: .5 };
    const hit = () => { if (R.wait > 0 || R.round >= R.n) return; const ok = Math.abs(R.pos - R.c) < R.w / 2; if (ok) { R.hits++; bb.big('✓', '#3ddc97'); } else bb.big('✗', '#ff5d73'); R.round++; R.wait = .45; R.w = Math.max(.1, R.w - .02); R.c = .2 + Math.random() * .6; if (bb.hornSfx && ok) {} };
    bb.CINE.play({ kind: 'none', label: g.name, title: g.verb || 'Work', sub: g.line, lines: [g.line, 'Tap when the marker is in the green', 'Steady hands…', 'Last few!'], dur: 40, lookToggle: false, skipLabel: 'Stop', showAvatar: true,
      extraHtml: `<div class="rscore" id="gsc">0/${R.n}</div>` + '<div class="gigbar" id="gbar"><i id="gzone"></i><b id="gmk"></b></div><button class="go tapbig" id="gtap">TAP · Space</button>',
      keys: (code, down) => { if (code === 'Space' || code === 'KeyE' || code === 'Enter') { if (down) hit(); return true; } return false; },
      onStart: el => { const b = el.querySelector('#gtap'); b.addEventListener('pointerdown', e => { e.preventDefault(); hit(); }); },
      onTick: (dt, f, st) => { R.wait -= dt; const sp = .7 + R.round * .09; R.pos += R.dir * sp * dt; if (R.pos > 1) { R.pos = 1; R.dir = -1; } if (R.pos < 0) { R.pos = 0; R.dir = 1; }
        const z = document.getElementById('gzone'), m = document.getElementById('gmk'), s = document.getElementById('gsc'); if (z) { z.style.left = (R.c - R.w / 2) * 100 + '%'; z.style.width = R.w * 100 + '%'; } if (m) m.style.left = R.pos * 100 + '%'; if (s) s.textContent = `${R.hits}/${R.n}`;
        if (R.round >= R.n && !R.done) { R.done = true; setTimeout(() => bb.CINE.on && bb.CINE.finish(), 400); } },
      cam: (f, dt, st) => { const A = bb.avatar; A.position.set(pp.x, .3, pp.z); A.rotation.set(0, h0, 0); const U = A.userData; if (U.arms) { U.arms[0].rotation.x = -1.2 + Math.sin(st.t * 8) * .4; U.arms[1].rotation.x = -1.2 - Math.sin(st.t * 8) * .4; } const c = st.t * .15 + h0; return { x: pp.x + Math.sin(c) * 5, y: 2.6, z: pp.z + Math.cos(c) * 5, lx: pp.x, ly: 1.2, lz: pp.z, px: pp.x, pz: pp.z }; },
      onDone: () => end(), onCancel: () => end() });
    const end = () => { if (R.ended) return; R.ended = true; done(R.hits / R.n, R.hits, R.n, R.round); }; }
  function craft(g) { timing(g, (frac, h, n, rounds) => { P().energy = Math.max(0, P().energy - 6); if (rounds < 3) return bb.toast('Shift stopped early · no pay', '#d6c8e4'); paid(g, frac >= .5 ? frac * 1.1 : frac * .5, `${h}/${n} done well${frac >= .85 ? ' · master craftsman!' : ''}`); }); }
  /* carry and drive: targets on the map */
  let J = null;
  function dropNear(g, k) { const z = g.zoneObj; for (let t = 0; t < 30; t++) { const a = Math.random() * 6.28, r = 40 + Math.random() * 60; const x = g.site.x + Math.cos(a) * r, zz = g.site.z + Math.sin(a) * r; const p = bb.nearestRoadPoint(x, zz, 60); if (!p) continue; const nx = p.e.dz, nz = -p.e.dx, o = p.e.w / 2 + 2.5; const q = { x: p.x + nx * o, z: p.z + nz * o }; if (!bb.isWater(q.x, q.z)) return q; } return { x: g.site.x + 30, z: g.site.z }; }
  function startCarry(g) { const drop = dropNear(g); J = { g, kind: 'carry', n: 0, holding: true, drop, t: 60 + g.n * 40, total: 60 + g.n * 40 }; bb.toast(`${g.icon} Carry the ${g.item} to the marker · ${g.n} trips`, '#ffc93c'); }
  function startDrive(g) { const pp = bb.ppos(); const r = bb.nearestRoadPoint(g.site.x, g.site.z, 120); if (!r) return; const e = r.e; const nx = e.dz, nz = -e.dx;
    const v = bb.makeVeh(g.veh, r.x + nx * (e.w / 2 + 2.4), r.z + nz * (e.w / 2 + 2.4), Math.atan2(e.dx, e.dz), 'parked', { fuel: 100, company: true });
    let stops; if (g.to) { const dz = W.zones.find(q => q.id === bb.mpick(g.to.filter(id => W.zones.some(z => z.id === id)))); const c = bb.nearestRoadPoint(dz.x0 + dz.nx * 40, dz.z0 + dz.nz * 40, 200); stops = [{ x: c.x, z: c.z, name: dz.name }]; }
    else { stops = []; let last = g.site; for (let i = 0; i < (g.stops || 3); i++) { const a = Math.random() * 6.28, rr = 120 + Math.random() * 140; const c = bb.nearestRoadPoint(last.x + Math.cos(a) * rr, last.z + Math.sin(a) * rr, 120); if (c) { stops.push({ x: c.x, z: c.z, name: `Stop ${i + 1}` }); last = c; } } }
    let secs = 0, lx = g.site.x, lz = g.site.z; for (const s of stops) { secs += Math.hypot(s.x - lx, s.z - lz) * 1.4 / (g.fast ? 16 : 11) + 10; lx = s.x; lz = s.z; } secs = Math.round(secs + 40);
    J = { g, kind: 'drive', v, stops, i: 0, t: secs, total: secs, crashes: 0 }; bb.toast(`${g.icon} Your ${bb.SPEC[g.veh] ? bb.SPEC[g.veh].label.toLowerCase() : 'vehicle'} is on the road nearby · ${stops.length} stop(s) · ${Math.ceil(secs / 60)} min`, '#ffc93c'); }
  function stopJob(ok, why) { if (!J) return; const j = J; J = null; if (j.v && bb.player.veh !== j.v) bb.removeVeh(j.v); else if (j.v) setTimeout(() => { if (bb.player.veh !== j.v) bb.removeVeh(j.v); }, 30000);
    if (ok) paid(j.g, j.kind === 'drive' ? Math.max(.5, 1 - j.crashes * .1) * (j.t > j.total * .3 ? 1.1 : 1) : (j.t > j.total * .4 ? 1.15 : 1), j.kind === 'drive' && j.crashes ? `${j.crashes} bump(s) · pay docked` : j.t > j.total * .4 ? 'Quick work · bonus' : ''); else bb.toast(why || 'Job stopped', '#ff5d73'); }
  bb.on('crash', () => { if (J && J.kind === 'drive') J.crashes++; });
  bb.onUpdate(dt => { if (!J || bb.inside) return; J.t -= dt; if (J.t <= 0) return stopJob(false, `${J.g.name} · out of time`); const pp = bb.ppos();
    if (J.kind === 'carry') { const tg = J.holding ? J.drop : J.g.site; if (Math.hypot(pp.x - tg.x, pp.z - tg.z) < 4 && bb.player.mode === 'foot') { if (J.holding) { J.n++; J.holding = false; if (J.n >= J.g.n) return stopJob(true); bb.toast(`Trip ${J.n} of ${J.g.n} · back for the next ${J.g.item}`, '#3ddc97'); } else { J.holding = true; J.drop = dropNear(J.g); bb.toast(`Got the ${J.g.item} · take it to the marker`, '#ffc93c'); } } }
    else { const s = J.stops[J.i]; const v = bb.player.veh; if (v === J.v && Math.hypot(pp.x - s.x, pp.z - s.z) < 12 && Math.abs(v.v) < 5) { J.i++; if (J.i >= J.stops.length) return stopJob(true); bb.toast(`${s.name} done · ${J.stops.length - J.i} to go`, '#3ddc97'); bb.hornSfx && bb.hornSfx(); } } });
  bb.addMission(() => { if (!J) return null; const pp = bb.ppos(); const tl = Math.max(0, Math.ceil(J.t)), tt = `${Math.floor(tl / 60)}:${String(tl % 60).padStart(2, '0')}`;
    if (J.kind === 'carry') { const tg = J.holding ? J.drop : J.g.site; return { pri: 50, k: `${J.g.icon} ${J.g.name} · trip ${J.n + 1} of ${J.g.n}`, t: J.holding ? `Carry the ${J.g.item}` : `Fetch the next ${J.g.item}`, m: `${Math.round(Math.hypot(pp.x - tg.x, pp.z - tg.z) * 2.4)} m · ${tt}${bb.player.mode !== 'foot' ? ' · on foot only' : ''}`, target: { x: tg.x, z: tg.z, col: 0xffc93c } }; }
    const s = J.stops[J.i]; const inV = bb.player.veh === J.v; return { pri: 50, k: `${J.g.icon} ${J.g.name} · ${J.i + 1} of ${J.stops.length}`, t: inV ? `Drive to ${s.name}` : `Get in your ${bb.SPEC[J.g.veh] ? bb.SPEC[J.g.veh].label.toLowerCase() : 'vehicle'}`, m: `${tt}`, target: inV ? { x: s.x, z: s.z, col: 0x7fd858 } : { x: J.v.pos.x, z: J.v.pos.z, col: 0x5fb4ff } }; });
  /* shift: time passes */
  function shift(g) { bb.startActivity({ kind: g.name, title: `${g.icon} ${g.name}`, sub: g.line, minutes: (g.h || 4) * 60, effects: { energy: -(g.h || 4) * 4, hunger: -(g.h || 4) * 3 }, onDone: () => paid(g, 1, `${g.h || 4} hour shift`) }); }
  /* the site sheet */
  function gigSheet(g) { const done = ex()[g.id] || 0; bb.openSheet(`${g.icon} ${g.name}`, `${KIND[g.kind]} · ${esc(g.zoneObj.name)}`, `<p class="note">${esc(g.line || '')}</p>` +
      bb.rowHtml('start', J ? 'Finish your current job first' : 'Start work', g.kind === 'craft' ? '8 rounds of the timing game' : g.kind === 'carry' ? `${g.n} trips, on foot, against the clock` : g.kind === 'drive' ? `Company ${bb.SPEC[g.veh] ? bb.SPEC[g.veh].label.toLowerCase() : 'vehicle'} · ${g.to ? 'to another city' : (g.stops || 3) + ' stops'}` : `${g.h || 4} hours (Bay time)`, `up to ${bb.inr(Math.round(payOf(g) * (g.kind === 'shift' ? 1 : 1.15)))}`, J ? 'ghost' : '') +
      `<p class="note">${done ? `Done ${done} time${done > 1 ? 's' : ''} · experience pays ${Math.min(50, done * 5)}% more` : 'Pay goes up a little every time you do it.'}</p>`,
      s => s.onclick = e => { if (e.target.dataset.id !== 'start' || J) return; if (g.kind === 'drive' && ['truck', 'bus'].includes(g.veh) && !(P().lic && P().lic.heavy)) return bb.toast('You need a heavy vehicle licence · RTO office', '#ff9f1c');
        if (g.kind === 'drive' && ['taxi', 'suv'].includes(g.veh) && !(P().lic && P().lic.lmv)) return bb.toast('You need a car licence (LMV) · RTO office', '#ff9f1c'); if (g.kind === 'drive' && ['bike', 'sportsbike'].includes(g.veh) && !(P().lic && P().lic.two)) return bb.toast('You need a two-wheeler licence · RTO office', '#ff9f1c');
        if (g.kind === 'drive' && g.veh === 'auto' && !(P().lic && P().lic.three)) return bb.toast('You need an auto rickshaw licence · RTO office', '#ff9f1c');
        bb.closeSheet(); ({ craft, carry: startCarry, drive: startDrive, shift })[g.kind](g); }); }
  bb.poiHandlers.gig = poi => { const g = GIGS.find(q => q.id === poi.extra); if (g) gigSheet(g); };
  /* Menu → Local work */
  function listSheet() { const pp = bb.ppos(); const st = bb.stateAt(pp.x, pp.z); const mine = GIGS.filter(g => g.site && g.zoneObj.st === st); const list = (mine.length ? mine : GIGS.filter(g => g.site)).sort((a, b) => Math.hypot(a.site.x - pp.x, a.site.z - pp.z) - Math.hypot(b.site.x - pp.x, b.site.z - pp.z));
    bb.openSheet('💼 Local work', `${mine.length ? esc(W.states[st] || st) : 'Nearest first'} · ${list.length} jobs${J ? ' · on the job: ' + esc(J.g.name) : ''}`, (J ? bb.rowHtml('quit', 'Stop the current job', esc(J.g.name), 'Stop', 'danger') : '') +
      list.map(g => bb.rowHtml(g.id, `${g.icon} ${esc(g.name)}`, `${esc(g.zoneObj.name)} · ${KIND[g.kind]} · ${(Math.hypot(g.site.x - pp.x, g.site.z - pp.z) * 2.4 / 1000).toFixed(1)} km`, `${bb.inr(payOf(g))} · Go`, 'ghost')).join(''),
      s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; if (id === 'quit') { stopJob(false, 'You stopped the job'); return listSheet(); } const g = GIGS.find(q => q.id === id); if (!g) return; bb.closeSheet(); if (bb.TRAVEL) bb.TRAVEL.setGps(g.site.x, g.site.z, g.name); bb.toast(`🧭 Directions to ${g.name}, ${g.zoneObj.name}`, '#ffc93c'); }); }
  bb.addApp({ id: 'localwork', label: 'Local work', icon: '🛠', group: 'menu', fn: listSheet });
  bb.LOCALJOBS = { GIGS, timing, get current() { return J; } };
});
