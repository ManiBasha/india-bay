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
  function blockOf(poi) { if (poi._b) return poi._b; let best = null, bd = 1e9; for (const b of bb.blocks) { const dz = poi.z - b.z; if (Math.abs(poi.x - b.x) > 34 || dz < 18 || dz > 42) continue; const d = Math.abs(dz - 30) + Math.abs(poi.x - b.x) * .1; if (d < bd) { bd = d; best = b; } }
    if (!best) for (const b of bb.blocks) { const d = Math.hypot(b.x - poi.x, b.z - poi.z); if (d < bd) { bd = d; best = b; } } poi._b = best; return best; }
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
  function buildCrowd(poi, team, away, mood) { clearCrowd(); const b = blockOf(poi); if (!b) return; const g = new T.Group(); bb.scene.add(g);
    const n = mood === 'win' || mood === 'champ' ? 48 : mood === 'pre' ? 42 : mood === 'calm' ? 16 : 10; const people = [];
    for (let i = 0; i < n; i++) { const awayFan = away && mood === 'pre' && i % 6 === 5; const col = awayFan ? away.col : i % 4 === 3 ? team.col2 : team.col;
      const p = bb.buildPerson(mat(col)); const side = i % 3 ? 1 : Math.floor(Math.random() * 4); const t = (Math.random() - .5) * 56; const off = 29 + Math.random() * 1.6;
      const x = side < 2 ? b.x + t : b.x + (side === 2 ? -off : off), z = side < 2 ? b.z + (side ? off : -off) : b.z + t;
      p.position.set(x, .3, z); p.rotation.y = Math.atan2(b.x - x, b.z - z) + (Math.random() - .5); if (i % 3 === 0) { const fl = flagMesh(i % 2 ? team.col : team.col2); fl.position.set(.3, .9, 0); p.add(fl); p.userData.flag = fl; }
      g.add(p); people.push({ p, ph: Math.random() * 6.3, x, z, side, t, off, b }); }
    // flares: glowing tips with rising smoke
    const flares = []; if (mood === 'win' || mood === 'champ' || mood === 'pre') for (let i = 0; i < 5; i++) { const q = people[Math.floor(Math.random() * people.length)]; const tip = new T.Mesh(new T.SphereGeometry(.12, 6, 4), new T.MeshBasicMaterial({ color: i % 2 ? 0xff3b1f : new T.Color(team.col) }));
      tip.position.set(.3, 2.1, 0); q.p.add(tip); flares.push({ q, tip, puffs: [] }); }
    // fan zone banner on the stadium side of the street
    const banner = new T.Mesh(new T.PlaneGeometry(14, 2.2), new T.MeshBasicMaterial({ map: bannerTex(`${team.fans || team.short} · ${mood === 'champ' ? 'CHAMPIONS' : mood === 'win' ? 'WE WON!' : 'FAN ZONE'}`, team), side: T.DoubleSide }));
    banner.position.set(poi.x, 4.2, poi.z); banner.rotation.y = poi.rot || 0; g.add(banner);
    crowd = { poi, team, mood, g, people, flares, smoke: [], drumT: 0 }; }
  function bannerTex(text, team) { const c = document.createElement('canvas'); c.width = 512; c.height = 80; const x = c.getContext('2d'); x.fillStyle = team.col; x.fillRect(0, 0, 512, 80); x.fillStyle = team.col2 === '#ffffff' ? '#ffffff' : team.col2; x.fillRect(0, 64, 512, 16);
    x.font = '800 40px "Baloo 2", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = team.col2 === '#ffffff' || team.col === '#ffd23a' || team.col === '#ececec' ? '#1a1430' : '#ffffff'; x.fillText(text.toUpperCase(), 256, 34, 490); return new T.CanvasTexture(c); }
  function clearCrowd() { if (!crowd) return; bb.scene.remove(crowd.g); for (const s of crowd.smoke) bb.scene.remove(s.m); crowd = null; }
  const smokeGeo = new T.SphereGeometry(.5, 6, 4);
  function updCrowd(dt, t) { if (!crowd) return; const happy = crowd.mood === 'win' || crowd.mood === 'champ', pre = crowd.mood === 'pre';
    for (const q of crowd.people) { const U = q.p.userData; if (happy) { q.p.position.y = .3 + Math.abs(Math.sin(t * 6 + q.ph)) * .45; if (U.arms) { U.arms[0].rotation.x = -2.6 + Math.sin(t * 8 + q.ph) * .3; U.arms[1].rotation.x = -2.8; } }
      else if (pre) { q.t += Math.sin(q.ph) * dt * .8; if (Math.abs(q.t) > 28) q.ph += Math.PI; const b = q.b; const x = q.side < 2 ? b.x + q.t : b.x + (q.side === 2 ? -q.off : q.off), z = q.side < 2 ? b.z + (q.side ? q.off : -q.off) : b.z + q.t; q.p.position.set(x, .3 + Math.abs(Math.sin(t * 7 + q.ph)) * .06, z);
        if (U.legs) { const a = Math.sin(t * 7 + q.ph) * .45; U.legs[0].rotation.x = a; U.legs[1].rotation.x = -a; } if (U.arms) U.arms[1].rotation.x = Math.sin(t * 2 + q.ph) > .6 ? -2.7 : 0; }
      else if (crowd.mood === 'sad' && U.arms) { U.arms[0].rotation.x = 0; U.arms[1].rotation.x = 0; }
      if (U.flag) U.flag.userData.cloth.rotation.y = Math.sin(t * 5 + q.ph) * .5; }
    for (const f of crowd.flares) { if (Math.random() < dt * 6) { const wp = new T.Vector3(); f.tip.getWorldPosition(wp); const m = new T.Mesh(smokeGeo, new T.MeshLambertMaterial({ color: f.tip.material.color, transparent: true, opacity: .5, depthWrite: false })); m.position.copy(wp); bb.scene.add(m); crowd.smoke.push({ m, life: 3 }); } }
    for (let i = crowd.smoke.length - 1; i >= 0; i--) { const s = crowd.smoke[i]; s.life -= dt; s.m.position.y += dt * 1.6; s.m.position.x += dt * .5; s.m.scale.setScalar(1 + (3 - s.life) * .8); s.m.material.opacity = Math.max(0, s.life / 3 * .45); if (s.life <= 0) { bb.scene.remove(s.m); s.m.material.dispose(); crowd.smoke.splice(i, 1); } }
    crowd.drumT -= dt; if ((pre || happy) && crowd.drumT <= 0) { crowd.drumT = .5; const pp = bb.ppos(); const d = Math.hypot(pp.x - crowd.poi.x, pp.z - crowd.poi.z); if (d < 140) drum(.2 * (1 - d / 140)); } }

  /* ---------- fireworks ---------- */
  const fw = []; let fwT = 0;
  function burst(x, y, z, col) { const n = 70, pos = new Float32Array(n * 3), vel = []; for (let i = 0; i < n; i++) { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; const a = Math.random() * 6.283, e = Math.acos(Math.random() * 2 - 1), s = 9 + Math.random() * 6; vel.push([Math.sin(e) * Math.cos(a) * s, Math.cos(e) * s, Math.sin(e) * Math.sin(a) * s]); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); const m = new T.PointsMaterial({ color: col, size: 1.6, transparent: true, opacity: 1, depthWrite: false, blending: T.AdditiveBlending });
    const pt = new T.Points(g, m); bb.scene.add(pt); fw.push({ pt, vel, life: 1.8 }); }
  function updFireworks(dt, poi, team) { if (poi) { fwT -= dt; if (fwT <= 0) { fwT = .35 + Math.random() * .5; const b = blockOf(poi); burst(b.x + (Math.random() - .5) * 60, 55 + Math.random() * 30, b.z + (Math.random() - .5) * 60, [team.col, team.col2, '#ffd36a', '#ffffff'][Math.floor(Math.random() * 4)]);
        const pp = bb.ppos(); const d = Math.hypot(pp.x - poi.x, pp.z - poi.z); if (d < 600 && Math.random() < .5) setTimeout(() => drum(.12 * (1 - d / 600)), 300); } }
    for (let i = fw.length - 1; i >= 0; i--) { const f = fw[i]; f.life -= dt; const a = f.pt.geometry.attributes.position; for (let k = 0; k < f.vel.length; k++) { const v = f.vel[k]; v[1] -= 6 * dt; v[0] *= .985; v[2] *= .985; a.array[k * 3] += v[0] * dt; a.array[k * 3 + 1] += v[1] * dt; a.array[k * 3 + 2] += v[2] * dt; } a.needsUpdate = true; f.pt.material.opacity = Math.max(0, f.life / 1.8);
      if (f.life <= 0) { bb.scene.remove(f.pt); f.pt.geometry.dispose(); f.pt.material.dispose(); fw.splice(i, 1); } } }

  /* ---------- watching a match ---------- */
  const LINES = { chance: ['shoots from distance · just wide!', 'hits the post!', 'a brilliant save from the keeper', 'a header goes over the bar', 'a corner swings in, cleared', 'a long ball over the top, offside'],
    crowd: ['The stands bounce to the drums', 'Mexican wave around the stadium', 'Phone torches light up the stands', 'The fan club unfurls a giant flag', 'Chants roll down from the upper tier'] };
  function watch(poi, f, vip) { const team = f.home; const { mc } = now(); if (mc.state === 'ft') return bb.toast('The match is over', '#d6c8e4');
    const endH = L.kick + L.len / 60; const secs = Math.max(10, Math.ceil((endH - bb.clock) * 60 / ((bb.CFG.timeSpeed) || 1)));
    const res = F.result(f); let shownGoals = 0, lineT = 0, over = false, ended = false; const fb = ex(); const mine = fb.club === team.id || P().outfit.topCol === team.col;
    if (bb.player.mode === 'drive') bb.exitVehicle(true);
    bb.openWait({ kind: (vip ? 'VIP box · ' : 'Stands · ') + poi.name, title: `${f.home.name} v ${f.away.name}`, sub: 'Finding your seat…', total: secs, cancel: 'Leave the stadium',
      buttons: [{ id: 'chant', label: '📣 Chant', fn: () => { bb.toast(`${team.chant || 'Come on!'} · the stands join in`, team.col); roar(.18, 1.6); } }, { id: 'snack', label: '🍿 Snack ' + bb.inr(bb.price(80)), fn: () => { if (bb.spend(bb.price(80))) { P().hunger = Math.min(100, P().hunger + 18); bb.toast('Samosa and chai in the stands', '#ffc93c'); } } }],
      timeText: () => { const c = F.clock(bb.clock); const [h, a] = F.scoreAt(res, f, c.state === 'pre' ? 0 : c.min); return c.state === 'pre' ? `Kick-off in ${Math.ceil(c.toKick)} min · ${bayClock()}` : c.state === 'ht' ? `Half-time · ${f.home.short} ${h}–${a} ${f.away.short}` : `${c.min}' · ${f.home.short} ${h}–${a} ${f.away.short}`; },
      onTick: (dt) => { const c = F.clock(bb.clock); if (c.state === 'ft' && !over) { over = true; setTimeout(() => { bb.closeWait(); fullTime(); }, 1500); } const min = c.state === 'pre' ? 0 : c.min; const el = document.querySelector('#wsub');
        while (shownGoals < res.goals.length && res.goals[shownGoals].m <= min) { const g = res.goals[shownGoals++]; const t = F.byId(g.team); const home = g.team === f.home.id;
          bb.big(home ? 'GOAL!' : 'Goal…', home ? team.col : '#d6c8e4'); roar(home ? .45 : .12, home ? 3 : 1.4); if (el) el.textContent = `${g.m}' · ${t.name} score through ${g.by}`; lineT = 6; }
        lineT -= dt; if (lineT <= 0 && el) { lineT = 5 + Math.random() * 4; el.textContent = c.state === 'pre' ? 'Teams warm up · the fan club sings' : c.state === 'ht' ? 'Half-time · dhol players in the stands' : Math.random() < .5 ? `${Math.random() < .55 ? f.home.short : f.away.short} ${LINES.chance[Math.floor(Math.random() * 6)]}` : LINES.crowd[Math.floor(Math.random() * 5)]; }
        P().energy = Math.max(0, P().energy - dt * .01); },
      onDone: () => fullTime(),
      onCancel: () => placeOutside(poi) });
    function fullTime() { if (ended) return; ended = true; const [h, a] = [res.hg, res.ag]; fb.matches++; bb.setDirty(); bb.emit('football', { kind: 'watched', team: team.id, win: h > a });
        const msg = h > a ? `Full time · ${f.home.short} ${h}–${a} ${f.away.short} · home win! Fans are celebrating outside` : h < a ? `Full time · ${f.home.short} ${h}–${a} ${f.away.short} · a quiet walk home` : `Full time · ${f.home.short} ${h}–${a} ${f.away.short} · honours even`;
        bb.toast(msg, h > a ? team.col : '#d6c8e4'); if (h > a && mine) { bb.earn(bb.price(150), 'football'); bb.toast(`Fan bonus · +${bb.inr(bb.price(150))}`, '#3ddc97'); } placeOutside(poi); } }
  function placeOutside(poi) { bb.teleport(poi.x + Math.sin(poi.rot || 0) * 3, poi.z + Math.cos(poi.rot || 0) * 3, poi.rot || 0); }
  const bayClock = () => bb.bayTime();

  /* ---------- the stadium gate ---------- */
  function stadiumSheet(poi) { const team = F.byId(poi.extra); const fb = ex(); const f = F.homeMatch(team.id, bb.gameDay); const st = status(f); const p = P();
    const nx = !f || st.mc.state === 'ft' ? F.nextHome(team.id, bb.gameDay + 1) : null; const key = f ? ticketKey(f) : ''; const has = f && fb.tickets[key];
    const d = F.day(bb.gameDay); const champDays = !d.matchday; const champ = champDays ? champion(d.season) : null;
    let rows = '';
    if (f && st.mc.state !== 'ft') {
      const gates = st.mc.state !== 'pre' || st.mc.toKick <= 30;
      if (has) rows += bb.rowHtml('enter', gates ? 'Go in and watch' : 'You have a ticket', gates ? `${has === 'vip' ? 'VIP box' : 'Stands'} · ${st.text}` : `Gates open at 7:00 pm · ${st.text}`, gates ? 'Enter' : 'Wait', gates ? '' : 'ghost');
      else { const disc = fb.club === team.id ? .5 : 1; rows += bb.rowHtml('stands', 'Ticket · stands', `${st.text}${disc < 1 ? ' · fan club half price' : ''}`, bb.inr(bb.price(300 * disc))) + bb.rowHtml('vip', 'Ticket · VIP box', 'Padded seats, snacks included', bb.inr(bb.price(1500 * disc)), 'ghost'); }
    } else if (champ && champ.id === team.id) rows += `<p class="note">🏆 ${bb.esc(team.name)} are the champions! The trophy celebration starts at 7:30 pm outside the stadium.</p>`;
    else rows += `<p class="note">${f ? `Today: ${bb.esc(st.text)}. ` : ''}${nx ? `Next home match: ${bb.esc(nx.f.away.name)} in ${nx.inDays} Bay day${nx.inDays > 1 ? 's' : ''}, 7:30 pm.` : 'No more home matches this season.'}</p>`;
    const jersey = p.outfit.topCol === team.col;
    rows += bb.rowHtml('jersey', `${team.short} home jersey`, jersey ? 'You are wearing it' : 'Wear your team colours · fans notice', jersey ? 'Worn' : bb.inr(bb.price(999)), jersey ? 'ghost' : '');
    rows += bb.rowHtml('club', `${team.fans} fan club`, fb.club === team.id ? 'Member · half-price tickets, fan marches, match alerts' : fb.club ? `You support ${F.byId(fb.club).name} · switching costs the fee again` : 'Half-price tickets, fan marches and match alerts', fb.club === team.id ? 'Member' : bb.inr(bb.price(500)), fb.club === team.id ? 'ghost' : '');
    rows += bb.rowHtml('table', 'League table and fixtures', `${L.name} · season ${d.season % 100 + 1}`, 'Open', 'ghost');
    bb.openSheet(`⚽ ${bb.esc(poi.name)}`, `${bb.esc(team.name)} · ${f ? `${bb.esc(f.home.short)} v ${bb.esc(f.away.short)} today` : champDays ? 'Season over · champions\' celebrations' : 'No match today'}`, rows, s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return;
      if (id === 'table') return leagueSheet();
      if (id === 'stands' || id === 'vip') { const disc = fb.club === team.id ? .5 : 1; if (!bb.spend(bb.price((id === 'vip' ? 1500 : 300) * disc), true)) return; fb.tickets = { [key]: id === 'vip' ? 'vip' : 'stand' }; bb.setDirty(); bb.toast(`Ticket booked · ${f.home.short} v ${f.away.short}`, '#3ddc97'); bb.emit('football', { kind: 'ticket' }); return stadiumSheet(poi); }
      if (id === 'enter') { const s2 = status(f); if (s2.mc.state === 'pre' && s2.mc.toKick > 30) return bb.toast('Gates open at 7:00 pm', '#ff9f1c'); bb.closeSheet(); return watch(poi, f, fb.tickets[key] === 'vip'); }
      if (id === 'jersey' && !jersey) { if (!bb.spend(bb.price(999), true)) return; p.outfit.topCol = team.col; bb.applyOutfit(); bb.setDirty(); bb.toast(`You're in ${team.short} colours`, team.col); bb.emit('football', { kind: 'jersey' }); return stadiumSheet(poi); }
      if (id === 'club' && fb.club !== team.id) { if (!bb.spend(bb.price(500), true)) return; fb.club = team.id; bb.setDirty(); bb.toast(`Welcome to the ${team.fans}! Match alerts are on`, team.col); bb.emit('football', { kind: 'club', team: team.id }); return stadiumSheet(poi); } }); }
  bb.poiHandlers.stadium = stadiumSheet;

  /* ---------- league app ---------- */
  function leagueSheet() { const d = F.day(bb.gameDay); const { mc } = now(); const played = d.matchday ? d.round + (mc.state === 'ft' ? 1 : 0) : L.rounds; const tab = F.table(d.season, played); const fb = ex();
    const fx = d.matchday ? F.fixtures(d.season, d.round) : []; const pp = bb.ppos();
    const fixtures = fx.map((f, i) => { const s = status(f); const here = f.home.stadium; return bb.rowHtml('f' + i, `${f.home.short} v ${f.away.short}`, `${here ? f.home.stadium + ' · ' : ''}${s.text}`, here ? 'Directions' : 'Away', here ? 'ghost' : 'ghost'); }).join('');
    const rows = tab.map((r, i) => `<tr${fb.club === r.team.id ? ' class="me"' : ''}><td>${i + 1}</td><td><b style="color:${r.team.col}">■</b> ${bb.esc(r.team.short)}</td><td>${r.P}</td><td>${r.W}</td><td>${r.D}</td><td>${r.L}</td><td>${r.GF - r.GA > 0 ? '+' : ''}${r.GF - r.GA}</td><td><b>${r.Pts}</b></td></tr>`).join('');
    const champ = !d.matchday ? champion(d.season) : null;
    bb.openSheet(`⚽ ${bb.esc(L.name)}`, d.matchday ? `Season ${d.season % 100 + 1} · round ${d.round + 1} of ${L.rounds} · matches at 7:30 pm Bay time` : `Season ${d.season % 100 + 1} is over · champions: ${bb.esc(champ.name)}`,
      (champ ? `<p class="note">🏆 ${bb.esc(champ.name)} won the league.${champ.stadium ? ` Trophy celebrations at ${bb.esc(champ.stadium)} tonight from 7:30 pm.` : ''} The next season starts in ${L.seasonDays - d.round} Bay day${L.seasonDays - d.round > 1 ? 's' : ''}.</p>` : `<h3 class="sub">Today</h3>${fixtures}`) +
      `<h3 class="sub">Table</h3><table class="ltab"><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>${rows}</table>` +
      `<h3 class="sub">Stadiums on the map</h3>${F.homeTeams.map(t => { const p = stadiumOf(t.id); return bb.rowHtml('s' + t.id, `${bb.esc(t.stadium)}`, `${bb.esc(t.name)} · ${p ? Math.round(Math.hypot(p.x - pp.x, p.z - pp.z) * 2.4 / 100) / 10 + ' km' : ''}${fb.club === t.id ? ' · your club' : ''}`, 'Directions', 'ghost'); }).join('')}` +
      `<p class="note">Buy tickets, jerseys and fan club membership at the stadium gate. Fan club members get alerts for every goal and a fan march before home matches.</p>`,
      s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; let t = null; if (id[0] === 'f') t = fx[+id.slice(1)].home; if (id[0] === 's') t = F.byId(id.slice(1)); if (!t || !t.stadium) return; const p = stadiumOf(t.id); if (p && bb.TRAVEL) bb.TRAVEL.go(p.x, p.z, p.name); }); }
  bb.addApp({ id: 'football', label: 'Football', icon: '⚽', fn: leagueSheet });

  /* ---------- fan march before home matches ---------- */
  let march = null;
  function startMarch(poi, team, f) { const b = blockOf(poi); if (!b) return; const pp = bb.ppos(); const g = new T.Group(); bb.scene.add(g); const people = [];
    for (let i = 0; i < 18; i++) { const p = bb.buildPerson(mat(i % 3 === 2 ? team.col2 : team.col)); if (i % 2 === 0) { const fl = flagMesh(i % 4 ? team.col : team.col2); fl.position.set(.3, .9, 0); p.add(fl); p.userData.flag = fl; } g.add(p); people.push({ p, ph: Math.random() * 6, o: i }); }
    // walk two blocks along the sidewalk toward the gate
    const dir = Math.sign(pp.x - b.x) || 1; const start = { x: b.x + dir * 150, z: b.z + 30.5 }; march = { poi, team, f, g, people, b, x: start.x, z: start.z, dir: -dir, with: 0, done: false }; }
  function updMarch(dt, t) { if (!march) return; const m = march; if (!m.done) { m.x += m.dir * 1.6 * dt; if ((m.dir < 0 && m.x <= m.b.x) || (m.dir > 0 && m.x >= m.b.x)) { m.done = true; finishMarch(); return; } }
    m.people.forEach((q, i) => { const row = Math.floor(i / 3), col = i % 3; q.p.position.set(m.x - m.dir * row * 1.4, .3 + Math.abs(Math.sin(t * 7 + q.ph)) * .08, m.z - 1.4 + col * 1.1); q.p.rotation.y = m.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
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
