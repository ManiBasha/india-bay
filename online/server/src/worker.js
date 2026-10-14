// India Bay online server (Cloudflare Worker + one Durable Object per region).
// Players connect with a WebSocket. The Worker checks their Supabase sign-in and username,
// then hands them to the region's Durable Object, which relays positions and chat to nearby players.
import { DurableObject } from 'cloudflare:workers';

const REGIONS = ['west'];          // regions that have a live map
const MAX_PLAYERS = 150;           // per region
const NEAR = 700;                  // metres: players closer than this see each other
const CHAT_NEAR = 250;             // map units: chat and voice reach this far ("this area")
const CHAT_CLOSE = 21;             // map units (about 50 m in the game): "nearby only" chat and voice
const VOICE_MAX = 46000;           // characters of base64 audio in one voice message (about 8 seconds)
const VOICE_MIME = new Set(['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/aac']);
const IDLE_MS = 60_000;            // drop sockets silent for a minute
const VEH = new Set(['cycle', 'rickshaw', 'bike', 'sportsbike', 'auto', 'taxi', 'car', 'sedan', 'suv', 'sports', 'police', 'bus', 'truck']);
const BAD = ['fuck', 'shit', 'bitch', 'chutiya', 'madarchod', 'bhenchod', 'gandu', 'randi', 'harami', 'kamina', 'bastard', 'asshole', 'mc', 'bc'];

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });

function originOk(req, env) {
  const o = req.headers.get('Origin');
  if (!o) return true;
  const list = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return list.length === 0 || list.includes(o);
}

// A WebSocket that tells the game why it could not join, then closes.
function refuse(code, msg) {
  const [c, s] = Object.values(new WebSocketPair());
  s.accept(); s.send(JSON.stringify({ t: 'err', code, msg })); s.close(4000, code);
  return new Response(null, { status: 101, webSocket: c });
}

// Sign-in check. Newer Supabase projects sign tokens with a public key (JWKS), so the server
// checks the signature itself. Older projects fall back to asking Supabase who the token belongs to.
let JWKS = null, jwksAt = 0;
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0));
const dec = s => JSON.parse(new TextDecoder().decode(b64u(s)));
async function jwks(env, force) {
  if (force || !JWKS || Date.now() - jwksAt > 3600_000) {
    const r = await fetch(env.SUPABASE_URL + '/auth/v1/.well-known/jwks.json');
    JWKS = r.ok ? ((await r.json()).keys || []) : []; jwksAt = Date.now();
  }
  return JWKS;
}
async function verifyLocal(env, token) {
  const [h, p, sig] = String(token).split('.');
  if (!sig) return { bad: 'not a sign-in token' };
  const head = dec(h), body = dec(p);
  if (head.alg !== 'ES256' && head.alg !== 'RS256') return null;           // older project: use fallback
  let jwk = (await jwks(env)).find(k => k.kid === head.kid);
  if (!jwk) jwk = (await jwks(env, true)).find(k => k.kid === head.kid);
  if (!jwk) return null;
  const imp = head.alg === 'ES256' ? { name: 'ECDSA', namedCurve: 'P-256' } : { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
  const ver = head.alg === 'ES256' ? { name: 'ECDSA', hash: 'SHA-256' } : { name: 'RSASSA-PKCS1-v1_5' };
  const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y, n: jwk.n, e: jwk.e, alg: jwk.alg, ext: true }, imp, false, ['verify']);
  const ok = await crypto.subtle.verify(ver, key, b64u(sig), new TextEncoder().encode(h + '.' + p));
  if (!ok) return { bad: 'signature did not match' };
  if (body.exp && body.exp * 1000 < Date.now() - 30_000) return { bad: 'expired' };
  if (!body.sub) return { bad: 'no user in token' };
  return { uid: body.sub, anon: !!body.is_anonymous };
}
async function whoIs(env, token) {
  let v = await verifyLocal(env, token);
  if (!v) {
    const u = await fetch(env.SUPABASE_URL + '/auth/v1/user', { headers: { apikey: env.SUPABASE_KEY, authorization: 'Bearer ' + token } });
    if (!u.ok) return { bad: 'Supabase said ' + u.status + ' ' + (await u.text()).slice(0, 80) };
    const user = await u.json();
    v = user && user.id ? { uid: user.id, anon: !!user.is_anonymous } : { bad: 'no user' };
  }
  if (v.bad) return v;
  const url = env.SUPABASE_URL + '/rest/v1/profiles?select=username&id=eq.' + encodeURIComponent(v.uid);
  let p = await fetch(url, { headers: { apikey: env.SUPABASE_KEY, authorization: 'Bearer ' + token } });
  if (!p.ok) p = await fetch(url, { headers: { apikey: env.SUPABASE_KEY } });
  if (!p.ok) return { uid: v.uid, dbErr: p.status + ' ' + (await p.text()).slice(0, 80) };
  const rows = await p.json();
  return { uid: v.uid, anon: !!v.anon, name: rows[0] ? rows[0].username : null };
}

