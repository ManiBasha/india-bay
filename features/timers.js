// Timers (Beta v1.01.11): every waiting task shows a small countdown at the top of the screen, and runs on
// the real clock, so it keeps going with the screen off or the browser closed.
// Background jobs (repairs, paint, deliveries to you) do not stop you: keep playing while they finish.
//   bb.TIMERS.add({ kind, icon, label, secs, data })   -> job (saved with the game)
//   bb.TIMERS.on(kind, (job, away) => {})              -> called when it is done (away: it finished while you were gone)
//   bb.TIMERS.source(() => [{ icon, label, left }])     -> live countdowns owned by a feature (e.g. a delivery you are driving)
window.BBFeatures.push(function (bb) {
  const P = () => bb.P; const handlers = {}, sources = []; let started = false;
  const jobs = () => { const x = P().extra; if (!Array.isArray(x.jobs)) x.jobs = []; return x.jobs; };
  function add(o) { const j = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), kind: o.kind, icon: o.icon || '⏳', label: o.label || 'Working', start: Date.now(), end: Date.now() + Math.max(1, o.secs) * 1000, data: o.data || {} }; jobs().push(j); bb.setDirty(); bb.save(); draw(); return j; }
  function on(kind, fn) { handlers[kind] = fn; }
  function source(fn) { sources.push(fn); }
  function cancel(id) { const L = jobs(); const i = L.findIndex(j => j.id === id); if (i >= 0) { L.splice(i, 1); bb.setDirty(); draw(); } }
  const fmt = s => { s = Math.max(0, Math.ceil(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`; };
  const KIND_ICON = { Sleeping: '😴', Mechanic: '🔧', 'Paint shop': '🎨', Queue: '🧍', Cinema: '🎬', Flight: '✈', 'Bullet train': '🚄', Ferry: '⛴', Metro: '🚇', 'Mumbai local': '🚆', 'ST bus': '🚌', 'Bot taxi': '🚕', Helicopter: '🚁' };
  const iconFor = k => KIND_ICON[k] || (/train/i.test(k || '') ? '🚆' : /bus/i.test(k || '') ? '🚌' : /taxi/i.test(k || '') ? '🚕' : /fl(y|ight)|heli/i.test(k || '') ? '✈' : '⏳');
  // the strip
  const box = document.createElement('div'); box.id = 'timers'; box.className = 'hud'; box.setAttribute('aria-live', 'off'); document.body.appendChild(box);
  function list() { const out = []; const now = Date.now();
    const w = bb.getWait && bb.getWait(); if (w && w.total) out.push({ icon: iconFor(w.kind), label: w.kind || w.title, left: w.total - w.t });
    const c = bb.CINE && bb.CINE.state; if (c && c.o && c.o.dur) out.push({ icon: iconFor(c.o.label || c.o.kind), label: c.o.label || c.o.title || 'Ride', left: c.o.dur - c.t });
    for (const j of jobs()) out.push({ icon: j.icon, label: j.label, left: (j.end - now) / 1000, id: j.id });
    for (const f of sources) { try { const r = f(); if (r) out.push(...r); } catch (e) {} }
    return out.filter(t => t.left > -1); }
  let last = '';
  function draw() { if (!started) { box.hidden = true; return; } const L = list(); const html = L.slice(0, 5).map(t => `<span class="tm"${t.id ? ` data-j="${t.id}"` : ''}><i>${bb.esc(t.icon)}</i>${bb.esc(String(t.label).slice(0, 22))}<b>${fmt(t.left)}</b></span>`).join('') + (L.length > 5 ? `<span class="tm">+${L.length - 5}</span>` : '');
    if (html !== last) { box.innerHTML = html; last = html; } box.hidden = !L.length; document.body.classList.toggle('tmr', !!L.length); }
  box.onclick = e => { const s = e.target.closest('[data-j]'); if (!s) return; const j = jobs().find(q => q.id === s.dataset.j); if (j) bb.toast(`${j.icon} ${bb.esc(j.label)} · ready in ${fmt((j.end - Date.now()) / 1000)}`, '#d6c8e4'); };
  function check(away) { const now = Date.now(); const L = jobs(); for (const j of L.slice()) { if (j.end > now || !handlers[j.kind]) continue; L.splice(L.indexOf(j), 1); bb.setDirty(); try { handlers[j.kind](j, away); } catch (e) { console.error(e); } } }
  bb.onStart(() => { started = true; setTimeout(() => { check(true); if (bb.resumeWait) bb.resumeWait(); }, 700); });
  setInterval(() => { if (!started) return; check(false); draw(); }, 500);
  // coming back to the tab: catch up straight away
  document.addEventListener('visibilitychange', () => { if (!document.hidden && started) { check(true); draw(); } });
  bb.TIMERS = { add, on, source, cancel, list, fmt, get jobs() { return jobs(); } };
});
