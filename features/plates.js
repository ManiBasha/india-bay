// Number plates (Beta v1.01.24). Your vehicles carry your own plate, which other players see. Choose it in
// Phone → Number plate: 2 to 10 letters, numbers and spaces. Every plate is unique in the game (the server keeps
// a list, linked to your username). Until you choose one, your plate is made from your username.
// Traffic uses plates that start with BAY, so those are kept for traffic. Needs supabase-update-10.sql.
window.BBFeatures.push(function (bb) {
  const esc = bb.esc, O = () => bb.ONLINE, P = () => bb.P;
  const clean = t => String(t || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 10);
  const fromName = n => clean(String(n || 'BAY PLAYER').replace(/[._]/g, ' ')) || 'MY CAR';
  const valid = t => /^[A-Z0-9][A-Z0-9 ]{1,9}$/.test(t) && !/^BAY\b/.test(t);
  const sqlNote = e => /does not exist|schema cache|function/i.test(e && e.message || '') ? 'Number plates need the server update (update 10)' : (e && e.message || String(e));
  function apply() { const t = P().extra.plate; if (!t || !bb.setPlate) return; for (const v of bb.ownedVehicles || []) if (v) bb.setPlate(v, t); }
  function setLocal(t) { P().extra.plate = t; bb.setDirty(); apply(); }
  bb.on('ownedSpawn', v => { const t = P().extra.plate; if (t) bb.setPlate(v, t); });
  // when you sign in, the server tells you your plate (and gives you one from your username the first time)
  async function sync() { const o = O(); if (!o || !o.signedIn || o.guest) { if (!P().extra.plate) setLocal(fromName(o && o.username || P().name)); return; }
    try { const r = await o.rpc('my_plate', { p_default: fromName(o.username) }); if (!r.error && r.data) setLocal(r.data); else if (!P().extra.plate) setLocal(fromName(o.username)); } catch (e) { if (!P().extra.plate) setLocal(fromName(o.username)); } }
  let synced = false; bb.onStart(() => setTimeout(sync, 6000)); setInterval(() => { const o = O(); if (!synced && o && o.signedIn && !o.guest) { synced = true; sync(); } }, 5000);
  function app() { const o = O(); const cur = P().extra.plate || fromName(o && o.username || P().name); const can = o && o.signedIn && !o.guest;
    bb.openSheet('🔢 Number plate', 'On every vehicle you own', `<div style="display:flex;justify-content:center;margin:8px 0 14px"><div style="background:#f4f4f0;color:#141414;border:4px solid #1b1b1b;border-radius:8px;padding:8px 18px;font:800 30px 'Arial Narrow',Arial,sans-serif;letter-spacing:2px">${esc(cur)}</div></div>` +
      (can ? `<label class="fld">New plate<input id="pl_in" maxlength="10" value="${esc(cur)}" autocomplete="off" style="text-transform:uppercase"></label><p class="note">2 to 10 letters, numbers and spaces. It must not be used by another player. Plates starting with BAY are for traffic.</p><div class="btnrow"><button class="go" data-id="save">Save plate</button><button class="buy ghost" data-id="def">Use my username</button></div>`
        : '<p class="note">Sign in with Google (👤 Profile) to choose your own plate. Right now it is made from your name.</p>'),
      s => s.onclick = async e => { const id = e.target.dataset.id; if (!id) return; let t = id === 'def' ? fromName(o.username) : clean(s.querySelector('#pl_in').value);
        if (!valid(t)) return bb.toast('Use 2 to 10 letters and numbers · not starting with BAY', '#ff9f1c'); if (t === cur) return bb.toast('That is already your plate', '#d6c8e4');
        const r = await o.rpc('claim_plate', { p_plate: t }); if (r.error) return bb.toast(sqlNote(r.error), '#ff8b8b'); if (r.data !== 'ok') return bb.toast(r.data === 'taken' ? `${esc(t)} is already used by another player · try another` : esc(r.data), '#ff9f1c');
        setLocal(t); bb.save(); bb.toast(`🔢 Your plate is now ${esc(t)}`, '#3ddc97'); app(); }); }
  bb.addApp({ id: 'plate', label: 'Number plate', icon: '🔢', fn: app });
  bb.PLATES = { app, sync, valid, clean };
});