export default {
  async fetch(req, env) {
    // Accept the Project URL even if it was copied with /rest/v1 or a trailing slash on the end.
    env = Object.assign({}, env, { SUPABASE_URL: String(env.SUPABASE_URL || '').trim().replace(/\/(rest|auth)\/v1.*$/, '').replace(/\/+$/, '') });
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET', 'access-control-allow-headers': '*' } });
    if (url.pathname === '/' || url.pathname === '/health') return json({ ok: true, game: 'India Bay', regions: REGIONS });
    if (url.pathname === '/status') {
      const out = {};
      for (const r of REGIONS) {
        try { const res = await env.REGION.get(env.REGION.idFromName(r)).fetch('https://region/status'); out[r] = (await res.json()).online; } catch (e) { out[r] = null; }
      }
      return json(out);
    }
    if (url.pathname === '/ws') {
      if (req.headers.get('Upgrade') !== 'websocket') return json({ error: 'Expected a WebSocket' }, 426);
      if (!originOk(req, env)) return refuse('origin', 'This website is not allowed to join the online world.');
      const region = url.searchParams.get('region') || 'west';
      if (!REGIONS.includes(region)) return refuse('region', 'That region is not open yet.');
      const token = url.searchParams.get('token');
      if (!token) return refuse('auth', 'Please sign in first.');
      let who = null;
      try { who = await whoIs(env, token); } catch (e) { return refuse('auth', 'Could not check your sign-in (' + String(e && e.message || e).slice(0, 60) + '). Try again in a moment.'); }
      if (who.bad) return refuse('auth', 'Sign-in not accepted: ' + who.bad + '. Sign out and play as guest again.');
      if (who.dbErr) return refuse('db', 'Server could not read usernames (' + who.dbErr + '). Check SUPABASE_KEY in wrangler.toml.');
      if (!who.name) return refuse('name', 'Pick a username first.');
      const h = new Headers(req.headers); h.set('x-uid', who.uid); h.set('x-name', who.name); h.set('x-anon', who.anon ? '1' : '0');
      return env.REGION.get(env.REGION.idFromName(region)).fetch(new Request('https://region/ws', { headers: h }));
    }
    return json({ error: 'Not found' }, 404);
  }
};

const num = (v, lo, hi) => (typeof v === 'number' && isFinite(v) ? Math.max(lo, Math.min(hi, v)) : 0);
function clean(t) {
  t = String(t || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);
  for (const w of BAD) t = t.replace(new RegExp('\\b' + w + '\\b', 'gi'), m => m[0] + '*'.repeat(m.length - 1));
  return t;
}
const pub = p => { const o = { id: p.id, n: p.name, x: p.x, z: p.z, y: p.y, h: p.h, m: p.m, v: p.v, c: p.c, s: p.s }; if (p.l) o.l = p.l; if (p.pv) Object.assign(o, { pv: p.pv, px: p.px, pz: p.pz, py: p.py, ph: p.ph });
  if (p.m === 'r' && p.r) Object.assign(o, { r: p.r, rs: p.rs }); if (p.m === 'd' && p.o) o.o = p.o; return o; };
const VACT = new Set(['ride', 'seat', 'full', 'slow', 'no', 'leave', 'drop', 'take']);
const near = (a, b, r) => Math.abs(a.x - b.x) < r && Math.abs(a.z - b.z) < r;

