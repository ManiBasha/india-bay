// Test play for testers and admins (switch in 👤 Profile → Play mode). Uses its own save (ib.save.test), never
// uploads to the cloud, unlocks everything, skips opening hours and age locks, and adds Phone → Test tools.
// Only accounts in the testers table (online/supabase-update-5.sql) or admins can stay in test play.
window.BBFeatures.push(function (bb) {
  if (!bb.testMode) return;
  const W = bb.WORLD;
  const badge = document.createElement('div'); badge.id = 'testBadge'; badge.textContent = '🧪 TEST PLAY'; document.body.appendChild(badge);
  // only verified testers stay in test play
  bb.onStart(() => { let n = 0; const t = setInterval(() => { n++; const O = bb.ONLINE; if (O && O.signedIn && O.isTester) return clearInterval(t); if (n > 20) { clearInterval(t); bb.toast('Test play needs a tester account · back to real play', '#ff8b8b'); setTimeout(() => bb.setTestMode(false), 1800); } }, 1000); });
  // everything unlocked, once per test save
  bb.onStart(() => { const p = bb.P; p.extra = p.extra || {}; if (p.extra.testInit) return; p.extra.testInit = bb.istISO();
    p.cash = Math.max(p.cash, 1e7); p.bank = Math.max(p.bank, 1e7); p.lic = Object.assign(p.lic || {}, { two: true, three: true, lmv: true, heavy: true }); p.helmet = true; p.phone = 'smart'; p.health = 100; p.hunger = p.energy = p.bladder = 100;
    const have = new Set(p.cars.map(c => c.type)); for (const t of ['cycle', 'bike', 'sportsbike', 'auto', 'car', 'sedan', 'suv', 'sports']) if (!have.has(t)) p.cars.push({ type: t, fuel: 100, hp: 100 });
    p.homes = (W.homes || []).map(h => h.id); p.extra.heli = Object.assign(p.extra.heli || {}, { lic: true, own: true }); p.age18 = true;
    bb.save(); bb.toast('🧪 Test play: ₹1 crore, every licence, every home, a garage full of vehicles and a helicopter. Phone → Test tools for teleport, time and more.', '#ffc93c'); });
  // local overrides survive the admin settings reloading every minute
  const O = {}; const apply = () => { for (const k in O) bb.CFG[k] = O[k]; }; bb.on('config', apply);
  const set = (k, v) => { O[k] = v; apply(); bb.emit('config', bb.CFG); };
  const setHour = h => { const off = +bb.CFG.timeOffset || 0, raw = bb.gameMin() - off; set('timeOffset', Math.floor((raw + off) / 1440) * 1440 + h * 60 - raw); };
  const FEST = ['diwali', 'navratri', 'ganpati', 'holi', 'uttarayan', 'durga', 'onam', 'christmas', 'eid', 'pongal'];
  function tools() { const cities = W.zones.filter(z => z.size !== 'small').sort((a, b) => a.name.localeCompare(b.name));
    bb.openSheet('🧪 Test tools', `Test play · Bay ${bb.bayTime()} · ${bb.CFG.weather}`,
      `<h3 class="sub">Time of day</h3><div class="chips">${[0, 6, 9, 12, 15, 17, 19.5, 21].map(h => `<button class="chip" data-h="${h}">${h === 19.5 ? '7:30 pm' : h === 0 ? '12 am' : h < 12 ? h + ' am' : h === 12 ? '12 pm' : (h - 12) + ' pm'}</button>`).join('')}</div>
      <div class="chips">${[1, 5, 10].map(v => `<button class="chip${+bb.CFG.timeSpeed === v ? ' on' : ''}" data-sp="${v}">Time ×${v}</button>`).join('')}</div>
      <h3 class="sub">Weather</h3><div class="chips">${['auto', 'clear', 'cloudy', 'rain', 'monsoon', 'fog'].map(w => `<button class="chip${bb.CFG.weather === w ? ' on' : ''}" data-w="${w}">${w}</button>`).join('')}</div>
      <h3 class="sub">You</h3>` + bb.rowHtml('money', 'Add ₹10 lakh', `Cash ${bb.inr(bb.P.cash)}`, 'Add') + bb.rowHtml('fill', 'Full health, food, sleep and toilet', '', 'Fill') +
      bb.rowHtml('god', 'No damage', bb.god ? 'On · crashes, falls and fights do not hurt' : 'Off', bb.god ? 'Turn off' : 'Turn on', 'ghost') + bb.rowHtml('cops', 'Police', bb.CFG.police === 'off' ? 'Off' : 'On', bb.CFG.police === 'off' ? 'Turn on' : 'Turn off', 'ghost') +
      bb.rowHtml('chal', 'Traffic challans', bb.CFG.challansOn ? 'On' : 'Off', bb.CFG.challansOn ? 'Turn off' : 'Turn on', 'ghost') +
      `<h3 class="sub">Festival today (this device only)</h3><div class="chips"><button class="chip" data-f="none">None</button>${FEST.map(f => `<button class="chip" data-f="${f}">${f}</button>`).join('')}</div>
      <h3 class="sub">Teleport</h3><div class="chips">${cities.map(z => `<button class="chip" data-tp="${z.id}">${bb.esc(z.name)}</button>`).join('')}</div>` +
      bb.rowHtml('reset', 'Reset test save', 'Start test play again from scratch', 'Reset', 'danger') + '<p class="note">Changes here stay on this device and only in test play. Your real save is untouched: switch back in 👤 Profile → Play mode.</p>',
      s => s.onclick = e => { const d = e.target.dataset; if (d.h != null) { setHour(+d.h); bb.toast(`Time set · Bay ${bb.bayTime()}`, '#d6c8e4'); return tools(); } if (d.sp) { set('timeSpeed', +d.sp); return tools(); } if (d.w) { set('weather', d.w); return tools(); }
        if (d.f) { const iso = bb.istISO(); set('festivals', d.f === 'none' ? [] : [{ name: 'Test ' + d.f, type: d.f, where: 'all', start: iso, end: iso, mult: 1, gift: 0 }]); bb.toast(d.f === 'none' ? 'Festivals off' : `${d.f} is on today`, '#ffc93c'); return; }
        if (d.tp) { const z = W.zones.find(q => q.id === d.tp); const r = bb.nearestRoadPoint(z.x0 + z.nx * 40, z.z0 + z.nz * 40, 300); bb.closeSheet(); bb.teleport(r ? r.x : z.x0 + z.nx * 40, r ? r.z : z.z0 + z.nz * 40, 0); bb.toast(`Teleported to ${z.name}`, '#ffc93c'); return; }
        const id = d.id; if (!id) return; const p = bb.P;
        if (id === 'money') { bb.earn(1e6, 'test'); return tools(); } if (id === 'fill') { p.health = p.hunger = p.energy = p.bladder = 100; return tools(); }
        if (id === 'god') { bb.god = !bb.god; return tools(); } if (id === 'cops') { set('police', bb.CFG.police === 'off' ? 'normal' : 'off'); return tools(); } if (id === 'chal') { set('challansOn', !bb.CFG.challansOn); return tools(); }
        if (id === 'reset') { if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = 'Tap again'; return; } try { localStorage.removeItem('ib.save.test'); } catch (er) {} location.reload(); } }); }
  bb.addApp({ id: 'testtools', label: 'Test tools', icon: '🧪', fn: tools });
});
