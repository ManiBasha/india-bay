// Phone apps (Beta v1.01.11): BayRadio (news and announcements, plus the radio stations), BayTraveler
// (things to do in every state and city), Themes (each player picks the look of their phone and the game),
// Mechanic (call one to your vehicle) and vehicle names in the garage.
window.BBFeatures.push(function (bb) {
  const P = () => bb.P, W = bb.WORLD, esc = bb.esc;
  /* ---------- BayRadio ---------- */
  const extraNews = [];   // other features can add lines: bb.NEWS.push({ icon, title, text })
  bb.NEWS = { push(n) { extraNews.unshift(Object.assign({ at: Date.now() }, n)); if (extraNews.length > 30) extraNews.pop(); }, get list() { return extraNews; } };
  function radioApp(tab) { tab = tab || 'news'; const C = bb.CFG; const items = [];
    if (C.announce) items.push({ icon: '📣', title: 'From India Bay', text: C.announce });
    for (const n of bb.activeNews()) items.push({ icon: '📰', title: n.title || 'News', text: n.text || '', when: n.end ? 'Until ' + n.end : '' });
    for (const n of extraNews) items.push(n);
    const cl = bb.clList()[0]; if (cl) items.push({ icon: '✨', title: `Update ${cl.v}${cl.title ? ' · ' + cl.title : ''}`, text: bb.clLines(cl.notes).slice(0, 2).join(' '), btn: 'whatsnew' });
    const tabs = `<div class="chips"><button class="chip${tab === 'news' ? ' on' : ''}" data-t="news">📰 News</button><button class="chip${tab === 'fm' ? ' on' : ''}" data-t="fm">📻 Stations</button></div>`;
    const body = tab === 'news' ? (items.length ? items.map((n, i) => `<div class="news"><span>${esc(n.icon || '📰')}</span><div><b>${esc(n.title)}</b><p>${esc(n.text || '')}</p>${n.when ? `<small>${esc(n.when)}</small>` : ''}${n.btn ? `<button class="buy ghost" data-n="${n.btn}">Read</button>` : ''}</div></div>`).join('') : '<p class="note">No news right now. Check back soon.</p>')
      : '<p class="note">Tune in while you drive. R switches stations.</p><div class="btnrow"><button class="go" data-n="fm">Open the radio</button></div>';
    bb.openSheet('📻 BayRadio', 'News, announcements and music', tabs + body, s => s.onclick = e => { const t = e.target.dataset.t; if (t) return radioApp(t); const n = e.target.dataset.n; if (n === 'whatsnew') return bb.whatsNew(false); if (n === 'fm') bb.openApp('radio'); }); }
  bb.addApp({ id: 'bayradio', label: 'BayRadio', icon: '📻', fn: () => radioApp() });
  /* ---------- BayTraveler ---------- */
  const stateOf = z => z.st;
  function cityThings(z) { const x0 = z.x0 - 120, x1 = z.x0 + z.nx * 80 + 120, z0 = z.z0 - 120, z1 = z.z0 + z.nz * 80 + 120; const inZ = (x, q) => x > x0 && x < x1 && q > z0 && q < z1;
    const out = [];
    for (const a of (bb.ACTIVITIES || [])) for (const at of a.at) { const nm = typeof at === 'string' ? at : at.name; const p = typeof at === 'string' ? (W.places || []).find(q => q[0] === at) : [nm, at.p[0], at.p[1]]; if (p && inZ(p[1], p[2])) out.push({ icon: '🪂', name: a.name, sub: nm + ' · ' + a.desc, x: p[1], z: p[2], price: bb.cost('adv.' + a.id, a.price) }); }
    for (const p of (W.places || [])) if (inZ(p[1], p[2]) && !out.some(o => o.sub.startsWith(p[0]))) out.push({ icon: '📍', name: p[0], sub: 'Famous place', x: p[1], z: p[2] });
    const T = { mall: ['🛍', 'Mall'], stadium: ['🏟', 'Stadium'], heli: ['🚁', 'Helipad · joyrides'], metro: ['🚇', 'Metro station'], station: ['🚆', 'Railway station'], airport: ['✈', 'Airport'], bus: ['🚌', 'Bus stand'], cinema: ['🎬', 'Cinema'] };
    for (const p of bb.pois) if (p.zone === z && T[p.type] && !out.some(o => o.name === p.name)) out.push({ icon: T[p.type][0], name: p.name, sub: T[p.type][1], x: p.x, z: p.z });
    return out; }
  function travelerApp(st, zid) { const states = [...new Set(W.zones.map(stateOf))].filter(s => W.states[s]);
    st = st || (() => { const p = bb.ppos(); const z = bb.zoneAt(p.x, p.z, 400); return z ? z.st : states[0]; })();
    const zones = W.zones.filter(z => z.st === st).sort((a, b) => ({ big: 0, mid: 1, small: 2 }[a.size] - { big: 0, mid: 1, small: 2 }[b.size]) || a.name.localeCompare(b.name));
    const z = zid ? W.zones.find(q => q.id === zid) : null;
    let body = `<div class="chips tscroll">${states.map(s => `<button class="chip${s === st ? ' on' : ''}" data-st="${s}">${esc(W.states[s])}</button>`).join('')}</div>`;
    if (!z) body += `<p class="note">${zones.length} places to visit in ${esc(W.states[st])}</p>` + zones.map(q => { const n = cityThings(q).length; return bb.rowHtml('z:' + q.id, esc(q.name), `${n} thing${n === 1 ? '' : 's'} to do`, 'Explore', 'ghost'); }).join('');
    else { const L = cityThings(z); body += `<h3 class="sub">${esc(z.name)}</h3>` + (L.length ? L.map((t, i) => bb.rowHtml('g:' + i, `${t.icon} ${esc(t.name)}`, esc(t.sub) + (t.price ? ' · ' + bb.inr(t.price) : ''), 'Directions', 'ghost')).join('') : '<p class="note">Walk the streets, eat local and find your own adventure here.</p>') + bb.rowHtml('back', '‹ All places in ' + esc(W.states[st]), '', 'Back', 'ghost');
      travelerApp.last = L; }
    bb.openSheet('🧭 BayTraveler', 'Things to do in every state and city', body, s => { const on = s.querySelector('.tscroll .chip.on'); if (on) setTimeout(() => on.scrollIntoView({ inline: 'center', block: 'nearest' }), 30); s.onclick = e => { const b = e.target.closest('[data-st]'); if (b) return travelerApp(b.dataset.st); const id = e.target.dataset.id; if (!id) return;
      if (id === 'back') return travelerApp(st); if (id.startsWith('z:')) return travelerApp(st, id.slice(2));
      if (id.startsWith('g:')) { const t = travelerApp.last[+id.slice(2)]; if (t && bb.directions) { bb.closeSheet(); bb.directions(t.x, t.z, t.name); } } }; }); }
  bb.addApp({ id: 'traveler', label: 'BayTraveler', icon: '🧭', fn: () => travelerApp() });
  /* ---------- Themes ---------- */
  function themesApp() { const cur = (P().extra && P().extra.theme) || bb.CFG.theme || 'kesar';
    bb.openSheet('🎨 Themes', 'Your phone and the game menus', `<div class="themes">${Object.entries(bb.THEMES).map(([k, t]) => `<button class="theme${k === cur ? ' on' : ''}" data-th="${k}" style="--tw:${t.wall || t.sheet};--ta:${t.accent}"><i></i><b>${esc(t.label)}</b>${k === cur ? '<small>In use</small>' : ''}</button>`).join('')}</div><p class="note">Only you see your theme. It changes your phone wallpaper, menus and buttons.</p>`,
      s => s.onclick = e => { const b = e.target.closest('[data-th]'); if (!b) return; P().extra.theme = b.dataset.th; bb.setDirty(); bb.save(); bb.applyTheme(); themesApp(); bb.toast('Theme changed', 'var(--acc)'); }); }
  bb.addApp({ id: 'themes', label: 'Themes', icon: '🎨', fn: themesApp });
  bb.onStart(() => bb.applyTheme());
  /* ---------- Mechanic ---------- */
  bb.addApp({ id: 'mechanic', label: 'Mechanic', icon: '🔧', fn: () => { const ws = bb.pois.filter(p => p.type === 'mechanic'); const pp = bb.ppos(); const near = ws.sort((a, b) => Math.hypot(a.x - pp.x, a.z - pp.z) - Math.hypot(b.x - pp.x, b.z - pp.z))[0];
    bb.openSheet('🔧 Mechanic', 'Repairs, paint and mods', bb.rowHtml('call', '📞 Call a mechanic to your vehicle', 'Comes to you and repairs it on the spot', 'Call') + (near ? bb.rowHtml('go', '🧭 Nearest workshop', `${esc(near.name)} · ${(Math.hypot(near.x - pp.x, near.z - pp.z) * 2.4 / 1000).toFixed(1)} km · repairs, paint, tune, horn and underglow`, 'Directions', 'ghost') : ''),
      s => s.onclick = e => { const id = e.target.dataset.id; if (id === 'call' && bb.ROADSIDE) bb.ROADSIDE(); if (id === 'go' && near && bb.directions) { bb.closeSheet(); bb.directions(near.x, near.z, near.name); } }); } });
  /* ---------- vehicle names ---------- */
  bb.nameCar = (i, after) => { const c = P().cars[i]; if (!c) return; const spec = bb.ownedVeh[i] ? bb.ownedVeh[i].spec.label : 'vehicle';
    bb.openSheet('✏ Name your vehicle', spec, `<form class="form" id="nc"><label>Name<input type="text" id="nc_n" maxlength="18" value="${esc(c.nick || '')}" placeholder="Rani, Toofan, Black Beauty…"></label><div class="btnrow"><button class="go" type="submit">Save</button><button class="buy ghost" type="button" data-id="skip">Skip</button></div></form>`,
      s => { const f = s.querySelector('#nc'); const inp = s.querySelector('#nc_n'); setTimeout(() => inp.focus(), 60);
        f.onsubmit = e => { e.preventDefault(); const v = inp.value.trim().slice(0, 18); if (v && bb.nameOk && !bb.nameOk(v) && /[^\w\s'-]/.test(v)) return bb.toast('Letters and numbers only', '#ff9f1c'); c.nick = v; bb.setDirty(); bb.save(); bb.closeSheet(); if (v) bb.toast(`Say hello to ${esc(v)}`, '#3ddc97'); after && after(); };
        s.querySelector('[data-id=skip]').onclick = () => { bb.closeSheet(); after && after(); }; }); };
  bb.on('garage', e => { if (e && e.kind === 'keep') { const i = P().cars.length - 1; setTimeout(() => bb.nameCar(i), 400); } });
});
