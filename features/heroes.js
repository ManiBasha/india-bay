// India Bay heroes (Beta v1.01.12): six original superheroes with regional flavour. Each one is in one place at a
// time and moves every 20 minutes, worked out from the shared clock so every player sees the hero in the same city.
// Sightings show on billboards, in Phone → BayRadio and as a radio flash. Each hero has an admin switch
// (Admin → Game settings → Heroes). Meet a hero for an autograph (a small reward once a day) and an achievement.
window.BBFeatures.push(function (bb) {
  const T = bb.THREE, W = bb.WORLD, P = () => bb.P, esc = bb.esc;
  const HEROES = [
    { id: 'vidyut', name: 'Vidyut', title: 'the Lightning Guardian', st: 'KL', icon: '⚡', suit: '#1f4fd8', acc: '#ffd23f', fx: 'bolt', line: 'Fast as monsoon lightning over the backwaters. Vidyut guards every boat and bus in Kerala.' },
    { id: 'varsha', name: 'Varsha', title: 'the Monsoon Guardian', st: 'MH', icon: '🌧', suit: '#0f766e', acc: '#cfe8ff', fx: 'rain', line: 'She rides the first rain clouds into the city and clears the flooded roads for everyone.' },
    { id: 'marudhar', name: 'Marudhar', title: 'the Desert Falcon', st: 'RJ', icon: '🦅', suit: '#c2410c', acc: '#f6d58a', fx: 'wings', line: 'He soars over the forts of the Thar and finds every lost traveller before sunset.' },
    { id: 'patang', name: 'Patang', title: 'the Kite Ace', st: 'GJ', icon: '🪁', suit: '#7b2a5e', acc: '#ffc93c', fx: 'kite', line: 'She flies on a giant kite above the pols, and never lets a single kite string hurt a bird.' },
    { id: 'sagar', name: 'Sagar', title: 'the Tide Rider', st: 'GA', icon: '🌊', suit: '#0e7490', acc: '#ff8a3d', fx: 'wave', line: 'He surfs the Arabian Sea and keeps the beaches of Goa safe for swimmers.' },
    { id: 'chandan', name: 'Chandan', title: 'the Forest Spirit', st: 'KA', icon: '🌿', suit: '#3f6212', acc: '#d9b26f', fx: 'leaves', line: 'Born in the sandalwood forests, Chandan protects the elephants and the coffee hills.' }];
  const SLOT = 20 * 60 * 1000;
  for (const h of HEROES) bb.achAdd && bb.achAdd(['hero_' + h.id, h.icon, `Met ${h.name}`, `Get an autograph from ${h.name}, ${h.title}`]);
  bb.achAdd && bb.achAdd(['heroes_all', '🦸', 'Hero hunter', 'Meet all six India Bay heroes']);
  const on = h => !bb.CFG.heroes || bb.CFG.heroes[h.id] !== false;
  function hash(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return (x >>> 0) / 4294967296; }
  // where each hero is right now: a famous place (or the centre) of one of the bigger towns in its state
  function whereNow(h, slot) { const zs = W.zones.filter(z => z.st === h.st && z.size !== 'small'); const L = zs.length ? zs : W.zones.filter(z => z.st === h.st); if (!L.length) return null;
    const z = L[Math.floor(hash(h.id + ':' + slot) * L.length)]; const pl = (W.places || []).filter(p => p[1] > z.x0 - 60 && p[1] < z.x0 + z.nx * 80 + 60 && p[2] > z.z0 - 60 && p[2] < z.z0 + z.nz * 80 + 60);
    const p = pl.length ? pl[Math.floor(hash(h.id + '#' + slot) * pl.length)] : [z.name, z.x0 + z.nx * 40, z.z0 + z.nz * 40]; return { zone: z, place: p[0], x: p[1], z: p[2] }; }
  /* ---------- the hero figure ---------- */
  const LM = c => bb.LMat(c), G = c => new T.MeshBasicMaterial({ color: c });
  function build(h) { const g = new T.Group(); const body = bb.buildPerson(LM(h.suit), { female: ['varsha', 'patang'].includes(h.id) }); body.scale.setScalar(1.12); g.add(body);
    const cape = new T.Mesh(new T.PlaneGeometry(.9, 1.5, 1, 4), new T.MeshLambertMaterial({ color: h.acc, side: T.DoubleSide })); cape.position.set(0, 1.05, -.24); g.add(cape); g.userData.cape = cape;
    const mask = new T.Mesh(new T.BoxGeometry(.34, .08, .05), LM('#14141a')); mask.position.set(0, 1.78, .17); g.add(mask);
    const emb = new T.Mesh(new T.CircleGeometry(.12, 12), G(h.acc)); emb.position.set(0, 1.35, .2); g.add(emb);
    const fx = new T.Group(); g.add(fx); g.userData.fx = fx;
    if (h.fx === 'bolt') { for (let i = 0; i < 6; i++) { const b = new T.Mesh(new T.BoxGeometry(.05, .5, .05), G(0xfff27a)); b.position.set(Math.cos(i) * .6, .6 + i * .25, Math.sin(i) * .6); b.rotation.z = i % 2 ? .6 : -.6; fx.add(b); } }
    if (h.fx === 'rain') { const cl = new T.Mesh(new T.SphereGeometry(.8, 10, 8), LM('#dfe8f0')); cl.scale.set(1.6, .6, 1); cl.position.y = 3.1; fx.add(cl); for (let i = 0; i < 14; i++) { const d = new T.Mesh(new T.BoxGeometry(.03, .35, .03), G(0x9fd4ff)); d.position.set((Math.random() - .5) * 2, 2.4 - Math.random() * 2, (Math.random() - .5) * 1.4); d.userData.drop = true; fx.add(d); } }
    if (h.fx === 'wings') for (const s of [-1, 1]) { const w = new T.Mesh(new T.ConeGeometry(.5, 2.2, 3), LM(h.acc)); w.rotation.z = s * 1.2; w.position.set(s * 1.1, 1.4, -.2); w.userData.wing = s; fx.add(w); }
    if (h.fx === 'kite') { const k = new T.Mesh(new T.BoxGeometry(1.6, 1.6, .05), new T.MeshLambertMaterial({ color: h.acc, side: T.DoubleSide })); k.rotation.z = Math.PI / 4; k.position.set(0, 3.6, -.6); fx.add(k); const s = new T.Mesh(new T.BoxGeometry(.02, 2, .02), LM('#eee')); s.position.set(0, 2.4, -.3); fx.add(s); }
    if (h.fx === 'wave') { const b = new T.Mesh(new T.BoxGeometry(.6, .08, 2.2), LM(h.acc)); b.position.y = .02; fx.add(b); }
    if (h.fx === 'leaves') for (let i = 0; i < 10; i++) { const l = new T.Mesh(new T.PlaneGeometry(.22, .12), new T.MeshLambertMaterial({ color: i % 2 ? '#65a30d' : '#a3e635', side: T.DoubleSide })); l.userData.leaf = i; fx.add(l); }
    const halo = new T.Mesh(new T.RingGeometry(.9, 1.05, 24), new T.MeshBasicMaterial({ color: h.acc, transparent: true, opacity: .5, side: T.DoubleSide })); halo.rotation.x = -Math.PI / 2; halo.position.y = .05; g.add(halo);
    return g; }
  /* ---------- state: who is where, news and billboards ---------- */
  const live = {}; let lastSlot = -1;
  function tickSlot() { const slot = Math.floor(bb.now() / SLOT); if (slot === lastSlot) return; const first = lastSlot < 0; lastSlot = slot;
    for (const h of HEROES) { if (!on(h)) { if (live[h.id]) drop(h); continue; } const w = whereNow(h, slot); if (!w) continue; const L = live[h.id] = live[h.id] || {}; L.w = w; L.slot = slot; if (L.g) { bb.scene.remove(L.g); L.g = null; }
      bb.NEWS && bb.NEWS.push({ icon: h.icon, title: `${h.name} spotted in ${w.zone.name}`, text: `${h.name}, ${h.title}, is near ${w.place}. ${h.line}` });
      if (!first) { const pp = bb.ppos(); const here = bb.zoneAt(pp.x, pp.z, 300); if (here && here.st === h.st && bb.started) bb.toast(`📻 BayRadio flash · ${h.icon} ${esc(h.name)} is now seen in ${esc(w.zone.name)}`, h.acc); } }
    if (bb.refreshBillboards) bb.refreshBillboards(); }
  function drop(h) { const L = live[h.id]; if (L && L.g) bb.scene.remove(L.g); delete live[h.id]; }
  bb.addHouseAd && bb.addHouseAd(slot => { if (!slot.zone) return null; const h = HEROES.find(q => on(q) && live[q.id] && q.st === slot.zone.st); if (!h) return null; const w = live[h.id].w;
    return { title: `${h.icon} ${h.name.toUpperCase()} SPOTTED`, line2: `${w.zone.name} · near ${w.place}`, desc: `${h.name}, ${h.title}, was seen near ${w.place} in ${w.zone.name}. Tap for directions and go meet the hero.`, cat: 'News', fg: '#1d1433', bg: h.acc, target: { x: w.x, z: w.z, name: `${h.name} · ${w.place}` } }; });
  setInterval(tickSlot, 5000); bb.onStart(tickSlot);
  /* ---------- in the world: flying round the place, landing when you come close ---------- */
  bb.onUpdate(dt => { if (!bb.started) return; const pp = bb.ppos(); const t = performance.now() / 1000;
    for (const h of HEROES) { const L = live[h.id]; if (!L || !L.w) continue; const d = Math.hypot(L.w.x - pp.x, L.w.z - pp.z);
      if (d > 700 || bb.inside) { if (L.g) L.g.visible = false; continue; } if (!L.g) { L.g = build(h); bb.scene.add(L.g); L.a = 0; L.y = 12; L.g.position.set(L.w.x + 22, 12, L.w.z); } L.g.visible = true;
      const close = Math.hypot(L.g.position.x - pp.x, L.g.position.z - pp.z) < 45 && bb.player.mode === 'foot';
      L.a += dt * (close ? 0 : .35); const tx = close ? pp.x + 2.6 : L.w.x + Math.cos(L.a) * 22, tz = close ? pp.z + 2.2 : L.w.z + Math.sin(L.a) * 22, ty = close ? 0 : 9 + Math.sin(t * .8) * 2;
      const k = 1 - Math.exp(-dt * (close ? 2 : 1.2)); L.g.position.x += (tx - L.g.position.x) * k; L.g.position.z += (tz - L.g.position.z) * k; L.y += (ty - L.y) * k; L.g.position.y = L.y + (h.fx === 'wave' && L.y < 1 ? Math.sin(t * 2) * .05 : 0);
      L.g.rotation.y = close ? Math.atan2(pp.x - L.g.position.x, pp.z - L.g.position.z) : -L.a; L.g.rotation.x = L.y > 2 ? .35 : 0;
      const c = L.g.userData.cape; if (c) c.rotation.x = .2 + Math.sin(t * 6) * .12 + (L.y > 2 ? .6 : 0);
      for (const o of L.g.userData.fx.children) { if (o.userData.drop) { o.position.y -= dt * 3; if (o.position.y < .2) o.position.y = 2.6; } if (o.userData.wing) o.rotation.x = Math.sin(t * 8) * .3; if (o.userData.leaf != null) { const a = t * 1.5 + o.userData.leaf * .63; o.position.set(Math.cos(a) * .9, .4 + (o.userData.leaf % 5) * .35, Math.sin(a) * .9); o.rotation.y = a; } }
      if (h.fx === 'bolt') L.g.userData.fx.visible = Math.sin(t * 17) > -.3; } });
  /* ---------- meeting a hero ---------- */
  (bb.addFirstPrompt || bb.addPrompt)(() => { if (bb.inside || bb.player.mode !== 'foot') return null; const pp = bb.ppos();
    for (const h of HEROES) { const L = live[h.id]; if (!L || !L.g || !L.g.visible || L.y > 1.5) continue; if (Math.hypot(L.g.position.x - pp.x, L.g.position.z - pp.z) < 5) return { text: `Meet ${h.name} ${h.icon}`, fn: () => meet(h) }; } return null; });
  function meet(h) { const x = P().extra; x.heroes = x.heroes || {}; const day = bb.istISO(); const got = x.heroes[h.id] === day;
    bb.openSheet(`${h.icon} ${h.name}`, h.title, `<p class="note" style="font-size:14px">"${esc(h.line)}"</p>` + bb.rowHtml('auto', '✍ Ask for an autograph', got ? 'You already have one from today' : `A gift for fans · ${bb.inr(bb.price(500))} once a day`, got ? 'Done' : 'Ask', got ? 'ghost' : '') + bb.rowHtml('pic', '📸 Take a selfie', 'Opens photo mode · post it on BayGram', 'Photo', 'ghost'),
      s => s.onclick = e => { const id = e.target.dataset.id; if (id === 'auto' && !got) { x.heroes[h.id] = day; bb.earn(bb.price(500), 'hero'); bb.grant && bb.grant('hero_' + h.id); const met = HEROES.filter(q => P().ach && P().ach['hero_' + q.id]).length; if (met >= HEROES.length) bb.grant && bb.grant('heroes_all'); bb.setDirty(); bb.toast(`${h.icon} ${esc(h.name)} signs your phone case · +${bb.inr(bb.price(500))}`, h.acc); meet(h); }
        if (id === 'pic') { bb.closeSheet(); document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP', key: 'p' })); } }); }
  bb.HEROES = { list: HEROES, where: id => live[id] && live[id].w, whereNow, debug: id => { const L = live[id]; return L ? { has: !!L.g, vis: L.g && L.g.visible, pos: L.g && [L.g.position.x, L.g.position.y, L.g.position.z], w: [L.w.x, L.w.z] } : null; } };
});
