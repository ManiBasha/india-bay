// Online play: Supabase sign-in (Google or guest), unique usernames, cloud saves, shared admin settings,
// and the live West region on the Cloudflare server (other players, proximity chat, mute and report).
// Does nothing until js/online-config.js is filled in.
window.BBFeatures.push(function (bb) {
  const C = window.ONLINE || {};
  if (!C.supabaseUrl || !C.supabaseKey) return;
  const THREE = bb.THREE;
  const SB_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js';
  const REGION = 'west', IDLE_MIN = 10;
  let sb = null, session = null, profile = null, isAdmin = false, offline = false, passed = false, next = null;
  let authRetry = false, ws = null, myId = null, online = 0, status = 'off', kicked = false, idleOff = false, retry = 0, lastInput = Date.now(), lastSent = null;
  const remotes = new Map();
  const muted = new Set((() => { try { return JSON.parse(localStorage.getItem('ib.muted') || '[]'); } catch (e) { return []; } })());
  const lastChat = {};
  const mats = {}; const mat = c => (mats[c] = mats[c] || bb.LMat(c));
  const $ = q => document.querySelector(q);
  const isAnon = () => !!(session && session.user && session.user.is_anonymous);
  const here = () => location.origin + location.pathname;

  /* ---------- page elements ---------- */
  const lcol = $('#top .lcol');
  const chip = document.createElement('button'); chip.id = 'chat'; chip.className = 'pill'; chip.type = 'button'; chip.hidden = true; lcol.appendChild(chip);
  const log = document.createElement('div'); log.id = 'chatlog'; lcol.appendChild(log);
  const bar = document.createElement('form'); bar.id = 'chatbar'; bar.hidden = true; bar.setAttribute('novalidate', '');
  bar.innerHTML = '<input maxlength="120" placeholder="Say something to players nearby" enterkeyhint="send" aria-label="Chat message"><button class="go" type="submit">Send</button><button class="buy ghost" type="button" data-x>✕</button>';
  document.body.appendChild(bar);
  const inp = bar.querySelector('input');
  const introLine = document.createElement('div'); introLine.id = 'onl'; const cities = $('#cities'); if (cities) cities.after(introLine);

  /* ---------- Supabase ---------- */
  function loadScript() { return new Promise((res, rej) => { if (window.supabase && window.supabase.createClient) return res(); const s = document.createElement('script'); s.src = SB_JS; s.onload = res; s.onerror = () => rej(new Error('sign-in library did not load')); document.head.appendChild(s); }); }
  function niceErr(e) {
    const m = String(e && e.message || e || '');
    if (/anonymous sign-ins are disabled/i.test(m)) return 'Guest play is not switched on yet. In Supabase: Authentication → Sign In / Providers → allow anonymous sign-ins.';
    if (/provider is not enabled|unsupported provider/i.test(m)) return 'Google sign-in is not set up yet. Use guest play for now.';
    if (/manual linking is disabled/i.test(m)) return 'Linking is not switched on yet. In Supabase: Authentication → Sign In / Providers → allow manual linking.';
    if (/already linked|identity_already_exists/i.test(m)) return 'That Google account already has its own India Bay profile. Sign out and sign in with Google instead.';
    if (/failed to fetch|network/i.test(m)) return 'No connection to the server. Check your internet and try again.';
    return m || 'Something went wrong. Try again.';
  }
  const backend = admin => ({
    admin,
    async save(c) { const { error } = await sb.from('game_config').upsert({ id: 1, data: c, updated_at: new Date().toISOString() }); if (error) throw error; },
    async suggest(row) { const { error } = await sb.from('suggestions').insert({ name: row.name, region: row.region, text: row.text }); if (error) throw error; },
    async listSuggestions() { const { data, error } = await sb.from('suggestions').select('name,region,text,created_at').order('created_at', { ascending: false }).limit(50); if (error) throw error; return data.map(r => ({ name: r.name, region: r.region, text: r.text, date: String(r.created_at).slice(0, 10) })); }
  });
  async function loadConfig() { try { const { data } = await sb.from('game_config').select('data').eq('id', 1).maybeSingle(); if (data && data.data) bb.cloudConfig(data.data); } catch (e) {} }
  async function afterSignIn() {
    const uid = session.user.id;
    const pr = await sb.from('profiles').select('username,is_guest').eq('id', uid).maybeSingle();
    if (pr.error) throw pr.error;
    profile = pr.data || null;
    const ad = await sb.from('admins').select('user_id').eq('user_id', uid).maybeSingle();
    isAdmin = !!(ad.data);
    bb.setCfgBackend(backend(isAdmin));
    if (profile && profile.is_guest && !isAnon()) { await sb.from('profiles').update({ is_guest: false }).eq('id', uid); profile.is_guest = false; }
    renderIntro();
  }
  const ready = (async () => {
    try {
      await loadScript();
      sb = window.supabase.createClient(C.supabaseUrl, C.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } });
      const q = new URLSearchParams(location.search);
      const { data } = await sb.auth.getSession(); session = data.session;
      if (q.has('code') || q.has('error')) { if (q.get('error_description')) setTimeout(() => bb.toast(q.get('error_description'), '#ff8b8b'), 800); history.replaceState(null, '', location.pathname + location.hash); }
      sb.auth.onAuthStateChange((ev, s) => { session = s; if (ev === 'SIGNED_OUT') { profile = null; disconnect(true); } });
      loadConfig(); setInterval(loadConfig, 5 * 60 * 1000);
      if (session) await afterSignIn();
      if (sessionStorage.getItem('ib.cloudLoaded')) { sessionStorage.removeItem('ib.cloudLoaded'); setTimeout(() => bb.toast('☁ Loaded your cloud save', '#3ddc97'), 600); }
      renderIntro(); serverStatus();
      return true;
    } catch (e) { console.warn('Online unavailable', e); status = 'error'; renderIntro(); return false; }
  })();

  /* ---------- start screen gate ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('#go,#newGame');
    if (!t) return;
    if (t.id === 'newGame') { if (t.dataset.sure) sessionStorage.setItem('ib.reset', '1'); return; }
    if (passed) return;
    e.preventDefault(); e.stopImmediatePropagation();
    next = pass; flow();
  }, true);
  function pass() { passed = true; $('#go').click(); }
  async function flow() {
    const ok = await ready;
    if (!ok) { bb.toast('Online is unavailable right now · playing offline', '#ffc93c'); offline = true; return next(); }
    if (offline) return next();
    if (!session) return signInSheet();
    if (!profile) return nameSheet();
    if (await syncSave()) return;
    offline = false; next();
  }

  function signInSheet() {
    bb.openSheet('Play online', 'Play West India with everyone', `<div class="stack"><button class="go" data-id="google">Sign in with Google</button><button class="go alt" data-id="guest">Play as guest</button>${passed ? '' : '<button class="buy ghost" data-id="offline">Play offline</button>'}</div>
      <p class="note">Google keeps your progress on every device. A guest account lives in this browser only; you can link Google later from Phone → Online.</p><p class="note" id="si_msg" aria-live="polite"></p>`, s => {
      s.onclick = async e => {
        const id = e.target.dataset.id; if (!id) return; const msg = s.querySelector('#si_msg');
        const bad = t => { msg.textContent = t; msg.className = 'note bad'; };
        if (id === 'offline') { offline = true; bb.closeSheet(); return next(); }
        if (id === 'google') { msg.textContent = 'Opening Google…'; msg.className = 'note'; const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: here() } }); if (error) bad(niceErr(error)); return; }
        if (id === 'guest') {
          msg.textContent = 'Creating your guest account…'; msg.className = 'note';
          const { data, error } = await sb.auth.signInAnonymously(); if (error) return bad(niceErr(error));
          session = data.session; try { await afterSignIn(); } catch (err) { return bad(niceErr(err)); }
          bb.closeSheet(); flow();
        }
      };
    });
  }
  function nameSheet() {
    const sug = bb.P.name && !bb.nameOk(bb.P.name) ? bb.P.name : '';
    bb.openSheet('Pick your username', 'Everyone online sees this name', `<form class="form" id="un" novalidate><label>Username<input type="text" id="un_n" maxlength="10" autocomplete="off" value="${bb.esc(sug)}" placeholder="Raju2026"></label><div class="note" id="un_m">Letters and numbers, up to 10. Nobody else can have the same name.</div>
      <label class="ck"><input type="checkbox" id="un_18"${bb.P.age18 ? ' checked' : ''}> I am 18 or older</label><div class="btnrow"><button class="go" type="submit">Continue</button></div></form>`, s => {
      const f = s.querySelector('#un'), n = s.querySelector('#un_n'), m = s.querySelector('#un_m');
      n.oninput = () => { const er = bb.nameOk(n.value); m.textContent = er || 'Looks good.'; m.className = 'note ' + (er ? 'bad' : 'ok'); };
      f.onsubmit = async e => {
        e.preventDefault(); const name = n.value.trim(); const er = bb.nameOk(name); if (er) { m.textContent = er; m.className = 'note bad'; return; }
        m.textContent = 'Checking…'; m.className = 'note';
        const { error } = await sb.from('profiles').insert({ id: session.user.id, username: name, is_guest: isAnon() });
        if (error) { m.textContent = error.code === '23505' ? `${name} is taken. Try another.` : error.code === '23514' ? 'That name is not allowed. Try another.' : niceErr(error); m.className = 'note bad'; return; }
        profile = { username: name, is_guest: isAnon() }; bb.P.age18 = s.querySelector('#un_18').checked; bb.closeSheet(); renderIntro(); flow();
      };
    });
  }

  /* ---------- cloud save ---------- */
  function claim() { bb.P.extra.uid = session.user.id; bb.P.name = profile.username; bb.setDirty(); }
  async function syncSave() {
    const uid = session.user.id, P = bb.P;
    if (sessionStorage.getItem('ib.reset')) { sessionStorage.removeItem('ib.reset'); claim(); upload(true); return false; }
    const { data, error } = await sb.from('saves').select('data').eq('user_id', uid).maybeSingle();
    if (error) { bb.toast('Could not reach your cloud save · using this device', '#ffc93c'); claim(); return false; }
    const cloud = data && data.data; const mine = P.extra && P.extra.uid === uid;
    if (cloud && (!mine || (cloud.savedAt || 0) > (P.savedAt || 0))) {
      cloud.extra = cloud.extra || {}; cloud.extra.uid = uid; cloud.name = profile.username;
      localStorage.setItem('ib.save.v3', JSON.stringify(cloud)); sessionStorage.setItem('ib.cloudLoaded', '1'); location.reload(); return true;
    }
    claim(); return false;
  }
  let upAt = 0, upBusy = false, upLater = false;
  async function upload(force) {
    if (!sb || !session || !profile || !passed && !force) return;
    if (!force && Date.now() - upAt < 20000) { upLater = true; return; }
    if (upBusy) { upLater = true; return; }
    upBusy = true; upLater = false; upAt = Date.now();
    try { const { error } = await sb.from('saves').upsert({ user_id: session.user.id, data: bb.P, updated_at: new Date().toISOString() }); if (error) { console.warn(error); upLater = true; } } catch (e) { upLater = true; }
    upBusy = false;
  }
  bb.on('save', () => upload(false));
  setInterval(() => { if (upLater) upload(true); }, 20000);
  document.addEventListener('visibilitychange', () => { if (document.hidden && passed && session) { bb.save(); upload(true); } });

  /* ---------- server connection ---------- */
  function wsUrl() { return String(C.serverUrl).replace(/^http/, 'ws').replace(/\/$/, '') + '/ws?region=' + REGION + '&token=' + encodeURIComponent(session.access_token); }
  function connect() {
    if (!C.serverUrl || !session || !profile || ws || offline) return;
    kicked = false; idleOff = false; status = 'connecting'; renderChip();
    try { ws = new WebSocket(wsUrl()); } catch (e) { ws = null; return later(); }
    const me = ws;
    me.onmessage = ev => { if (ws !== me) return; let d; try { d = JSON.parse(ev.data); } catch (e) { return; } handle(d); };
    me.onclose = () => { if (ws !== me) return; ws = null; myId = null; clearRemotes(); status = kicked ? 'off' : 'retry'; renderChip(); if (!kicked) later(); };
  }
  function later() { retry = Math.min(retry + 1, 6); setTimeout(() => { if (!ws && !kicked && !offline && bb.started) connect(); }, 1000 * Math.pow(2, retry)); }
  function disconnect(silent) { kicked = true; if (ws) { const w = ws; ws = null; try { w.close(); } catch (e) {} } myId = null; clearRemotes(); status = 'off'; renderChip(); if (!silent) bb.toast('Offline', '#d6c8e4'); }
  async function handle(d) {
    if (d.t === 'hello') { authRetry = false; myId = d.id; online = d.online; status = 'on'; retry = 0; lastSent = null; renderChip(); bb.toast(`🌐 Online in West India as ${d.name}`, '#3ddc97'); }
    else if (d.t === 'snap') { online = d.online; for (const p of d.list) upsert(p); renderChip(); }
    else if (d.t === 'p') { upsert(d); }
    else if (d.t === 'leave') { drop(d.id); renderChip(); }
    else if (d.t === 'pong') { online = d.online; renderChip(); }
    else if (d.t === 'slow') bb.toast('Wait a moment before sending again', '#ffc93c');
    else if (d.t === 'chat') chat(d);
    else if (d.t === 'kick') { kicked = true; if (/idle/i.test(d.msg)) idleOff = true; bb.toast(d.msg + (idleOff ? ' · press any key to rejoin' : ''), '#ffc93c'); }
    else if (d.t === 'err') {
      if (d.code === 'auth' && !authRetry) { authRetry = true; try { const r = await sb.auth.refreshSession(); if (r.data && r.data.session) { session = r.data.session; return; } } catch (e) {} kicked = true; bb.toast(d.msg, '#ff8b8b'); }
      else { kicked = true; bb.toast(d.msg, '#ff8b8b'); }
    }
  }
  function input() { lastInput = Date.now(); if (idleOff && !ws && bb.started) { idleOff = false; connect(); } }
  ['keydown', 'pointerdown', 'touchstart'].forEach(ev => addEventListener(ev, input, { passive: true }));
  setInterval(() => { if (ws && Date.now() - lastInput > IDLE_MIN * 60000) { disconnect(true); idleOff = true; bb.toast(`Went offline after ${IDLE_MIN} idle minutes · press any key to rejoin`, '#ffc93c'); } }, 30000);
  setInterval(() => { if (ws && ws.readyState === 1) ws.send('{"t":"ping"}'); }, 30000);
  // Keep others seeing you while a menu is open (the game loop pauses then).
  setInterval(() => { if (ws && ws.readyState === 1 && myId && bb.started && lastSent && Date.now() - lastSent.at > 3500) { const st = state(); ws.send(JSON.stringify(st)); st.at = Date.now(); lastSent = st; } }, 2000);
  bb.onStart(() => { if (session && profile && !offline) connect(); renderChip(); });

  /* ---------- other players ---------- */
  function tag(text, chatty) {
    const c = document.createElement('canvas'), x = c.getContext('2d'); const fs = chatty ? 30 : 28; x.font = `700 ${fs}px "Baloo 2", sans-serif`;
    const w = Math.min(640, Math.ceil(x.measureText(text).width) + 30), h = fs + 22; c.width = w; c.height = h + (chatty ? 12 : 0);
    x.font = `700 ${fs}px "Baloo 2", sans-serif`; x.fillStyle = chatty ? 'rgba(255,255,255,.96)' : 'rgba(20,16,40,.78)';
    const r = h / 2; x.beginPath(); x.moveTo(r, 0); x.arcTo(w, 0, w, h, r); x.arcTo(w, h, 0, h, r); x.arcTo(0, h, 0, 0, r); x.arcTo(0, 0, w, 0, r); x.fill();
    if (chatty) { x.beginPath(); x.moveTo(w / 2 - 10, h - 1); x.lineTo(w / 2, h + 11); x.lineTo(w / 2 + 10, h - 1); x.fill(); }
    x.fillStyle = chatty ? '#1a1430' : '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 1);
    const t = new THREE.CanvasTexture(c); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
    const sc = chatty ? .8 : .55; sp.scale.set(sc * c.width / c.height, sc, 1); sp.renderOrder = 999; return sp;
  }
  function freeSprite(sp) { if (!sp) return; sp.parent && sp.parent.remove(sp); sp.material.map.dispose(); sp.material.dispose(); }
  const TALL = { bus: 4.4, truck: 4.2 };
  function rebuild(r, d, kind) {
    if (r.body) r.g.remove(r.body);
    r.kind = kind;
    if (d.m === 'd') {
      r.body = bb.buildVeh(d.v); const sp = bb.SPEC[d.v] || {};
      if (sp.two || sp.pedal) { const rider = bb.buildPerson(mat(d.c || '#e8573e')); rider.position.set(0, .35, -.15); const U = rider.userData; U.legs.forEach(l => l.rotation.x = -1.3); r.body.add(rider); }
      r.tagY = TALL[d.v] || 2.9;
    } else { r.body = bb.buildPerson(mat(d.c || '#e8573e')); r.tagY = 2.45; }
    r.g.add(r.body); r.tag.position.y = r.tagY; if (r.bub) r.bub.position.y = r.tagY + 1.1;
  }
  function upsert(d) {
    if (d.id === myId) return;
    let r = remotes.get(d.id);
    const kind = d.m === 'd' ? 'd:' + d.v : d.m === 'i' ? 'i' : 'f:' + (d.c || '');
    if (!r) { r = { id: d.id, n: d.n, g: new THREE.Group(), body: null, kind: '', x: d.x, z: d.z, y: d.y || 0, h: d.h, walk: 0, tagY: 2.4 }; r.tag = tag(d.n, false); r.g.add(r.tag); bb.scene.add(r.g); remotes.set(d.id, r); renderChip(); }
    if (r.kind !== kind && kind !== 'i') rebuild(r, d, kind); else if (kind === 'i') r.kind = 'i';
    r.tx = d.x; r.tz = d.z; r.ty = d.y || 0; r.th = d.h; r.s = d.s || 0; r.seen = performance.now(); r.n = d.n; r.m = d.m;
    if (Math.hypot(r.tx - r.x, r.tz - r.z) > 60) { r.x = r.tx; r.z = r.tz; r.h = r.th; }
  }
  function drop(id) { const r = remotes.get(id); if (!r) return; bb.scene.remove(r.g); freeSprite(r.tag); freeSprite(r.bub); remotes.delete(id); }
  function clearRemotes() { for (const id of [...remotes.keys()]) drop(id); }
  const selfG = new THREE.Group(); bb.scene.add(selfG); let selfBub = null, selfBubT = 0;

  function state() {
    const pl = bb.player, drive = pl.mode === 'drive' && pl.veh, p = bb.ppos();
    return { t: 'p', x: +p.x.toFixed(2), z: +p.z.toFixed(2), y: +(p.y || 0).toFixed(2), h: +(drive ? pl.veh.h : pl.h).toFixed(3), s: +((drive ? pl.veh.v : pl.v) || 0).toFixed(1), m: bb.inside ? 'i' : drive ? 'd' : 'f', v: drive ? pl.veh.type : '', c: bb.P.outfit.topCol || '' };
  }
  bb.onUpdate(dt => {
    const now = performance.now(), k = 1 - Math.exp(-8 * Math.min(dt, .2)), hide = bb.inside;
    for (const r of [...remotes.values()]) {
      if (now - r.seen > 9000) { drop(r.id); renderChip(); continue; }
      r.x += (r.tx - r.x) * k; r.z += (r.tz - r.z) * k; r.y += (r.ty - r.y) * k;
      let dh = r.th - r.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); r.h += dh * k;
      r.g.position.set(r.x, r.y, r.z); if (r.body) r.body.rotation.y = r.h; r.g.visible = !hide && r.kind !== 'i';
      if (r.kind[0] === 'f' && r.body && r.body.userData.legs) { const mv = Math.hypot(r.tx - r.x, r.tz - r.z) > .05 || Math.abs(r.s) > .3; r.walk += Math.min(dt, .2) * (mv ? 9 : 0); const a = mv ? Math.sin(r.walk) * .6 : 0; const U = r.body.userData; U.legs[0].rotation.x = a; U.legs[1].rotation.x = -a; U.arms[0].rotation.x = -a; U.arms[1].rotation.x = a; }
      if (r.bub && now > r.bubT) { freeSprite(r.bub); r.bub = null; }
    }
    const p = bb.ppos(); selfG.position.set(p.x, p.y || 0, p.z); selfG.visible = !hide;
    if (selfBub && now > selfBubT) { freeSprite(selfBub); selfBub = null; }
    if (ws && ws.readyState === 1 && myId && bb.started) {
      const st = state(), t = Date.now(), L = lastSent;
      const moved = !L || Math.hypot(st.x - L.x, st.z - L.z) > .4 || Math.abs(st.h - L.h) > .05 || st.m !== L.m || st.v !== L.v || st.c !== L.c;
      const gap = L ? t - L.at : 1e9;
      if ((moved && gap > 300) || gap > 4000) { ws.send(JSON.stringify(st)); st.at = t; lastSent = st; }
    }
  });

  /* ---------- chat ---------- */
  function chat(d) {
    const self = d.id === myId;
    if (!self && muted.has(String(d.n).toLowerCase())) return;
    lastChat[d.n] = d.text;
    const line = document.createElement('div'); line.className = 'cl'; line.innerHTML = `<b>${bb.esc(d.n)}</b> ${bb.esc(d.text)}`; log.appendChild(line);
    while (log.children.length > 4) log.firstChild.remove();
    setTimeout(() => { line.classList.add('fade'); setTimeout(() => line.remove(), 800); }, 12000);
    const short = d.text.length > 42 ? d.text.slice(0, 40) + '…' : d.text;
    if (self) { freeSprite(selfBub); selfBub = tag(short, true); selfBub.position.y = (bb.player.mode === 'drive' ? 3.4 : 2.9); selfG.add(selfBub); selfBubT = performance.now() + 7000; }
    else { const r = remotes.get(d.id); if (r) { freeSprite(r.bub); r.bub = tag(short, true); r.bub.position.y = r.tagY + 1.1; r.g.add(r.bub); r.bubT = performance.now() + 7000; } }
  }
  function openBar() { if (status !== 'on') { offline = false; if (!session || !profile) { next = connect; return flow(); } return connect(); } bar.hidden = false; inp.value = ''; inp.focus(); }
  function closeBar() { bar.hidden = true; inp.blur(); }
  bar.onsubmit = e => { e.preventDefault(); const t = inp.value.trim(); if (t && ws && ws.readyState === 1) ws.send(JSON.stringify({ t: 'chat', text: t.slice(0, 120) })); closeBar(); };
  bar.querySelector('[data-x]').onclick = closeBar;
  inp.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); closeBar(); } });
  chip.onclick = openBar;
  // T opens chat. Handled here so the T itself is not typed into the box.
  addEventListener('keydown', e => { if (e.code !== 'KeyT' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return; if (e.target.closest && e.target.closest('input,textarea,select')) return; if (!bb.started || bb.uiLock()) return; e.preventDefault(); openBar(); }, true);
  function renderChip() {
    chip.hidden = !bb.started || (!session && !offline);
    if (offline && !session) chip.hidden = !bb.started;
    chip.innerHTML = status === 'on' ? `💬 Chat <small>${remotes.size} near · ${online} online</small>` : status === 'connecting' ? '🌐 Joining…' : status === 'retry' ? '🌐 Reconnecting…' : offline || !session ? '🌐 Offline · go online' : '🌐 Offline · tap to rejoin';
    chip.classList.toggle('on', status === 'on');
  }

  /* ---------- start screen line ---------- */
  async function serverStatus() { if (!C.serverUrl) return; try { const r = await fetch(String(C.serverUrl).replace(/\/$/, '') + '/status'); const j = await r.json(); if (typeof j[REGION] === 'number') { online = j[REGION]; renderIntro(); } } catch (e) {} }
  function renderIntro() {
    if (!introLine) return;
    const who = session && profile ? `Signed in as <b>${bb.esc(profile.username)}</b>${isAnon() ? ' (guest)' : ''} · <button type="button" class="lnk" data-out>Sign out</button>` : session ? 'Signed in · pick a username when you start' : status === 'error' ? 'Online is unavailable right now' : 'Sign in when you start to play online';
    introLine.innerHTML = `🌐 West India online${online ? ` · <b>${online}</b> playing now` : ''}<br><small>${who}</small>`;
    const o = introLine.querySelector('[data-out]'); if (o) o.onclick = signOut;
  }
  async function signOut() { bb.save(); await upload(true); disconnect(true); try { await sb.auth.signOut(); } catch (e) {} localStorage.removeItem('ib.save.v3'); location.reload(); }

  /* ---------- phone app ---------- */
  function sheet() {
    if (!session || !profile) return bb.openSheet('🌐 Online', 'You are playing offline', `<p class="note">Sign in to see other players, chat and keep your progress in the cloud.</p><div class="btnrow"><button class="go" data-id="signin">Go online</button></div>`, s => s.onclick = e => { if (e.target.dataset.id === 'signin') { offline = false; next = () => { bb.closeSheet(); connect(); }; flow(); } });
    const pp = bb.ppos(); const list = [...remotes.values()].map(r => ({ r, d: Math.hypot(r.x - pp.x, r.z - pp.z) })).sort((a, b) => a.d - b.d);
    const st = status === 'on' ? `Connected · ${online} online in West India` : status === 'connecting' || status === 'retry' ? 'Connecting…' : 'Offline';
    bb.openSheet('🌐 Online', st,
      bb.rowHtml('conn', status === 'on' ? 'Connected' : 'Not connected', `Region: West India${C.serverUrl ? '' : ' · server not set up yet'}`, status === 'on' ? 'Go offline' : 'Connect', status === 'on' ? 'ghost' : '') +
      bb.rowHtml('acct', bb.esc(profile.username), isAnon() ? 'Guest account · progress lives in this browser' : 'Google account · progress saved in the cloud', isAnon() ? 'Link Google' : 'Sign out', 'ghost') +
      (isAnon() ? bb.rowHtml('out', 'Sign out', 'A guest account cannot be recovered after signing out', 'Sign out', 'ghost') : '') +
      `<h3 class="sub">Players near you (${list.length})</h3>` +
      (list.length ? list.map(({ r, d }) => `<div class="row"><div class="nm">${bb.esc(r.n)}<small>${d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km'} · ${r.m === 'd' ? 'driving' : r.m === 'i' ? 'indoors' : 'on foot'}</small></div><div class="btnrow" style="flex-wrap:nowrap;gap:6px"><button class="buy ghost" data-mute="${bb.esc(r.n)}">${muted.has(r.n.toLowerCase()) ? 'Unmute' : 'Mute'}</button><button class="buy ghost" data-rep="${bb.esc(r.n)}">Report</button></div></div>`).join('') : '<p class="note">Nobody nearby yet. Players within about 700 m show up here and on the road.</p>') +
      `<p class="note">Chat with <kbd>T</kbd> or the 💬 button. Messages reach players within 250 m. Be kind: reports go to the admin.</p>`,
      s => s.onclick = async e => {
        const id = e.target.dataset.id, mu = e.target.dataset.mute, rep = e.target.dataset.rep;
        if (id === 'conn') { if (status === 'on') disconnect(); else { offline = false; connect(); } return setTimeout(sheet, 400); }
        if (id === 'acct') { if (!isAnon()) return signOut(); const { error } = await sb.auth.linkIdentity({ provider: 'google', options: { redirectTo: here() } }); if (error) bb.toast(niceErr(error), '#ff8b8b'); return; }
        if (id === 'out') return signOut();
        if (mu) { const k = mu.toLowerCase(); muted.has(k) ? muted.delete(k) : muted.add(k); try { localStorage.setItem('ib.muted', JSON.stringify([...muted])); } catch (er) {} bb.toast(muted.has(k) ? `${mu} muted` : `${mu} unmuted`, '#d6c8e4'); return sheet(); }
        if (rep) return reportSheet(rep);
      });
  }
  function reportSheet(name) {
    bb.openSheet('Report ' + name, 'The admin reviews every report', `<form class="form" id="rp" novalidate><label>What happened?<select id="rp_r"><option>Rude or abusive chat</option><option>Bad username</option><option>Cheating</option><option>Spamming</option><option>Other</option></select></label><label>Details (optional)<textarea id="rp_t" maxlength="200"></textarea></label><div class="btnrow"><button class="go" type="submit">Send report</button></div><p class="note" id="rp_m"></p></form>`, s => {
      s.querySelector('#rp').onsubmit = async e => {
        e.preventDefault(); const reason = (s.querySelector('#rp_r').value + ' · ' + s.querySelector('#rp_t').value).slice(0, 300);
        const { error } = await sb.from('reports').insert({ target_name: name, reason, last_chat: lastChat[name] || null });
        if (error) { const m = s.querySelector('#rp_m'); m.textContent = niceErr(error); m.className = 'note bad'; return; }
        muted.add(name.toLowerCase()); try { localStorage.setItem('ib.muted', JSON.stringify([...muted])); } catch (er) {}
        bb.closeSheet(); bb.toast(`Report sent · ${name} is muted for you`, '#3ddc97');
      };
    });
  }
  bb.addApp({ id: 'online', label: 'Online', icon: '🌐', fn: sheet });
  bb.ONLINE = { get status() { return status; }, get remotes() { return remotes; }, get profile() { return profile; }, connect, disconnect };
});
