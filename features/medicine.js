// Miracle medicines (Beta v1.01.27): Neend Elixir fills your sleep (energy) to 100%, Jeevan Tonic fills your health to
// 100%. Buy them in Phone → Medicine (any time) and drink one whenever you need it, instead of a full night's sleep or a
// hospital visit. They also show up when you are very tired or badly hurt.
window.BBFeatures.push(function (bb) {
  const P = () => bb.P; const M = () => { const p = P(); p.extra = p.extra || {}; return p.extra.meds = p.extra.meds || { sleep: 0, heal: 0 }; };
  const MEDS = { sleep: { icon: '🧪', name: 'Neend Elixir', what: 'Fills your sleep (energy) to 100%', key: 'item.elixir', price: 1500, apply: p => { p.energy = 100; } },
    heal: { icon: '💊', name: 'Jeevan Tonic', what: 'Fills your health to 100%', key: 'item.tonic', price: 3000, apply: p => { p.health = 100; } } };
  function drink(k) { const m = M(); const D = MEDS[k]; if (!m[k]) return bb.toast(`No ${D.name} left · buy one in Phone → Medicine`, '#ff9f1c'); m[k]--; D.apply(P()); bb.setDirty(); bb.save(); bb.toast(`${D.icon} You drink the ${D.name} · ${k === 'sleep' ? 'wide awake, energy 100%' : 'good as new, health 100%'}`, '#3ddc97'); bb.emit('medicine', k); }
  function sheet() { const m = M(); const p = P();
    bb.openSheet('💊 Medicine', `Energy ${Math.round(p.energy)}% · health ${Math.round(p.health)}%`, Object.entries(MEDS).map(([k, D]) => bb.rowHtml('d' + k, `${D.icon} ${D.name} · ${m[k]} in your bag`, D.what, m[k] ? 'Drink' : 'None left', m[k] ? '' : 'ghost') + bb.rowHtml('b' + k, `Buy a ${D.name}`, 'Delivered to your bag right away', bb.inr(bb.cost(D.key, D.price)), 'ghost')).join('') + '<p class="note">One bottle fills it all the way back to 100%. Keep one for emergencies.</p>',
      s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; const k = id.slice(1); if (!MEDS[k]) return; if (id[0] === 'd') drink(k); else { if (!bb.spend(bb.cost(MEDS[k].key, MEDS[k].price), true)) return; M()[k]++; bb.setDirty(); bb.save(); bb.toast(`${MEDS[k].icon} ${MEDS[k].name} added to your bag`, '#3ddc97'); } sheet(); }); }
  bb.addApp({ id: 'medicine', label: 'Medicine', icon: '💊', fn: sheet });
  // a nudge when it would help (at most every few minutes)
  let lastNudge = 0; setInterval(() => { if (!bb.started || (bb.CINE && bb.CINE.on)) return; const p = P(), m = M(); const now = Date.now(); if (now - lastNudge < 5 * 60 * 1000) return;
    if (p.energy < 12 && m.sleep) { lastNudge = now; bb.notify && bb.notify('🧪', 'Very tired', `Tap to drink a Neend Elixir · energy back to 100%`, () => drink('sleep'), 'meds'); }
    else if (p.health < 25 && m.heal) { lastNudge = now; bb.notify && bb.notify('💊', 'Badly hurt', `Tap to drink a Jeevan Tonic · health back to 100%`, () => drink('heal'), 'meds'); } }, 15000);
  bb.MEDS = { drink, sheet, MEDS };
});
