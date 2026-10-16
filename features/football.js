// Football: league matches at the stadiums in Mumbai, Margao (Goa), Bengaluru and Kochi.
// Match tickets and live matches, jerseys, fan clubs and fan marches, crowds outside the stadium on
// matchday, flares, drums and fireworks when the home team wins, and a champions' celebration at the
// end of every season. Fixtures and results come from js/football-data.js and the shared Bay clock.
window.BBFeatures.push(function (bb) {
  const F = window.FOOTBALL; if (!F) return;
  const T = bb.THREE, P = () => bb.P, L = F.league;
  const ex = () => { const p = P(); p.extra = p.extra || {}; p.extra.fb = p.extra.fb || { club: null, tickets: {}, seen: {}, marches: 0, matches: 0 }; return p.extra.fb; };
  const mats = {}; const mat = c => (mats[c] = mats[c] || bb.LMat(c));
  const ticketKey = (f) => `${f.season}:${f.round}:${f.home.id}`;
  const now = () => { const d = F.day(bb.gameDay); return { d, h: bb.clock, mc: F.clock(bb.clock) }; };
  const scoreTxt = (f, res, min) => { const [h, a] = F.scoreAt(res, f, min); return `${f.home.short} ${h}–${a} ${f.away.short}`; };
  const stadiums = () => bb.pois.filter(p => p.type === 'stadium' && F.byId(p.extra));
  function stadiumOf(teamId) { return stadiums().find(p => p.extra === teamId); }
  // The stadium POI sits on the south edge of its block, so the block is the one just north of it.
  // The stadium site registered by its 3D model (centre, size and the gate in front of it).
  function siteOf(poi) { const S = window.STADIA || {}; return S[poi.extra] || { x: poi.x + 40, z: poi.z, rx: 40, rz: 30, gx: poi.x - 2, gz: poi.z, dx: -1, dz: 0 }; }
  function crowdSpot(st, i, n) { if (i % 5 < 3) { const along = (Math.random() - .5) * 34, out = 2 + Math.random() * 22; return { gate: true, x: st.gx + st.dx * out - st.dz * along, z: st.gz + st.dz * out + st.dx * along, a: 0 }; }
    const a = Math.random() * 6.283, k = 1.12 + Math.random() * .1; return { gate: false, a, k, x: st.x + Math.cos(a) * st.rx * k, z: st.z + Math.sin(a) * st.rz * k }; }
  function status(f) { if (!f) return null; const { h, mc } = now(); const res = F.result(f); return { res, mc, h, text: mc.state === 'pre' ? `Kick-off at 7:30 pm${mc.toKick < 120 ? ' · in ' + Math.ceil(mc.toKick) + ' min' : ''}` : mc.state === 'ft' ? `Full time · ${scoreTxt(f, res, 90)}` : mc.state === 'ht' ? `Half-time · ${scoreTxt(f, res, 45)}` : `LIVE ${mc.min}' · ${scoreTxt(f, res, mc.min)}` }; }
  function champion(season) { return F.table(season, L.rounds)[0].team; }

  /* ---------- sound: drums and crowd roar ---------- */
  let noiseBuf = null;
  function roar(vol = .25, dur = 2.2) { const ac = bb.audio; if (!ac || bb.muted) return; try { if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate * 2.5, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = .6; const g = ac.createGain(); const t = ac.currentTime;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .25); g.gain.exponentialRampToValueAtTime(.001, t + dur); s.connect(f); f.connect(g); g.connect(ac.destination); s.start(t); s.stop(t + dur + .1); } catch (e) {} }
  function drum(vol = .18) { const ac = bb.audio; if (!ac || bb.muted) return; try { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(48, t + .18);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + .25); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .3); } catch (e) {} }

  /* ---------- crowds outside the stadium ---------- */
  // One crowd at a time, for the stadium the player is near. mood: 'pre' (gathering), 'win' (celebrating), 'calm', 'sad', 'champ'
  let crowd = null;
  function flagMesh(col) { const g = new T.Group(); const pole = new T.Mesh(new T.BoxGeometry(.05, 2, .05), mat('#3b3a40')); pole.position.y = 1; g.add(pole);
    const cl = new T.Mesh(new T.PlaneGeometry(1.1, .7), new T.MeshLambertMaterial({ color: col, side: T.DoubleSide })); cl.position.set(.58, 1.65, 0); g.add(cl); g.userData.cloth = cl; return g; }
  function buildCrowd(poi, team, away, mood) { clearCrowd(); const st = siteOf(poi); const g = new T.Group(); bb.scene.add(g);
    const n = mood === 'win' || mood === 'champ' ? 48 : mood === 'pre' ? 42 : mood === 'calm' ? 16 : 10; const people = [];
    for (let i = 0; i < n; i++) { const awayFan = away && mood === 'pre' && i % 6 === 5; const col = awayFan ? away.col : i % 4 === 3 ? team.col2 : team.col;
      const p = bb.buildPerson(mat(col)); const sp = crowdSpot(st, i, n); const x = sp.x, z = sp.z;
      p.position.set(x, .3, z); p.rotation.y = Math.atan2(st.x - x, st.z - z) + (Math.random() - .5); if (i % 3 === 0) { const fl = flagMesh(i % 2 ? team.col : team.col2); fl.position.set(.3, .9, 0); p.add(fl); p.userData.flag = fl; } else if (i % 3 === 1 && (mood === 'pre' || mood === 'win' || mood === 'champ')) { const cd = new T.Mesh(new T.PlaneGeometry(.9, .4), cardMat(awayFan ? away : team, i % 2)); cd.position.set(0, 2.15, .35); p.add(cd); p.userData.card = cd; if (p.userData.arms) p.userData.arms.forEach(a => a.rotation.x = -2.4); p.userData.holdCard = true; }
      g.add(p); people.push({ p, ph: Math.random() * 6.3, x, z, sp, st }); }
    // flares: glowing tips with rising smoke
    const flares = []; if (mood === 'win' || mood === 'champ' || mood === 'pre') for (let i = 0; i < 5; i++) { const q = people[Math.floor(Math.random() * people.length)]; const tip = new T.Mesh(new T.SphereGeometry(.12, 6, 4), new T.MeshBasicMaterial({ color: i % 2 ? 0xff3b1f : new T.Color(team.col) }));
      tip.position.set(.3, 2.1, 0); q.p.add(tip); flares.push({ q, tip, puffs: [] }); }
    // fan zone banner on the stadium side of the street
    const banner = new T.Mesh(new T.PlaneGeometry(14, 2.2), new T.MeshBasicMaterial({ map: bannerTex(`${team.fans || team.short} · ${mood === 'champ' ? 'CHAMPIONS' : mood === 'win' ? 'WE WON!' : 'FAN ZONE'}`, team), side: T.DoubleSide }));
    banner.position.set(st.gx + st.dx * 4, 4.2, st.gz + st.dz * 4); banner.rotation.y = Math.atan2(st.dx, st.dz); g.add(banner);
    crowd = { poi, team, mood, g, people, flares, smoke: [], drumT: 0 }; }
  function bannerTex(text, team) { const c = document.createElement('canvas'); c.width = 512; c.height = 80; const x = c.getContext('2d'); x.fillStyle = team.col; x.fillRect(0, 0, 512, 80); x.fillStyle = team.col2 === '#ffffff' ? '#ffffff' : team.col2; x.fillRect(0, 64, 512, 16);
    x.font = '800 40px "Baloo 2", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = team.col2 === '#ffffff' || team.col === '#ffd23a' || team.col === '#ececec' ? '#1a1430' : '#ffffff'; x.fillText(text.toUpperCase(), 256, 34, 490); return new T.CanvasTexture(c); }
  const CM = {}; function cardMat(team, v) { const k = team.id + v; if (CM[k]) return CM[k]; const c = document.createElement('canvas'); c.width = 256; c.height = 112; const x = c.getContext('2d'); x.fillStyle = v ? '#ffffff' : team.col; x.fillRect(0, 0, 256, 112); x.fillStyle = v ? team.col : (team.col2 && team.col2 !== team.col ? team.col2 : '#ffffff');
    const txt = v ? 'COME ON ' + team.short : team.short; let f = 70; x.font = `900 ${f}px "Baloo 2", sans-serif`; while (x.measureText(txt).width > 236 && f > 18) { f -= 3; x.font = `900 ${f}px "Baloo 2", sans-serif`; } x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 128, 60); return CM[k] = new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), side: T.DoubleSide }); }
  /* ---------- outside the stadium (Beta v1.01.26): a car park and both teams' buses, parked and locked ---------- */
  let yard = null;
  function buildYard(poi) { const st = siteOf(poi); const team = F.byId(poi.extra); const f = F.homeMatch(team.id, bb.gameDay); const away = f ? f.away : null; const g = new T.Group(); bb.scene.add(g); const parked = [];
    const sx = -st.dz, sz = st.dx; let C = null; const V3 = new T.Vector3(); const clear = (x, z) => { if (bb.isWater(x, z) || bb.roadAt(x, z, .5)) return false; V3.set(x, 0, z); return !bb.collideTest(V3); };
    for (const out of [26, 36, 48, 60]) for (const side of [1, -1, 1.6, -1.6]) { if (C) break; const cx = st.gx + st.dx * out + sx * side * 30, cz = st.gz + st.dz * out + sz * side * 30; let ok = true; for (const [a, b2] of [[-14, -9], [14, -9], [-14, 9], [14, 9], [0, 0], [-7, 0], [7, 0]]) if (!clear(cx + sx * a + st.dx * b2, cz + sz * a + st.dz * b2)) { ok = false; break; } if (ok) C = { x: cx, z: cz }; }
    if (!C) C = { x: st.gx + st.dx * 30, z: st.gz + st.dz * 30 };
    const h = Math.atan2(sx, sz); const lot = new T.Mesh(new T.PlaneGeometry(30, 19), bb.LMat('#3a3b40')); lot.rotation.x = -Math.PI / 2; lot.rotation.z = -h; lot.position.set(C.x, .05, C.z); g.add(lot);
    const lineM = bb.LMat('#f4f1ea'); for (let i = -6; i <= 6; i++) for (const r of [-1, 1]) { const ln = new T.Mesh(new T.BoxGeometry(.1, .02, 4.6), lineM); const a = i * 2.3; ln.position.set(C.x + sx * a + st.dx * r * 5.7, .07, C.z + sz * a + st.dz * r * 5.7); ln.rotation.y = Math.atan2(st.dx, st.dz); g.add(ln); }
    const sgn = document.createElement('canvas'); sgn.width = 128; sgn.height = 128; const sx2 = sgn.getContext('2d'); sx2.fillStyle = '#1d4fd8'; sx2.fillRect(0, 0, 128, 128); sx2.fillStyle = '#fff'; sx2.font = '900 96px sans-serif'; sx2.textAlign = 'center'; sx2.fillText('P', 64, 100);
    const ps = new T.Mesh(new T.PlaneGeometry(1.2, 1.2), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sgn), side: T.DoubleSide })); ps.position.set(C.x - sx * 16, 2.8, C.z - sz * 16); ps.rotation.y = h + Math.PI / 2; g.add(ps); const pole = new T.Mesh(new T.BoxGeometry(.08, 2.4, .08), bb.LMat('#6b6f76')); pole.position.set(ps.position.x, 1.2, ps.position.z); g.add(pole);
    const types = ['car', 'sedan', 'suv', 'mpv', 'taxi', 'car', 'hatch', 'van']; for (let i = -5; i <= 5; i++) for (const r of [-1, 1]) { if (Math.random() < .35) continue; const a = i * 2.3 + 1.15; const t = types[Math.floor(Math.random() * types.length)]; const ty = bb.SPEC[t] ? t : 'car';
        try { const v = bb.makeVeh(ty, C.x + sx * a + st.dx * r * 5.7, C.z + sz * a + st.dz * r * 5.7, Math.atan2(st.dx * -r, st.dz * -r), 'parked'); v.lot = true; v.locked = true; v.lockMsg = 'Locked · it belongs to a fan at the match'; parked.push(v); } catch (e) {} }
    // the team buses, side by side at the gate, in team colours, locked
    const buses = [[team, 0], [away, 1]].filter(q => q[0]); buses.forEach(([tm, k]) => { let bx = st.gx + st.dx * 12 + sx * (k ? -10 : 10), bz = st.gz + st.dz * 12 + sz * (k ? -10 : 10); { let ok = false; for (const out of [10, 16, 22, 30]) { if (ok) break; for (const lat of [10, 16, 24, 6, 32]) { const x0 = st.gx + st.dx * out + sx * (k ? -lat : lat), z0 = st.gz + st.dz * out + sz * (k ? -lat : lat); if ([-5, 0, 5].every(a => clear(x0 + Math.sin(h) * a, z0 + Math.cos(h) * a)) && Math.hypot(x0 - C.x, z0 - C.z) > 18) { bx = x0; bz = z0; ok = true; break; } } } } const L = { body: tm.col, band: tm.col2 || '#ffffff', text: (tm.name || tm.short).toUpperCase(), dd: false, key: 'team' + tm.id, style: 'team', open: false };
      try { const v = bb.makeBusWith(L, bx, bz, h, 'parked'); v.lot = true; v.noEnter = false; v.locked = true; v.lockName = `${tm.name} team bus`; v.lockMsg = `${tm.name} team bus · locked · the players are inside the stadium`; parked.push(v); } catch (e) {} });
    yard = { poi, g, parked }; }
  function clearYard() { if (!yard) return; bb.scene.remove(yard.g); for (const v of yard.parked) if (bb.vehicles.includes(v) && bb.player.veh !== v) bb.removeVeh(v); yard = null; }
  setInterval(() => { if (!bb.started) return; const pp = bb.ppos(); let best = null, bd = 520; for (const poi of stadiums()) { const d = Math.hypot(pp.x - poi.x, pp.z - poi.z); if (d < bd) { bd = d; best = poi; } }
    if (best && (!yard || yard.poi !== best) && !bb.inside) { clearYard(); buildYard(best); } else if (!best && yard) clearYard(); }, 2000);
  function clearCrowd() { if (!crowd) return; bb.scene.remove(crowd.g); for (const s of crowd.smoke) bb.scene.remove(s.m); crowd = null; }
  const smokeGeo = new T.SphereGeometry(.5, 6, 4);
  function updCrowd(dt, t) { if (!crowd) return; const happy = crowd.mood === 'win' || crowd.mood === 'champ', pre = crowd.mood === 'pre'; for (const q of crowd.people) { const U = q.p.userData; if (U.holdCard && U.card) U.card.position.y = 2.15 + Math.abs(Math.sin(t * 4 + q.ph)) * .12; }
    for (const q of crowd.people) { const U = q.p.userData; if (happy) { q.p.position.y = .3 + Math.abs(Math.sin(t * 6 + q.ph)) * .45; if (U.arms) { U.arms[0].rotation.x = -2.6 + Math.sin(t * 8 + q.ph) * .3; U.arms[1].rotation.x = -2.8; } }
      else if (pre) { const sp = q.sp; if (sp.gate) { q.p.position.set(q.x + Math.sin(t * .4 + q.ph) * .8, .3 + Math.abs(Math.sin(t * 7 + q.ph)) * .06, q.z + Math.cos(t * .3 + q.ph) * .8); } else { sp.a += dt * .012 * (q.ph > 3 ? 1 : -1); const x = q.st.x + Math.cos(sp.a) * q.st.rx * sp.k, z = q.st.z + Math.sin(sp.a) * q.st.rz * sp.k; q.p.rotation.y = Math.atan2(x - q.p.position.x, z - q.p.position.z) || q.p.rotation.y; q.p.position.set(x, .3 + Math.abs(Math.sin(t * 7 + q.ph)) * .06, z); }
        if (U.legs) { const a = Math.sin(t * 7 + q.ph) * .45; U.legs[0].rotation.x = a; U.legs[1].rotation.x = -a; } if (U.arms) U.arms[1].rotation.x = Math.sin(t * 2 + q.ph) > .6 ? -2.7 : 0; }
      else if (crowd.mood === 'sad' && U.arms) { U.arms[0].rotation.x = 0; U.arms[1].rotation.x = 0; }
      if (U.flag) U.flag.userData.cloth.rotation.y = Math.sin(t * 5 + q.ph) * .5; if (U.holdCard && U.arms) { U.arms[0].rotation.x = U.arms[1].rotation.x = -2.5 + Math.sin(t * 4 + q.ph) * .08; } }
    for (const f of crowd.flares) { if (Math.random() < dt * 6) { const wp = new T.Vector3(); f.tip.getWorldPosition(wp); const m = new T.Mesh(smokeGeo, new T.MeshLambertMaterial({ color: f.tip.material.color, transparent: true, opacity: .5, depthWrite: false })); m.position.copy(wp); bb.scene.add(m); crowd.smoke.push({ m, life: 3 }); } }
    for (let i = crowd.smoke.length - 1; i >= 0; i--) { const s = crowd.smoke[i]; s.life -= dt; s.m.position.y += dt * 1.6; s.m.position.x += dt * .5; s.m.scale.setScalar(1 + (3 - s.life) * .8); s.m.material.opacity = Math.max(0, s.life / 3 * .45); if (s.life <= 0) { bb.scene.remove(s.m); s.m.material.dispose(); crowd.smoke.splice(i, 1); } }
    crowd.drumT -= dt; if ((pre || happy) && crowd.drumT <= 0) { crowd.drumT = .5; const pp = bb.ppos(); const d = Math.hypot(pp.x - crowd.poi.x, pp.z - crowd.poi.z); if (d < 140) drum(.2 * (1 - d / 140)); } }

  /* ---------- fireworks ---------- */
  const fw = []; let fwT = 0;
  function burst(x, y, z, col) { const n = 70, pos = new Float32Array(n * 3), vel = []; for (let i = 0; i < n; i++) { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; const a = Math.random() * 6.283, e = Math.acos(Math.random() * 2 - 1), s = 9 + Math.random() * 6; vel.push([Math.sin(e) * Math.cos(a) * s, Math.cos(e) * s, Math.sin(e) * Math.sin(a) * s]); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); const m = new T.PointsMaterial({ color: col, size: 1.6, transparent: true, opacity: 1, depthWrite: false, blending: T.AdditiveBlending });
    const pt = new T.Points(g, m); bb.scene.add(pt); fw.push({ pt, vel, life: 1.8 }); }
  function updFireworks(dt, poi, team) { if (poi) { fwT -= dt; if (fwT <= 0) { fwT = .35 + Math.random() * .5; const b = siteOf(poi); burst(b.x + (Math.random() - .5) * b.rx * 1.4, 60 + Math.random() * 35, b.z + (Math.random() - .5) * 60, [team.col, team.col2, '#ffd36a', '#ffffff'][Math.floor(Math.random() * 4)]);
        const pp = bb.ppos(); const d = Math.hypot(pp.x - poi.x, pp.z - poi.z); if (d < 600 && Math.random() < .5) setTimeout(() => drum(.12 * (1 - d / 600)), 300); } }
    for (let i = fw.length - 1; i >= 0; i--) { const f = fw[i]; f.life -= dt; const a = f.pt.geometry.attributes.position; for (let k = 0; k < f.vel.length; k++) { const v = f.vel[k]; v[1] -= 6 * dt; v[0] *= .985; v[2] *= .985; a.array[k * 3] += v[0] * dt; a.array[k * 3 + 1] += v[1] * dt; a.array[k * 3 + 2] += v[2] * dt; } a.needsUpdate = true; f.pt.material.opacity = Math.max(0, f.life / 1.8);
      if (f.life <= 0) { bb.scene.remove(f.pt); f.pt.geometry.dispose(); f.pt.material.dispose(); fw.splice(i, 1); } } }

  /* ---------- watching a match: inside the stadium (features/sports.js) ---------- */
  function watch(poi, f, vip) { if (bb.SPORTS) return bb.SPORTS.enter(poi, 'football', f, vip); bb.toast('The stands are closed today', '#d6c8e4'); }
  function placeOutside(poi) { bb.teleport(poi.x + Math.sin(poi.rot || 0) * 3, poi.z + Math.cos(poi.rot || 0) * 3, poi.rot || 0); }
  const bayClock = () => bb.bayTime();

  /* ---------- the stadium gate ---------- */
  function stadiumSheet(poi) { const team = F.byId(poi.extra); const fb = ex(); const f = F.homeMatch(team.id, bb.gameDay); const st = status(f); const p = P();
    const nx = !f || st.mc.state === 'ft' ? F.nextHome(team.id, bb.gameDay + 1) : null; const key = f ? ticketKey(f) : ''; const has = f && fb.tickets[key];
    const d = F.day(bb.gameDay); const champDays = !d.matchday; const champ = champDays ? champion(d.season) : null;
    let rows = '';
    if (f && st.mc.state !== 'ft') {
      const gates = bb.testMode || st.mc.state !== 'pre' || st.mc.toKick <= 30;
      if (has) rows += bb.rowHtml('enter', gates ? 'Go in and watch' : 'You have a ticket', gates ? `${has === 'vip' ? 'VIP box' : 'Stands'} · ${st.text}` : `Gates open at 7:00 pm · ${st.text}`, gates ? 'Enter' : 'Wait', gates ? '' : 'ghost');
      else { const disc = fb.club === team.id ? .5 : 1; rows += bb.rowHtml('stands', 'Ticket · stands', `${st.text}${disc < 1 ? ' · fan club half price' : ''}`, bb.inr(bb.cost('fb.stands', 300) * disc)) + bb.rowHtml('vip', 'Ticket · VIP box', 'Padded seats, snacks included', bb.inr(bb.cost('fb.vip', 1500) * disc), 'ghost'); }
    } else if (champ && champ.id === team.id) rows += `<p class="note">🏆 ${bb.esc(team.name)} are the champions! The trophy celebration starts at 7:30 pm outside the stadium.</p>`;
    else rows += `<p class="note">${f ? `Today: ${bb.esc(st.text)}. ` : ''}${nx ? `Next home match: ${bb.esc(nx.f.away.name)} in ${nx.inDays} Bay day${nx.inDays > 1 ? 's' : ''}, 7:30 pm.` : 'No more home matches this season.'}</p>`;
    if (!f || st.mc.state === 'ft') rows += bb.rowHtml('tour', 'Stadium tour', 'Walk in, see the pitch and the stands', bb.inr(bb.cost('st.tour', 150)), 'ghost');
    else if (st.mc.state === 'pre' && bb.SPORTS) rows += bb.rowHtml('bet', 'Bet on this match', `${team.short} v ${f.away.short} · 18+ · bets close at kick-off`, 'Bet', 'ghost');
    const jersey = p.outfit.topCol === team.col;
    rows += bb.rowHtml('jersey', `${team.short} home jersey`, jersey ? 'You are wearing it' : 'Wear your team colours · fans notice', jersey ? 'Worn' : bb.inr(bb.cost('fb.jersey', 999)), jersey ? 'ghost' : '');
    rows += bb.rowHtml('club', `${team.fans} fan club`, fb.club === team.id ? 'Member · half-price tickets, fan marches, match alerts' : fb.club ? `You support ${F.byId(fb.club).name} · switching costs the fee again` : 'Half-price tickets, fan marches and match alerts', fb.club === team.id ? 'Member' : bb.inr(bb.cost('fb.club', 500)), fb.club === team.id ? 'ghost' : '');
    rows += bb.rowHtml('table', 'League table and fixtures', `${L.name} · in the Sports app`, 'Open', 'ghost');
    bb.openSheet(`⚽ ${bb.esc(poi.name)}`, `${bb.esc(team.name)} · ${f ? `${bb.esc(f.home.short)} v ${bb.esc(f.away.short)} today` : champDays ? 'Season over · champions\' celebrations' : 'No match today'}`, rows, s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return;
      if (id === 'table') return bb.SPORTS ? bb.SPORTS.open('football') : null;
      if (id === 'bet') return bb.SPORTS.betSheet('football', f, () => stadiumSheet(poi));
      if (id === 'tour') { if (!bb.spend(bb.cost('st.tour', 150), true)) return; bb.closeSheet(); return bb.SPORTS.enter(poi, 'football', null, false); }
      if (id === 'stands' || id === 'vip') { const disc = fb.club === team.id ? .5 : 1; if (!bb.spend((id === 'vip' ? bb.cost('fb.vip', 1500) : bb.cost('fb.stands', 300)) * disc, true)) return; fb.tickets = { [key]: id === 'vip' ? 'vip' : 'stand' }; bb.setDirty(); bb.toast(`Ticket booked · ${f.home.short} v ${f.away.short}`, '#3ddc97'); bb.emit('football', { kind: 'ticket' }); return stadiumSheet(poi); }
      if (id === 'enter') { const s2 = status(f); if (!bb.testMode && s2.mc.state === 'pre' && s2.mc.toKick > 30) return bb.toast('Gates open at 7:00 pm', '#ff9f1c'); bb.closeSheet(); return watch(poi, f, fb.tickets[key] === 'vip'); }
      if (id === 'jersey' && !jersey) { if (!bb.spend(bb.cost('fb.jersey', 999), true)) return; p.outfit.topCol = team.col; bb.applyOutfit(); bb.setDirty(); bb.toast(`You're in ${team.short} colours`, team.col); bb.emit('football', { kind: 'jersey' }); return stadiumSheet(poi); }
      if (id === 'club' && fb.club !== team.id) { if (!bb.spend(bb.cost('fb.club', 500), true)) return; fb.club = team.id; bb.setDirty(); bb.toast(`Welcome to the ${team.fans}! Match alerts are on`, team.col); bb.emit('football', { kind: 'club', team: team.id }); return stadiumSheet(poi); } }); }
  bb.poiHandlers.stadium = stadiumSheet;

  // League table, fixtures and bets live in the Sports app (features/sports.js).

  /* ---------- fan march before home matches ---------- */
  let march = null;
  function startMarch(poi, team, f) { const st = siteOf(poi); const g = new T.Group(); bb.scene.add(g); const people = [];
    for (let i = 0; i < 18; i++) { const p = bb.buildPerson(mat(i % 3 === 2 ? team.col2 : team.col)); if (i % 2 === 0) { const fl = flagMesh(i % 4 ? team.col : team.col2); fl.position.set(.3, .9, 0); p.add(fl); p.userData.flag = fl; } g.add(p); people.push({ p, ph: Math.random() * 6, o: i }); }
    // the march walks in from 120 m out, straight to the stadium gate
    march = { poi, team, f, g, people, st, d: 120, with: 0, done: false, x: st.gx + st.dx * 120, z: st.gz + st.dz * 120 }; }
  function updMarch(dt, t) { if (!march) return; const m = march, st = m.st; if (!m.done) { m.d -= 1.6 * dt; if (m.d <= 2) { m.done = true; finishMarch(); return; } } m.x = st.gx + st.dx * m.d; m.z = st.gz + st.dz * m.d; const ry = Math.atan2(-st.dx, -st.dz);
    m.people.forEach((q, i) => { const row = Math.floor(i / 3), col = i % 3; const back = row * 1.4, side = (col - 1) * 1.1; q.p.position.set(m.x + st.dx * back - st.dz * side, .3 + Math.abs(Math.sin(t * 7 + q.ph)) * .08, m.z + st.dz * back + st.dx * side); q.p.rotation.y = ry;
      const U = q.p.userData; if (U.legs) { const a = Math.sin(t * 7 + q.ph) * .5; U.legs[0].rotation.x = a; U.legs[1].rotation.x = -a; } if (U.arms) U.arms[1].rotation.x = -2.6 + Math.sin(t * 4 + q.ph) * .3; if (U.flag) U.flag.userData.cloth.rotation.y = Math.sin(t * 5 + q.ph) * .5; });
    const pp = bb.ppos(); if (Math.hypot(pp.x - m.x, pp.z - m.z) < 14 && bb.player.mode === 'foot') m.with += dt; m.drumT = (m.drumT || 0) - dt; if (m.drumT <= 0) { m.drumT = .5; const d = Math.hypot(pp.x - m.x, pp.z - m.z); if (d < 120) drum(.25 * (1 - d / 120)); } }
  function finishMarch() { const m = march; const fb = ex(); const ok = m.with > 25; if (ok) { fb.marches++; bb.earn(bb.price(200), 'football'); bb.toast(`Fan march done · ${m.team.fans} reach the gate · +${bb.inr(bb.price(200))}`, m.team.col); roar(.3, 2.5); bb.emit('football', { kind: 'march' }); bb.setDirty(); }
    setTimeout(() => { if (march === m) { bb.scene.remove(m.g); march = null; } }, 4000); }

  /* ---------- matchday loop: crowds, alerts, celebrations ---------- */
  let tick = 0; const alerted = {};
  bb.onUpdate(dt => { const t = performance.now() / 1000; updCrowd(dt, t); updMarch(dt, t); tick -= dt;
    let fwPoi = null, fwTeam = null; const { d, mc } = now();
    if (tick <= 0) { tick = .5; const pp = bb.ppos(); const fb = ex(); let want = null;
      for (const poi of stadiums()) { const team = F.byId(poi.extra); const f = F.homeMatch(team.id, bb.gameDay); const dist = Math.hypot(pp.x - poi.x, pp.z - poi.z);
        let mood = null; if (f) { const res = F.result(f); if (mc.state === 'pre' && mc.toKick < 150) mood = 'pre'; else if (mc.state === 'live' || mc.state === 'ht') mood = 'calm'; else if (mc.state === 'ft' && mc.since < 120) mood = res.hg > res.ag ? 'win' : res.hg < res.ag ? 'sad' : 'calm';
          // goal alerts and results for fan club members, wherever they are
          if (fb.club === team.id && (mc.state === 'live' || mc.state === 'ht' || mc.state === 'ft')) { const k = ticketKey(f); const seen = fb.seen[k] || 0; const min = mc.state === 'ft' ? 90 : mc.min; const goals = res.goals.filter(g => g.m <= min);
            if (goals.length > seen && !document.querySelector('#wait:not([hidden])')) { const g = goals[goals.length - 1]; bb.toast(`📱 ${g.team === team.id ? 'GOAL' : 'Goal against'} · ${g.m}' · ${scoreTxt(f, res, min)}`, g.team === team.id ? team.col : '#d6c8e4'); fb.seen[k] = goals.length; }
            if (mc.state === 'ft' && !alerted[k]) { alerted[k] = 1; bb.toast(`📱 Full time · ${scoreTxt(f, res, 90)}${res.hg > res.ag ? ' · the city celebrates!' : ''}`, res.hg > res.ag ? team.col : '#d6c8e4'); } }
          if (mc.state === 'pre' && mc.toKick < 90 && mc.toKick > 30 && !march && fb.club === team.id && dist < 400 && !alerted['m' + ticketKey(f)]) { alerted['m' + ticketKey(f)] = 1; startMarch(poi, team, f); bb.toast(`The ${team.fans} fan march is coming down the road · walk with them to the gate`, team.col); } }
        else if (!d.matchday) { const ch = champion(d.season); if (ch.id === team.id && bb.clock >= L.kick && bb.clock < 23.5) mood = 'champ'; }
        if (mood === 'win' || mood === 'champ') { if (bb.clock >= 18 || bb.clock < 5) { fwPoi = poi; fwTeam = team; } if (dist < 900 && !alerted['w' + d.season + d.round + team.id]) { alerted['w' + d.season + d.round + team.id] = 1; bb.toast(mood === 'champ' ? `🏆 ${team.name} are the champions! Fireworks over ${poi.name}` : `${team.name} won! Fans are celebrating at ${poi.name}`, team.col); if (dist < 300) roar(.3, 3); } }
        if (mood && dist < 450 && (!want || dist < want.dist)) want = { poi, team, away: f ? f.away : null, mood, dist }; }
      if (fwPoi) updFireworks.poi = [fwPoi, fwTeam]; else updFireworks.poi = null;
      if (!want || bb.inside) { if (crowd) clearCrowd(); } else if (!crowd || crowd.poi !== want.poi || crowd.mood !== want.mood) buildCrowd(want.poi, want.team, want.away, want.mood);
      // Fans cheer a player wearing the home jersey near the stadium on matchday
      if (crowd && P().outfit.topCol === crowd.team.col && (crowd.mood === 'pre' || crowd.mood === 'win') && Math.hypot(pp.x - crowd.poi.x, pp.z - crowd.poi.z) < 40 && !alerted['j' + d.season + d.round + crowd.team.id]) { alerted['j' + d.season + d.round + crowd.team.id] = 1; bb.toast(`Fans high-five you in your ${crowd.team.short} jersey`, crowd.team.col); }
    }
    const fp = updFireworks.poi; updFireworks(dt, fp ? fp[0] : null, fp ? fp[1] : null); });

  bb.addMission(() => { if (march && !march.done) { return { pri: 45, k: `${march.team.fans} fan march`, t: 'Walk with the fans to the gate', m: march.with > 25 ? 'You are part of the march' : 'Stay close to the march', target: { x: march.x, z: march.z, col: 0xffc93c } }; } return null; });
});
