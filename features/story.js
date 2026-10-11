// Story chapter 1 "New in Maharashtra", achievements, personal stats and daily login rewards.
window.BBFeatures.push(function (bb) {
  const P = () => bb.P;
  const STEPS = [
    { t: 'Meet cousin Pappu', m: 'He left you his old auto at CSMT. Find him at the chai tapri.', target: () => { const p = bb.pois.find(q => q.type === 'food' && q.zone && q.zone.id === 'mumbai' && /Chai/.test(q.name)); return p && { x: p.x, z: p.z }; }, near: 6, reward: 250 },
    { t: 'First sawari', m: 'Do 2 auto taxi rides · Phone → Jobs → Auto taxi', ev: 'job', check: d => d.type === 'auto', count: 2, reward: 500 },
    { t: 'Bank it', m: 'Deposit at least ₹500 at Bharat Bay Bank', ev: 'deposit', check: v => v >= 500, reward: 250 },
    { t: 'Licence raj', m: 'Get a car licence at an RTO office', ev: 'licence', check: id => id === 'lmv', reward: 750 },
    { t: 'Vada pav break', m: 'Eat a vada pav, Mumbai style', ev: 'eat', check: it => it[0] === 'vadapav', reward: 200 },
    { t: 'Ride the local', m: 'Take the Mumbai local from any station', ev: 'travel', check: d => d.mode === 'local', reward: 300 },
    { t: 'Expressway to Pune', m: 'Drive the expressway and find Shaniwar Wada', ev: 'discover', check: n => n === 'Shaniwar Wada', target: () => ({ x: 4600, z: 9270 }), reward: 1000 }];
  const st = () => P().story; let counter = 0;
  function advance() { const s = st(); const step = STEPS[s.step]; bb.earn(bb.price(step.reward), 'story'); bb.toast(`Story · ${step.t} done · +${bb.inr(bb.price(step.reward))}`, '#ffc93c'); s.step++; counter = 0;
    if (s.step >= STEPS.length) { s.done = true; bb.earn(bb.price(5000), 'story'); bb.big('CHAPTER 1 DONE', '#ffc93c'); bb.toast('New in Maharashtra · complete · +' + bb.inr(bb.price(5000)) + '<br><span style="font-size:15px">Chapter 2, Gujarat calling, comes in a later update</span>', '#ffc93c'); grant('chapter1'); } bb.save(); }
  for (const ev of new Set(STEPS.filter(s => s.ev).map(s => s.ev))) bb.on(ev, d => { const s = st(); if (s.done) return; const step = STEPS[s.step]; if (!step || step.ev !== ev) return; if (step.check && !step.check(d)) return; counter++; if (counter >= (step.count || 1)) advance(); });
  bb.onUpdate(() => { const s = st(); if (s.done || s.paused) return; const step = STEPS[s.step]; if (step && step.near && step.target) { const t = step.target(); if (t && bb.player.mode === 'foot') { const pp = bb.ppos(); if (Math.hypot(pp.x - t.x, pp.z - t.z) < step.near) { bb.toast('Pappu: "Bhai, welcome to Mumbai! Auto is yours. Earn, eat, explore!"', '#ffc93c'); advance(); } } } });
  bb.addMission(() => { const s = st(); if (s.done || s.paused) return null; const step = STEPS[s.step]; if (!step) return null; const t = step.target && step.target(); return { pri: 30, k: `Chapter 1 · New in Maharashtra · ${s.step + 1}/${STEPS.length}`, t: step.t, m: step.m + (step.count ? ` (${counter}/${step.count})` : ''), target: t ? { x: t.x, z: t.z, col: 0xffc93c } : null }; });

  /* achievements */
  const ACH = [['firstjob', 'First day at work', 'Finish any job'], ['jobs10', 'Regular', 'Finish 10 jobs'], ['jobs50', 'Workhorse', 'Finish 50 jobs'], ['lakh', 'Lakhpati', 'Have ₹1,00,000 in cash and bank'], ['crore', 'Crorepati', 'Have ₹1,00,00,000 in cash and bank'],
    ['home', 'Ghar ka sapna', 'Buy a home'], ['homes3', 'Property tycoon', 'Own 3 homes'], ['states', 'Tri-state traveller', 'Visit Maharashtra, Gujarat and Rajasthan'], ['ut', 'UT explorer', 'Visit Daman and Silvassa'], ['places10', 'Sightseer', 'Discover 10 famous places'],
    ['places30', 'Guidebook', 'Discover 30 famous places'], ['placesAll', 'Know your West', 'Discover every famous place'], ['lions', 'Simba spotted', 'See lions on a Gir safari'], ['camel', 'Ship of the desert', 'Ride a camel at Sam'], ['local', 'Local legend', 'Ride the Mumbai local'],
    ['flight', 'Frequent flyer', 'Take a flight'], ['five', 'Most wanted', 'Reach 5 police stars'], ['helmet', 'Safety first', 'Buy a helmet'], ['challan', 'Welcome to India', 'Get your first e-challan'], ['ludo', 'Ludo king', 'Win a game of Ludo'],
    ['quiz', 'Quiz master', 'Score 4 or more in the quiz'], ['km100', 'Road tripper', 'Drive 100 km'], ['km1000', 'Highway hero', 'Drive 1,000 km'], ['chapter1', 'New in Maharashtra', 'Finish chapter 1'], ['photo', 'Content creator', 'Save a photo or clip'], ['streak7', 'Seven days', 'Log in 7 days in a row']];
  function grant(id) { const p = P(); if (p.ach[id]) return; p.ach[id] = bb.istISO(); const a = ACH.find(x => x[0] === id); if (!a) return; bb.toast(`🏆 Achievement · ${a[1]}`, '#ffc93c'); bb.earn(bb.price(300), 'achievement'); bb.setDirty(); }
  const visited = () => (P().extra.states = P().extra.states || {});
  bb.on('job', () => { const n = P().stats.trips; grant('firstjob'); if (n >= 10) grant('jobs10'); if (n >= 50) grant('jobs50'); });
  bb.on('buy', d => { if (d.kind === 'home') { grant('home'); if (P().homes.length >= 3) grant('homes3'); } if (d.kind === 'helmet') grant('helmet'); });
  bb.on('zone', z => { visited()[z.st] = 1; const v = visited(); if (v.MH && v.GJ && v.RJ) grant('states'); if (v.DD && v.DN) grant('ut'); });
  bb.on('discover', () => { const n = Object.keys(P().discovered).length; if (n >= 10) grant('places10'); if (n >= 30) grant('places30'); if (n >= bb.WORLD.places.length) grant('placesAll'); });
  bb.on('safari', () => grant('lions')); bb.on('camel', () => grant('camel')); bb.on('travel', d => { if (d.mode === 'local') grant('local'); if (d.mode === 'flight') grant('flight'); });
  bb.on('stars', n => { if (n >= 5) grant('five'); }); bb.on('challan', () => grant('challan')); bb.on('media', () => grant('photo'));
  bb.on('baygame', d => { if (d.win && d.game === 'Ludo') grant('ludo'); if (d.win && d.game === 'the quiz') grant('quiz'); });
  bb.onUpdate(() => { const p = P(); const net = p.cash + p.bank; if (net >= 1e5) grant('lakh'); if (net >= 1e7) grant('crore'); if (p.stats.km >= 100) grant('km100'); if (p.stats.km >= 1000) grant('km1000'); });
  function achSheet() { const p = P(); const got = ACH.filter(a => p.ach[a[0]]).length;
    bb.openSheet('Achievements', `${got} of ${ACH.length} · each one pays ${bb.inr(bb.price(300))}`, ACH.map(a => `<div class="row"><div class="nm">${p.ach[a[0]] ? '🏆' : '🔒'} ${bb.esc(a[1])}<small>${bb.esc(a[2])}${p.ach[a[0]] ? ' · ' + p.ach[a[0]] : ''}</small></div></div>`).join('') +
      `<h3 style="font-family:var(--f-display);margin:14px 0 4px">Your stats</h3><div class="row"><div class="nm">Distance driven</div><b>${p.stats.km.toFixed(1)} km</b></div><div class="row"><div class="nm">Jobs done</div><b>${p.stats.trips}</b></div><div class="row"><div class="nm">Money earned</div><b>${bb.inr(p.stats.earned)}</b></div><div class="row"><div class="nm">Places discovered</div><b>${Object.keys(p.discovered).length} / ${bb.WORLD.places.length}</b></div><div class="row"><div class="nm">Lions spotted</div><b>${p.stats.lions}</b></div><p class="note">Weekly leaderboards for richest player, best driver and top taxi rating arrive with online play.</p>`); }
  function storySheet() { const s = st(); bb.openSheet('Story', 'Chapter 1 · New in Maharashtra', STEPS.map((x, i) => `<div class="row"><div class="nm">${i < s.step || s.done ? '✅' : i === s.step ? '➡️' : '▫️'} ${bb.esc(x.t)}<small>${bb.esc(x.m)}</small></div><b>${bb.inr(bb.price(x.reward))}</b></div>`).join('') + (s.done ? '<p class="note">Chapter complete. Chapter 2, Gujarat calling, comes in a later update.</p>' : bb.rowHtml('pause', s.paused ? 'Show story goals' : 'Hide story goals', 'Free roam without the story tracker', s.paused ? 'Show' : 'Hide', 'ghost')),
    sh => sh.onclick = e => { if (e.target.dataset.id === 'pause') { s.paused = !s.paused; bb.setDirty(); storySheet(); } }); }
  bb.addApp({ id: 'story', label: 'Story', icon: '📖', fn: storySheet }); bb.addApp({ id: 'ach', label: 'Achievements', icon: '🏆', group: 'settings', fn: achSheet });

  /* daily login reward (India date; the online version will use the server date) */
  const REWARDS = [200, 300, 400, 500, 700, 900, 1500];
  bb.onStart(() => { const p = P(); const today = bb.istISO(); if (p.daily.last === today) return; const y = new Date(Date.parse(today + 'T00:00:00Z') - 864e5).toISOString().slice(0, 10); p.daily.streak = p.daily.last === y ? p.daily.streak + 1 : 1; p.daily.last = today;
    const amt = bb.price(REWARDS[Math.min(p.daily.streak - 1, 6)]); bb.earn(amt, 'daily'); if (p.daily.streak >= 7) grant('streak7'); bb.save(); setTimeout(() => bb.toast(`Daily reward · day ${p.daily.streak} · +${bb.inr(amt)}`, '#3ddc97'), 2600); });
});
