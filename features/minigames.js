// Mini games (Beta v1.01.12): Tic-tac-toe, Connect Four, Snakes and Ladders and a Quiz duel against players near
// you when they are online, otherwise against bots; plus Ludo and Gully cricket against bots. Winning pays a small
// cash prize, up to a daily limit. Online games travel through the game server as small 'mg' messages:
// invite → accept → moves, and both sides use the same seed so dice and questions match.
window.BBFeatures.push(function (bb) {
  const P = () => bb.P, esc = bb.esc; const CAP = 2000;   // most you can win in a day
  const PRIZE = { ttt: [40, 120], c4: [60, 180], snl: [50, 150], quiz: [20, 150], ludo: [100, 100], cricket: [80, 80] };
  const GAMES = [['ttt', '❌⭕', 'Tic-tac-toe', 'Three in a row wins', true, '#ff5d73'], ['c4', '🔴🟡', 'Connect Four', 'Drop discs, line up four', true, '#2f7fd8'], ['snl', '🐍🪜', 'Snakes and Ladders', 'Race to 100', true, '#1f8a4c'],
    ['quiz', '🧠', 'Quiz duel', '5 questions on India, cricket and films', true, '#7b2a5e'], ['ludo', '🎲', 'Ludo', 'You and three bots', false, '#e8a020'], ['cricket', '🏏', 'Gully cricket', '2 overs, chase the target', false, '#c0392b']];
  const BOTS = ['Bunty', 'Pinky', 'Chintu', 'Golu', 'Munni', 'Raju', 'Sweety', 'Pappu'];
  /* ---------- money ---------- */
  function today() { const x = P().extra; const d = bb.istISO(); if (!x.mg || x.mg.d !== d) x.mg = { d, won: 0, games: 0 }; return x.mg; }
  function pay(game, vsPlayer, mult = 1) { const t = today(); const base = PRIZE[game][vsPlayer ? 1 : 0] * mult; const amt = Math.max(0, Math.min(Math.round(base), CAP - t.won)); t.games++; if (!amt) { bb.toast('You reached today\'s prize limit · play for fun', '#d6c8e4'); return 0; } t.won += amt; bb.earn(bb.price(amt), 'game'); bb.setDirty(); return bb.price(amt); }
  /* ---------- the window ---------- */
  let root = null, cur = null, holding = false;
  function shell(html) { if (!root) { root = document.createElement('div'); root.id = 'mg'; document.body.appendChild(root); root.addEventListener('click', e => { if (e.target.closest('[data-mgx]')) close(); }); } root.hidden = false; root.innerHTML = `<div class="mgcard">${html}</div>`; return root.querySelector('.mgcard'); }
  function hold() { if (holding || bb.inside || bb.uiLock()) return; holding = true; bb.closeSheet(); bb.openWait({ kind: 'BayGame', title: 'Playing BayGame', sub: 'The Bay clock keeps running', total: 1e9, noPersist: true, cancel: 'Stop playing', timeText: () => `Bay ${bb.bayTime()}`, onCancel: () => { holding = false; close(true); } }); }
  function close(fromWait) { if (cur && cur.net) net('bye', cur); cur = null; if (root) root.hidden = true; if (holding && !fromWait) { holding = false; bb.closeWait(); } holding = fromWait ? false : holding; }
  bb.setEscape && bb.setEscape(() => { if (root && !root.hidden) { close(); return true; } return false; });
  const head = (title, sub) => `<div class="mghead"><div><h2>${title}</h2><div class="sub">${sub || ''}</div></div><button class="x" data-mgx aria-label="Close">×</button></div>`;
  function menu() { hold(); cur = null; const t = today();
    const c = shell(head('🎲 BayGame', `Win small cash prizes · ${bb.inr(bb.price(t.won))} of ${bb.inr(bb.price(CAP))} won today`) + `<div class="mggrid">${GAMES.map(([id, ic, n, d, online, col]) => `<button class="mgtile" data-g="${id}" style="--c:${col}"><span>${ic}</span><b>${n}</b><small>${d}</small><em>Win ${bb.inr(bb.price(PRIZE[id][0]))}${online ? ` · ${bb.inr(bb.price(PRIZE[id][1]))} vs players` : ''}</em>${online ? '<i>👥 online</i>' : ''}</button>`).join('')}</div>`);
    c.onclick = e => { const b = e.target.closest('[data-g]'); if (b) pick(b.dataset.g); }; }
  /* ---------- who to play ---------- */
  const nearby = () => { const O = bb.ONLINE; if (!O || O.status !== 'on' || !O.remotes) return []; const pp = bb.ppos(); return [...O.remotes.values()].filter(r => r.n && Math.hypot(r.x - pp.x, r.z - pp.z) < 400).sort((a, b) => Math.hypot(a.x - pp.x, a.z - pp.z) - Math.hypot(b.x - pp.x, b.z - pp.z)).slice(0, 8); };
  function pick(g) { const G = GAMES.find(q => q[0] === g); if (!G[4]) { const O = bb.BAYGAME_OLD; if (O && O[g]) { root.hidden = true; O.open(g); } return; }
    const L = nearby(); const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
    const c = shell(head(`${G[1]} ${G[2]}`, 'Who do you want to play?') + (L.length ? `<p class="note">Players near you</p>${L.map(r => `<button class="mgrow" data-p="${esc(r.id)}"><span class="av">${esc(r.n[0].toUpperCase())}</span><b>${esc(r.n)}</b><small>${Math.round(Math.hypot(r.x - bb.ppos().x, r.z - bb.ppos().z) * 2.4)} m away · win ${bb.inr(bb.price(PRIZE[g][1]))}</small><em>Invite</em></button>`).join('')}` : `<p class="note">${bb.ONLINE && bb.ONLINE.status === 'on' ? 'Nobody is near you right now.' : 'You are offline, so you play a bot.'}</p>`) +
      `<button class="mgrow" data-bot="1"><span class="av bot">🤖</span><b>${bot}</b><small>Bot · win ${bb.inr(bb.price(PRIZE[g][0]))}</small><em>Play</em></button><div class="btnrow"><button class="buy ghost" data-back>‹ All games</button></div>`);
    c.onclick = e => { if (e.target.closest('[data-back]')) return menu(); if (e.target.closest('[data-bot]')) return start(g, { bot }, 0, (Math.random() * 1e9) | 0); const p = e.target.closest('[data-p]'); if (p) invite(g, L.find(r => r.id === p.dataset.p)); }; }
  /* ---------- online ---------- */
  let pending = null;
  const send = (k, to, g, s, m) => bb.ONLINE && bb.ONLINE.send({ t: 'mg', k, to, g, s: s == null ? '' : String(s), m: m || 0 });
  function net(k, c, s) { if (c && c.net) send(k, c.net.id, c.g, s, c.seed); }
  function invite(g, r) { const seed = (Math.random() * 1e9) | 0; pending = { g, r, seed, at: Date.now() }; send('inv', r.id, g, '', seed);
    shell(head('📨 Invite sent', `Waiting for ${esc(r.n)}…`) + `<div class="mgwait"><i></i><i></i><i></i></div><p class="note">If ${esc(r.n)} does not answer in 20 seconds, play a bot instead.</p><div class="btnrow"><button class="buy ghost" data-bot>Play a bot</button><button class="buy ghost" data-back>Cancel</button></div>`).onclick = e => { if (e.target.closest('[data-back]')) { pending = null; return menu(); } if (e.target.closest('[data-bot]')) { pending = null; start(g, { bot: BOTS[0] }, 0, seed); } };
    setTimeout(() => { if (pending && pending.r === r && Date.now() - pending.at >= 19000) { pending = null; bb.toast(`${esc(r.n)} did not answer · playing a bot`, '#d6c8e4'); start(g, { bot: BOTS[1] }, 0, seed); } }, 20000); }
  bb.on('mg', d => { const G = GAMES.find(q => q[0] === d.g);
    if (d.k === 'inv' && G) { if (cur || (bb.CINE && bb.CINE.on)) return send('dec', d.id, d.g, 'busy');
      return bb.openSheet(`${G[1]} Game invite`, `${esc(d.n)} wants to play ${G[2]}`, `<p class="note">Winner gets ${bb.inr(bb.price(PRIZE[d.g][1]))}.</p><div class="stack"><button class="go" data-id="acc">Play</button><button class="buy ghost" data-id="dec">No thanks</button></div>`,
        s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return; bb.closeSheet(); send(id, d.id, d.g, '', d.m); if (id === 'acc') { hold(); start(d.g, { net: { id: d.id, n: d.n } }, 1, d.m); } }); }
    if (d.k === 'acc' && pending && pending.r.id === d.id && pending.g === d.g) { const p = pending; pending = null; start(p.g, { net: { id: d.id, n: d.n } }, 0, p.seed); }
    if (d.k === 'dec' && pending && pending.r.id === d.id) { pending = null; bb.toast(`${esc(d.n)} ${d.s === 'busy' ? 'is busy' : 'said no'} · try a bot`, '#d6c8e4'); pick(d.g); }
    if (d.k === 'mv' && cur && cur.net && cur.net.id === d.id && cur.g === d.g) { let m; try { m = JSON.parse(d.s); } catch (e) { return; } cur.apply(1 - cur.me, m); }
    if (d.k === 'bye' && cur && cur.net && cur.net.id === d.id) { bb.toast(`${esc(d.n)} left the game · you win`, '#3ddc97'); cur.finish(cur.me, true); } });
  /* ---------- a game session ---------- */
  // me: 0 moves first. The opponent is a bot or a player (net). rnd: the same random numbers on both sides.
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function start(g, opp, me, seed) { hold(); const S = { g, me, seed, rnd: rng(seed), net: opp.net || null, bot: opp.bot || null, turn: 0, over: false, names: [], c: null };
    S.names[me] = 'You'; S.names[1 - me] = opp.net ? opp.net.n : opp.bot + ' 🤖';
    S.finish = (winner, forfeit) => { if (S.over) return; S.over = true; const won = winner === me, draw = winner === -1; let msg = draw ? 'It\'s a draw' : won ? 'You win!' : `${S.names[1 - me]} wins`;
      if (won) { const amt = pay(g, !!S.net); if (amt) msg += ` · +${bb.inr(amt)}`; bb.emit('baygame', { game: g, win: true, online: !!S.net }); } else bb.emit('baygame', { game: g, win: false, online: !!S.net });
      S.result = { msg, won, draw }; S.draw(); if (won) confetti(); };
    S.move = m => { if (S.over || S.turn !== me) return; if (!S.legal(m)) return; if (S.net) net('mv', S, JSON.stringify(m)); S.apply(me, m); };
    S.apply = (who, m) => { if (S.over) return; S.play(who, m); S.draw(); if (!S.over && S.bot && S.turn !== me) setTimeout(() => { if (cur === S && !S.over) S.apply(1 - me, S.ai()); }, 650 + Math.random() * 500); };
    cur = S; ({ ttt: TTT, c4: C4, snl: SNL, quiz: QUIZ })[g](S); S.draw(); if (S.bot && S.turn !== me) setTimeout(() => { if (cur === S) S.apply(1 - me, S.ai()); }, 800); }
  const bar = S => { const you = S.turn === S.me && !S.over; return `<div class="mgvs"><span class="${S.turn === 0 && !S.over ? 'on' : ''}"><i class="d0"></i>${esc(S.names[0])}</span><b>vs</b><span class="${S.turn === 1 && !S.over ? 'on' : ''}"><i class="d1"></i>${esc(S.names[1])}</span></div><div class="mgturn">${S.result ? `<b class="${S.result.won ? 'win' : ''}">${esc(S.result.msg)}</b>` : you ? 'Your turn' : `${esc(S.names[S.turn])} is thinking…`}</div>`; };
  const tail = S => S.over ? `<div class="btnrow"><button class="go" data-again>Play again</button><button class="buy ghost" data-menu>All games</button></div>` : `<div class="btnrow"><button class="buy ghost" data-menu>Leave</button></div>`;
  function frame(S, title, body) { const c = shell(head(title, S.net ? '👥 Online game' : '🤖 Against a bot') + bar(S) + body + tail(S)); c.onclick = e => { if (e.target.closest('[data-menu]')) { if (S.net && !S.over) net('bye', S); return menu(); } if (e.target.closest('[data-again]')) return S.net ? pick(S.g) : start(S.g, { bot: S.bot }, 0, (Math.random() * 1e9) | 0); if (S.click) S.click(e); }; return c; }
  function confetti() { if (!root) return; const box = document.createElement('div'); box.className = 'mgconf'; for (let i = 0; i < 40; i++) { const p = document.createElement('i'); p.style.cssText = `left:${Math.random() * 100}%;background:hsl(${Math.random() * 360} 90% 60%);animation-delay:${Math.random() * .5}s;transform:rotate(${Math.random() * 360}deg)`; box.appendChild(p); } root.appendChild(box); setTimeout(() => box.remove(), 2600); }
  /* ---------- Tic-tac-toe ---------- */
  function TTT(S) { const b = Array(9).fill(-1); const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]; let line = null;
    const win = (B, p) => L.find(l => l.every(i => B[i] === p));
    S.legal = m => b[m.i] === -1; S.play = (who, m) => { b[m.i] = who; const w = win(b, who); if (w) { line = w; S.finish(who); } else if (b.every(x => x !== -1)) S.finish(-1); else S.turn = 1 - who; };
    S.ai = () => { const ai = 1 - S.me, me = S.me; const free = b.map((x, i) => x === -1 ? i : -1).filter(i => i >= 0); const t = p => free.find(i => { const B = b.slice(); B[i] = p; return win(B, p); });
      let i = t(ai); if (i == null) i = t(me); if (i == null && b[4] === -1) i = 4; if (i == null || S.rnd() < .15) i = free[Math.floor(S.rnd() * free.length)]; return { i }; };
    const X = '<svg viewBox="0 0 40 40"><path d="M8 8L32 32M32 8L8 32" /></svg>', O = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" /></svg>';
    S.draw = () => { frame(S, '❌⭕ Tic-tac-toe', `<div class="ttt">${b.map((x, i) => `<button class="tc${x === 0 ? ' x' : x === 1 ? ' o' : ''}${line && line.includes(i) ? ' hit' : ''}" data-i="${i}">${x === 0 ? X : x === 1 ? O : ''}</button>`).join('')}</div>`); };
    S.click = e => { const c = e.target.closest('[data-i]'); if (c) S.move({ i: +c.dataset.i }); }; }
  /* ---------- Connect Four ---------- */
  function C4(S) { const R = 6, C = 7; const b = Array(R * C).fill(-1); let last = -1, line = null;
    const at = (r, c) => b[r * C + c]; const drop = c => { for (let r = R - 1; r >= 0; r--) if (at(r, c) === -1) return r; return -1; };
    const four = (B, p) => { for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) { const cells = [0, 1, 2, 3].map(k => [r + dr * k, c + dc * k]); if (cells.every(([y, x]) => y >= 0 && y < R && x >= 0 && x < C && B[y * C + x] === p)) return cells.map(([y, x]) => y * C + x); } return null; };
    S.legal = m => m.c >= 0 && m.c < C && drop(m.c) >= 0; S.play = (who, m) => { const r = drop(m.c); b[r * C + m.c] = who; last = r * C + m.c; const w = four(b, who); if (w) { line = w; S.finish(who); } else if (b.every(x => x !== -1)) S.finish(-1); else S.turn = 1 - who; };
    S.ai = () => { const ai = 1 - S.me; const cols = [3, 2, 4, 1, 5, 0, 6].filter(c => drop(c) >= 0); const tryp = (c, p) => { const B = b.slice(); B[drop(c) * C + c] = p; return !!four(B, p); };
      let c = cols.find(c => tryp(c, ai)); if (c == null) c = cols.find(c => tryp(c, S.me)); if (c == null) { const safe = cols.filter(c => { const r = drop(c); if (r <= 0) return true; const B = b.slice(); B[r * C + c] = ai; B[(r - 1) * C + c] = S.me; return !four(B, S.me); }); const L2 = safe.length ? safe : cols; c = S.rnd() < .7 ? L2[0] : L2[Math.floor(S.rnd() * L2.length)]; } return { c }; };
    S.draw = () => { frame(S, '🔴🟡 Connect Four', `<div class="c4">${Array.from({ length: C }, (_, c) => `<button class="c4col" data-c="${c}">${Array.from({ length: R }, (_, r) => { const v = at(r, c), k = r * C + c; return `<i class="${v === 0 ? 'p0' : v === 1 ? 'p1' : ''}${k === last ? ' drop' : ''}${line && line.includes(k) ? ' hit' : ''}" style="--r:${r}"></i>`; }).join('')}</button>`).join('')}</div>`); };
    S.click = e => { const c = e.target.closest('[data-c]'); if (c) S.move({ c: +c.dataset.c }); }; }
  /* ---------- Snakes and Ladders ---------- */
  function SNL(S) { const SN = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 }, LA = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 }; const pos = [0, 0]; let die = 0, msg = '';
    const cell = n => { const r = Math.floor((n - 1) / 10), c = (n - 1) % 10; return { x: (r % 2 ? 9 - c : c) * 10 + 5, y: (9 - r) * 10 + 5 }; };
    S.legal = () => true; S.ai = () => ({ r: 1 });
    S.play = who => { die = 1 + Math.floor(S.rnd() * 6); let p = pos[who] + die; msg = `${S.names[who]} rolled ${die}`; if (p > 100) { msg += ' · needs an exact roll'; p = pos[who]; } else if (SN[p]) { msg += ` · 🐍 down to ${SN[p]}`; p = SN[p]; } else if (LA[p]) { msg += ` · 🪜 up to ${LA[p]}`; p = LA[p]; } pos[who] = p; if (p === 100) return S.finish(who); if (die !== 6) S.turn = 1 - who; else msg += ' · roll again'; };
    const svg = () => { let s = '<svg viewBox="0 0 100 100" class="snlsvg">'; for (const [a, b] of Object.entries(LA)) { const p = cell(+a), q = cell(b); s += `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" class="lad"/>`; } for (const [a, b] of Object.entries(SN)) { const p = cell(+a), q = cell(b); const mx = (p.x + q.x) / 2 + 8, my = (p.y + q.y) / 2; s += `<path d="M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}" class="snk"/><circle cx="${p.x}" cy="${p.y}" r="2.2" class="snh"/>`; }
      pos.forEach((n, i) => { if (!n) return; const c = cell(n); s += `<circle cx="${c.x + (i ? 2 : -2)}" cy="${c.y + (i ? 2 : -2)}" r="3.2" class="tok t${i}"/>`; }); return s + '</svg>'; };
    S.draw = () => { let cells = ''; for (let r = 9; r >= 0; r--) for (let c = 0; c < 10; c++) { const n = r * 10 + (r % 2 ? 10 - c : c + 1); cells += `<i class="${(r + c) % 2 ? 'a' : 'b'}">${n}</i>`; }
      frame(S, '🐍🪜 Snakes and Ladders', `<div class="snl"><div class="snlg">${cells}</div>${svg()}</div><div class="snlbar"><span class="die">${['⚀', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][die] || '🎲'}</span><span>${esc(msg || 'First to 100 wins · a 6 rolls again')}</span>${!S.over && S.turn === S.me ? '<button class="go" data-roll>Roll</button>' : ''}</div><p class="note">You ${pos[S.me]} · ${esc(S.names[1 - S.me])} ${pos[1 - S.me]}</p>`); };
    S.click = e => { if (e.target.closest('[data-roll]')) S.move({ r: 1 }); }; }
  /* ---------- Quiz duel: both answer the same 5 questions; the faster correct answers score more ---------- */
  const QB = [['Which is the largest state of India by area?', ['Rajasthan', 'Maharashtra', 'Madhya Pradesh', 'Gujarat'], 0], ['Which river flows through Pune?', ['Mula-Mutha', 'Godavari', 'Narmada', 'Tapi'], 0], ['The Gateway of India faces which sea?', ['Arabian Sea', 'Bay of Bengal', 'Red Sea', 'Andaman Sea'], 0],
    ['Which city is called the Pink City?', ['Jaipur', 'Jodhpur', 'Udaipur', 'Bikaner'], 0], ['Which city is called the Blue City?', ['Jodhpur', 'Jaipur', 'Jaisalmer', 'Ajmer'], 0], ['Onam is the harvest festival of which state?', ['Kerala', 'Karnataka', 'Goa', 'Gujarat'], 0],
    ['The Statue of Unity honours whom?', ['Sardar Vallabhbhai Patel', 'Mahatma Gandhi', 'B. R. Ambedkar', 'Subhas Chandra Bose'], 0], ['Which state is famous for the Garba dance?', ['Gujarat', 'Rajasthan', 'Maharashtra', 'Kerala'], 0], ['Bengaluru is the capital of which state?', ['Karnataka', 'Kerala', 'Tamil Nadu', 'Goa'], 0],
    ['Which fort city stands in the Thar desert?', ['Jaisalmer', 'Pune', 'Mysuru', 'Kochi'], 0], ['Mysore Palace is in which state?', ['Karnataka', 'Kerala', 'Maharashtra', 'Rajasthan'], 0], ['Vada pav is a famous snack of which city?', ['Mumbai', 'Ahmedabad', 'Kochi', 'Jaipur'], 0],
    ['Which is India\'s smallest state by area?', ['Goa', 'Sikkim', 'Tripura', 'Kerala'], 0], ['The Mumbai–Ahmedabad bullet train links Maharashtra with which state?', ['Gujarat', 'Rajasthan', 'Goa', 'Karnataka'], 0], ['Which Indian state has the longest coastline?', ['Gujarat', 'Kerala', 'Maharashtra', 'Goa'], 0],
    ['How many runs is a boundary that does not bounce?', ['6', '4', '5', '8'], 0], ['Who captained India to the 2011 Cricket World Cup win?', ['MS Dhoni', 'Sourav Ganguly', 'Virat Kohli', 'Kapil Dev'], 0], ['What is a duck in cricket?', ['Out for zero', 'A wide ball', 'Six sixes', 'A no-ball'], 0],
    ['Which film features the song "Chaiyya Chaiyya"?', ['Dil Se..', 'Lagaan', 'Sholay', 'Swades'], 0], ['Kathakali is a classical dance from which state?', ['Kerala', 'Gujarat', 'Rajasthan', 'Maharashtra'], 0], ['The Hampi ruins were the capital of which empire?', ['Vijayanagara', 'Maurya', 'Mughal', 'Maratha'], 0]].concat(((bb.BAYGAME_OLD && bb.BAYGAME_OLD.QS) || []).map(q => [q[0], q[1].concat(['None of these']), q[2]]));
  function QUIZ(S) { const order = QB.map((q, i) => i).sort(() => S.rnd() - .5).slice(0, 5); const score = [0, 0], ans = [[], []]; let qi = 0, t0 = Date.now(); S.turn = S.me;
    const shuffle = q => { const o = q[1].map((t, i) => ({ t, ok: i === q[2] })); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(S.rnd() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; }; const opts = order.map(i => shuffle(QB[i]));
    S.legal = m => ans[S.me][m.q] == null && m.q === qi;
    S.play = (who, m) => { if (ans[who][m.q] != null) return; ans[who][m.q] = m.a; if (opts[m.q][m.a] && opts[m.q][m.a].ok) score[who] += 10 + Math.max(0, 10 - Math.floor((m.t || 9000) / 1000));
      if (ans[0][qi] != null && ans[1][qi] != null) { setTimeout(() => { if (S.over || cur !== S) return; qi++; t0 = Date.now(); if (qi >= 5) S.finish(score[0] === score[1] ? -1 : score[0] > score[1] ? 0 : 1); else S.draw(); }, 1200); } };
    S.ai = () => { const q = qi; const right = S.rnd() < .65; const k = opts[q].findIndex(o => o.ok); return { q, a: right ? k : (k + 1 + Math.floor(S.rnd() * 3)) % 4, t: 2500 + S.rnd() * 5000 }; };
    const baseApply = S.apply; S.apply = (who, m) => { baseApply(who, m); if (who === S.me && S.bot && ans[1 - S.me][m.q] == null) setTimeout(() => { if (cur === S && !S.over) baseApply(1 - S.me, S.ai()); }, 900 + Math.random() * 1500); };
    S.draw = () => { if (qi >= 5) { frame(S, '🧠 Quiz duel', `<div class="qz"><b>Final score</b><p>You ${score[S.me]} · ${esc(S.names[1 - S.me])} ${score[1 - S.me]}</p></div>`); return; }
      const q = QB[order[qi]], mine = ans[S.me][qi], theirs = ans[1 - S.me][qi]; const shown = mine != null && theirs != null;
      frame(S, '🧠 Quiz duel', `<div class="qz"><small>Question ${qi + 1} of 5 · faster right answers score more</small><b>${esc(q[0])}</b><div class="qo">${opts[qi].map((o, i) => `<button data-a="${i}" class="${mine === i ? 'pick' : ''}${shown && o.ok ? ' ok' : ''}${shown && mine === i && !o.ok ? ' no' : ''}"${mine != null ? ' disabled' : ''}>${esc(o.t)}</button>`).join('')}</div><p class="note">You ${score[S.me]} · ${esc(S.names[1 - S.me])} ${score[1 - S.me]}${mine != null && theirs == null ? ' · waiting for ' + esc(S.names[1 - S.me]) : ''}</p></div>`); };
    S.click = e => { const b = e.target.closest('[data-a]'); if (b) S.move({ q: qi, a: +b.dataset.a, t: Date.now() - t0 }); }; }
  // Quiz turns are simultaneous: let the local player answer whatever the turn says
  const bgOpen = () => menu();
  bb.MINIGAMES = { menu: bgOpen, pay, start, close };
  bb.on('baygame', e => { if (e && e.win && (e.game === 'ludo' || e.game === 'cricket') && !e.paid) { const a = pay(e.game, false); if (a) bb.toast(`+${bb.inr(a)} prize`, '#3ddc97'); } });
});
