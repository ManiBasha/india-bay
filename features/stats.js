// Numbers for the admin dashboards (Beta v1.01.21), sent only for players who are signed in:
//   • who is playing now: where in the Bay (state, city), on foot or driving, and the look they chose (male or
//     female) and age group, for showing suitable ads. Nothing else, and never their name or date of birth.
//   • how the game is used: minutes driving, walking, on public transport and sleeping, voice, texts and calls,
//     and how many requests go to the game server (Cloudflare) and the database (Supabase).
//   • billboard ads: how often each ad was seen and tapped (collaborator ads, India Bay ads and samples).
// Also: Admin → Refresh can make every player's game reload (for an urgent update).
window.BBFeatures.push(function (bb) {
  const O = () => bb.ONLINE; const U = bb.USAGE = bb.USAGE || { n: {}, add(k, v) { this.n[k] = (this.n[k] || 0) + (v == null ? 1 : v); } };
  const C = window.ONLINE || {};
  // requests to the database (Supabase): counted by kind
  if (C.supabaseUrl && window.fetch && !window.__ibFetchCount) { window.__ibFetchCount = 1; const base = String(C.supabaseUrl).replace(/\/$/, ''); const f0 = window.fetch.bind(window);
    window.fetch = function (u, o) { try { const s = typeof u === 'string' ? u : (u && u.url) || ''; if (s.startsWith(base)) U.add(s.includes('/storage/') ? 'sb_storage' : s.includes('/rpc/') ? 'sb_rpc' : s.includes('/auth/') ? 'sb_auth' : 'sb_rest'); } catch (e) {} return f0(u, o); }; }
  /* ---------- time spent: every second, what you are doing ---------- */
  setInterval(() => { if (!bb.started || document.hidden) return; const pl = bb.player; const w = bb.getWait && bb.getWait();
    if (w && /sleep/i.test(w.kind || '')) U.add('sleep_s'); else if (bb.CINE && bb.CINE.on) U.add('transit_s'); else if (bb.inside) U.add('inside_s'); else if (pl.mode === 'drive' && pl.veh) { U.add(pl.veh.spec && pl.veh.spec.animal ? 'animal_s' : 'drive_s'); } else if (Math.abs(pl.v || 0) > .5) U.add('walk_s'); else U.add('idle_s');
    U.add('play_s'); }, 1000);
  bb.on('travel', e => U.add('trips_' + String(e && e.mode || 'other').replace(/[^a-z0-9]/g, '').slice(0, 12)));
  bb.on('ticket', () => U.add('tickets')); bb.on('taxiBook', () => U.add('taxis')); bb.on('baygram', () => U.add('posts')); bb.on('comment', () => U.add('comments')); bb.on('eat', () => U.add('meals')); bb.on('sleep', () => U.add('sleeps')); bb.on('jump', () => U.add('jumps'));
  /* ---------- ads seen and tapped ---------- */
  const ads = new Map(); const adKey = a => { const s = a.collab ? String(a.advertiser || 'Sponsor') : a.sample ? 'Sample' : 'India Bay'; const t = String(a.text || (a.title + (a.line2 ? '|' + a.line2 : '')) || '').slice(0, 120); return s + '\u0001' + t; };
  const adAdd = (a, k) => { if (!a) return; const key = adKey(a); const r = ads.get(key) || { v: 0, c: 0 }; r[k]++; ads.set(key, r); };
  bb.on('adView', a => adAdd(a, 'v')); bb.on('adClick', a => adAdd(a, 'c'));
  /* ---------- sending ---------- */
  async function flush() { const o = O(); if (!o || !o.signedIn || !o.client) return; const n = U.n; U.n = {}; const body = {}; for (const k in n) if (n[k] > 0) body[k] = Math.round(n[k]);
    for (const k of ['play_s', 'drive_s', 'walk_s', 'transit_s', 'sleep_s', 'inside_s', 'idle_s', 'animal_s']) if (body[k]) body[k.replace('_s', '_min')] = Math.round(body[k] / 60 * 10) / 10;
    if (Object.keys(body).length) { const r = await o.rpc('add_usage', { p: body }); if (r && r.error && !/does not exist|schema cache|function/i.test(r.error.message || '')) for (const k in n) U.add(k, n[k]); }
    if (ads.size) { const L = [...ads.entries()].slice(0, 60).map(([k, v]) => { const [s, a] = k.split('\u0001'); return { s, a, v: v.v, c: v.c }; }); ads.clear(); await o.rpc('add_ad_stats', { p: L }); } }
  setInterval(flush, 5 * 60 * 1000); document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  /* ---------- who is playing now ---------- */
  const ageGroup = () => { const a = bb.ageFromDob ? bb.ageFromDob(bb.P.dob) : null; return a == null ? '' : a < 13 ? 'under 13' : a < 18 ? '13-17' : a < 25 ? '18-24' : a < 35 ? '25-34' : a < 50 ? '35-49' : '50+'; };
  async function beat() { const o = O(); if (!o || !o.signedIn || !o.client || !bb.started || document.hidden) return; const p = bb.ppos(); const z = bb.zoneAt(p.x, p.z, 120); const pl = bb.player;
    const mode = bb.inside ? 'inside' : bb.CINE && bb.CINE.on ? 'transit' : (bb.getWait && bb.getWait() && /sleep/i.test(bb.getWait().kind || '')) ? 'sleep' : pl.mode === 'drive' ? 'drive' : 'foot';
    try { await o.client.from('presence').upsert({ user_id: o.uid, username: o.username || '', is_guest: !!o.guest, female: !!(bb.P.look && bb.P.look.female), age_group: ageGroup(), state: bb.stateAt ? bb.stateAt(p.x, p.z) : '', zone: z ? z.name : '', x: Math.round(p.x), z: Math.round(p.z), mode, updated_at: new Date().toISOString() }); } catch (e) {} }
  bb.onStart(() => setTimeout(beat, 4000)); setInterval(beat, 60000);
  /* ---------- Admin → Refresh: reload every player's game ---------- */
  const loadedAt = Date.now(); let reloading = false;
  function checkReload(c) { const t = +((c || bb.CFG).reloadAt || 0); if (!t || t <= loadedAt || reloading) return; if (Date.now() - t > 30 * 60 * 1000) return; reloading = true;
    if (!bb.started) { location.replace(location.pathname + '?u=' + Date.now() + location.hash); return; }
    bb.toast('🔄 India Bay is updating · your game is saved and reloads in 10 seconds', '#ffc93c'); try { bb.save(); } catch (e) {} setTimeout(() => { try { bb.save(); } catch (e) {} location.replace(location.pathname + '?u=' + Date.now() + location.hash); }, 10000); }
  bb.on('config', checkReload); setTimeout(() => checkReload(), 3000);
  bb.STATS = { flush, beat };
});
