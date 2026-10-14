// BayGame: turn-based mini-games against bots on this device. Play chips only, never money.
// Ludo, Snakes and Ladders, Tic-tac-toe, Gully cricket and a cricket and Bollywood quiz.
window.BBFeatures.push(function (bb) {
  let root = null, holding = false, timers = [];
  const clearT = () => { timers.forEach(clearTimeout); timers = []; };
  const later = (f, ms) => timers.push(setTimeout(f, ms));
  function shell(title, sub, body) { if (!root) { root = document.createElement('div'); root.id = 'bg'; document.body.appendChild(root); }
    root.hidden = false; root.innerHTML = `<div class="bgcard"><div class="shead"><div><h2 style="font-family:var(--f-display);margin:0;font-size:22px">${title}</h2><div class="sub">${sub || ''}</div></div><button class="x" data-bgx aria-label="Close">×</button></div>${body}</div>`;
    root.querySelector('[data-bgx]').onclick = close; return root.querySelector('.bgcard'); }
  function close() { clearT(); if (root) root.hidden = true; if (!holding && bb.MINIGAMES) bb.MINIGAMES.close(); if (holding) { holding = false; bb.closeWait(); } removeKey(); }
  let keyFn = null; const removeKey = () => { if (keyFn) removeEventListener('keydown', keyFn); keyFn = null; };
  bb.setEscape(() => { if (root && !root.hidden) { close(); return true; } return false; });
  function menu() { clearT(); removeKey(); if (bb.MINIGAMES) { if (root) root.hidden = true; return bb.MINIGAMES.menu(); } const c = shell('BayGame', 'Play chips only · bots on this device', `${[['ludo', 'Ludo', 'You and three bots'], ['snl', 'Snakes and Ladders', 'Race a bot to 100'], ['ttt', 'Tic-tac-toe', 'Best of quick rounds'], ['cricket', 'Gully cricket', '2 overs, chase the target'], ['quiz', 'Cricket and Bollywood quiz', '5 questions']].map(([id, n, s]) => bb.rowHtml(id, n, s, 'Play')).join('')}<p class="note">Chess, carrom, rummy and teen patti (play chips) arrive with online tables.</p>`);
    c.onclick = e => { const id = e.target.dataset.id; if (!id) return; ({ ludo, snl, ttt, cricket, quiz })[id](); }; }
  function open(fromWait) { if (!fromWait && !bb.inside && !bb.uiLock()) { holding = true; bb.closeSheet(); bb.openWait({ kind: 'BayGame', title: 'Playing BayGame', sub: 'The Bay clock keeps running', total: 1e9, cancel: 'Stop playing', timeText: () => `Bay ${bb.bayTime()}`, onCancel: () => { holding = false; if (root) root.hidden = true; } }); } else bb.closeSheet(); menu(); }
  // Beta v1.01.12: the new mini games lobby (features/minigames.js) takes over; Ludo and Gully cricket still live here
  bb.setBayGame(() => bb.MINIGAMES ? bb.MINIGAMES.menu() : open(true)); bb.addApp({ id: 'baygame', label: 'BayGame', icon: '🎲', smart: true, fn: () => bb.MINIGAMES ? bb.MINIGAMES.menu() : open(false) });
  bb.BAYGAME_OLD = { get QS() { return QS; }, open: g => { clearT(); removeKey(); if (g === 'ludo') ludo(); if (g === 'cricket') cricket(); } };
  const win = (game, w) => { bb.emit('baygame', { game, win: w }); if (w) bb.toast(`You won ${game}!`, '#3ddc97'); };
  const back = '<div class="btnrow" style="margin-top:10px"><button class="buy ghost" data-back>All games</button></div>';
  function wireBack(c) { const b = c.querySelector('[data-back]'); if (b) b.onclick = menu; }

  /* ---------- Ludo ---------- */
  function ludo() { const S = 24, N = 15; const COL = ['#e8473a', '#2fa64f', '#f2c230', '#2f7fd8'], NAMES = ['You', 'Green bot', 'Yellow bot', 'Blue bot'];
    const T = [[1,6],[2,6],[3,6],[4,6],[5,6],[6,5],[6,4],[6,3],[6,2],[6,1],[6,0],[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[9,6],[10,6],[11,6],[12,6],[13,6],[14,6],[14,7],[14,8],[13,8],[12,8],[11,8],[10,8],[9,8],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[7,14],[6,14],[6,13],[6,12],[6,11],[6,10],[6,9],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],[0,7],[0,6]];
    const START = [0, 13, 26, 39], SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
    const HOME = [[[1,7],[2,7],[3,7],[4,7],[5,7]], [[7,1],[7,2],[7,3],[7,4],[7,5]], [[13,7],[12,7],[11,7],[10,7],[9,7]], [[7,13],[7,12],[7,11],[7,10],[7,9]]];
    const BASE = [[[1.5,1.5],[3.5,1.5],[1.5,3.5],[3.5,3.5]], [[10.5,1.5],[12.5,1.5],[10.5,3.5],[12.5,3.5]], [[10.5,10.5],[12.5,10.5],[10.5,12.5],[12.5,12.5]], [[1.5,10.5],[3.5,10.5],[1.5,12.5],[3.5,12.5]]];
    const tok = [0, 1, 2, 3].map(() => [-1, -1, -1, -1]); let turn = 0, roll = 0, rolled = false, msg = 'Your turn · roll the dice';
    const c = shell('Ludo', 'Roll a 6 to leave base · land on a rival to send them home', `<canvas id="lc" width="${S * N * 2}" height="${S * N * 2}"></canvas><div class="btnrow" style="margin-top:10px;align-items:center"><button class="go" id="lroll">Roll</button><b id="ldie" style="font-family:var(--f-display);font-size:28px;min-width:30px;text-align:center">–</b></div><p class="note" id="lmsg"></p>${back}`); wireBack(c);
    const cv = c.querySelector('#lc'), x = cv.getContext('2d'); x.scale(2, 2);
    const cell = (p, rel) => rel < 0 ? null : rel <= 50 ? T[(START[p] + rel) % 52] : rel <= 55 ? HOME[p][rel - 51] : [7, 7];
    const g = (p, rel) => rel >= 0 && rel <= 50 ? (START[p] + rel) % 52 : -1;
    function draw() { x.fillStyle = '#fbf3df'; x.fillRect(0, 0, S * N, S * N); const corner = [[0, 0], [9, 0], [9, 9], [0, 9]]; corner.forEach(([cx, cy], i) => { x.fillStyle = COL[i]; x.fillRect(cx * S, cy * S, 6 * S, 6 * S); x.fillStyle = '#fff'; x.fillRect((cx + .8) * S, (cy + .8) * S, 4.4 * S, 4.4 * S); });
      x.strokeStyle = '#c9b88f'; x.lineWidth = 1; T.forEach(([i, j], k) => { x.fillStyle = START.includes(k) ? COL[START.indexOf(k)] : SAFE.has(k) ? '#e9dcbc' : '#fff'; x.fillRect(i * S, j * S, S, S); x.strokeRect(i * S, j * S, S, S); if (SAFE.has(k) && !START.includes(k)) { x.fillStyle = '#b39b62'; x.font = `${S * .6}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('★', (i + .5) * S, (j + .55) * S); } });
      HOME.forEach((h, p) => h.forEach(([i, j]) => { x.fillStyle = COL[p]; x.fillRect(i * S, j * S, S, S); x.strokeRect(i * S, j * S, S, S); }));
      [[6, 6, 9, 6, 7.5, 7.5, 1], [9, 6, 9, 9, 7.5, 7.5, 2], [9, 9, 6, 9, 7.5, 7.5, 3], [6, 9, 6, 6, 7.5, 7.5, 0]].forEach(([a, b, c2, d, e, f, p]) => { x.fillStyle = COL[[0, 1, 2, 3][p]]; x.beginPath(); x.moveTo(a * S, b * S); x.lineTo(c2 * S, d * S); x.lineTo(e * S, f * S); x.fill(); });
      tok.forEach((ts, p) => ts.forEach((rel, k) => { let px, py; if (rel < 0) [px, py] = BASE[p][k]; else { const [i, j] = cell(p, rel); const same = ts.filter(r => r === rel).length; const off = same > 1 ? (k - 1.5) * 3 : 0; px = i + .5 + off / S; py = j + .5; } x.fillStyle = COL[p]; x.strokeStyle = '#1a1430'; x.lineWidth = 2; x.beginPath(); x.arc(px * S, py * S, S * .34, 0, 6.29); x.fill(); x.stroke();
        if (p === 0 && turn === 0 && rolled && legal(0).includes(k)) { x.strokeStyle = '#1a1430'; x.lineWidth = 2; x.beginPath(); x.arc(px * S, py * S, S * .48, 0, 6.29); x.stroke(); } }));
      c.querySelector('#lmsg').textContent = msg; c.querySelector('#lroll').disabled = !(turn === 0 && !rolled); }
    function legal(p) { const out = []; tok[p].forEach((rel, k) => { if (rel < 0) { if (roll === 6) out.push(k); } else if (rel < 56 && rel + roll <= 56) out.push(k); }); return out; }
    function move(p, k) { let rel = tok[p][k]; rel = rel < 0 ? 0 : rel + roll; tok[p][k] = rel; let extra = roll === 6, cap = false; const gi = g(p, rel);
      if (gi >= 0 && !SAFE.has(gi)) for (let q = 0; q < 4; q++) if (q !== p) tok[q].forEach((r, kk) => { if (g(q, r) === gi) { tok[q][kk] = -1; cap = true; } });
      if (cap) { extra = true; msg = `${NAMES[p]} captured a token!`; } if (rel === 56) { extra = true; msg = `${NAMES[p]} brought a token home`; }
      if (tok[p].every(r => r === 56)) { msg = `${NAMES[p]} wins!`; draw(); win('Ludo', p === 0); later(menu, 2500); return; } rolled = false; if (!extra) turn = (turn + 1) % 4; draw(); next(); }
    function next() { if (turn !== 0) later(botTurn, 650); else msg = msg.includes('wins') ? msg : 'Your turn · roll the dice'; draw(); }
    function doRoll() { roll = 1 + Math.floor(Math.random() * 6); rolled = true; c.querySelector('#ldie').textContent = roll; const L = legal(turn);
      if (!L.length) { msg = `${NAMES[turn]} rolled ${roll} · no move`; rolled = false; turn = (turn + 1) % 4; draw(); next(); return; }
      if (turn === 0) { if (L.length === 1) { msg = `Rolled ${roll} · only one move`; draw(); later(() => move(0, L[0]), 450); } else { msg = `Rolled ${roll} · tap a highlighted token`; draw(); } } }
    function botTurn() { doRoll(); if (!rolled) return; const L = legal(turn); const p = turn; const score = k => { const rel = tok[p][k] < 0 ? 0 : tok[p][k] + roll; const gi = g(p, rel); let s = rel; if (gi >= 0 && !SAFE.has(gi)) for (let q = 0; q < 4; q++) if (q !== p && tok[q].some(r => g(q, r) === gi)) s += 100; if (tok[p][k] < 0) s += 40; if (rel === 56) s += 80; if (SAFE.has(gi)) s += 10; return s; };
      const k = L.sort((a, b) => score(b) - score(a))[0]; later(() => move(p, k), 500); }
    c.querySelector('#lroll').onclick = () => { if (turn === 0 && !rolled) doRoll(); };
    cv.onclick = e => { if (turn !== 0 || !rolled) return; const r = cv.getBoundingClientRect(); const mx = (e.clientX - r.left) / r.width * N, my = (e.clientY - r.top) / r.height * N; const L = legal(0); let best = null, bd = 1.2;
      for (const k of L) { const rel = tok[0][k]; const [px, py] = rel < 0 ? BASE[0][k] : (([i, j]) => [i + .5, j + .5])(cell(0, rel)); const d = Math.hypot(px - mx, py - my); if (d < bd) { bd = d; best = k; } } if (best != null) move(0, best); };
    draw(); }

  /* ---------- Snakes and Ladders ---------- */
  function snl() { const SN = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 }, LA = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 }; const pos = [0, 0]; let turn = 0, busy = false, msg = 'Your turn';
    const c = shell('Snakes and Ladders', 'First to 100 wins · exact roll needed', `<canvas id="sc" width="720" height="720"></canvas><div class="btnrow" style="margin-top:10px;align-items:center"><button class="go" id="sroll">Roll</button><b id="sdie" style="font-family:var(--f-display);font-size:28px">–</b></div><p class="note" id="smsg"></p>${back}`); wireBack(c);
    const cv = c.querySelector('#sc'), x = cv.getContext('2d'); x.scale(2, 2); const S = 36;
    const xy = n => { const r = Math.floor((n - 1) / 10), k = (n - 1) % 10; const col = r % 2 ? 9 - k : k; return [(col + .5) * S, (9 - r + .5) * S]; };
    function draw() { for (let n = 1; n <= 100; n++) { const [cx, cy] = xy(n); x.fillStyle = (Math.floor((n - 1) / 10) + n) % 2 ? '#f7e7c1' : '#f1d9a6'; x.fillRect(cx - S / 2, cy - S / 2, S, S); x.fillStyle = '#8a6a3a'; x.font = '700 10px sans-serif'; x.fillText(n, cx - S / 2 + 3, cy - S / 2 + 11); }
      const line = (a, b, col, w) => { const [ax, ay] = xy(+a), [bx, by] = xy(b); x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); };
      for (const a in LA) line(a, LA[a], '#8a5a2a', 5); for (const a in SN) line(a, SN[a], '#2fa64f', 6);
      pos.forEach((p, i) => { if (!p) return; const [cx, cy] = xy(p); x.fillStyle = i ? '#2f7fd8' : '#e8473a'; x.strokeStyle = '#1a1430'; x.lineWidth = 2; x.beginPath(); x.arc(cx + (i ? 6 : -6), cy + 4, 8, 0, 6.29); x.fill(); x.stroke(); });
      c.querySelector('#smsg').textContent = `${msg} · You ${pos[0]} · Bot ${pos[1]}`; c.querySelector('#sroll').disabled = turn !== 0 || busy; }
    function play(p) { busy = true; const r = 1 + Math.floor(Math.random() * 6); c.querySelector('#sdie').textContent = r; let n = pos[p] + r; if (n > 100) { msg = `${p ? 'Bot' : 'You'} rolled ${r} · too far`; } else { pos[p] = n; msg = `${p ? 'Bot' : 'You'} rolled ${r}`; if (LA[n]) { pos[p] = LA[n]; msg += ' · ladder!'; } if (SN[n]) { pos[p] = SN[n]; msg += ' · snake!'; } }
      draw(); if (pos[p] === 100) { msg = p ? 'Bot wins' : 'You win!'; draw(); win('Snakes and Ladders', !p); later(menu, 2200); return; } if (r !== 6) turn = 1 - turn; busy = false; draw(); if (turn === 1) later(() => play(1), 700); }
    c.querySelector('#sroll').onclick = () => { if (turn === 0 && !busy) play(0); }; draw(); }

  /* ---------- Tic-tac-toe ---------- */
  function ttt() { let b = Array(9).fill(''), over = false, score = [0, 0]; const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const c = shell('Tic-tac-toe', 'You are X', `<div id="tg" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:300px;margin:0 auto"></div><p class="note" id="tmsg" style="text-align:center"></p>${back}`); wireBack(c);
    const wins = (bd, s) => L.some(l => l.every(i => bd[i] === s));
    function bot() { const free = b.map((v, i) => v ? -1 : i).filter(i => i >= 0); for (const s of ['O', 'X']) for (const i of free) { const t = b.slice(); t[i] = s; if (wins(t, s)) return i; } if (!b[4]) return 4; const corners = [0, 2, 6, 8].filter(i => !b[i]); if (corners.length) return bb.mpick(corners); return bb.mpick(free); }
    function draw(m) { c.querySelector('#tg').innerHTML = b.map((v, i) => `<button class="buy ghost" data-c="${i}" style="height:86px;font-size:36px;font-family:var(--f-display)">${v}</button>`).join(''); c.querySelector('#tmsg').textContent = `${m || ''} · You ${score[0]} · Bot ${score[1]}`; }
    function end(m) { over = true; draw(m); later(() => { b = Array(9).fill(''); over = false; draw('New round'); }, 1400); }
    c.querySelector('#tg').onclick = e => { const i = e.target.dataset.c; if (i == null || over || b[i]) return; b[i] = 'X'; if (wins(b, 'X')) { score[0]++; win('Tic-tac-toe', true); return end('You win'); } if (b.every(v => v)) return end('Draw'); b[bot()] = 'O'; if (wins(b, 'O')) { score[1]++; return end('Bot wins'); } if (b.every(v => v)) return end('Draw'); draw('Your move'); }; draw('Your move'); }

  /* ---------- Gully cricket ---------- */
  function cricket() { const target = 16 + Math.floor(Math.random() * 14); let runs = 0, balls = 0, wk = 0, ball = null, msg = `Target ${target} in 12 balls · 2 wickets`;
    const c = shell('Gully cricket', 'Tap Hit (or Space) when the ball reaches the bat', `<canvas id="gc" width="720" height="520"></canvas><div class="btnrow" style="margin-top:10px"><button class="go" id="ghit">Hit</button><button class="buy ghost" id="gbowl">Bowl next</button></div><p class="note" id="gmsg"></p>${back}`); wireBack(c);
    const cv = c.querySelector('#gc'), x = cv.getContext('2d'); x.scale(2, 2); let raf = 0;
    function draw() { x.fillStyle = '#7fae4a'; x.fillRect(0, 0, 360, 260); x.fillStyle = '#d9c08a'; x.fillRect(150, 20, 60, 230); x.fillStyle = '#f4f1ea'; x.fillRect(172, 228, 16, 3); x.fillRect(172, 28, 16, 3); for (const k of [-6, 0, 6]) { x.fillRect(180 + k - 1, 232, 2, 16); x.fillRect(180 + k - 1, 14, 2, 14); }
      x.fillStyle = '#1a1430'; x.beginPath(); x.arc(180, 34, 6, 0, 6.29); x.fill(); x.fillStyle = '#e8473a'; x.fillRect(176, 214, 8, 18); x.fillStyle = '#c99a5b'; x.fillRect(184, 206, 4, 22);
      x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(150, 206, 60, 18);
      if (ball) { x.fillStyle = '#c8102e'; x.beginPath(); x.arc(ball.x, ball.y, 4, 0, 6.29); x.fill(); }
      x.fillStyle = '#fff'; x.font = '800 16px "Baloo 2", sans-serif'; x.fillText(`${runs}/${wk}  ·  ${balls}/12 balls  ·  need ${Math.max(0, target - runs)}`, 10, 18); c.querySelector('#gmsg').textContent = msg; }
    function bowl() { if (ball || over()) return; const sp = .85 + Math.random() * .5; ball = { t: 0, dur: sp, x: 180, y: 40, dx: (Math.random() - .5) * 20, hit: false }; const t0 = performance.now(); cancelAnimationFrame(raf);
      const step = () => { if (!ball) return; ball.t = (performance.now() - t0) / 1000; const f = ball.t / ball.dur; ball.y = 40 + f * 175; ball.x = 180 + ball.dx * f; if (ball.hit) { ball.y = 215 - (ball.t - ball.hitT) * 400; ball.x += ball.hx; }
        draw(); if (!ball.hit && f > 1.18) { result(-1); return; } if (ball.hit && ball.y < -10) { ball = null; draw(); return; } raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); }
    function hit() { if (!ball || ball.hit) return; const f = ball.t / ball.dur; const e = Math.abs(f - 1); let r; if (e < .05) r = 6; else if (e < .1) r = 4; else if (e < .16) r = 2; else if (e < .24) r = 1; else return result(-1); ball.hit = true; ball.hitT = ball.t; ball.hx = (Math.random() - .5) * 6; result(r); }
    function result(r) { balls++; if (r < 0) { if (Math.random() < .4) { wk++; msg = 'Bowled! Middle stump gone'; } else msg = 'Missed · dot ball'; ball = null; } else { runs += r; msg = r === 6 ? 'SIX! Over the building!' : r === 4 ? 'FOUR! Through the gully' : `${r} run${r > 1 ? 's' : ''}`; }
      draw(); if (over()) { const w = runs >= target; msg = w ? `You chased ${target}! Gully legend` : `Fell short by ${target - runs}`; draw(); win('Gully cricket', w); later(menu, 2600); } else later(bowl, 1200); }
    const over = () => runs >= target || balls >= 12 || wk >= 2;
    c.querySelector('#ghit').onclick = hit; c.querySelector('#gbowl').onclick = bowl; keyFn = e => { if (e.code === 'Space') { e.preventDefault(); hit(); } }; addEventListener('keydown', keyFn); draw(); later(bowl, 700); }

  /* ---------- Quiz ---------- */
  const QS = [['Which team won the 1983 Cricket World Cup?', ['India', 'West Indies', 'Australia'], 0], ['How many balls are there in an over?', ['6', '8', '5'], 0], ['Which ground is known as the Home of Cricket?', ["Lord's", 'Eden Gardens', 'MCG'], 0],
    ['Which batter made 100 international centuries?', ['Sachin Tendulkar', 'Brian Lara', 'Ricky Ponting'], 0], ['Wankhede Stadium is in which city?', ['Mumbai', 'Pune', 'Ahmedabad'], 0], ['How many players does a cricket team field?', ['11', '9', '12'], 0],
    ['India won the men\'s T20 World Cup in 2007 and again in:', ['2024', '2016', '2012'], 0], ['Which Indian city has the world\'s largest cricket stadium by capacity?', ['Ahmedabad', 'Kolkata', 'Mumbai'], 0],
    ['In which year was the film Sholay released?', ['1975', '1982', '1969'], 0], ['"Mogambo khush hua" is a line from which film?', ['Mr. India', 'Don', 'Deewaar'], 0], ['What does DDLJ stand for?', ['Dilwale Dulhania Le Jayenge', 'Dil Dhadakne Lage Jab', 'Dost Dushman Le Jao'], 0],
    ['Which song from RRR won the Oscar for Best Original Song?', ['Naatu Naatu', 'Jai Ho', 'Chaiyya Chaiyya'], 0], ['Lagaan was nominated for the Oscar in which category?', ['Foreign Language Film', 'Best Picture', 'Best Song'], 0], ['Mumbai\'s Film City is in which area?', ['Goregaon', 'Colaba', 'Thane'], 0]];
  function quiz() { const qs = QS.slice().sort(() => Math.random() - .5).slice(0, 5); let i = 0, score = 0;
    function show(m) { if (i >= qs.length) { const c = shell('Quiz', 'Final score', `<p style="font-size:22px;font-family:var(--f-display);text-align:center">${score} / ${qs.length}</p>${back}`); wireBack(c); win('the quiz', score >= 4); return; }
      const [q, opts, a] = qs[i]; const order = opts.map((o, k) => k).sort(() => Math.random() - .5);
      const c = shell(`Question ${i + 1} of ${qs.length}`, m || `Score ${score}`, `<p style="font-size:17px;line-height:1.5">${bb.esc(q)}</p>${order.map(k => `<div class="row"><div class="nm">${bb.esc(opts[k])}</div><button class="buy ghost" data-a="${k}">Choose</button></div>`).join('')}${back}`); wireBack(c);
      c.onclick = e => { const k = e.target.dataset.a; if (k == null) return; const ok = +k === a; if (ok) score++; i++; show(ok ? 'Correct!' : `Not quite · it was ${opts[a]}`); }; }
    show(); }
});
