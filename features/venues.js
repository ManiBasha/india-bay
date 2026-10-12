// Walk-in places: shopping malls (shops, food court, cinema, game zone) and the insides of famous places
// (temples, churches, dargahs and mosques, palaces and forts, caves, domed tombs). Uses bb.enterVenue.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE, W = bb.WORLD, P = () => bb.P, esc = bb.esc;
  const mats = {}; const mat = c => (mats[c] = mats[c] || bb.LMat(c)); const glow = {}; const gmat = c => (glow[c] = glow[c] || new T.MeshBasicMaterial({ color: c }));
  function box(g, w, h, d, x, y, z, m) { const b = new T.Mesh(new T.BoxGeometry(w, h, d), typeof m === 'string' ? mat(m) : m); b.position.set(x, y, z); g.add(b); return b; }
  function cyl(g, r1, r2, h, x, y, z, m, seg = 12) { const b = new T.Mesh(new T.CylinderGeometry(r1, r2, h, seg), typeof m === 'string' ? mat(m) : m); b.position.set(x, y, z); g.add(b); return b; }
  function tex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return new T.CanvasTexture(c); }
  function label(g, text, w, h, x, y, z, ry, bg, fg) { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex(512, Math.round(512 * h / w), (c, W2, H2) => { c.fillStyle = bg; c.fillRect(0, 0, W2, H2); c.fillStyle = fg; c.font = `800 ${Math.round(H2 * .62)}px "Baloo 2", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, W2 / 2, H2 / 2 + 2, W2 - 16); }) }));
    m.position.set(x, y, z); m.rotation.y = ry || 0; g.add(m); return m; }
  function floor(g, w, d, col, ceil) { const f = new T.Mesh(new T.PlaneGeometry(w, d), mat(col)); f.rotation.x = -Math.PI / 2; g.add(f); if (ceil) { const c = new T.Mesh(new T.PlaneGeometry(w, d), mat(ceil[0])); c.rotation.x = Math.PI / 2; c.position.y = ceil[1]; g.add(c); } }
  function walls(g, w, d, h, col) { box(g, w, h, .4, 0, h / 2, -d / 2, col); box(g, w, h, .4, 0, h / 2, d / 2, col); box(g, .4, h, d, -w / 2, h / 2, 0, col); box(g, .4, h, d, w / 2, h / 2, 0, col); }
  function light(g, col, k, x, y, z, dist) { const l = new T.PointLight(col, k, dist || 40); l.position.set(x, y, z); g.add(l); return l; }

  /* ---------- people walking around inside ---------- */
  let crowd = []; function addWalkers(g, n, w, d, cols) { crowd = []; for (let i = 0; i < n; i++) { const p = bb.buildPerson(mat(cols[i % cols.length])); g.add(p); const q = { p, x: (Math.random() - .5) * w * .7, z: (Math.random() - .5) * d * .5, tx: 0, tz: 0, ph: Math.random() * 6, w, d, wait: Math.random() * 3 }; pickT(q); crowd.push(q); } }
  function pickT(q) { q.tx = (Math.random() - .5) * q.w * .75; q.tz = (Math.random() - .5) * q.d * .6; }
  function updWalkers(dt, t) { for (const q of crowd) { if (q.wait > 0) { q.wait -= dt; } else { const dx = q.tx - q.x, dz = q.tz - q.z, d = Math.hypot(dx, dz); if (d < .4) { q.wait = 1 + Math.random() * 4; pickT(q); } else { q.x += dx / d * 1.3 * dt; q.z += dz / d * 1.3 * dt; q.p.rotation.y = Math.atan2(dx, dz); } }
    const mv = q.wait > 0 ? 0 : 1; q.p.position.set(q.x, 0, q.z); const U = q.p.userData; if (U.legs) { const a = Math.sin(t * 7 + q.ph) * .45 * mv; U.legs[0].rotation.x = a; U.legs[1].rotation.x = -a; } } }
  bb.onUpdate((dt, now) => { if (bb.insideVenue && bb.insideVenue.walkers) updWalkers(dt, now); });

  /* ---------- shopping malls ---------- */
  const STORES = [['clothes', 'Fashion Street', '#c2185b'], ['mobile', 'Mobile World', '#3b2f8f'], ['furniture', 'Home & Decor', '#8d5a2b'], ['baycart', 'BayCart Pickup', '#ff7a1a']];
  function mallVenue(poi) { const w = 64, d = 48; const name = poi.name; const zoneFood = (poi.zone && poi.zone.food) || 'MH';
    return { poi, name, w, d, bg: '#efe9df', walkers: true, exitName: `Exit · back outside ${name}`, exit: { x: 0, z: d / 2 - 1.2 }, start: { x: 0, z: d / 2 - 3, h: Math.PI },
      blk: [[-3.2, -3.2, 3.2, 3.2], [-w / 2, -d / 2, w / 2, -d / 2 + 4], [-w / 2, -d / 2, -w / 2 + 4, d / 2], [w / 2 - 4, -d / 2, w / 2, d / 2]],
      build: g => { floor(g, w, d, '#e8e2d6', ['#f6f3ee', 11]); walls(g, w, d, 11, '#f1ece4'); light(g, 0xfff4e0, 1, 0, 9, 0, 60); light(g, 0xfff4e0, .6, -20, 9, -8, 40); light(g, 0xfff4e0, .6, 20, 9, -8, 40);
        // floor tiles, the upper floor balcony, escalators and a fountain in the atrium
        for (let i = -3; i <= 3; i++) box(g, .08, .02, d - 2, i * 9, .01, 0, '#d9d0c0'); box(g, w - 8, .5, 6, 0, 5.5, -d / 2 + 7, '#d9d4cc'); box(g, w - 8, 1.1, .15, 0, 6.3, -d / 2 + 10, gmat('#9fd3e8'));
        for (const s of [-1, 1]) { const e = box(g, 3, .6, 12, s * 10, 2.8, 4, '#b7b1a8'); e.rotation.x = s * .38; box(g, .2, 1, 12, s * 10 - 1.6, 3.6, 4, gmat('#bfe6f5')).rotation.x = s * .38; }
        cyl(g, 3, 3.2, .8, 0, .4, 0, '#cfc7b8', 24); const water = cyl(g, 2.7, 2.7, .1, 0, .82, 0, gmat('#58b6e0'), 24); cyl(g, .3, .3, 2.6, 0, 1.6, 0, '#cfc7b8'); g.userData.water = water;
        label(g, name.toUpperCase(), 22, 2, 0, 8.6, -d / 2 + .25, 0, '#c2185b', '#ffffff');
        const pts = [];
        STORES.forEach(([k, n, col], i) => { const x = -24 + i * 16; box(g, 12, 5, 3, x, 2.5, -d / 2 + 2, col); box(g, 11, 3.6, .1, x, 2, -d / 2 + 3.55, gmat('#cfe9f2')); label(g, n.toUpperCase(), 10, 1.1, x, 4.5, -d / 2 + 3.62, 0, col, '#ffffff');
          for (let j = 0; j < 3; j++) box(g, .8, 1.6, .8, x - 3 + j * 3, .8, -d / 2 + 1.4, j % 2 ? '#f4f1ea' : '#2b2b30'); pts.push({ k: 'store:' + k, name: k === 'baycart' ? 'BayCart Pickup · order anything' : `${n} · shop`, x, z: -d / 2 + 5.2 }); });
        const side = [[-1, -9, 'food', 'FOOD COURT', '#e4572e'], [-1, 7, 'atm', 'BANK ATM', '#0f5f5f'], [1, -9, 'cinema', 'CINEPLEX', '#1b1b2f'], [1, 7, 'games', 'GAME ZONE', '#5b3fa0']];
        for (const [s, z, k, n, col] of side) { const x = s * (w / 2 - 2); box(g, 3, 5, 12, x, 2.5, z, col); label(g, n, 10, 1.1, x - s * 1.56, 4.6, z, -s * Math.PI / 2, col, '#ffffff'); pts.push({ k, name: { food: `Food court · ${W.states[(poi.zone || {}).st] || ''} dishes`, atm: 'Bank ATM', cinema: `Cineplex · movie ${bb.inr(bb.cost('mall.movie', 250))}`, games: 'Game Zone · bowling and VR' }[k], x: x - s * 4.6, z }); }
        for (let i = 0; i < 4; i++) { box(g, 2.4, .7, .9, -6 + i * 4, .35, d / 2 - 9, '#8d6e63'); } pts.push({ k: 'wc', name: `Restrooms · ${bb.inr(bb.cost('svc.toilet', 5))}`, x: -w / 2 + 6, z: d / 2 - 3 });
        addWalkers(g, 16, w, d, ['#ff6fa8', '#5fb4ff', '#ffc93c', '#3ddc97', '#f4f1ea', '#c38bff', '#ff9f1c']); return pts; },
      onAction: k => { const pz = { zone: poi.zone, x: poi.x, z: poi.z, rot: poi.rot };
        if (k.startsWith('store:')) { const t = k.slice(6); if (t === 'baycart') return bb.openApp('baycart'); return bb.openPoi(Object.assign({ type: t, name: `${STORES.find(s => s[0] === t)[1]} · ${name}` }, pz)); }
        if (k === 'food') return bb.foodSheet(Object.assign({ type: 'food', name: `Food court · ${name}`, extra: zoneFood }, pz)); if (k === 'atm') return bb.openPoi(Object.assign({ type: 'bank', name: `ATM · ${name}` }, pz));
        if (k === 'wc') return bb.openPoi(Object.assign({ type: 'toilet', name: `Restrooms · ${name}` }, pz)); if (k === 'cinema') return cinema(name); if (k === 'games') return games(name); } }; }
  const FILMS = ['a family drama with six songs', 'an action film · the hero jumps a train', 'a romantic comedy set in Goa', 'a cricket underdog story', 'a horror film · everyone screams', 'a big-budget fantasy epic', 'a Malayalam thriller with subtitles', 'a Kannada crime drama'];
  function cinema(name) { const fee = bb.cost('mall.movie', 250); bb.openSheet(`🎬 Cineplex · ${esc(name)}`, `Shows every hour · cash ${bb.inr(P().cash)}`, bb.rowHtml('movie', 'Movie ticket', `Now showing: ${esc(bb.mpick(FILMS))} · 150 game minutes`, bb.inr(fee)) + bb.rowHtml('combo', 'Ticket with popcorn and cola', 'Fills you up a little', bb.inr(fee + bb.cost('mall.popcorn', 180)), 'ghost'),
    s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; const tot = id === 'combo' ? fee + bb.cost('mall.popcorn', 180) : fee; if (!bb.spend(tot, true)) return; bb.closeSheet();
      bb.startActivity({ kind: 'Cinema', title: `At the movies · ${name}`, sub: 'The lights go down…', minutes: 150, effects: id === 'combo' ? { hunger: 25, energy: 5 } : { energy: 5 }, cancelLabel: 'Leave early', buttons: [{ id: 'clap', label: '👏 Whistle', fn: () => bb.toast('The whole hall whistles with you', '#ffc93c') }],
        onDone: () => { bb.toast('What a film! Interval samosas were the best part', '#3ddc97'); bb.emit('mall', { kind: 'movie' }); } }); }); }
  function games(name) { bb.openSheet(`🎳 Game Zone · ${esc(name)}`, `Cash ${bb.inr(P().cash)}`, bb.rowHtml('bowl', 'Bowling · one game', 'Ten frames, see your score', bb.inr(bb.cost('mall.bowling', 200))) + bb.rowHtml('vr', 'VR ride · roller coaster', 'Hold on tight', bb.inr(bb.cost('mall.vr', 300)), 'ghost') + bb.rowHtml('claw', 'Claw machine', 'Win a soft toy (maybe)', bb.inr(50), 'ghost'),
    s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; const fee = id === 'bowl' ? bb.cost('mall.bowling', 200) : id === 'vr' ? bb.cost('mall.vr', 300) : 50; if (!bb.spend(fee, true)) return; bb.closeSheet();
      if (id === 'claw') { const win = Math.random() < .25; bb.toast(win ? '🧸 You won a soft toy!' : 'So close · the claw slipped', win ? '#3ddc97' : '#d6c8e4'); return; }
      bb.startActivity({ kind: id === 'bowl' ? 'Bowling' : 'VR ride', title: id === 'bowl' ? 'Bowling night' : 'VR roller coaster', minutes: id === 'bowl' ? 40 : 15, effects: { energy: -3 }, onDone: () => { if (id === 'bowl') { const sc = 60 + Math.floor(Math.random() * 180); bb.toast(`Bowling score ${sc}${sc > 200 ? ' · strike after strike!' : sc > 140 ? ' · nice game' : ''}`, '#ffc93c'); } else bb.toast('Your legs are still shaking · what a ride', '#ffc93c'); bb.emit('mall', { kind: id }); } }); }); }
  bb.poiHandlers.mall = poi => { if (bb.clock < 10 || bb.clock >= 22) return bb.toast(`${poi.name} is open 10 am to 10 pm`, '#ff9f1c'); bb.enterVenue(mallVenue(poi)); bb.toast(`Welcome to ${poi.name}`, '#ffc93c'); bb.emit('mall', { kind: 'enter' }); };

  /* ---------- inside famous places ---------- */
  const CAT = [[/dargah|masjid|mosque|haji ali/i, 'dargah'], [/maqbara|gumbaz|tomb/i, 'tomb'], [/caves?\b/i, 'cave'], [/church|basilica|cathedral|chapel|bom jesus|conception/i, 'church'],
    [/temple|mandir|matha|dilwara|jyotirlinga|sabarimala|siddhivinayak|dagdusheth|trimbak|gommateshwara|shravanabelagola/i, 'temple'], [/palace|fort|mahal|wada|haveli|bhawan|vilas/i, 'palace']];
  const catOf = n => { for (const [re, k] of CAT) if (re.test(n)) return k; return null; };
  const FACTS = { 'Gol Gumbaz': 'Whisper here and the whispering gallery carries it right across the dome', 'Ellora Caves': 'The Kailasa temple was carved down from a single rock', 'Ajanta Caves': 'Buddhist paintings on these walls are well over 1,500 years old',
    'Basilica of Bom Jesus': 'The basilica holds the remains of St Francis Xavier', 'Mysore Palace': 'On Sundays and festivals nearly 100,000 bulbs light up the palace', 'Hawa Mahal': 'The pink facade has 953 small windows for the breeze',
    'Amber Fort': 'The Sheesh Mahal sparkles with thousands of tiny mirrors', 'Mehrangarh Fort': 'The fort stands on a rock high above the blue city of Jodhpur', 'Padmanabhaswamy Temple': 'The deity reclines on the serpent Anantha',
    'Siddhivinayak Temple': 'Mumbai\'s Ganesh temple, first built in 1801', 'Haji Ali Dargah': 'The dargah sits on an islet, reached by a causeway at low tide', 'Somnath Temple': 'Revered as the first of the twelve jyotirlingas',
    'Shaniwar Wada': 'The Peshwas\' palace, completed in 1732', 'Laxmi Vilas Palace': 'Said to be about four times the size of Buckingham Palace', 'Umaid Bhawan Palace': 'Part royal home, part hotel, part museum',
    'Aina Mahal': 'An 18th-century hall of mirrors', 'City Palace, Udaipur': 'The palace looks out over Lake Pichola', 'Bibi Ka Maqbara': 'Often called the Taj of the Deccan', 'Se Cathedral': 'Home of the famous Golden Bell',
    'Udupi Sri Krishna Matha': 'Devotees see the deity through the Kanakana Kindi window', 'Edakkal Caves': 'Rock engravings here go back thousands of years', 'Jaisalmer Fort': 'A living fort: people still live inside its golden walls', 'Dilwara Temples': 'Famous for their delicate white marble carvings' };
  const LINES = { temple: ['Bells ring as devotees enter', 'The scent of incense and jasmine', 'A priest offers you prasad', 'Lamps flicker around the sanctum'], church: ['Sunlight through the stained glass', 'Candles glow by the altar', 'The choir practises a hymn', 'Quiet pews and high arches'],
    dargah: ['Qawwali drifts across the courtyard', 'Rose petals and a green chadar', 'Pigeons rise from the arches', 'Pilgrims tie threads for their wishes'], palace: ['Chandeliers and painted ceilings', 'A guide tells stories of the old rulers', 'Silver thrones and armour in the halls', 'Jharokha windows look over the city'],
    cave: ['Your torch lights up ancient carvings', 'Cool air deep in the rock', 'Painted ceilings in the gloom', 'Footsteps echo in the hall'], tomb: ['The great dome soars above', 'Every sound echoes back', 'Marble lattice screens let in the light', 'A quiet, cool hall'] };
  const PAID = { palace: true, cave: true, tomb: true };
  function placeVenue(pl, cat, from) { const [name, px, pz] = pl; const rot = Math.atan2(from.x - px, from.z - pz); const poi = { x: px + Math.sin(rot) * 50, z: pz + Math.cos(rot) * 50, rot, name };
    // put the exit back where the player came in from
    poi.x = from.x; poi.z = from.z; poi.rot = Math.atan2(from.x - px, from.z - pz);
    const B = { temple: buildTemple, church: buildChurch, dargah: buildDargah, palace: buildPalace, cave: buildCave, tomb: buildTomb }[cat];
    const size = { temple: [30, 40], church: [26, 44], dargah: [40, 34], palace: [44, 34], cave: [30, 40], tomb: [36, 36] }[cat];
    return { poi, name, w: size[0], d: size[1], bg: { cave: '#0b0806', tomb: '#1a1714', church: '#1b1726' }[cat] || '#1d140d', walkers: true, cat, exitName: `Exit · back outside ${name}`,
      build: g => { const pts = B(g, size[0], size[1], name); addWalkers(g, cat === 'cave' ? 5 : 9, size[0], size[1], cat === 'dargah' ? ['#f4f1ea', '#1e8a4c', '#2b2b30'] : cat === 'temple' ? ['#ff9f1c', '#f4f1ea', '#c8102e', '#ffd04a'] : ['#5fb4ff', '#f4f1ea', '#ff6fa8', '#3ddc97']); return pts; },
      onAction: k => act(k, cat, name), onExit: () => { crowd = []; } }; }
  function act(k, cat, name) { const fact = FACTS[name];
    if (k === 'pray') { P().energy = Math.min(100, P().energy + 6); P().health = Math.min(100, P().health + 3); bb.toast(cat === 'church' ? 'A quiet prayer · you feel calm' : cat === 'dargah' ? 'You make a wish at the dargah' : 'Darshan done · you feel at peace', '#ffc93c'); bb.emit('attraction', { kind: 'pray', name }); return; }
    if (k === 'offer') { const fee = bb.cost('att.donate', 51); if (!bb.spend(fee, true)) return; bb.toast(cat === 'church' ? `You light a candle · ${bb.inr(fee)}` : cat === 'dargah' ? `You offer a chadar and rose petals · ${bb.inr(fee)}` : `You offer flowers and a coconut · ${bb.inr(fee)}`, '#ffc93c'); bb.emit('attraction', { kind: 'offer', name }); return; }
    if (k === 'prasad') { P().hunger = Math.min(100, P().hunger + 12); bb.toast(cat === 'dargah' ? 'Sweet tabarruk from the langar' : 'Sweet prasad · ladoo and sheera', '#ffc93c'); return; }
    if (k === 'bell') { ring(); bb.toast('Dinnng… the temple bell rings', '#ffc93c'); return; }
    if (k === 'listen') { bb.startActivity({ kind: cat === 'church' ? 'Choir' : 'Qawwali', title: cat === 'church' ? 'The choir sings' : 'A qawwali session', sub: name, minutes: 30, effects: { energy: 8 }, onDone: () => bb.toast('Beautiful music · you feel rested', '#3ddc97') }); return; }
    if (k === 'echo') { ring(.5, 220); setTimeout(() => ring(.35, 220), 500); setTimeout(() => ring(.2, 220), 1000); bb.toast('Hello… hello… hello… the dome answers back', '#ffc93c'); return; }
    if (k === 'guide') { const fee = bb.cost('att.guide', 200); if (!bb.spend(fee, true)) return; bb.startActivity({ kind: 'Guided tour', title: `Guided tour · ${name}`, sub: fact || bb.mpick(LINES[cat]), minutes: 45, effects: { energy: -4 }, buttons: [{ id: 'q', label: '❓ Ask a question', fn: () => bb.toast(bb.mpick(['"This was built over many years by thousands of craftsmen"', '"Kings once held court in this very hall"', '"Look up · every panel tells a story"', '"Visitors come from all over the world"']), '#d6c8e4') }], onDone: () => { bb.toast('Tour over · you know this place well now', '#3ddc97'); bb.emit('attraction', { kind: 'guide', name }); } }); return; }
    if (k === 'look') { bb.toast(fact || bb.mpick(LINES[cat]), '#ffc93c'); return; }
    if (k === 'throne') { bb.toast('You pose by the throne · say cheese! (press P for photo mode outside)', '#ffc93c'); return; } }
  function ring(vol = .25, f = 660) { const ac = bb.audio; if (!ac || bb.muted) return; try { const t = ac.currentTime; for (const m of [1, 2.4, 3.9]) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f * m; g.gain.setValueAtTime(vol / m, t); g.gain.exponentialRampToValueAtTime(.0005, t + 2.4); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 2.5); } } catch (e) {} }

  function buildTemple(g, w, d, name) { floor(g, w, d, '#e8d9b8'); walls(g, w, d, 7, '#d9b77e'); light(g, 0xffc070, 1.2, 0, 5, -d / 2 + 6, 30); light(g, 0xffd9a0, .6, 0, 6, 6, 40);
    for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { cyl(g, .6, .7, 6, s * 6, 3, d / 2 - 8 - i * 5, '#c99a5a', 8); box(g, 1.6, .5, 1.6, s * 6, 6.2, d / 2 - 8 - i * 5, '#b88a4a'); }
    box(g, 12, 9, 6, 0, 4.5, -d / 2 + 3, '#b88a4a'); box(g, 4.4, 5, .3, 0, 2.5, -d / 2 + 6.1, '#2b1d10'); cyl(g, 1, 1.2, 2.6, 0, 1.3, -d / 2 + 4.5, gmat('#ffd36a'), 10); const sp = new T.Mesh(new T.SphereGeometry(.9, 12, 8), gmat('#ffb347')); sp.position.set(0, 3.3, -d / 2 + 4.5); g.add(sp);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI; const di = new T.Mesh(new T.SphereGeometry(.14, 6, 4), gmat('#ffb347')); di.position.set(Math.cos(a) * 3.2, .25, -d / 2 + 8 - Math.sin(a) * 1.2); g.add(di); }
    for (const s of [-1, 1]) { cyl(g, .05, .05, 1.6, s * 2.6, 6.2, -d / 2 + 9, '#3b3a40', 4); const bell = cyl(g, .25, .55, .8, s * 2.6, 5, -d / 2 + 9, '#c9a227', 10); }
    label(g, name.toUpperCase(), 14, 1.4, 0, 8.2, -d / 2 + 6.15, 0, '#7b2a10', '#ffd36a');
    return [{ k: 'pray', name: 'Darshan · pray', x: 0, z: -d / 2 + 10.5 }, { k: 'offer', name: `Offer flowers · ${bb.inr(bb.cost('att.donate', 51))}`, x: -4.5, z: -d / 2 + 11 }, { k: 'bell', name: 'Ring the bell', x: 2.6, z: -d / 2 + 10.2 }, { k: 'prasad', name: 'Take prasad', x: 7.5, z: -d / 2 + 13 }, { k: 'look', name: 'Read about this temple', x: -9, z: 6 }]; }
  function buildChurch(g, w, d, name) { floor(g, w, d, '#d8cfc0'); walls(g, w, d, 12, '#efe8da'); light(g, 0xfff1d6, 1, 0, 9, -d / 2 + 6, 40); light(g, 0xcfe0ff, .5, 0, 10, 8, 40);
    for (let r = 0; r < 8; r++) for (const s of [-1, 1]) box(g, 7, 1, 1, s * 5.5, .5, -d / 2 + 14 + r * 3.2, '#6b4a32');
    box(g, 6, 1.2, 3, 0, .6, -d / 2 + 6, '#f4f1ea'); box(g, .3, 4, .3, 0, 3.8, -d / 2 + 2, '#c9a227'); box(g, 2, .3, .3, 0, 4.8, -d / 2 + 2, '#c9a227'); box(g, 10, 7, .3, 0, 5, -d / 2 + .3, '#c9a227');
    const SG = ['#d62f4b', '#2d6cdf', '#ffd04a', '#1e8a4c', '#7a3cff']; for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const m = new T.Mesh(new T.PlaneGeometry(2.2, 5), gmat(SG[(i + (s > 0 ? 2 : 0)) % 5])); m.position.set(s * (w / 2 - .25), 6.5, -d / 2 + 10 + i * 7); m.rotation.y = -s * Math.PI / 2; g.add(m); }
    for (let i = 0; i < 9; i++) { const c = new T.Mesh(new T.SphereGeometry(.1, 6, 4), gmat('#ffd36a')); c.position.set(-2.4 + i * .6, 1.45, -d / 2 + 6); g.add(c); }
    label(g, name.toUpperCase(), 12, 1.2, 0, 10.5, -d / 2 + .5, 0, '#3a2a55', '#ffd36a');
    return [{ k: 'pray', name: 'Sit and pray', x: 0, z: -d / 2 + 11 }, { k: 'offer', name: `Light a candle · ${bb.inr(bb.cost('att.donate', 51))}`, x: -4, z: -d / 2 + 8.5 }, { k: 'listen', name: 'Listen to the choir', x: 5, z: -d / 2 + 9 }, { k: 'look', name: 'Read about this church', x: -9, z: 10 }]; }
  function buildDargah(g, w, d, name) { floor(g, w, d, '#f2ede2'); walls(g, w, d, 6, '#f4f1ea'); light(g, 0xfff4e0, 1, 0, 8, 0, 50);
    for (let i = -3; i <= 3; i++) { box(g, .9, 5, .9, i * 5, 2.5, -d / 2 + 6, '#f4f1ea'); const ar = new T.Mesh(new T.TorusGeometry(2.05, .3, 6, 12, Math.PI), mat('#e9e2d0')); ar.position.set(i * 5 + 2.5, 5, -d / 2 + 6); g.add(ar); }
    box(g, 10, 6, 7, 0, 3, -d / 2 + 2.5, '#ffffff'); const dm = new T.Mesh(new T.SphereGeometry(3.6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat('#ffffff')); dm.position.set(0, 6, -d / 2 + 2.5); g.add(dm);
    box(g, 4, 1, 2.4, 0, .5, -d / 2 + 6.5, '#1e8a4c'); for (let i = 0; i < 12; i++) { const p = new T.Mesh(new T.SphereGeometry(.08, 4, 3), gmat('#d62f4b')); p.position.set(-1.6 + Math.random() * 3.2, 1.05, -d / 2 + 5.6 + Math.random() * 1.8); g.add(p); }
    for (const s of [-1, 1]) cyl(g, .7, .9, 16, s * (w / 2 - 3), 8, -d / 2 + 3, '#f4f1ea', 10);
    return [{ k: 'pray', name: 'Make a wish', x: 0, z: -d / 2 + 10 }, { k: 'offer', name: `Offer a chadar · ${bb.inr(bb.cost('att.donate', 51))}`, x: -4, z: -d / 2 + 9.5 }, { k: 'listen', name: 'Listen to qawwali', x: 9, z: 4 }, { k: 'prasad', name: 'Langar · tabarruk', x: -10, z: 6 }, { k: 'look', name: 'Read about this place', x: 6, z: -d / 2 + 11 }]; }
  function buildPalace(g, w, d, name) { floor(g, w, d, '#a8322d'); walls(g, w, d, 10, '#e9d7b0'); light(g, 0xffe2b0, 1.1, 0, 8, -4, 50); light(g, 0xffe2b0, .6, 0, 8, 10, 40);
    for (let i = -3; i <= 3; i++) { if (!i) continue; cyl(g, .6, .6, 9, i * 6, 4.5, -4, '#f4e9cf', 10); } box(g, w - 4, .02, 6, 0, .02, 4, '#c9a227');
    box(g, 8, 1, 5, 0, .5, -d / 2 + 4, '#7b2a10'); box(g, 2.6, 3.2, 1.8, 0, 2.6, -d / 2 + 3.5, '#c9a227'); box(g, 3.4, .5, 2, 0, 1.25, -d / 2 + 3.6, '#d62f4b');
    for (const x of [-12, 0, 12]) { const ch = new T.Mesh(new T.SphereGeometry(1.2, 10, 8), gmat('#fff2c8')); ch.position.set(x, 8.2, 4); g.add(ch); cyl(g, .03, .03, 1.6, x, 9.2, 4, '#c9a227', 4); }
    const ART = ['#3a6fd8', '#1e8a4c', '#c2185b', '#ff9f1c']; for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const m = new T.Mesh(new T.PlaneGeometry(4, 3), gmat(ART[(i + (s > 0 ? 1 : 0)) % 4])); m.position.set(s * (w / 2 - .25), 5, -d / 2 + 8 + i * 6.5); m.rotation.y = -s * Math.PI / 2; g.add(m); }
    for (let i = 0; i < 4; i++) { box(g, 1.4, 1, 1.4, -15 + i * 2.2, .5, d / 2 - 6, '#2b2b30'); box(g, .9, 1.7, .5, -15 + i * 2.2, 1.9, d / 2 - 6, '#8d939a'); }
    label(g, name.toUpperCase(), 16, 1.4, 0, 8.6, -d / 2 + .3, 0, '#7b2a10', '#ffd36a');
    return [{ k: 'throne', name: 'The royal throne', x: 0, z: -d / 2 + 8 }, { k: 'guide', name: `Guided tour · ${bb.inr(bb.cost('att.guide', 200))}`, x: -8, z: 2 }, { k: 'look', name: 'The armoury', x: -12, z: d / 2 - 8.5 }, { k: 'look', name: 'Royal paintings', x: w / 2 - 3, z: 0 }]; }
  function buildCave(g, w, d, name) { floor(g, w, d, '#5a4a3a'); light(g, 0xffb070, 1.4, 0, 3, 6, 22); light(g, 0xffb070, .8, 0, 3, -d / 2 + 6, 22);
    for (let i = 0; i < 14; i++) { const r = new T.Mesh(new T.DodecahedronGeometry(3 + Math.random() * 3, 0), mat(i % 2 ? '#6b5a48' : '#5e4e3e')); const s = i % 2 ? 1 : -1; r.position.set(s * (w / 2 - 1 + Math.random() * 2), 2 + Math.random() * 4, -d / 2 + (i >> 1) * 6); g.add(r); }
    const roof = new T.Mesh(new T.PlaneGeometry(w, d), mat('#3f3428')); roof.rotation.x = Math.PI / 2; roof.position.y = 7; g.add(roof);
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) cyl(g, .7, .8, 7, s * 6, 3.5, d / 2 - 10 - i * 4.5, '#7a6652', 8);
    box(g, 6, 1.6, 3, 0, .8, -d / 2 + 4, '#7a6652'); const bud = new T.Mesh(new T.SphereGeometry(1.4, 12, 10), mat('#8a7560')); bud.position.set(0, 2.9, -d / 2 + 4); g.add(bud); const hd = new T.Mesh(new T.SphereGeometry(.7, 12, 10), mat('#8a7560')); hd.position.set(0, 4.6, -d / 2 + 4); g.add(hd);
    const halo = new T.Mesh(new T.CircleGeometry(1.6, 24), mat('#6b5a48')); halo.position.set(0, 4.6, -d / 2 + 3.2); g.add(halo);
    return [{ k: 'look', name: 'Look at the carvings', x: 0, z: -d / 2 + 8 }, { k: 'guide', name: `Guided tour · ${bb.inr(bb.cost('att.guide', 200))}`, x: 6, z: 2 }, { k: 'look', name: 'Ancient wall paintings', x: -8, z: -4 }]; }
  function buildTomb(g, w, d, name) { floor(g, w, d, '#cfc6b4'); walls(g, w, d, 14, '#d8cfbd'); light(g, 0xfff1d6, 1, 0, 12, 0, 50);
    const dm = new T.Mesh(new T.SphereGeometry(w / 2 - .5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshLambertMaterial({ color: '#d8cfbd', side: T.BackSide })); dm.position.y = 14; g.add(dm);
    box(g, 6, 1.4, 3, 0, .7, 0, '#f4f0e6'); box(g, 7, .3, 4, 0, 1.55, 0, '#e9e2d0'); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; const m = new T.Mesh(new T.PlaneGeometry(3, 5), gmat('#ffe9b8')); m.position.set(Math.cos(a) * (w / 2 - .3), 4, Math.sin(a) * (d / 2 - .3)); m.lookAt(0, 4, 0); g.add(m); }
    return [{ k: 'echo', name: 'Clap and listen to the echo', x: 0, z: 6 }, { k: 'look', name: 'Read about this monument', x: -8, z: -6 }, { k: 'guide', name: `Guided tour · ${bb.inr(bb.cost('att.guide', 200))}`, x: 8, z: -6 }]; }

  // "Go inside" prompt when you walk up to a famous place that has an inside
  const PLACES = (W.places || []).map(p => ({ p, cat: catOf(p[0]) })).filter(q => q.cat && !/stadium|station|stone|junction|statue/i.test(q.p[0]));
  bb.addPrompt(api => { if (bb.player.mode !== 'foot' || bb.inside) return null; const pp = bb.ppos(); let best = null, bd = 55; for (const q of PLACES) { const d = Math.hypot(q.p[1] - pp.x, q.p[2] - pp.z); if (d < bd) { bd = d; best = q; } } if (!best) return null;
    const paid = PAID[best.cat]; const fee = bb.cost('att.ticket', 50); return { text: `Go inside ${best.p[0]}${paid ? ' · ticket ' + bb.inr(fee) : ''}`, fn: () => enterPlace(best, paid ? fee : 0) }; });
  function enterPlace(q, fee) { if (fee && !bb.spend(fee, true)) return; const pp = bb.ppos(); const v = placeVenue(q.p, q.cat, { x: pp.x, z: pp.z }); bb.enterVenue(v); const p = P(); p.extra = p.extra || {}; const seen = p.extra.visited = p.extra.visited || {};
    if (!seen[q.p[0]]) { seen[q.p[0]] = bb.istISO(); const bonus = bb.price(100); bb.earn(bonus, 'explore'); bb.toast(`First visit to ${esc(q.p[0])} · explorer bonus +${bb.inr(bonus)}`, '#3ddc97'); bb.setDirty(); }
    else bb.toast(FACTS[q.p[0]] || bb.mpick(LINES[q.cat]), '#ffc93c'); bb.emit('attraction', { kind: 'enter', name: q.p[0], cat: q.cat }); }
  bb.VENUES = { mallVenue, placeVenue, catOf };
});
