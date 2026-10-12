// Food bag: keep food for later. Delivered food asks "eat now or keep it"; stalls can pack a parcel; BayCart
// sells packed food. Fresh food keeps about 6 Bay hours, fruit 1 Bay day and packed food 3 Bay days, then it
// spoils. When you get hungry a "Hungry? Eat …" button appears (or press B).
window.BBFeatures.push(function (bb) {
  const MAX = 8, LIFE = { fresh: 6 * 60, fruit: 24 * 60, packed: 72 * 60 };
  const bag = () => { const p = bb.P; p.extra = p.extra || {}; return p.extra.bag = p.extra.bag || []; };
  const now = () => bb.gameMin();
  const left = it => it.exp - now(); const fmt = m => m > 1440 ? `${Math.round(m / 1440)} Bay day${Math.round(m / 1440) > 1 ? 's' : ''}` : m > 60 ? `${Math.round(m / 60)} h` : `${Math.max(1, Math.round(m))} min`;
  function add(item, from, kind) { const B = bag(); if (B.length >= MAX) { bb.toast('Your food bag is full · eat something first', '#ff9f1c'); return false; }
    B.push({ id: item[0], name: item[1], fx: Object.assign({}, item[4] || {}), kind: kind || 'fresh', from: from || '', exp: now() + (LIFE[kind] || LIFE.fresh) }); bb.setDirty(); return true; }
  bb.on('parcel', d => add(d.item, d.from, d.kind));
  function eat(i) { const B = bag(); const it = B[i]; if (!it) return; if (left(it) <= 0) { B.splice(i, 1); bb.setDirty(); return bb.toast(`${it.name} has gone bad · thrown away`, '#ff9f1c'); }
    const heal = applyFx(it.fx); B.splice(i, 1); bb.setDirty(); bb.emit('eat', [it.id, it.name, '', 0, it.fx, 'snack']); bb.toast(`🍱 You eat the ${bb.esc(it.name)}${heal >= 1 && bb.P.health < 100 ? ' · health up' : ''}`, '#3ddc97'); }
  function applyFx(fx) { const p = bb.P; const heal = Math.max(0, (fx.hunger || 0) * .5 + (fx.energy || 0) * .3); for (const k of ['hunger', 'bladder', 'energy']) if (fx[k]) p[k] = Math.max(0, Math.min(100, p[k] + fx[k])); p.health = Math.min(100, p.health + heal); bb.setDirty(); return heal; }
  // delivered food: eat now, or keep it
  function arrived(r, app, col) { const busy = bb.uiLock() || (bb.CINE && bb.CINE.on);
    if (busy) { if (add(r, app, 'fresh')) bb.toast(`${app} · your ${bb.esc(r[1])} arrived · kept in your food bag`, col); else { eatItem(r); bb.toast(`${app} · your ${bb.esc(r[1])} arrived · eaten`, col); } return; }
    bb.openSheet(`${app} · your order is here`, `${r[1]} · food ${Math.round(bb.P.hunger)}%`, bb.rowHtml('now', `Eat ${bb.esc(r[1])} now`, 'Fills you up and brings health back', 'Eat now') + bb.rowHtml('keep', 'Keep it for later', `In your food bag · stays fresh about ${fmt(LIFE.fresh)}`, 'Keep', 'ghost'),
      s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; bb.closeSheet(); if (id === 'now') { eatItem(r); bb.toast(`${bb.esc(r[1])} · tasty`, col); } else if (!add(r, app, 'fresh')) eatItem(r); else bb.toast(`🍱 ${bb.esc(r[1])} kept for later`, col); }, () => {});
    bb.emit('order', { app, kind: 'arrived' }); }
  function eatItem(r) { applyFx(r[4] || {}); bb.emit('eat', r); }
  // spoiling
  let spT = 0; bb.onUpdate(dt => { spT -= dt; if (spT > 0) return; spT = 15; const B = bag(); for (let i = B.length - 1; i >= 0; i--) if (left(B[i]) <= 0) { bb.toast(`🤢 The ${bb.esc(B[i].name)} in your bag went bad`, '#ff9f1c'); B.splice(i, 1); bb.setDirty(); } });
  // "Hungry? Eat …" button
  const hint = document.createElement('button'); hint.id = 'bagHint'; hint.type = 'button'; hint.className = 'pill'; hint.hidden = true; const lcol = document.querySelector('#top .lcol'); if (lcol) lcol.appendChild(hint);
  const best = () => { const B = bag(); let k = -1; B.forEach((it, i) => { if (k < 0 || left(it) < left(B[k])) k = i; }); return k; };
  hint.onclick = () => { const k = best(); if (k >= 0) eat(k); };
  let hT = 0; bb.onUpdate(dt => { hT -= dt; if (hT > 0) return; hT = .6; const B = bag(); const show = bb.started && B.length && bb.P.hunger < 35 && !bb.uiLock() && !(bb.CINE && bb.CINE.on) && !(bb.player.mode === 'drive' && bb.player.veh && Math.abs(bb.player.veh.v) > 3);
    hint.hidden = !show; if (show) { const it = B[best()]; hint.innerHTML = `🍱 Hungry? Eat <b>${bb.esc(it.name)}</b> <small>B</small>`; } });
  bb.onKey('KeyB', () => { if (!hint.hidden) hint.onclick(); else if (bag().length) sheet(); });
  function sheet() { const B = bag(); bb.openSheet('🍱 Food bag', `${B.length} of ${MAX} · food ${Math.round(bb.P.hunger)}%`, (B.length ? B.map((it, i) => bb.rowHtml('e' + i, `${it.kind === 'packed' ? '📦' : it.kind === 'fruit' ? '🍌' : '🥡'} ${bb.esc(it.name)}`, `${it.from ? bb.esc(it.from) + ' · ' : ''}food +${it.fx.hunger || 0}${it.fx.energy ? ' · energy +' + it.fx.energy : ''} · ${left(it) > 0 ? 'good for ' + fmt(left(it)) : 'gone bad'}`, left(it) > 0 ? 'Eat' : 'Throw', left(it) > 0 ? '' : 'danger')).join('') : '<p class="note">Empty. Order food on Swiggy or Zomato and keep it, pick 📦 Parcel at any food stall, or buy packed food on BayCart.</p>') +
    '<p class="note">Fresh food keeps about 6 Bay hours, fruit 1 Bay day, packed food 3 Bay days. When you are hungry a button appears to eat from the bag (or press B).</p>',
    s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; eat(+id.slice(1)); sheet(); }); }
  bb.addApp({ id: 'foodbag', label: 'Food bag', icon: '🍱', fn: sheet });
  bb.FOODBAG = { add, eat, arrived, sheet, get items() { return bag(); } };
});
