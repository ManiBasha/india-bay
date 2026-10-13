// BayGram: the in-game photo and video feed. Photos and clips you take in the game (📷 Camera app, photo mode P,
// Record 15/30/60 s) go to your BayGram gallery on this device. From there you post them to the feed for everyone,
// save them to your device, or delete them. Only pictures taken inside the game can be posted.
// Feed: newest posts from all players, ❤ likes, ⚑ report, 🗑 delete your own (admins can delete any).
// Needs online/supabase-update-6.sql (the "baygram" bucket and tables). Posting needs a Google account.
window.BBFeatures.push(function (bb) {
  const esc = bb.esc, MAXB = 10 * 1024 * 1024, KEEP = 24;
  /* ---------- the gallery on this device (IndexedDB) ---------- */
  let dbp = null; const db = () => dbp || (dbp = new Promise((res, rej) => { try { const r = indexedDB.open('ib.baygram', 1); r.onupgradeneeded = () => r.result.createObjectStore('items', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }));
  const tx = async (mode, fn) => { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('items', mode); const s = t.objectStore('items'); const out = fn(s); t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); }); };
  const all = async () => { try { const list = await tx('readonly', s => s.getAll()); return (list || []).sort((a, b) => b.t - a.t); } catch (e) { return mem.slice(); } };
  const mem = []; // fallback when IndexedDB is not available (private windows)
  const placeName = () => { const p = bb.ppos(); const z = bb.zoneAt(p.x, p.z, 300); return z ? z.name : (bb.WORLD.states[bb.stateAt ? bb.stateAt(p.x, p.z) : ''] || 'India Bay'); };
  async function keep(kind, blob, ext) { const it = { id: Date.now() + '' + Math.floor(Math.random() * 1000), kind, blob, type: blob.type || (kind === 'photo' ? 'image/jpeg' : 'video/webm'), ext: ext || (kind === 'photo' ? 'jpg' : 'webm'), t: Date.now(), place: placeName(), size: blob.size };
    try { await tx('readwrite', s => s.put(it)); const list = await all(); for (const old of list.slice(KEEP)) await tx('readwrite', s => s.delete(old.id)); } catch (e) { mem.unshift(it); mem.length = Math.min(mem.length, KEEP); }
    bb.toast(kind === 'photo' ? '📸 Photo saved to your BayGram gallery · Phone → BayGram to post it' : '🎬 Clip saved to your BayGram gallery · Phone → BayGram to post it', '#3ddc97'); bb.emit('media', kind); }
  async function drop(id) { try { await tx('readwrite', s => s.delete(id)); } catch (e) { const i = mem.findIndex(q => q.id === id); if (i >= 0) mem.splice(i, 1); } }
  /* ---------- online ---------- */
  const O = () => bb.ONLINE; const sb = () => O() && O().client;
  const canPost = () => O() && O().signedIn && !O().guest;
  const off = () => bb.CFG.baygramOn === false;
  const pub = path => { try { return sb().storage.from('baygram').getPublicUrl(path).data.publicUrl; } catch (e) { return ''; } };
  const ago = s => { const m = Math.max(1, Math.round((Date.now() - new Date(s).getTime()) / 60000)); return m < 60 ? m + ' min' : m < 1440 ? Math.round(m / 60) + ' h' : Math.round(m / 1440) + ' d'; };
  let tab = 'feed', who = '', urls = [], feed = null, liked = new Set(), busy = false;
  const freeUrls = () => { for (const u of urls) URL.revokeObjectURL(u); urls = []; };
  async function loadFeed(mine) { const c = sb(); if (!c) return null; let q = c.from('baygram_posts').select('id,user_id,username,kind,path,caption,place,likes,created_at').order('created_at', { ascending: false }).limit(30); if (mine) q = q.eq('user_id', O().uid);
    const { data, error } = await q; if (error) { bb.toast(/relation|does not exist|schema/i.test(error.message) ? 'BayGram is not set up on the server yet (update 6)' : 'BayGram: ' + error.message, '#ff8b8b'); return []; }
    liked = new Set(); if (data && data.length && O().signedIn) { const r = await c.from('baygram_likes').select('post_id').in('post_id', data.map(p => p.id)); for (const l of (r.data || [])) liked.add(l.post_id); }
    return data || []; }
  // Instagram-style post: avatar and name, the picture or clip (double-tap to like), actions, likes, caption, time
  const hue = n => { let h = 0; for (const ch of String(n)) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
  const av = n => `<span class="bgav" style="--h:${hue(n)}"><i>${esc(String(n)[0] || '?').toUpperCase()}</i></span>`;
  function card(p) { const me = O() && O().uid === p.user_id, adm = O() && O().isAdmin; const src = pub(p.path); const on = liked.has(p.id);
    return `<article class="bgpost"><header>${av(p.username)}<div><b>${esc(p.username)}</b><small>${esc(p.place || 'India Bay')}</small></div>${me || adm ? `<button class="bgx" data-del="${p.id}" aria-label="Delete post">🗑</button>` : `<button class="bgx" data-rep="${p.id}" aria-label="Report post">⚑</button>`}</header>
      <div class="bgmedia" data-dbl="${p.id}">${p.kind === 'video' ? `<video src="${esc(src)}" playsinline loop muted autoplay preload="metadata"></video><span class="bgsnd">🔇 tap for sound</span>` : `<img src="${esc(src)}" alt="Photo by ${esc(p.username)}" loading="lazy">`}<span class="bgheart">♥</span></div>
      <div class="bgacts2"><button class="bglk${on ? ' on' : ''}" data-like="${p.id}" aria-label="Like">${on ? '♥' : '♡'}</button><button class="bgsh" data-share="${p.id}" aria-label="Share">➤</button></div>
      <div class="bgtxt"><b data-likes="${p.id}">${p.likes} like${p.likes === 1 ? '' : 's'}</b>${p.caption ? `<p><b>${esc(p.username)}</b> ${esc(p.caption)}</p>` : ''}<small>${ago(p.created_at).toUpperCase()} AGO</small></div></article>`; }
  function stories(list) { const seen = []; for (const p of list) if (!seen.includes(p.username)) seen.push(p.username); return seen.length ? `<div class="bgstories">${seen.slice(0, 14).map(n => `<button data-who="${esc(n)}">${av(n)}<small>${esc(n)}</small></button>`).join('')}</div>` : ''; }
  async function sheet(t) { if (t) tab = t; freeUrls(); const tabs = `<div class="chips">${[['feed', '🌍 Feed'], ['mine', '👤 My posts'], ['gallery', '🖼 My gallery']].map(([k, n]) => `<button class="chip${tab === k ? ' on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>`;
    let body = '';
    if (tab === 'gallery') { const list = await all();
      body = `<div class="btnrow"><button class="go" data-cam>📷 Take a photo</button><button class="buy ghost" data-rec>🎬 Record a 15 s clip</button></div>` + (list.length ? `<div class="bggrid">${list.map(it => { const u = URL.createObjectURL(it.blob); urls.push(u);
        return `<div class="bgitem">${it.kind === 'video' ? `<video src="${u}" muted playsinline preload="metadata"></video><i>▶ clip</i>` : `<img src="${u}" alt="Your photo">`}<small>${esc(it.place)} · ${it.size > 1048576 ? (it.size / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(it.size / 1024)) + " KB"}</small>
          <div class="bgacts"><button class="chip" data-post="${it.id}">📤 Post</button><button class="chip" data-dl="${it.id}">⬇ Save</button><button class="chip" data-gdel="${it.id}">🗑</button></div></div>`; }).join('')}</div>` : '<p class="note">Your gallery is empty. Take photos with 📷 Camera (or press P) and record clips in photo mode, then post them here.</p>') +
        '<p class="note">The last 24 photos and clips stay on this device. You can post 5 times a day. Posts can be photos or clips up to 10 MB (15 or 30 second clips). When BayGram runs low on space the oldest posts are removed.</p>'; }
    else if (off()) body = '<p class="note">BayGram is paused by the admin right now. Your gallery still works.</p>';
    else if (!sb() || !O().signedIn) body = '<p class="note">Sign in (👤 Profile) to see BayGram posts from other players. Your gallery works without signing in.</p>';
    else { feed = await loadFeed(tab === 'mine'); const shown = who ? feed.filter(p => p.username === who) : feed; body = (tab === 'feed' ? stories(feed) : '') + (who ? `<p class="note">Posts by @${esc(who)} · <a href="#" data-who="">show everyone</a></p>` : '') + (shown.length ? shown.map(card).join('') : '') + (feed.length ? '' : `<p class="note">${tab === 'mine' ? 'You have not posted yet. Open 🖼 My gallery and tap 📤 Post.' : 'No posts yet. Be the first: open 🖼 My gallery and tap 📤 Post.'}</p>`); }
    const sub = tab === 'gallery' ? 'Photos and clips you took in the game' : canPost() ? 'Posts from players across India Bay' : 'Sign in with Google to post';
    bb.openSheet('📸 BayGram', sub, tabs + body, s => s.onclick = onClick, freeUrls); }
  async function onClick(e) { const d = e.target.dataset; if (!d) return;
    if (d.tab) { who = ''; return sheet(d.tab); }
    const wb = e.target.closest('[data-who]'); if (wb) { e.preventDefault(); who = wb.dataset.who; return sheet('feed'); }
    const dm = e.target.closest('[data-dbl]'); if (dm) { const v = dm.querySelector('video'); const now = Date.now(); if (now - (dm._t || 0) < 350) { const b = dm.closest('.bgpost').querySelector('[data-like]'); dm.classList.remove('pop'); void dm.offsetWidth; dm.classList.add('pop'); if (b && !b.classList.contains('on')) b.click(); } else if (v) { v.muted = !v.muted; const s = dm.querySelector('.bgsnd'); if (s) s.textContent = v.muted ? '🔇 tap for sound' : '🔊'; } dm._t = now; return; }
    if (d.share) { const p = (feed || []).find(q => q.id === +d.share); if (!p) return; const url = pub(p.path); try { if (navigator.share) await navigator.share({ title: 'BayGram · India Bay', text: `@${p.username} on BayGram · indiabaygame.com`, url }); else { await navigator.clipboard.writeText(url); bb.toast('Link copied', '#3ddc97'); } } catch (er) {} return; }
    if (d.cam != null) { bb.closeSheet(); return setTimeout(() => bb.MEDIA && bb.MEDIA.enter(), 50); }
    if (d.rec != null) { bb.closeSheet(); return setTimeout(() => { if (bb.MEDIA) { bb.MEDIA.enter(); const b = document.querySelector('#photoBar [data-p="r15"]'); if (b) b.click(); } }, 80); }
    if (d.dl) { const it = (await all()).find(q => q.id === d.dl); if (it) bb.MEDIA.saveFile(`india-bay-${it.kind}-${bb.MEDIA.stamp()}.${it.ext}`, it.blob); return; }
    if (d.gdel) { if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = 'Sure?'; return; } await drop(d.gdel); return sheet('gallery'); }
    if (d.post) return postSheet(d.post);
    const likeB = e.target.closest('[data-like]'); if (likeB) { const lid = likeB.dataset.like; if (!O() || !O().signedIn) return bb.toast('Sign in to like posts', '#d6c8e4'); const { data, error } = await O().rpc('baygram_like', { p_post: +lid }); if (error) return bb.toast(error.message, '#ff8b8b'); const id = +lid; liked.has(id) ? liked.delete(id) : liked.add(id); const b = likeB; b.classList.toggle('on', liked.has(id)); b.textContent = liked.has(id) ? '♥' : '♡'; const lk = document.querySelector(`[data-likes="${id}"]`); if (lk) lk.textContent = `${data} like${data === 1 ? '' : 's'}`; return; }
    if (d.rep) { const p = (feed || []).find(q => q.id === +d.rep); if (!p) return; const { error } = await sb().from('reports').insert({ target_name: p.username, reason: `BayGram post #${p.id}: ${p.caption || '(no caption)'}`.slice(0, 300), last_chat: pub(p.path) }); bb.toast(error ? 'Report not sent · ' + error.message : 'Reported to the admin · thank you', error ? '#ff8b8b' : '#3ddc97'); return; }
    if (d.del) { if (!e.target.dataset.sure) { e.target.dataset.sure = 1; e.target.textContent = 'Tap again'; return; } const p = (feed || []).find(q => q.id === +d.del); if (!p) return;
      const { error } = await sb().from('baygram_posts').delete().eq('id', p.id); if (error) return bb.toast(error.message, '#ff8b8b'); try { await sb().storage.from('baygram').remove([p.path]); } catch (er) {} bb.toast('Post deleted', '#d6c8e4'); return sheet(); } }
  async function postSheet(id) { const it = (await all()).find(q => q.id === id); if (!it) return;
    if (off()) return bb.toast('BayGram is paused by the admin', '#ff9f1c');
    if (!canPost()) return bb.toast(O() && O().signedIn ? 'Guests cannot post · link Google in 👤 Profile to post on BayGram' : 'Sign in with Google (👤 Profile) to post on BayGram', '#ff9f1c');
    if (it.size > MAXB) return bb.toast('This clip is over 10 MB · record a 15 s or 30 s clip to post it', '#ff9f1c');
    freeUrls(); const u = URL.createObjectURL(it.blob); urls.push(u);
    bb.openSheet('📤 New BayGram post', `${it.kind === 'video' ? 'Clip' : 'Photo'} from ${esc(it.place)}`, `<div class="bgmedia">${it.kind === 'video' ? `<video src="${u}" controls playsinline loop></video>` : `<img src="${u}" alt="Your photo">`}</div>
      <label class="fl">Caption<input id="bg_cap" maxlength="200" placeholder="Say something about it (optional)" autocomplete="off"></label><label class="fl">Place<input id="bg_place" maxlength="60" value="${esc(it.place)}"></label>
      <p class="note">Everyone on BayGram can see your post with your username. Be kind: posts can be reported to the admin.</p><div class="btnrow"><button class="buy ghost" data-back>Back</button><button class="go" data-send>Post</button></div>`,
      s => s.onclick = async e => { if (e.target.dataset.back != null) return sheet('gallery'); if (e.target.dataset.send == null || busy) return; busy = true; e.target.textContent = 'Posting…';
        try { const c = sb(); const path = `${O().uid}/${Date.now()}.${it.ext}`; const up = await c.storage.from('baygram').upload(path, it.blob, { contentType: it.type, upsert: false }); if (up.error) throw up.error;
          const r = await O().rpc('baygram_post', { p_kind: it.kind, p_path: path, p_caption: s.querySelector('#bg_cap').value.trim(), p_place: s.querySelector('#bg_place').value.trim(), p_size: it.size });
          if (r.error) { await c.storage.from('baygram').remove([path]); throw r.error; }
          bb.toast('📸 Posted on BayGram', '#3ddc97'); cleanTrash(); bb.emit('baygram', { kind: it.kind }); busy = false; return sheet('mine'); }
        catch (er) { busy = false; e.target.textContent = 'Post'; bb.toast('Not posted · ' + (er && er.message || er), '#ff8b8b'); } }, freeUrls); }
  // old posts removed for space: delete their files (the server lists them, any player may clear them)
  async function cleanTrash() { try { const c = sb(); const r = await O().rpc('baygram_trash_list'); const paths = (r.data || []).map(x => typeof x === 'string' ? x : x.baygram_trash_list || Object.values(x)[0]).filter(Boolean); if (!paths.length) return; await c.storage.from('baygram').remove(paths); await O().rpc('baygram_trash_done', { p_paths: paths }); } catch (e) {} }
  bb.addApp({ id: 'baygram', label: 'BayGram', icon: '📸', smart: true, fn: () => sheet() });
  bb.BAYGRAM = { keep, sheet, all };
});
