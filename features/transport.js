// Bay Transport (Beta v1.01.21): a phone folder with a ticket app for every public transport.
//   🚌 BayBus      state buses, AC sleepers, city buses and city tours from the bus stands
//   🚆 BayTrains   trains between cities, the Mumbai local and the bullet train
//   🚇 BayMetro    the metro lines in the metro cities
//   ✈ BayFlights   flights between the airports
//   🎫 My tickets  every ticket you hold
// You pay once, when you book. The ticket is then confirmed in the background (the counter or check-in queue):
// the countdown shows at the top while you travel to the stop by driving, BayTaxi or walking. At the stop the
// ticket takes you straight on board with no queue. BayTaxi (already in the folder) works as before.
window.BBFeatures.push(function (bb) {
  const P = () => bb.P, esc = bb.esc, W = bb.WORLD;
  const LIFE = 6 * 3600 * 1000;    // a ticket is good for 6 real hours after it is confirmed
  const APPS = {
    baybus: { icon: '🚌', label: 'BayBus', title: 'BayBus', sub: 'Intercity and interstate buses, AC sleepers, city buses and tours', types: ['bus'], modes: ['bus', 'interstate', 'busac', 'citybus', 'tour'], place: 'ticket' },
    baytrain: { icon: '🚆', label: 'BayTrains', title: 'BayTrains', sub: 'Trains, the Mumbai local and the bullet train', types: ['station', 'local', 'bullet'], place: 'ticket' },
    baymetro: { icon: '🚇', label: 'BayMetro', title: 'BayMetro', sub: 'Metro lines in Mumbai, Pune, Ahmedabad, Jaipur, Bengaluru and Kochi', types: ['metro'], place: 'ticket' },
    bayflight: { icon: '✈', label: 'BayFlights', title: 'BayFlights', sub: 'Flights between every airport', types: ['airport'], place: 'checkin' } };
  const MODES_OF = { station: ['sleeper', 'ac'], local: ['local'], bullet: ['bullet'], metro: ['metro'], airport: ['flight'], bus: ['bus', 'interstate', 'busac', 'citybus', 'tour'] };
  const KIND = { station: 'Railway station', local: 'Mumbai local station', bullet: 'Bullet train station', metro: 'Metro station', airport: 'Airport', bus: 'Bus stand' };
  const keyOf = p => p.type + ':' + (p.extra != null ? p.extra : p.name);
  const list = () => { const x = P().extra; if (!Array.isArray(x.tickets)) x.tickets = []; return x.tickets; };
  const label = (mode, at) => (bb.TRANSIT ? bb.TRANSIT.label(mode, at) : (bb.TRAVEL.MODE[mode] || mode));
  const km = d => (d * 2.4 / 1000).toFixed(d * 2.4 < 10000 ? 1 : 0);
  // destinations from a stop, for one mode (the same lists as the counter at the stop)
  function dests(poi, mode) {
    if (poi.type === 'bullet') { const B = bb.BULLET; if (!B) return []; const from = B.stations.find(s => s.name === poi.extra); return B.stations.filter(s => s !== from && s.poi).map(s => ({ key: s.name, name: s.name, x: s.poi.x, z: s.poi.z, arrive: { x: s.poi.x + Math.sin(s.poi.rot) * 3, z: s.poi.z + Math.cos(s.poi.rot) * 3, rot: s.poi.rot, name: `${s.name} station`, zoneName: s.name } })); }
    return bb.TRAVEL.destsAt ? (bb.TRAVEL.destsAt(poi, mode) || []) : []; }
  const stops = types => { const pp = bb.ppos(); return bb.pois.filter(p => types.includes(p.type)).map(p => ({ p, d: Math.hypot(p.x - pp.x, p.z - pp.z) })).sort((a, b) => a.d - b.d); };
  function secsFor(place) { const per = (bb.CFG.queue && bb.CFG.queue[place]) || 20; const rush = (bb.clock >= 8 && bb.clock < 11) || (bb.clock >= 17 && bb.clock < 21); return Math.max(10, Math.round(per * (1 + Math.floor(Math.random() * (rush ? 6 : 3))))); }
  /* ---------- the ticket apps ---------- */
  function app(id, stopKey, mode) { const A = APPS[id]; const S = stops(A.types); if (!S.length) return bb.openSheet(`${A.icon} ${A.title}`, A.sub, '<p class="note">No stops on the map for this yet.</p>');
    const cur = (stopKey && S.find(q => keyOf(q.p) === stopKey)) || S[0]; const poi = cur.p; const modes = MODES_OF[poi.type] || ['bus']; mode = modes.includes(mode) ? mode : modes[0];
    const L = dests(poi, mode).slice(0, 40); const held = list().filter(t => t.app === id && !t.used);
    const body = (held.length ? `<h3 class="sub">Your tickets</h3>` + held.map(tRow).join('') : '') +
      `<h3 class="sub">From</h3><div class="chips tscroll">${S.slice(0, 10).map(q => `<button class="chip${q === cur ? ' on' : ''}" data-st="${esc(keyOf(q.p))}">${esc(q.p.name)} · ${km(q.d)} km</button>`).join('')}</div>` +
      (modes.length > 1 ? `<div class="chips tscroll">${modes.map(m => `<button class="chip${m === mode ? ' on' : ''}" data-md="${m}">${esc(label(m, poi))}</button>`).join('')}</div>` : '') +
      `<p class="note">${esc(KIND[poi.type] || '')} · ${km(cur.d)} km from you. You pay now. The ticket is confirmed while you go to the stop (see the timer at the top), then you board with no queue.</p>` +
      (L.length ? L.map((d, i) => { const dist = Math.hypot(d.x - poi.x, d.z - poi.z); const fare = bb.TRAVEL.fareFor(mode, dist); const t = Math.max(1, Math.round(((d.opts && d.opts.secs) || Math.max(8, Math.round((bb.CFG.travel[mode] || [0, 60])[1] * Math.min(1, Math.max(.25, dist / 7000))))) / 60));
        return bb.rowHtml('d' + i, esc(d.name), (d.sub ? esc(d.sub) + ' · ' : '') + `${km(dist)} km · about ${t} min on board`, bb.inr(fare)); }).join('') : '<p class="note">No trips from this stop with this ticket.</p>');
    bb.openSheet(`${A.icon} ${A.title}`, A.sub + ` · Cash ${bb.inr(P().cash)}`, body, s => s.onclick = e => { const b = e.target.closest('button'); if (!b) return; const d0 = b.dataset;
      if (d0.st) return app(id, d0.st, mode); if (d0.md) return app(id, keyOf(poi), d0.md); if (tClick(d0, () => app(id, keyOf(poi), mode))) return;
      const k = d0.id; if (!k || k[0] !== 'd') return; const d = L[+k.slice(1)]; if (!d) return; book(id, poi, mode, d); }); }
  function book(id, poi, mode, d) { const A = APPS[id]; const dist = Math.hypot(d.x - poi.x, d.z - poi.z); const fare = bb.TRAVEL.fareFor(mode, dist);
    if (!bb.spend(fare, true)) return; const secs = secsFor(A.place);
    const T = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), app: id, mode, label: label(mode, poi), fare, from: { key: keyOf(poi), type: poi.type, name: poi.name, x: poi.x, z: poi.z }, dest: { key: d.key, name: d.name }, booked: Date.now(), ready: Date.now() + secs * 1000, used: false };
    list().push(T); bb.setDirty(); bb.save();
    bb.TIMERS.add({ kind: 'ticket', icon: '🎫', label: (A.place === 'checkin' ? 'Check-in · ' : 'Ticket · ') + d.name, secs, data: { id: T.id } });
    bb.emit('ticket', { mode, fare }); bb.toast(`🎫 Paid ${bb.inr(fare)} · ${A.place === 'checkin' ? 'checking you in' : 'confirming your ticket'} while you go to ${esc(poi.name)}`, '#3ddc97');
    howTo(T); }
  // getting to the stop: drive or walk with directions, or a BayTaxi to the stop
  function howTo(T) { const f = T.from; const pp = bb.ppos(); const dist = Math.hypot(f.x - pp.x, f.z - pp.z);
    bb.openSheet('🧭 Get to the stop', `${esc(f.name)} · ${km(dist)} km`, (dist < 40 ? '<p class="note">You are already at the stop. Walk to the counter and press E.</p>' : '') +
      bb.rowHtml('drive', bb.player.mode === 'drive' ? '🚗 Drive there' : '🚶 Walk or drive there', 'Follow the blue line', 'Go') + bb.rowHtml('taxi', '🚕 Take a BayTaxi', 'A taxi comes to you and takes you to the stop', 'Book', 'ghost') +
      `<p class="note">At ${esc(f.name)}, press E and tap 🎫 Board. The ticket is good for 6 hours once it is confirmed.</p>`,
      s => s.onclick = e => { const k = e.target.dataset.id; if (!k) return; bb.closeSheet(); if (k === 'drive') bb.TRAVEL.go(f.x, f.z, f.name, true); if (k === 'taxi' && bb.TRANSIT && bb.TRANSIT.taxiApp) bb.TRANSIT.taxiApp(null, { name: f.name, x: f.x, z: f.z }); }); }
  function tRow(T) { const now = Date.now(); const st = T.ready > now ? `Confirming · ${bb.TIMERS.fmt((T.ready - now) / 1000)}` : `Ready · board at ${T.from.name}`;
    return `<div class="row tkrow"><div class="nm">🎫 ${esc(T.label)} → ${esc(T.dest.name)}<small>${esc(st)} · paid ${bb.inr(T.fare)}</small></div><div class="btnrow" style="gap:6px;flex-wrap:nowrap"><button class="buy ghost" data-tgo="${T.id}">🧭</button><button class="buy danger" data-tx="${T.id}">Cancel</button></div></div>`; }
  function tClick(d, again) { if (d.tgo) { const T = find(d.tgo); if (T) howTo(T); return true; }
    if (d.tx) { const T = find(d.tx); if (!T) return true; const b = document.querySelector(`[data-tx="${T.id}"]`); if (b && !b.dataset.sure) { b.dataset.sure = 1; b.textContent = `Refund ${bb.inr(Math.max(0, T.fare - bb.price(20)))}?`; return true; } refund(T, true); again(); return true; } return false; }
  function myTickets() { const L = list().filter(t => !t.used); bb.openSheet('🎫 My tickets', L.length ? `${L.length} ticket${L.length > 1 ? 's' : ''}` : 'No tickets yet', (L.length ? L.map(tRow).join('') : '<p class="note">Book a bus, train, metro or flight from the Bay Transport folder. You pay when you book, and board at the stop with no queue.</p>') +
      `<div class="btnrow">${Object.entries(APPS).map(([k, a]) => `<button class="buy ghost" data-ap="${k}">${a.icon} ${a.label}</button>`).join('')}</div>`, s => s.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.ap) return app(b.dataset.ap); tClick(b.dataset, myTickets); }); }
  /* ---------- the ticket in your pocket ---------- */
  const find = id => list().find(t => t.id === id);
  function refund(T, cancelled) { const L = list(); const i = L.indexOf(T); if (i < 0) return; L.splice(i, 1); const back = cancelled ? Math.max(0, T.fare - bb.price(20)) : T.fare; P().cash += back; bb.setDirty(); bb.save();
    const j = bb.TIMERS.jobs.find(q => q.kind === 'ticket' && q.data && q.data.id === T.id); if (j) bb.TIMERS.cancel(j.id); bb.toast(`🎫 Ticket ${cancelled ? 'cancelled' : 'refunded'} · ${bb.inr(back)} back${cancelled ? ' (₹20 fee)' : ''}`, '#d6c8e4'); }
  function use(T) { T.used = true; const L = list(); const i = L.indexOf(T); if (i >= 0) L.splice(i, 1); bb.setDirty(); }
  // tickets you hold for this stop (the counter shows them first)
  function at(poi) { const k = keyOf(poi.orig || poi); const now = Date.now(); return list().filter(t => !t.used && t.from.key === k && now < t.ready + LIFE); }
  bb.TIMERS.on('ticket', (j, away) => { const T = find(j.data && j.data.id); if (!T) return; bb.toast(`🎫 Ticket ready · ${esc(T.label)} to ${esc(T.dest.name)}`, '#3ddc97');
    if (bb.notify && !away) bb.notify('🎫', 'Your ticket is ready', `Board at ${T.from.name} · tap for directions`, () => howTo(T), 'ticket'); });
  // old tickets: confirmed more than 6 hours ago and never used
  setInterval(() => { if (!bb.started) return; const now = Date.now(); for (const T of list().slice()) if (!T.used && now > T.ready + LIFE) { const L = list(); L.splice(L.indexOf(T), 1); bb.setDirty(); bb.toast(`🎫 Your ${esc(T.label)} ticket to ${esc(T.dest.name)} expired`, '#ff9f1c'); } }, 30000);
  for (const [id, a] of Object.entries(APPS)) bb.addApp({ id, label: a.label, icon: a.icon, fn: () => app(id) });
  bb.addApp({ id: 'mytickets', label: 'My tickets', icon: '🎫', fn: myTickets });
  bb.TICKETS = { at, find, use, refund, get list() { return list(); }, app, myTickets };
});