export class Region extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.players = new Map();
    this.lastSweep = 0;
    for (const ws of ctx.getWebSockets()) { const a = ws.deserializeAttachment(); if (a) this.players.set(ws, a); }
  }

  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/status') return json({ online: this.players.size });
    const uid = req.headers.get('x-uid'), name = req.headers.get('x-name');
    if (!uid || !name) return new Response('Bad request', { status: 400 });
    // One connection per account: an older tab or device is told and closed.
    for (const [ws, p] of this.players) if (p.uid === uid) { this.drop(ws, 4001, 'Signed in somewhere else'); }
    if (this.players.size >= MAX_PLAYERS) return refuse('full', 'This region is full right now. Try again in a few minutes.');
    const [c, s] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(s);
    const p = { id: crypto.randomUUID().slice(0, 8), uid, name, anon: req.headers.get('x-anon') === '1', x: 0, z: 0, y: 0, h: 0, m: 'f', v: '', c: '', s: 0, seen: Date.now(), chatAt: 0, ready: false };
    s.serializeAttachment(p);
    this.players.set(s, p);
    s.send(JSON.stringify({ t: 'hello', id: p.id, name, online: this.players.size, guest: p.anon }));
    return new Response(null, { status: 101, webSocket: c });
  }

  // Reads the admin's voice switch from the game settings in Supabase, at most once a minute.
  async voiceOn() {
    const now = Date.now(); if (this.vcCheck && now - this.vcCheck.at < 60_000) return this.vcCheck.on;
    let on = true;
    try { const base = String(this.env.SUPABASE_URL || '').trim().replace(/\/(rest|auth)\/v1.*$/, '').replace(/\/+$/, '');
      const r = await fetch(base + '/rest/v1/game_config?select=data&id=eq.1', { headers: { apikey: this.env.SUPABASE_KEY } });
      if (r.ok) { const rows = await r.json(); if (rows[0] && rows[0].data && rows[0].data.voiceChat === false) on = false; } } catch (e) {}
    this.vcCheck = { at: now, on }; return on;
  }

  send(ws, msg) { try { ws.send(msg); } catch (e) { this.players.delete(ws); } }

  drop(ws, code, why) {
    const p = this.players.get(ws);
    this.players.delete(ws);
    try { ws.send(JSON.stringify({ t: 'kick', msg: why })); ws.close(code, why); } catch (e) {}
    if (p) { const m = JSON.stringify({ t: 'leave', id: p.id }); for (const w of this.players.keys()) this.send(w, m); }
  }

  sweep(now) {
    if (now - this.lastSweep < 20_000) return;
    this.lastSweep = now;
    for (const [ws, p] of this.players) if (now - p.seen > IDLE_MS) this.drop(ws, 4002, 'Disconnected for being idle');
  }

  async webSocketMessage(ws, raw) {
    let p = this.players.get(ws);
    if (!p) { p = ws.deserializeAttachment(); if (!p) { try { ws.close(4003, 'Unknown'); } catch (e) {} return; } this.players.set(ws, p); }
    if (typeof raw !== 'string' || raw.length > (raw.startsWith('{"t":"vc"') || raw.startsWith('{"t":"call"') ? VOICE_MAX + 300 : 600)) return;
    let d; try { d = JSON.parse(raw); } catch (e) { return; }
    const now = Date.now();
    p.seen = now;
    if (d.t === 'p') {
      p.x = num(d.x, -1e5, 1e5); p.z = num(d.z, -1e5, 1e5); p.y = num(d.y, -50, 500); p.h = num(d.h, -100, 100); p.s = num(d.s, -100, 100);
      p.m = d.m === 'd' ? 'd' : d.m === 'i' ? 'i' : d.m === 'r' ? 'r' : 'f';
      // Riding along in another player's vehicle: who drives, and which seat.
      p.r = p.m === 'r' && /^[0-9a-f]{8}$/.test(d.r) ? d.r : ''; p.rs = num(d.rs, 0, 40) | 0; p.o = p.m === 'd' ? num(d.o, 0, 40) | 0 : 0;
      p.v = p.m === 'd' && VEH.has(d.v) ? d.v : '';
      p.c = /^#[0-9a-fA-F]{6}$/.test(d.c) ? d.c : '';
      p.l = typeof d.l === 'string' && /^[mf][0-9]{7,12}$/.test(d.l) ? d.l : '';   // the player's look (Beta v1.0.0): gender and 7 digits
      // The vehicle this player last got out of, so others see it parked where they left it.
      p.pv = p.m !== 'd' && VEH.has(d.pv) ? d.pv : '';
      p.zn = typeof d.zn === 'string' && /^[a-z0-9_]{1,24}$/.test(d.zn) ? d.zn : '';   // the town or city you are in (for "N in your city")
      p.px = num(d.px, -1e5, 1e5); p.pz = num(d.pz, -1e5, 1e5); p.py = num(d.py, -50, 500); p.ph = num(d.ph, -100, 100);
      const first = !p.ready; p.ready = true;
      ws.serializeAttachment(p);
      const out = JSON.stringify(Object.assign({ t: 'p' }, pub(p)));
      const snap = [];
      for (const [w, q] of this.players) {
        if (w === ws || !q.ready || !near(p, q, NEAR)) continue;
        this.send(w, out);
        if (first) snap.push(pub(q));
      }
      if (first) this.send(ws, JSON.stringify({ t: 'snap', list: snap, online: this.players.size }));
    } else if (d.t === 'chat') {
      if (now - p.chatAt < 1500) return this.send(ws, JSON.stringify({ t: 'slow' }));
      const text = clean(d.text);
      if (!text) return;
      p.chatAt = now;
      const R = d.r === 'close' ? CHAT_CLOSE : CHAT_NEAR;
      const out = JSON.stringify({ t: 'chat', id: p.id, n: p.name, text, r: d.r === 'close' ? 'close' : 'area' });
      for (const [w, q] of this.players) if (w === ws || (q.ready && near(p, q, R))) this.send(w, out);
    } else if (d.t === 'v') {
      // Vehicle sharing (ride requests, seat replies, getting off, taking a parked vehicle): sent only to the named player nearby.
      if (!VACT.has(d.a) || typeof d.to !== 'string') return;
      if (now - (p.vAt || 0) < 150) return; p.vAt = now;
      const out = JSON.stringify({ t: 'v', a: d.a, id: p.id, n: p.name, s: num(d.s, 0, 40) | 0 });
      for (const [w, q] of this.players) if (q.id === d.to) { if (near(p, q, 150)) this.send(w, out); break; }
    } else if (d.t === 'vc') {
      // Push-to-talk voice message: a short recorded clip, sent to players within chat range.
      // The admin can switch voice off for everyone (Admin → Online and moderation); the server checks it.
      if (p.anon) return this.send(ws, JSON.stringify({ t: 'vcguest' }));   // hold to talk is for Google accounts
      if (!(await this.voiceOn())) return this.send(ws, JSON.stringify({ t: 'vcoff' }));
      if (now - (p.vcAt || 0) < 4000) return this.send(ws, JSON.stringify({ t: 'slow' }));
      if (typeof d.a !== 'string' || d.a.length < 200 || d.a.length > VOICE_MAX || !/^[A-Za-z0-9+/=]+$/.test(d.a)) return;
      const mime = VOICE_MIME.has(d.mime) ? d.mime : 'audio/webm'; const ms = num(d.ms, 300, 10000) | 0;
      p.vcAt = now;
      const out = JSON.stringify({ t: 'vc', id: p.id, n: p.name, a: d.a, ms, mime });
      const VR = d.r === 'close' ? CHAT_CLOSE : CHAT_NEAR;
      for (const [w, q] of this.players) if (w === ws || (q.ready && near(p, q, VR))) this.send(w, out);
    } else if (d.t === 'call') {
      // Phone calls and text pings between players by username, anywhere on the map (Beta v1.01.03).
      // Only Google accounts (not guests) can call; the person called sees who it is and can decline or block.
      // During a call, push-to-talk clips go only to the other person. Nothing is recorded or stored.
      if (p.anon) return this.send(ws, JSON.stringify({ t: 'call', k: 'noguest' }));
      const K = new Set(['ring', 'accept', 'decline', 'busy', 'end', 'vc', 'text']); if (!K.has(d.k) || typeof d.to !== 'string' || !/^[A-Za-z0-9]{1,10}$/.test(d.to)) return;
      if (d.k === 'ring' && now - (p.ringAt || 0) < 8000) return this.send(ws, JSON.stringify({ t: 'slow' }));
      if (d.k === 'vc') { if (!(await this.voiceOn())) return this.send(ws, JSON.stringify({ t: 'vcoff' })); if (now - (p.cvAt || 0) < 1500) return this.send(ws, JSON.stringify({ t: 'slow' })); if (typeof d.a !== 'string' || d.a.length < 200 || d.a.length > VOICE_MAX || !/^[A-Za-z0-9+/=]+$/.test(d.a)) return; p.cvAt = now; }
      if (d.k === 'ring') p.ringAt = now;
      let target = null; for (const [w, q] of this.players) if (q.ready && q.name.toLowerCase() === d.to.toLowerCase()) { target = w; break; }
      if (!target) { if (d.k === 'ring') this.send(ws, JSON.stringify({ t: 'call', k: 'offline', n: d.to })); return; }
      const out = { t: 'call', k: d.k, n: p.name };
      if (d.k === 'vc') Object.assign(out, { a: d.a, ms: num(d.ms, 300, 10000) | 0, mime: VOICE_MIME.has(d.mime) ? d.mime : 'audio/webm' });
      this.send(target, JSON.stringify(out));
    } else if (d.t === 'ping') {
      let city = 0, near1 = 0; for (const q of this.players.values()) { if (!q.ready) continue; if (p.zn && q.zn === p.zn) city++; if (near(p, q, NEAR)) near1++; }
      this.send(ws, JSON.stringify({ t: 'pong', online: this.players.size, city, near: near1, zn: p.zn }));
    }
    this.sweep(now);
  }

  async webSocketClose(ws) { this.left(ws); }
  async webSocketError(ws) { this.left(ws); }
  left(ws) {
    const p = this.players.get(ws) || ws.deserializeAttachment();
    this.players.delete(ws);
    if (!p) return;
    const m = JSON.stringify({ t: 'leave', id: p.id });
    for (const w of this.players.keys()) this.send(w, m);
  }
}
