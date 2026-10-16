// Sports: the Sports app on the phone (football, cricket and kabaddi tables, fixtures, live scores and bets),
// the IPL cricket grounds, and watching a match from inside the stadium: walk the concourse, buy snacks,
// a jersey or a bet, then take your seat and watch the players, the crowd and the scoreboard.
// Bets use in-game money only and are for players aged 18 and over.
window.BBFeatures.push(function (bb) {
  const F = window.FOOTBALL, CR = window.CRICKET, T = bb.THREE, P = () => bb.P;
  const ex = () => { const p = P(); p.extra = p.extra || {}; const s = p.extra.sports = p.extra.sports || {}; s.bets = s.bets || []; s.tickets = s.tickets || {}; s.won = s.won || 0; s.lost = s.lost || 0; s.cr = s.cr || { club: null }; return s; };
  const mats = {}; const mat = c => (mats[c] = mats[c] || bb.LMat(c));
  const esc = bb.esc;

  /* ---------- Pro Kabaddi League (results only: watch the scores in the app and bet on them) ---------- */
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function seedOf(s) { let h = 2166136261; for (const v of s) { h ^= v.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  const KB = (() => { const league = { name: 'Pro Kabaddi League', short: 'PKL', kick: 20.5, len: 45, seasonDays: 24, rounds: 22 };
    const teams = [['um', 'U Mumba', 'MUM', '#f26522', '#1a1a1a'], ['pp', 'Puneri Paltan', 'PUN', '#ff7a1a', '#1d3f9a'], ['gg', 'Gujarat Giants', 'GG', '#e03c31', '#f2c14e'], ['jpp', 'Jaipur Pink Panthers', 'JPP', '#ea1a85', '#1d1d1d'],
      ['bb', 'Bengaluru Bulls', 'BLR', '#d6262f', '#ffffff'], ['tt', 'Tamil Thalaivas', 'TAM', '#1f4fbf', '#f2c14e'], ['tel', 'Telugu Titans', 'TEL', '#e8b023', '#1d3f9a'], ['bw', 'Bengal Warriorz', 'BEN', '#ff8a1a', '#222222'],
      ['pat', 'Patna Pirates', 'PAT', '#1e8a4c', '#f2c14e'], ['hs', 'Haryana Steelers', 'HS', '#2a62c9', '#ffffff'], ['dd', 'Dabang Delhi K.C.', 'DEL', '#d71920', '#f2c14e'], ['upy', 'UP Yoddhas', 'UP', '#f26522', '#3a225d']].map(([id, name, short, col, col2]) => ({ id, name, short, col, col2 }));
    const n = teams.length; const PAIRS = (() => { const out = []; let ids = teams.map((t, i) => i); for (let r = 0; r < n - 1; r++) { const round = []; for (let i = 0; i < n / 2; i++) { let a = ids[i], b = ids[n - 1 - i]; if ((i === 0 && r % 2) || (i > 0 && i % 2)) [a, b] = [b, a]; round.push([a, b]); } out.push(round); ids = [ids[0], ids[n - 1], ...ids.slice(1, n - 1)]; } return out.concat(out.map(r => r.map(([a, b]) => [b, a]))); })();
    const day = g => { const S = league.seasonDays; return { season: Math.floor(g / S), round: ((g % S) + S) % S, get matchday() { return this.round < league.rounds; } }; };
    const fixtures = (season, round) => round < 0 || round >= league.rounds ? [] : PAIRS[round].slice(0, 3).map(([h, a], i) => ({ home: teams[h], away: teams[a], season, round, i, sport: 'kabaddi' }));
    const cache = new Map(); function result(f) { const k = 'k' + f.season + ':' + f.round + ':' + f.home.id; if (cache.has(k)) return cache.get(k); const r = rng(seedOf(k)); const hp = 24 + Math.floor(r() * 22), ap = 22 + Math.floor(r() * 22); const res = { hp, ap, hg: hp, ag: ap }; cache.set(k, res); return res; }
    function clock(h) { const m = (h - league.kick) * 60; if (m < 0) return { state: 'pre', toKick: -m }; if (m < 20) return { state: 'live', f: m / 40, half: 1, min: Math.floor(m) + 1 }; if (m < 25) return { state: 'ht', f: .5 }; if (m < 45) return { state: 'live', f: (m - 5) / 40, half: 2, min: Math.floor(m - 5) + 1 }; return { state: 'ft', f: 1, since: m - 45 }; }
    const scoreAt = (res, fr) => [Math.round(res.hp * fr), Math.round(res.ap * fr)];
    function table(season, played) { const T2 = new Map(teams.map(t => [t.id, { team: t, P: 0, W: 0, L: 0, D: 0, Pts: 0, PD: 0 }])); for (let r = 0; r < Math.min(played, league.rounds); r++) for (const f of fixtures(season, r)) { const s = result(f), H = T2.get(f.home.id), A = T2.get(f.away.id); H.P++; A.P++; H.PD += s.hp - s.ap; A.PD += s.ap - s.hp;
        if (s.hp > s.ap) { H.W++; H.Pts += 5; A.L++; if (s.hp - s.ap <= 7) A.Pts++; } else if (s.hp < s.ap) { A.W++; A.Pts += 5; H.L++; if (s.ap - s.hp <= 7) H.Pts++; } else { H.D++; A.D++; H.Pts += 3; A.Pts += 3; } }
      return [...T2.values()].sort((a, b) => b.Pts - a.Pts || b.PD - a.PD); }
    return { league, teams, byId: id => teams.find(t => t.id === id), day, fixtures, result, clock, scoreAt, table }; })();

  /* ---------- one interface for the three sports ---------- */
  const SP = {
    football: { name: 'Football', icon: '⚽', L: F.league, D: F, draw: true, time: '7:30 pm',
      status(f) { const res = F.result(f), c = F.clock(bb.clock); const [h, a] = F.scoreAt(res, f, c.state === 'pre' ? 0 : c.state === 'ft' ? 90 : c.min); const sc = `${f.home.short} ${h}–${a} ${f.away.short}`;
        return { res, c, open: c.state === 'pre', ft: c.state === 'ft', text: c.state === 'pre' ? `${f.home.short} v ${f.away.short} · 7:30 pm${c.toKick < 120 ? ' · in ' + Math.ceil(c.toKick) + ' min' : ''}` : c.state === 'ft' ? `FT · ${sc}` : c.state === 'ht' ? `HT · ${sc}` : `LIVE ${c.min}' · ${sc}` }; },
      outcome(f) { const r = F.result(f); return r.hg > r.ag ? 'home' : r.hg < r.ag ? 'away' : 'draw'; } },
    cricket: { name: 'Cricket', icon: '🏏', L: CR.league, D: CR, draw: false, time: '3:30 pm',
      status(f) { const res = CR.result(f), c = CR.clock(bb.clock); const t = CR.scoreText(f, res, c); return { res, c, open: c.state === 'pre', ft: c.state === 'ft', text: c.state === 'live' || c.state === 'break' ? 'LIVE · ' + t : c.state === 'ft' ? 'Result · ' + t : t }; },
      outcome(f) { const r = CR.result(f); return !r.winner ? 'draw' : r.winner === f.home ? 'home' : 'away'; } },
    kabaddi: { name: 'Kabaddi', icon: '🤼', L: KB.league, D: KB, draw: false, time: '8:30 pm',
      status(f) { const res = KB.result(f), c = KB.clock(bb.clock); const [h, a] = KB.scoreAt(res, c.state === 'pre' ? 0 : c.f); const sc = `${f.home.short} ${h}–${a} ${f.away.short}`;
        return { res, c, open: c.state === 'pre', ft: c.state === 'ft', text: c.state === 'pre' ? `${f.home.short} v ${f.away.short} · 8:30 pm` : c.state === 'ft' ? `FT · ${sc}` : c.state === 'ht' ? `Half-time · ${sc}` : `LIVE ${c.min}' · ${sc}` }; },
      outcome(f) { const r = KB.result(f); return r.hp > r.ap ? 'home' : r.hp < r.ap ? 'away' : 'draw'; } } };
  const dayOf = (sp, g) => SP[sp].D.day(g);
  function todays(sp, g = bb.gameDay) { const d = dayOf(sp, g); return d.matchday ? SP[sp].D.fixtures(d.season, d.round) : []; }
  function standings(sp) { const d = dayOf(sp, bb.gameDay); const s = SP[sp]; const st = todays(sp)[0]; const ftToday = st && s.status(st).ft; const played = d.matchday ? d.round + (ftToday ? 1 : 0) : s.L.rounds; return s.D.table(d.season, played); }
  const fxKey = f => `${f.sport || 'football'}:${f.season}:${f.round}:${f.home.id}:${f.away.id}`;

  /* ---------- odds and bets ---------- */
  function adult() { if (bb.testMode) return true; const a = bb.ageFromDob(P().dob); return a != null ? a >= 18 : !!P().age18; }
  function odds(sp, f) { const tab = standings(sp); const n = tab.length; const rk = id => { const i = tab.findIndex(r => r.team.id === id); return i < 0 ? n / 2 : i; };
    const sH = 1 + (n - rk(f.home.id)) / n + (f.home.stadium ? .12 : .05), sA = 1 + (n - rk(f.away.id)) / n; const k = .92; const r2 = v => Math.max(1.15, Math.min(9, Math.round(v * 20) / 20));
    if (SP[sp].draw) { const pD = .26, pH = (1 - pD) * sH / (sH + sA), pA = 1 - pD - pH; return { home: r2(k / pH), draw: r2(k / pD), away: r2(k / pA) }; }
    const pH = sH / (sH + sA); return { home: r2(k / pH), away: r2(k / (1 - pH)) }; }
  const minBet = () => Math.max(10, Math.round(bb.cost('bet.min', 50))), maxBet = () => Math.max(minBet(), Math.round(bb.cost('bet.max', 10000)));
  function betSheet(sp, f, back) { if (!adult()) return ageSheet(back); const S = SP[sp], st = S.status(f); const g = bb.gameDay; const fDay = f._day != null ? f._day : g;
    if (!st.open && fDay === g) { bb.toast('Bets closed when the match started', '#ff9f1c'); return back ? back() : null; }
    const o = odds(sp, f); let pick = null, stake = minBet() * 2; const stakes = [1, 2, 5, 10, 20, 50, 100].map(m => m * minBet()).filter(v => v <= maxBet());
    const draw = () => { const ret = pick ? Math.floor(stake * o[pick]) : 0;
      bb.openSheet(`🎲 Bet · ${esc(f.home.short)} v ${esc(f.away.short)}`, `${esc(S.L.name)} · ${fDay === g ? 'today' : 'tomorrow'} ${S.time} · in-game money · 18+`,
        `<div class="chips">${['home', S.draw ? 'draw' : null, 'away'].filter(Boolean).map(k => `<button class="chip${pick === k ? ' on' : ''}" data-pick="${k}">${k === 'home' ? esc(f.home.short) + ' win' : k === 'away' ? esc(f.away.short) + ' win' : 'Draw'} · ${o[k].toFixed(2)}</button>`).join('')}</div>
        <h3 class="sub">Stake</h3><div class="chips">${stakes.map(v => `<button class="chip${v === stake ? ' on' : ''}" data-stake="${v}">${bb.inr(v)}</button>`).join('')}</div>
        ${pick ? `<p class="note" style="font-size:14px">Bet ${bb.inr(stake)} on <b>${pick === 'draw' ? 'a draw' : esc((pick === 'home' ? f.home : f.away).name) + ' to win'}</b>. If you are right you get <b>${bb.inr(ret)}</b> back when the match ends.</p>` : '<p class="note">Pick a result first.</p>'}
        <div class="btnrow"><button class="go" data-place ${pick ? '' : 'disabled'}>Place bet</button><button class="buy ghost" data-back>Back</button></div>
        <p class="note">${S.draw ? 'A draw pays only bets on the draw.' : 'If the match is tied, your stake comes back.'} Play for fun: bets use India Bay money only, never real money.</p>`,
        s => s.onclick = e => { const t = e.target; if (t.dataset.pick) { pick = t.dataset.pick; return draw(); } if (t.dataset.stake) { stake = +t.dataset.stake; return draw(); } if (t.dataset.back != null) return back ? back() : bb.closeSheet();
          if (t.dataset.place != null && pick) { if (!S.status(f).open && fDay === bb.gameDay) return bb.toast('Bets closed · the match has started', '#ff9f1c'); if (!bb.spend(stake, true)) return;
            const X = ex(); X.bets.push({ id: Date.now().toString(36), sp, season: f.season, round: f.round, h: f.home.id, a: f.away.id, hn: f.home.short, an: f.away.short, day: fDay, pick, stake, odds: o[pick], at: bb.istISO() });
            if (X.bets.length > 60) X.bets.splice(0, X.bets.length - 60); bb.setDirty(); bb.save(); bb.toast(`Bet placed · ${bb.inr(stake)} at ${o[pick].toFixed(2)} · good luck!`, '#3ddc97'); bb.emit('bet', { sp, stake }); return back ? back() : open('bets'); } }); };
    draw(); }
  function ageSheet(back) { bb.openSheet('🎲 Bets are for 18+', 'India Bay money only', `<p class="note" style="font-size:14px">Betting on matches is only for players aged 18 and over. ${P().dob ? 'Your profile says you are under 18, so bets stay locked. You can still follow every score and table.' : 'Add your date of birth in your profile to unlock bets.'}</p>
    <div class="btnrow">${P().dob ? '' : '<button class="go" data-prof>Open profile</button>'}<button class="buy ghost" data-back>Back</button></div>`, s => s.onclick = e => { if (e.target.dataset.prof != null) return bb.profileSheet(false); if (e.target.dataset.back != null) return back ? back() : bb.closeSheet(); }); }
  function fixtureOf(b) { const D = SP[b.sp].D; return D.fixtures(b.season, b.round).find(f => f.home.id === b.h && f.away.id === b.a) || null; }
  function settle() { const X = ex(); let changed = false; for (const b of X.bets) { if (b.done) continue; const f = fixtureOf(b); if (!f) { b.done = 'void'; b.paid = b.stake; bb.earn(b.stake, 'bet'); changed = true; continue; }
      const st = SP[b.sp].status(f); const over = bb.gameDay > b.day || (bb.gameDay === b.day && st.ft); if (!over) continue; const out = SP[b.sp].outcome(f);
      if (out === b.pick) { b.done = 'won'; b.paid = Math.floor(b.stake * b.odds); X.won += b.paid - b.stake; bb.earn(b.paid, 'bet'); bb.toast(`📱 Bet won! ${b.hn} v ${b.an} · +${bb.inr(b.paid)}`, '#3ddc97'); bb.emit('bet', { won: true }); }
      else if (out === 'draw' && !SP[b.sp].draw) { b.done = 'void'; b.paid = b.stake; bb.earn(b.stake, 'bet'); bb.toast(`📱 ${b.hn} v ${b.an} tied · stake returned`, '#d6c8e4'); }
      else { b.done = 'lost'; b.paid = 0; X.lost += b.stake; bb.toast(`📱 Bet lost · ${b.hn} v ${b.an}`, '#d6c8e4'); }
      changed = true; } if (changed) { bb.setDirty(); bb.save(); } }
  setInterval(() => { if (bb.started && P()) try { settle(); } catch (e) { console.error(e); } }, 4000);

  /* ---------- the Sports app ---------- */
  let tab = 'football';
  function open(t) { if (t) tab = t; const X = ex(); const tabs = `<div class="chips">${[['football', '⚽ Football'], ['cricket', '🏏 Cricket'], ['kabaddi', '🤼 Kabaddi'], ['bets', '🎲 My bets']].map(([k, l]) => `<button class="chip${k === tab ? ' on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div>`;
    if (tab === 'bets') return betsTab(tabs, X);
    const S = SP[tab], d = dayOf(tab, bb.gameDay); const fx = todays(tab), tm = todays(tab, bb.gameDay + 1).map(f => Object.assign({}, f, { _day: bb.gameDay + 1 })); const pp = bb.ppos();
    const row = (f, i, tmw) => { const st = S.status(f); const home = f.home.stadium && stadiumOf(tab, f.home.id); const canBet = tmw || st.open;
      return `<div class="row"><div class="nm"><b style="color:${f.home.col}">■</b> ${esc(f.home.name)} v <b style="color:${f.away.col}">■</b> ${esc(f.away.name)}<small>${tmw ? `Tomorrow · ${S.time}` : esc(st.text)}${f.home.stadium ? ' · ' + esc(f.home.stadium) : ''}</small></div><div class="btnrow" style="gap:6px;flex-wrap:nowrap">${canBet ? `<button class="buy" data-bet="${tmw ? 't' : 'd'}${i}">Bet</button>` : ''}${home ? `<button class="buy ghost" data-dir="${tmw ? 't' : 'd'}${i}">Go</button>` : ''}</div></div>`; };
    const tabRows = standings(tab); const cols = tab === 'football' ? ['P', 'W', 'D', 'L', 'GD', 'Pts'] : tab === 'cricket' ? ['P', 'W', 'L', 'NR', 'NRR', 'Pts'] : ['P', 'W', 'L', 'T', 'PD', 'Pts'];
    const val = (r, c) => c === 'GD' ? (r.GF - r.GA > 0 ? '+' : '') + (r.GF - r.GA) : c === 'NRR' ? (r.nrr >= 0 ? '+' : '') + (r.P ? (r.nrr / r.P).toFixed(2) : '0.00') : c === 'PD' ? (r.PD > 0 ? '+' : '') + r.PD : c === 'T' ? r.D : r[c];
    const fanOf = tab === 'football' ? (P().extra.fb || {}).club : tab === 'cricket' ? X.cr.club : null;
    const table = `<table class="ltab"><tr><th>#</th><th>Team</th>${cols.map(c => `<th>${c}</th>`).join('')}</tr>${tabRows.map((r, i) => `<tr${fanOf === r.team.id ? ' class="me"' : ''}><td>${i + 1}</td><td><b style="color:${r.team.col}">■</b> ${esc(r.team.short)}</td>${cols.map(c => `<td>${c === 'Pts' ? '<b>' + r.Pts + '</b>' : val(r, c)}</td>`).join('')}</tr>`).join('')}</table>`;
    const grounds = tab === 'kabaddi' ? '<p class="note">Kabaddi arenas join the map with later regions. Follow live scores here and bet on them.</p>' : `<h3 class="sub">Stadiums on the map</h3>${S.D.homeTeams.map(t => { const p = stadiumOf(tab, t.id); return bb.rowHtml('s' + t.id, esc(t.stadium), `${esc(t.name)}${p ? ' · ' + Math.round(Math.hypot(p.x - pp.x, p.z - pp.z) * 2.4 / 100) / 10 + ' km' : ''}`, 'Directions', 'ghost'); }).join('')}`;
    bb.openSheet(`${S.icon} ${esc(S.L.name)}`, d.matchday ? `Season ${d.season % 100 + 1} · round ${d.round + 1} of ${S.L.rounds} · matches at ${S.time} Bay time` : `Season ${d.season % 100 + 1} is over · ${esc(tabRows[0].team.name)} are champions`,
      tabs + (fx.length ? `<h3 class="sub">Today</h3>${fx.map((f, i) => row(f, i, false)).join('')}` : '<p class="note">No matches today.</p>') + (tm.length ? `<h3 class="sub">Tomorrow</h3>${tm.map((f, i) => row(f, i, true)).join('')}` : '') +
      `<h3 class="sub">Table</h3>${table}${grounds}<p class="note">Buy tickets at the stadium gate, then go in and take your seat. ${adult() ? 'Bets close when a match starts and pay out at full time.' : 'Bets are for players aged 18 and over.'}</p>`,
      s => s.onclick = e => { const t = e.target; if (t.dataset.tab) return open(t.dataset.tab); const pickF = v => (v[0] === 't' ? tm : fx)[+v.slice(1)];
        if (t.dataset.bet) return betSheet(tab, pickF(t.dataset.bet), () => open(tab)); if (t.dataset.dir) { const f = pickF(t.dataset.dir); const p = stadiumOf(tab, f.home.id); if (p && bb.TRAVEL) bb.TRAVEL.go(p.x, p.z, p.name); return; }
        const id = t.dataset.id; if (id && id[0] === 's') { const p = stadiumOf(tab, id.slice(1)); if (p && bb.TRAVEL) bb.TRAVEL.go(p.x, p.z, p.name); } }); }
  function betsTab(tabs, X) { if (!adult()) return ageSheet(() => open('football')); const openB = X.bets.filter(b => !b.done), past = X.bets.filter(b => b.done).slice(-15).reverse();
    const line = b => { const f = fixtureOf(b); const st = f ? SP[b.sp].status(f) : null; const pk = b.pick === 'draw' ? 'Draw' : (b.pick === 'home' ? b.hn : b.an) + ' win';
      return `<div class="row"><div class="nm">${SP[b.sp].icon} ${esc(b.hn)} v ${esc(b.an)} · ${esc(pk)}<small>${bb.inr(b.stake)} at ${b.odds.toFixed(2)} · ${b.done ? (b.done === 'won' ? `Won ${bb.inr(b.paid)}` : b.done === 'void' ? 'Stake returned' : 'Lost') : st ? esc(st.text) : ''}</small></div><b style="color:${b.done === 'won' ? '#3ddc97' : b.done === 'lost' ? '#ff5d73' : '#ffc93c'}">${b.done ? (b.done === 'won' ? '+' + bb.inr(b.paid - b.stake) : b.done === 'lost' ? '−' + bb.inr(b.stake) : '±0') : 'Open'}</b></div>`; };
    bb.openSheet('🎲 My bets', `Winnings ${bb.inr(X.won)} · losses ${bb.inr(X.lost)}`, tabs + `<h3 class="sub">Open bets (${openB.length})</h3>${openB.map(line).join('') || '<p class="note">No open bets. Pick a match on the Football, Cricket or Kabaddi tab.</p>'}<h3 class="sub">Settled</h3>${past.map(line).join('') || '<p class="note">Nothing settled yet.</p>'}
      <p class="note">Bets use India Bay money only. Bet small: there is no sure win, and the stadium is fun either way.</p>`, s => s.onclick = e => { if (e.target.dataset.tab) open(e.target.dataset.tab); }); }
  bb.addApp({ id: 'sports', label: 'Sports', icon: '🏆', fn: () => open() });

  /* ---------- stadiums on the map ---------- */
  function stadiumOf(sp, teamId) { return bb.pois.find(p => (sp === 'cricket' ? p.type === 'cricket' : p.type === 'stadium') && p.extra === teamId); }
  // Cricket grounds: tickets, IPL jerseys and going in
  function cricketSheet(poi) { const team = CR.byId(poi.extra); if (!team) return; const X = ex(); const f = CR.homeMatch(team.id, bb.gameDay); const st = f ? SP.cricket.status(f) : null; const key = f ? fxKey(f) : ''; const has = f && X.tickets[key];
    const nx = !f || st.ft ? CR.nextHome(team.id, bb.gameDay + 1) : null; let rows = '';
    if (f && !st.ft) { const gates = bb.testMode || st.c.state !== 'pre' || st.c.toKick <= 30;
      if (has) rows += bb.rowHtml('enter', gates ? 'Go in and take your seat' : 'You have a ticket', gates ? `${has === 'vip' ? 'VIP box' : 'Stands'} · ${st.text}` : `Gates open at 3:00 pm · ${st.text}`, gates ? 'Enter' : 'Wait', gates ? '' : 'ghost');
      else rows += bb.rowHtml('stands', 'Ticket · stands', st.text, bb.inr(bb.cost('cr.stands', 400))) + bb.rowHtml('vip', 'Ticket · VIP box', 'Padded seats and snacks included', bb.inr(bb.cost('cr.vip', 2000)), 'ghost');
      if (st.open && adult()) rows += bb.rowHtml('bet', 'Bet on this match', `${team.short} v ${f.away.short} · bets close at 3:30 pm`, 'Bet', 'ghost'); }
    else rows += `<p class="note">${f ? `Today: ${esc(st.text)}. ` : ''}${nx ? `Next home match: ${esc(nx.f.away.name)} in ${nx.inDays} Bay day${nx.inDays > 1 ? 's' : ''}, 3:30 pm.` : 'No more home matches this season.'}</p>` + bb.rowHtml('tour', 'Stadium tour', 'Walk in, see the pitch and the stands', bb.inr(bb.cost('st.tour', 150)), 'ghost');
    const jersey = P().outfit.topCol === team.col; rows += bb.rowHtml('jersey', `${team.short} jersey`, jersey ? 'You are wearing it' : 'Wear your team colours to the match', jersey ? 'Worn' : bb.inr(bb.cost('cr.jersey', 1299)), jersey ? 'ghost' : '');
    rows += bb.rowHtml('app', 'IPL table and fixtures', 'In the Sports app on your phone', 'Open', 'ghost');
    bb.openSheet(`🏏 ${esc(poi.name)}`, `${esc(team.name)} · ${f ? `${esc(f.home.short)} v ${esc(f.away.short)} today` : 'No match today'}`, rows, s => s.onclick = e => { const id = e.target.dataset.id; if (!id) return;
      if (id === 'app') return open('cricket'); if (id === 'bet') return betSheet('cricket', f, () => cricketSheet(poi));
      if (id === 'stands' || id === 'vip') { if (!bb.spend(id === 'vip' ? bb.cost('cr.vip', 2000) : bb.cost('cr.stands', 400), true)) return; X.tickets = { [key]: id === 'vip' ? 'vip' : 'stand' }; bb.setDirty(); bb.toast(`Ticket booked · ${f.home.short} v ${f.away.short}`, '#3ddc97'); return cricketSheet(poi); }
      if (id === 'enter') { const s2 = SP.cricket.status(f); if (!bb.testMode && s2.c.state === 'pre' && s2.c.toKick > 30) return bb.toast('Gates open at 3:00 pm', '#ff9f1c'); bb.closeSheet(); return enter(poi, 'cricket', f, X.tickets[key] === 'vip'); }
      if (id === 'tour') { if (!bb.spend(bb.cost('st.tour', 150), true)) return; bb.closeSheet(); return enter(poi, 'cricket', null, false); }
      if (id === 'jersey' && !jersey) { if (!bb.spend(bb.cost('cr.jersey', 1299), true)) return; P().outfit.topCol = team.col; X.cr.club = team.id; bb.applyOutfit(); bb.setDirty(); bb.toast(`You're in ${team.short} colours`, team.col); return cricketSheet(poi); } }); }
  bb.poiHandlers.cricket = cricketSheet;

  /* ---------- sound ---------- */
  let noise = null;
  function roar(vol = .25, dur = 2.2) { const ac = bb.audio; if (!ac || bb.muted) return; try { if (!noise) { noise = ac.createBuffer(1, ac.sampleRate * 2.5, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(); s.buffer = noise; const fl = ac.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 650; fl.Q.value = .6; const g = ac.createGain(); const t = ac.currentTime; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .25); g.gain.exponentialRampToValueAtTime(.001, t + dur); s.connect(fl); fl.connect(g); g.connect(ac.destination); s.start(t); s.stop(t + dur + .1); } catch (e) {} }

  /* ---------- inside the stadium ---------- */
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.anisotropy = 4; return t; }
  function box(g, w, h, d, x, y, z, m) { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; }
  function pitchTexFootball(FW, FD) { return canvasTex(1024, Math.round(1024 * FD / FW), (x, w, h) => { const sx = w / (FW * 2), sz = h / (FD * 2), X = v => (v + FW) * sx, Z = v => (v + FD) * sz;
    for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? '#3d9a3a' : '#47aa44'; x.fillRect(i * w / 14, 0, w / 14 + 1, h); }
    x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = 3; const L = FW - 1.2, D = FD - 1.2; x.strokeRect(X(-L), Z(-D), (2 * L) * sx, (2 * D) * sz); x.beginPath(); x.moveTo(X(0), Z(-D)); x.lineTo(X(0), Z(D)); x.stroke();
    x.beginPath(); x.ellipse(X(0), Z(0), 8 * sx, 8 * sz, 0, 0, 6.29); x.stroke(); for (const s of [-1, 1]) { const gx = s * L; x.strokeRect(Math.min(X(gx), X(gx - s * 15)), Z(-17), 15 * sx, 34 * sz); x.strokeRect(Math.min(X(gx), X(gx - s * 5.5)), Z(-8), 5.5 * sx, 16 * sz);
      x.beginPath(); x.arc(X(gx - s * 10.5), Z(0), 3, 0, 6.29); x.fillStyle = '#fff'; x.fill(); } x.beginPath(); x.arc(X(0), Z(0), 3, 0, 6.29); x.fill(); }); }
  function fieldTexCricket() { return canvasTex(1024, 1024, (x, w, h) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#3f9b3c' : '#4aac46'; x.fillRect(0, i * h / 16, w, h / 16 + 1); }
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 3; x.setLineDash([10, 10]); x.beginPath(); x.ellipse(w / 2, h / 2, w * .3, h * .3, 0, 0, 6.29); x.stroke(); }); }
  function adTex(lines, col, col2) { return canvasTex(1024, 64, (x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); x.font = '800 38px "Baloo 2", sans-serif'; x.textBaseline = 'middle'; x.fillStyle = col2; let px = 20; let i = 0; while (px < w) { const t = lines[i++ % lines.length]; const L = bb.LOGO_IMG; if (t === 'INDIA BAY' && L && L.complete && L.naturalWidth) { x.drawImage(L, px, 3, h - 6, h - 6); px += h + 6; } x.fillText(t, px, h / 2 + 2); px += x.measureText(t).width + 60; } }); }
  function personMesh(col) { const p = bb.buildPerson(col, { female: false }); p.userData.base = col; return p; }

  /* Beta v1.01.26: real people in the stands (not boxes): seated fans with heads, hair, shirts in the team colours, trousers and
     arms, drawn as instanced meshes so thousands cost little; about one in five holds up a card with the team's name. */
  const FAN = (() => { const parts = (list) => { const gs = list.map(([geo, x, y, z, sx, sy, sz]) => { const q = geo.clone(); q.scale(sx || 1, sy || 1, sz || 1); q.translate(x, y, z); return q; }); return bb.mergeGeos ? bb.mergeGeos(gs) : merge(gs); };
    const cyl = new T.CylinderGeometry(.16, .2, .5, 8), sph = new T.SphereGeometry(1, 9, 7), box = new T.BoxGeometry(1, 1, 1);
    return { top: parts([[cyl, 0, .33, 0], [sph, -.19, .52, 0, .085, .085, .085], [sph, .19, .52, 0, .085, .085, .085], [box, -.22, .33, .03, .09, .38, .1], [box, .22, .33, .03, .09, .38, .1]]),
      legs: parts([[box, -.09, .05, .2, .14, .14, .44], [box, .09, .05, .2, .14, .14, .44], [box, -.09, -.17, .42, .12, .42, .13], [box, .09, -.17, .42, .12, .42, .13]]),
      head: parts([[sph, 0, .74, .01, .115, .135, .12], [box, 0, .62, 0, .08, .08, .08]]), hair: parts([[new T.SphereGeometry(1, 9, 5, 0, Math.PI * 2, 0, Math.PI * .5), 0, .76, -.005, .125, .12, .13]]),
      card: new T.PlaneGeometry(.95, .42) }; })();
  function merge(gs0) { const gs = gs0.map(g2 => g2.index ? g2.toNonIndexed() : g2); let n = 0; for (const g2 of gs) n += g2.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
    for (const q of gs) { pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); o += q.attributes.position.count; } const out = new T.BufferGeometry(); out.setAttribute('position', new T.BufferAttribute(pos, 3)); out.setAttribute('normal', new T.BufferAttribute(nor, 3)); return out; }
  const SKINS = ['#5c3a24', '#7b4a2e', '#8d5524', '#a0673f', '#b97a4f', '#c68642', '#d19a6a'].map(c => new T.Color(c)), HAIRS = ['#141010', '#1e1612', '#2b1d14', '#3a2a20', '#6b6b6b'].map(c => new T.Color(c)), PANTS = ['#2d3142', '#1f3a5f', '#3b3024', '#4a4e57', '#e9e4d6'].map(c => new T.Color(c));
  const cardMats = {}; function cardMat(team, v) { const k = (team ? team.id : 'x') + v; if (cardMats[k]) return cardMats[k]; const c = document.createElement('canvas'); c.width = 256; c.height = 112; const x = c.getContext('2d');
    const bg = team ? team.col : '#1d3f9a', fg = team && team.col2 && team.col2 !== bg ? team.col2 : '#ffffff'; x.fillStyle = v === 1 ? '#ffffff' : bg; x.fillRect(0, 0, 256, 112); x.fillStyle = v === 1 ? bg : fg; x.textAlign = 'center'; x.textBaseline = 'middle';
    const txt = !team ? 'INDIA BAY' : v === 0 ? team.short : v === 1 ? 'COME ON ' + team.short : (team.name || team.short).toUpperCase(); let f = 70; x.font = `900 ${f}px "Baloo 2", sans-serif`; while (x.measureText(txt).width > 236 && f > 18) { f -= 3; x.font = `900 ${f}px "Baloo 2", sans-serif`; } x.fillText(txt, 128, 60);
    const t = new T.CanvasTexture(c); return cardMats[k] = new T.MeshBasicMaterial({ map: t, side: T.DoubleSide }); }
  function fans(g, seats, ry, team, teamCol, palette) { const n = seats.length; if (!n) return; const lm = () => new T.MeshLambertMaterial({ color: 0xffffff });
    const top = new T.InstancedMesh(FAN.top, lm(), n), legs = new T.InstancedMesh(FAN.legs, lm(), n), head = new T.InstancedMesh(FAN.head, lm(), n), hair = new T.InstancedMesh(FAN.hair, lm(), n);
    const M4 = new T.Matrix4(), Q = new T.Quaternion(), Sv = new T.Vector3(), Pv = new T.Vector3(), Yax = new T.Vector3(0, 1, 0); const cards = [[], [], []];
    seats.forEach((p, i) => { const sc = .92 + Math.random() * .16; Q.setFromAxisAngle(Yax, ry + (Math.random() - .5) * .3); Sv.set(sc, sc, sc); Pv.set(p[0], p[1], p[2]); M4.compose(Pv, Q, Sv);
      for (const m of [top, legs, head, hair]) m.setMatrixAt(i, M4); top.setColorAt(i, teamCol && Math.random() < .85 ? teamCol : palette[Math.floor(Math.random() * palette.length)]); legs.setColorAt(i, PANTS[i % PANTS.length]); head.setColorAt(i, SKINS[Math.floor(Math.random() * SKINS.length)]); hair.setColorAt(i, HAIRS[Math.floor(Math.random() * HAIRS.length)]);
      if (Math.random() < .2) cards[Math.floor(Math.random() * 3)].push([p, ry, sc]); });
    for (const m of [top, legs, head, hair]) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; g.add(m); }
    cards.forEach((L, v) => { if (!L.length) return; const cm = new T.InstancedMesh(FAN.card, cardMat(team, v), L.length); L.forEach(([p, r, sc], i) => { Q.setFromAxisAngle(Yax, r); Sv.set(sc, sc, sc); Pv.set(p[0] + Math.sin(r) * .28, p[1] + 1.12, p[2] + Math.cos(r) * .28); M4.compose(Pv, Q, Sv); cm.setMatrixAt(i, M4); }); cm.instanceMatrix.needsUpdate = true; g.add(cm); }); }
  // The stadium bowl: pitch or oval, ad boards, stepped stands with the crowd, floodlights and the big screen.
  function buildBowl(g, sp, home, away, crowd, vs) { const fb = sp === 'football'; const FW = fb ? 42 : 50, FD = fb ? 27 : 44; const W2 = FW + 20, D2 = FD + 26; const day = !fb && bb.clock < 18.3;
    g.add(new T.HemisphereLight(day ? 0xe6f2ff : 0xc8d4ff, 0x2b3a22, day ? .35 : .25)); const sun = new T.DirectionalLight(0xfff4e0, day ? .6 : .45); sun.position.set(30, 90, 50); g.add(sun);
    // ground, pitch or oval
    const base = new T.Mesh(new T.PlaneGeometry(W2 * 2, D2 * 2), mat(fb ? '#2e6e2e' : '#357a33')); base.rotation.x = -Math.PI / 2; g.add(base);
    if (fb) { const pt = new T.Mesh(new T.PlaneGeometry(FW * 2, FD * 2), new T.MeshLambertMaterial({ map: pitchTexFootball(FW, FD) })); pt.rotation.x = -Math.PI / 2; pt.position.y = .02; g.add(pt);
      // goals with nets
      const white = mat('#ffffff'), net = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .28, side: T.DoubleSide });
      for (const s of [-1, 1]) { const gx = s * (FW - 1.2); for (const z of [-3.4, 3.4]) box(g, .18, 2.6, .18, gx, 1.3, z, white); box(g, .18, .18, 7, gx, 2.6, 0, white);
        const back = new T.Mesh(new T.PlaneGeometry(7, 2.6, 8, 4), net); back.position.set(gx + s * 1.8, 1.3, 0); back.rotation.y = Math.PI / 2; g.add(back); (g.userData.nets = g.userData.nets || []).push({ m: back, x0: back.position.x, s, kick: 0 }); const top = new T.Mesh(new T.PlaneGeometry(1.8, 7), net); top.rotation.x = -Math.PI / 2; top.position.set(gx + s * .9, 2.6, 0); g.add(top);
        for (const z of [-3.4, 3.4]) { const sd = new T.Mesh(new T.PlaneGeometry(1.8, 2.6), net); sd.position.set(gx + s * .9, 1.3, z); g.add(sd); } }
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) { box(g, .06, 1.4, .06, sx * (FW - 1.2), .7, sz * (FD - 1.2), mat('#ffd23a')); } }
    else { const ov = new T.Mesh(new T.CircleGeometry(1, 72), new T.MeshLambertMaterial({ map: fieldTexCricket() })); ov.scale.set(FW, FD, 1); ov.rotation.x = -Math.PI / 2; ov.position.y = .02; g.add(ov);
      const rope = new T.Mesh(new T.RingGeometry(.985, 1, 96), new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide })); rope.scale.set(FW, FD, 1); rope.rotation.x = -Math.PI / 2; rope.position.y = .05; g.add(rope);
      box(g, 3.2, .05, 22, 0, .04, 0, mat('#a8885a')); for (const z of [-9.2, 9.2]) box(g, 3, .06, .12, 0, .07, z, mat('#ffffff'));
      const stumps = { a: [], b: [] }; for (const [k, z] of [['a', -10], ['b', 10]]) for (const dx of [-.22, 0, .22]) { const st = box(g, .07, .75, .07, dx, .38, z, mat('#f4e3b5')); stumps[k].push(st); }
      g.userData.stumps = stumps; for (const z of [-1, 1]) { box(g, 14, 7, .6, 0, 3.5, z * (FD + 2.5), mat('#ffffff')); } }
    // ad boards around the field
    const adM = new T.MeshBasicMaterial({ map: adTex(['INDIA BAY', home ? home.name.toUpperCase() : 'WELCOME', 'BAYCART · ORDER ANYTHING', 'BAYPAY', fb ? F.league.name.toUpperCase() : CR.league.name.toUpperCase()], home ? home.col : '#1d3f9a', '#ffffff') });
    const bw = fb ? FW + 2 : FW + 4, bd = fb ? FD + 1.8 : FD + 4; for (const [w, x, z, ry] of [[bw * 2, 0, bd, Math.PI], [bw * 2, 0, -bd, 0], [bd * 2, bw, 0, -Math.PI / 2], [bd * 2, -bw, 0, Math.PI / 2]]) { const b = new T.Mesh(new T.PlaneGeometry(w, .9), adM); b.position.set(x, .45, z); b.rotation.y = ry; g.add(b); const bk = new T.Mesh(new T.PlaneGeometry(w, .9), mat('#222')); bk.position.copy(b.position); bk.rotation.y = ry + Math.PI; g.add(bk); }
    // stands: four stepped sides; the south stand sits behind the concourse
    const cA = home ? home.col : '#3a6fd8', cB = home ? (home.col2 === '#ffffff' ? '#d8d8d8' : home.col2) : '#e0e0e0'; const conc = mat('#8f8a86');
    const stands = [{ ax: 'z', s: 1, from: FD + 10.5, to: D2, len: W2 * 2 - 4 }, { ax: 'z', s: -1, from: fb ? FD + 4 : FD + 6, to: D2, len: W2 * 2 - 4 }, { ax: 'x', s: 1, from: fb ? FW + 4.5 : FW + 6, to: W2, len: (fb ? FD + 3 : FD + 5) * 2 }, { ax: 'x', s: -1, from: fb ? FW + 4.5 : FW + 6, to: W2, len: (fb ? FD + 3 : FD + 5) * 2 }];
    const sections = []; const cg = new T.BoxGeometry(.5, .75, .4); const cm = new T.MeshLambertMaterial({ color: 0xffffff }); const palette = [cA, cA, cA, cB, cA, '#f4f1ea', cA, cB, '#e8c9a0'].map(c => new T.Color(c)); const awayCol = away ? new T.Color(away.col) : null;
    stands.forEach((S, si) => { const rows = Math.max(3, Math.floor((S.to - S.from) / 1.6)); for (let k = 0; k < rows; k++) { const h = 1 + k * 1.05, c = S.from + (k + .5) * 1.6; const m = k % 2 ? conc : mat(k % 4 === 0 ? cA : '#a7a29d');
        if (S.ax === 'z') box(g, S.len, h, 1.6, 0, h / 2, S.s * c, m); else box(g, 1.6, h, S.len, S.s * c, h / 2, 0, m); }
      // a roof over each stand
      const rd = S.to - S.from + 2, rc = (S.from + S.to) / 2 + 1; const ry = 2 + rows * 1.05 + 4.5; if (S.ax === 'z') box(g, S.len + 2, .5, rd, 0, ry, S.s * rc, mat('#d9d6d0')); else box(g, rd, .5, S.len + 2, S.s * rc, ry, 0, mat('#d9d6d0'));
      if (!crowd) return; const nSec = 4; const fry = S.ax === 'z' ? (S.s > 0 ? Math.PI : 0) : (S.s > 0 ? -Math.PI / 2 : Math.PI / 2);
      for (let q = 0; q < nSec; q++) { const seats = []; const L0 = -S.len / 2 + q * S.len / nSec, L1 = L0 + S.len / nSec;
        for (let k = 0; k < rows; k++) for (let a = L0 + .6; a < L1 - .3; a += 1.05) { if (Math.random() < .12) continue; const c = S.from + (k + .5) * 1.6, y = 1 + k * 1.05 + .02; seats.push(S.ax === 'z' ? [a, y, S.s * c] : [S.s * c, y, a]); }
        const awayEnd = !!awayCol && si === 1 && q === 0; const sec = new T.Group(); g.add(sec); fans(sec, seats, fry, awayEnd ? away : home, awayEnd ? awayCol : null, palette);
        const mid = (L0 + L1) / 2; const ang = Math.atan2(S.ax === 'z' ? S.s * (S.from + 6) : mid, S.ax === 'z' ? mid : S.s * (S.from + 6)); sections.push({ m: sec, ph: ang }); } });
    // floodlights at the corners
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = sx * (W2 - 3), z = sz * (D2 - 3); box(g, .8, 40, .8, x, 20, z, mat('#6b6f76')); const panel = box(g, 7, 4, .6, x, 41, z, new T.MeshBasicMaterial({ color: 0xfff6d8 })); panel.lookAt(0, 0, 0); }
    // the big screen above the north stand
    const scr = document.createElement('canvas'); scr.width = 768; scr.height = 256; const st = new T.CanvasTexture(scr); const screen = new T.Mesh(new T.PlaneGeometry(24, 8), new T.MeshBasicMaterial({ map: st })); screen.position.set(0, 22, -(D2 - 2)); g.add(screen);
    box(g, 25, 9, .6, 0, 22, -(D2 - 1.6), mat('#1b1b1f'));
    // the concourse in front of the south stand: stalls for snacks, jerseys and bets
    const z0 = FD + 1.5, z1 = FD + 10.5, zc = (z0 + z1) / 2; box(g, W2 * 2, .12, z1 - z0, 0, .06, zc, mat('#7d7873'));
    const label = (w, h, cw, chh, x, y, z, bg, fg, text, px) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: canvasTex(cw, chh, (x2, W3, H3) => { x2.fillStyle = bg; x2.fillRect(0, 0, W3, H3); x2.fillStyle = fg; x2.font = `800 ${px}px "Baloo 2", sans-serif`; x2.textAlign = 'center'; x2.textBaseline = 'middle'; x2.fillText(text, W3 / 2, H3 / 2 + 3, W3 - 20); }) })); m.position.set(x, y, z); g.add(m); return m; };
    const stall = (x, name, col) => { box(g, 7, 3, 1.4, x, 1.5, z1 - .7, mat(col)); box(g, 7.4, .3, 2.2, x, 3.15, z1 - 1, mat('#f4f1ea')); label(6.5, 1.1, 512, 88, x, 3.95, z1 - 2.12, col, '#ffffff', name, 54); };
    stall(-16, 'SNACKS & CHAI', '#c0392b'); stall(16, home ? home.short + ' TEAM SHOP' : 'TEAM SHOP', home ? home.col : '#1d3f9a'); stall(-34, 'BETS · 18+', '#5b3fa0'); box(g, 9, 3.4, 1, 0, 1.7, z1 - .5, mat('#2b2b30'));
    label(8, 1.1, 512, 72, 0, 3.8, z1 - 1.02, '#2b2b30', '#ffc93c', vs || 'STANDS · TAKE YOUR SEAT', 46);
    return { FW, FD, W2, D2, z0, z1, zc, sections, nets: g.userData.nets || [], screen: { c: scr, t: st } }; }

  let V = null; // the stadium visit: { sp, f, res, bowl, players, ball, ... }
  function enter(poi, sp, f, vip) { const team = sp === 'cricket' ? CR.byId(poi.extra) : F.byId(poi.extra); const away = f ? f.away : null; const S = f ? SP[sp].status(f) : null;
    const fb = sp === 'football'; const FW = fb ? 42 : 50, FD = fb ? 27 : 44, W2 = FW + 20, D2 = FD + 26;
    const venue = { poi, name: poi.name, w: W2 * 2, d: D2 * 2, bg: fb || bb.clock >= 18.3 ? '#0b1430' : '#8fc6f2', exitName: 'Exit · back to the street', exit: { x: W2 - 3, z: FD + 6 }, start: { x: W2 - 8, z: FD + 6, h: -Math.PI / 2 },
      blk: [[-W2, -D2, W2, FD + 1.5], [-W2, FD + 10.5, W2, D2]],
      build: g => { const bowl = buildBowl(g, sp, team, away, !!f, f ? `${f.home.short} v ${f.away.short} · TAKE YOUR SEAT` : 'STADIUM TOUR'); V = { sp, f, team, away, vip, res: S ? S.res : null, bowl, g, t: 0, cam: 'tv', fx: [] };
        if (f) { if (fb) setupFootball(); else setupCricket(); } drawScreen(true);
        const zp = FD + 8; return [{ k: 'seat', name: f ? `Take your seat · watch ${f.home.short} v ${f.away.short}` : 'Sit in the stands', x: 0, z: zp }, { k: 'snack', name: `Snacks and chai · ${bb.inr(bb.cost('fb.snack', 80))}`, x: -16, z: zp },
          { k: 'shop', name: `${team.short} team shop · jersey`, x: 16, z: zp }, { k: 'bet', name: 'Betting counter · 18+', x: -34, z: zp }]; },
      onAction: k => { if (k === 'seat') return sit(); if (k === 'snack') return snack(); if (k === 'bet') return betCounter(); if (k === 'shop') return shop(); },
      onExit: () => { if (bb.CINE && bb.CINE.on) bb.CINE.stop(); V = null; if (lamp) lamp.intensity = lampK; } };
    const lamp = bb.interScene.children.find(o => o.isPointLight), lampK = lamp ? lamp.intensity : 1; if (lamp) lamp.intensity = 0;
    bb.enterVenue(venue); bb.toast(f ? `Welcome to ${poi.name} · walk to the stand entrance and press E to take your seat` : `Stadium tour · ${poi.name}`, '#ffc93c'); if (f) roar(.18, 2); }
  function snack() { if (!bb.spend(bb.cost('fb.snack', 80), true)) return; P().hunger = Math.min(100, P().hunger + 18); P().health = Math.min(100, P().health + 4); bb.toast(V && V.sp === 'cricket' ? 'Vada pav and a cutting chai' : 'Samosa and chai', '#ffc93c'); }
  function shop() { if (!V) return; const team = V.team; const key = V.sp === 'cricket' ? 'cr.jersey' : 'fb.jersey', def = V.sp === 'cricket' ? 1299 : 999; if (P().outfit.topCol === team.col) return bb.toast(`You are already in ${team.short} colours`, team.col);
    if (!bb.spend(bb.cost(key, def), true)) return; P().outfit.topCol = team.col; if (V.sp === 'cricket') ex().cr.club = team.id; bb.applyOutfit(); bb.setDirty(); bb.toast(`New ${team.short} jersey · the stands cheer`, team.col); if (V.sp === 'football') bb.emit('football', { kind: 'jersey' }); }
  function betCounter() { if (!V) return; if (V.f && SP[V.sp].status(V.f).open) return betSheet(V.sp, V.f, () => bb.closeSheet()); bb.toast(V.f ? 'Bets on this match closed at the start · bet on other games here' : 'No match today · bet on other games here', '#d6c8e4'); setTimeout(() => open('football'), 400); }

  /* the big screen */
  function drawScreen(force) { if (!V) return; const c = V.bowl.screen.c, x = c.getContext('2d'); x.fillStyle = '#0d0d12'; x.fillRect(0, 0, c.width, c.height); x.textAlign = 'center'; x.textBaseline = 'middle';
    if (!V.f) { x.fillStyle = '#ffc93c'; x.font = '800 60px "Baloo 2", sans-serif'; x.fillText(V.team.stadium || V.team.name, 384, 96, 740); x.fillStyle = '#fff'; x.font = '600 34px "Baloo 2", sans-serif'; x.fillText('Welcome · stadium tour', 384, 176); V.bowl.screen.t.needsUpdate = true; return; }
    const sb = scoreboard(); x.fillStyle = V.f.home.col; x.fillRect(0, 0, 18, 256); x.fillStyle = V.f.away.col; x.fillRect(750, 0, 18, 256);
    x.fillStyle = '#ffffff'; x.font = '800 64px "Baloo 2", sans-serif'; x.fillText(sb.big, 384, 100, 720); x.fillStyle = '#ffc93c'; x.font = '700 36px "Baloo 2", sans-serif'; x.fillText(sb.small, 384, 186, 720); V.bowl.screen.t.needsUpdate = true; }
  function scoreboard() { const f = V.f; if (V.sp === 'football') { const c = F.clock(bb.clock); const [h, a] = F.scoreAt(V.res, f, c.state === 'pre' ? 0 : c.state === 'ft' ? 90 : c.min); return { big: `${f.home.short} ${h} – ${a} ${f.away.short}`, small: c.state === 'pre' ? `Kick-off in ${Math.ceil(c.toKick)} min` : c.state === 'ht' ? 'Half-time' : c.state === 'ft' ? 'Full time' : `${c.min}'`, h, a, c }; }
    const c = CR.clock(bb.clock), res = V.res; if (c.state === 'pre') return { big: `${f.home.short} v ${f.away.short}`, small: `Starts in ${Math.ceil(c.toKick)} min · ${res.batFirst.short} bat first` };
    const a = CR.inningsAt(res.i1, c.inn === 1 && c.state === 'live' ? c.f : 1); const ov = b => `${Math.floor(b / 6)}.${b % 6}`;
    if (c.state === 'ft') return { big: `${res.batFirst.short} ${res.i1.runs}/${res.i1.w} · ${res.chase.short} ${res.i2.runs}/${res.i2.w}`, small: res.winner ? `${res.winner.name} won by ${res.margin}` : 'Match tied' };
    if (c.inn === 1) return { big: `${res.batFirst.short} ${a.runs}/${a.w}`, small: c.state === 'break' ? `Innings break · target ${res.i1.runs + 1}` : `${ov(a.balls)} overs · run rate ${(a.balls ? a.runs * 6 / a.balls : 0).toFixed(2)}` };
    const b = CR.inningsAt(res.i2, c.f); const need = res.i1.runs + 1 - b.runs; return { big: `${res.chase.short} ${b.runs}/${b.w} (${ov(b.balls)})`, small: need > 0 ? `Need ${need} off ${120 - b.balls} · target ${res.i1.runs + 1}` : `${res.chase.short} reach the target!` }; }

  /* football players */
  const FORM = [[-.93, 0], [-.62, -.6], [-.66, -.2], [-.66, .2], [-.62, .6], [-.22, -.62], [-.27, -.2], [-.27, .2], [-.22, .62], [.2, -.22], [.25, .22]];
  function setupFootball() { const { FW, FD } = V.bowl; V.players = []; for (let t = 0; t < 2; t++) for (let i = 0; i < 11; i++) { const team = t ? V.f.away : V.f.home; const col = i === 0 ? (t ? '#2f2f2f' : '#9be24a') : team.col; const p = personMesh(col); V.g.add(p);
      const q = { t, i, p, x: (t ? 1 : -1) * (6 + Math.random() * 20), z: (Math.random() - .5) * FD, h: 0, sp: 0 }; p.position.set(q.x, 0, q.z); V.players.push(q); }
    // the referee and two assistant referees with flags (Beta v1.01.26)
    V.refs = [['#111111', 'ref'], ['#ffd23a', 'ar1'], ['#ffd23a', 'ar2']].map(([c, k]) => { const p = personMesh(c); V.g.add(p); if (k !== 'ref') { const fl = new T.Mesh(new T.BoxGeometry(.3, .22, .02), mat('#ff4d2e')); fl.position.set(0, -.55, .12); (p.userData.fores ? p.userData.fores[1] : p.userData.arms[1]).add(fl); } return { p, k, x: 0, z: k === 'ar1' ? -(FD + .8) : k === 'ar2' ? FD + .8 : 6, h: 0 }; });
    const ballTex = canvasTex(128, 64, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#1b1b1f'; for (let i = 0; i < 9; i++) { x.beginPath(); x.arc((i % 5) * 30 + (i > 4 ? 15 : 0), i > 4 ? 44 : 18, 7, 0, 6.3); x.fill(); } });
    const ball = new T.Mesh(new T.SphereGeometry(.28, 14, 10), new T.MeshLambertMaterial({ map: ballTex })); V.g.add(ball); V.ball = { m: ball, x: 0, z: 0, y: .28, owner: -1, fl: null, passT: 1 };
    const c = F.clock(bb.clock); const min = c.state === 'pre' ? 0 : c.state === 'ft' ? 99 : c.min; V.goalsShown = V.res.goals.filter(g => g.m < min).length; V.seq = null; kickoff(0); V.state = c.state; }
  function kickoff(team) { const b = V.ball; b.x = 0; b.z = 0; b.y = .28; b.fl = null; b.owner = team * 11 + 9; b.passT = 1.5; }
  function fbDir() { const c = F.clock(bb.clock); return c.state === 'ft' || (c.state === 'live' && c.min > 45) ? -1 : 1; }
  function fbTick(dt, t) { const { FW, FD } = V.bowl; const c = F.clock(bb.clock); const b = V.ball, PL = V.players; const dir = fbDir(); const live = c.state === 'live';
    if (c.state !== V.state) { if (c.state === 'live' && (V.state === 'pre' || V.state === 'ht')) { kickoff(V.state === 'ht' ? 1 : 0); roar(.25, 2); bb.toast(V.state === 'pre' ? 'Kick-off!' : 'Second half underway', '#ffc93c'); } if (c.state === 'ht') bb.toast('Half-time · dhol players in the stands', '#d6c8e4'); if (c.state === 'ft') fullTime(); V.state = c.state; }
    // a goal is due: the scoring team attacks and puts it away
    if (!V.seq && V.goalsShown < V.res.goals.length && (live || c.state === 'ft') && V.res.goals[V.goalsShown].m <= (c.state === 'ft' ? 99 : c.min)) { const g = V.res.goals[V.goalsShown]; const tm = g.team === V.f.home.id ? 0 : 1; V.seq = { g, tm, ph: 'run', t: 0, sc: tm * 11 + 9 + Math.floor(Math.random() * 2) }; b.owner = V.seq.sc; b.fl = null; }
    const ad = tm => tm === 0 ? dir : -dir; // attack direction of a team
    if (V.seq) { const s = V.seq; s.t += dt; const att = ad(s.tm); const sc = PL[s.sc];
      if (s.ph === 'run') { sc.tx = att * (FW - 13); sc.tz = (sc.z) * .6; if (Math.abs(sc.x - sc.tx) < 1.5 || s.t > 4) { s.ph = 'shot'; s.t = 0; b.owner = -1; sc.kickT = .35; const gz = (Math.random() < .5 ? -1 : 1) * (1.2 + Math.random() * 2); b.fl = { fx: b.x, fz: b.z, tx: att * (FW - 1.2 + 1.5), tz: gz, t: 0, dur: .6, arc: .9 }; const gk = PL.find(q => q.i === 0 && q.t !== s.tm); if (gk) gk.dive = { t: .9, tz: -gz * .6, dir: -Math.sign(gz) }; } }
      else if (s.ph === 'shot' && !b.fl) { s.ph = 'cele'; s.t = 0; const nt = V.bowl.nets.find(n => n.s === att); if (nt) nt.kick = 1; b.inNet = { x: b.x, z: b.z, t: 0 }; s.corner = { x: att * (FW - 2), z: (Math.random() < .5 ? -1 : 1) * (FD - 2) }; const home = s.tm === 0; bb.big(home ? 'GOAL!' : 'Goal…', home ? V.f.home.col : '#d6c8e4'); roar(home ? .5 : .14, home ? 3.2 : 1.4); V.goalsShown++; V.bounce = home ? 6 : 1.5; drawScreen(); const tn = home ? V.f.home : V.f.away; if (bb.CINE && bb.CINE.on) bb.CINE.setSub(`${s.g.m}' · ${tn.name} score through ${s.g.by}`); if (home) burstAt(0, 30, -(V.bowl.D2 - 8)); }
      else if (s.ph === 'cele') { const cn = s.corner || { x: att * (FW - 3), z: FD - 3 }; for (const q of PL) if (q.t === s.tm && q.i) { const k = PL.indexOf(q) === s.sc ? 0 : 1.5 + (q.i % 4); q.tx = cn.x - att * k * .8; q.tz = cn.z - Math.sign(cn.z) * k * .7 + (q.i % 2 ? .6 : -.6); } if (b.inNet) { b.inNet.t += dt; b.x = b.inNet.x; b.z = b.inNet.z; b.y = Math.max(.28, .9 - b.inNet.t * 2); } if (s.t > 6.5) { V.seq = null; b.inNet = null; kickoff(1 - s.tm); } } }
    else if (live) { // normal play: pass, dribble, tackle
      if (b.owner >= 0) { const o = PL[b.owner]; const att = ad(o.t); o.tx = o.x + att * 5; o.tz = o.z * .92; b.passT -= dt;
        if (b.passT <= 0) { const deep = o.x * att > FW * .55; if (deep && Math.random() < .35) { b.owner = -1; o.kickT = .35; const onT = Math.random() < .45; const tz = onT ? (Math.random() - .5) * 5.6 : (Math.random() < .5 ? -1 : 1) * (4 + Math.random() * 6); b.fl = { fx: b.x, fz: b.z, tx: att * (FW + (onT ? -.9 : 2.5)), tz, t: 0, dur: .7, arc: onT ? .9 : 1.8, miss: !onT, save: onT }; const gk = PL.find(q => q.i === 0 && q.t !== o.t); if (onT && gk) gk.dive = { t: .9, tz, dir: Math.sign(tz - gk.z) || 1 }; roar(.12, 1.2); if (bb.CINE && bb.CINE.on) bb.CINE.setSub(onT ? `${(o.t ? V.f.away : V.f.home).short} shoot · great save by the keeper!` : `${(o.t ? V.f.away : V.f.home).short} shoot · just wide!`); }
          else { const mates = PL.filter(q => q.t === o.t && q !== o && q.i); const fw = mates.filter(q => (q.x - o.x) * att > -4); const to = (fw.length && Math.random() < .75 ? fw : mates)[Math.floor(Math.random() * (fw.length && Math.random() < .75 ? fw.length : mates.length))] || mates[0]; const d = Math.hypot(to.x - o.x, to.z - o.z);
            b.owner = -1; o.kickT = .3; b.fl = { fx: b.x, fz: b.z, tx: to.x + (to.tx - to.x) * .3, tz: to.z + (to.tz - to.z) * .3, t: 0, dur: Math.max(.35, d / 20), arc: d > 22 ? 2.5 : .2, to: PL.indexOf(to) }; }
          b.passT = 1.1 + Math.random() * 2; } }
      else if (!b.fl) { let best = null, bd = 1e9; for (const q of PL) { const d = Math.hypot(q.x - b.x, q.z - b.z); if (d < bd) { bd = d; best = q; } } if (best) { best.tx = b.x; best.tz = b.z; if (bd < .9) { b.owner = PL.indexOf(best); b.passT = .6 + Math.random(); } } } }
    // ball flight
    if (b.fl) { const fl = b.fl; fl.t += dt; const u = Math.min(1, fl.t / fl.dur); b.x = fl.fx + (fl.tx - fl.fx) * u; b.z = fl.fz + (fl.tz - fl.fz) * u; b.y = .28 + Math.sin(u * Math.PI) * fl.arc;
      if (u >= 1) { b.fl = null; if (fl.save) { const gk = PL.find(q => q.i === 0 && (q.x > 0) === (b.x > 0)); b.owner = gk ? PL.indexOf(gk) : -1; b.passT = 2; } else if (fl.miss) { const gk = PL.find(q => q.i === 0 && (q.x > 0) === (b.x > 0)); b.owner = gk ? PL.indexOf(gk) : -1; b.passT = 1.5; }
        else if (fl.to != null) { const opp = PL.filter(q => q.t !== PL[fl.to].t).sort((a, c2) => Math.hypot(a.x - b.x, a.z - b.z) - Math.hypot(c2.x - b.x, c2.z - b.z))[0]; b.owner = Math.random() < .22 && opp && Math.hypot(opp.x - b.x, opp.z - b.z) < 6 ? PL.indexOf(opp) : fl.to; b.passT = .8 + Math.random() * 1.5; } } }
    // everyone else holds the shape and shifts with the ball
    const poss = b.owner >= 0 ? PL[b.owner].t : -1;
    for (const q of PL) { const isOwner = b.owner === PL.indexOf(q); const inSeq = V.seq && (V.seq.ph === 'cele' && q.t === V.seq.tm || PL.indexOf(q) === V.seq.sc);
      if (!isOwner && !inSeq && !(b.owner < 0 && !b.fl && q.tx === b.x)) { const att = ad(q.t); const [fx, fz] = FORM[q.i]; let tx = att * fx * FW * .92 + (q.i ? b.x * .38 : 0) + (poss === q.t ? att * FW * .1 : 0), tz = fz * FD * .9 + b.z * (q.i ? .25 : .12);
        if (c.state === 'pre') { tx = (q.t ? 1 : -1) * (10 + (q.i % 5) * 5) + Math.sin(t * .5 + q.i) * 3; tz = ((q.i % 4) - 1.5) * 8 + Math.cos(t * .4 + q.i) * 3; }
        if (c.state === 'ht') { tx = (q.t ? 1 : -1) * 4 + (q.i - 5) * .9 * 0; tz = FD + 1; }
        if (c.state === 'ft') { tx = (q.i - 5) * 1.4 + (q.t ? 9 : -9); tz = 0; }
        q.tx = Math.max(-FW + .5, Math.min(FW - .5, tx)); q.tz = Math.max(-FD + .5, Math.min(FD + 1, tz)); } }
    // move and animate
    for (const q of PL) { const dx = q.tx - q.x, dz = q.tz - q.z, d = Math.hypot(dx, dz); const vmax = (b.owner === PL.indexOf(q) ? 5.2 : V.seq && V.seq.ph === 'cele' ? 6.5 : c.state === 'live' ? 6 : 2.5); const v = d > .3 ? Math.min(vmax, d * 2.5) : 0;
      if (v > 0) { q.x += dx / d * v * dt; q.z += dz / d * v * dt; q.h = Math.atan2(dx, dz); } q.sp = v; q.p.position.set(q.x, 0, q.z); q.p.rotation.y = q.h; const U = q.p.userData; const ph = t * 10 + q.i;
      if (q.kickT > 0) q.kickT -= dt; if (q.dive) { q.dive.t -= dt; const k = Math.max(0, q.dive.t / .9); q.z += q.dive.dir * 4 * dt * (k > .4 ? 1 : 0); q.p.position.set(q.x, Math.sin((1 - k) * Math.PI) * .6, q.z); q.p.rotation.set(0, q.h, q.dive.dir * 1.3 * Math.min(1, (1 - k) * 3), 'YXZ'); if (q.dive.t <= 0) { q.dive = null; q.p.rotation.set(0, q.h, 0); } }
      if (U.legs) { const a = Math.sin(ph) * Math.min(.8, v / 6); U.legs[0].rotation.x = q.kickT > 0 ? -1.4 * Math.sin((1 - q.kickT / .35) * Math.PI) : a; U.legs[1].rotation.x = -a; } if (U.arms) { const cele = (V.seq && V.seq.ph === 'cele' && q.t === V.seq.tm) || (c.state === 'ft' && ((V.res.hg > V.res.ag && q.t === 0) || (V.res.ag > V.res.hg && q.t === 1))); U.arms[0].rotation.x = cele ? -2.8 : -Math.sin(ph) * .5; U.arms[1].rotation.x = cele ? -2.8 : Math.sin(ph) * .5; } }
    if (b.owner >= 0) { const o = PL[b.owner]; b.x = o.x + Math.sin(o.h) * .6; b.z = o.z + Math.cos(o.h) * .6; b.y = .28; }
    const bsp = Math.hypot(b.x - (b.px || b.x), b.z - (b.pz || b.z)) / Math.max(dt, 1e-3); b.px = b.x; b.pz = b.z; b.m.rotation.x += bsp * dt / .28; b.m.rotation.z += bsp * dt * .2;
    for (const n of V.bowl.nets || []) { n.kick = Math.max(0, n.kick - dt * 1.2); n.m.position.x = n.x0 + n.s * Math.sin(n.kick * Math.PI) * .7; n.m.scale.y = 1 + n.kick * .05; }
    for (const r of V.refs || []) { let tx, tz; if (r.k === 'ref') { tx = b.x - 8 * Math.sign(b.x || 1) * .3; tz = b.z + (b.z > 0 ? -9 : 9); } else { tx = Math.max(-FW + 2, Math.min(FW - 2, b.x * .9)); tz = r.k === 'ar1' ? -(FD + .8) : FD + .8; } if (c.state === 'ht' || c.state === 'pre') { tx = r.k === 'ref' ? 0 : r.k === 'ar1' ? -2 : 2; tz = c.state === 'pre' ? 0 : FD + 1; }
      const dx = tx - r.x, dz = tz - r.z, d = Math.hypot(dx, dz); const v = d > .4 ? Math.min(5, d * 1.5) : 0; if (v) { r.x += dx / d * v * dt; r.z += dz / d * v * dt; r.h = Math.atan2(b.x - r.x, b.z - r.z); } r.p.position.set(r.x, 0, r.z); r.p.rotation.y = r.k === 'ref' ? r.h : (r.k === 'ar1' ? 0 : Math.PI); const U = r.p.userData; if (U.legs) { const a = Math.sin(t * 9 + (r.k === 'ref' ? 0 : 2)) * Math.min(.7, v / 6); U.legs[0].rotation.x = a; U.legs[1].rotation.x = -a; } if (U.arms && r.k !== 'ref') U.arms[1].rotation.x = V.seq && V.seq.ph === 'cele' ? -.2 : -.5; }
    b.m.position.set(b.x, b.y, b.z); b.m.visible = c.state !== 'pre' && c.state !== 'ht'; }

  /* cricket players */
  const FIELD = [[0, 13.5], [2.6, 14.6], [6.5, 13], [-19, 8], [-24, -6], [-9, -27], [9, -27], [23, -3], [20, 12], [14, 36], [-15, 35]]; // keeper first, bowler is extra
  function setupCricket() { const res = V.res; V.players = []; V.cr = { ph: 'idle', t: 0, inn: 0, out: null, lastBalls: -1 };
    const mk = (col, x, z, role, t) => { const p = personMesh(col); V.g.add(p); const q = { p, x, z, tx: x, tz: z, h: Math.PI, role, t, i: V.players.length }; p.position.set(x, 0, z); V.players.push(q); return q; };
    V.mk = mk; V.bat = null; placeCricket(true);
    const ball = new T.Mesh(new T.SphereGeometry(.16, 8, 6), mat('#e8e2d0')); V.g.add(ball); V.ball = { m: ball, x: 0, y: -5, z: 0 }; V.state = CR.clock(bb.clock).state; }
  function placeCricket(first) { const res = V.res; const c = CR.clock(bb.clock); const inn = c.state === 'live' || c.state === 'break' ? c.inn : c.state === 'ft' ? 2 : 1; if (!first && V.cr.inn === inn) return; V.cr.inn = inn;
    for (const q of V.players) V.g.remove(q.p); V.players = []; const bat = inn === 1 ? res.batFirst : res.chase, fld = inn === 1 ? res.chase : res.batFirst; V.batT = bat; V.fldT = fld;
    FIELD.forEach(([x, z], i) => V.mk(i === 0 ? '#2f2f2f' : fld.col, x, z, i === 0 ? 'keeper' : 'field', 1)); V.bowler = V.mk(fld.col2 === '#1a1a1a' ? fld.col : fld.col, 1.2, -24, 'bowler', 1);
    V.striker = V.mk(bat.col, .7, 9.6, 'bat', 0); V.non = V.mk(bat.col, -.9, -9.4, 'bat', 0); V.striker.h = Math.PI; V.non.h = 0; V.umpire = V.mk('#f4f1ea', -1.3, -12, 'ump', 2); }
  function crTick(dt, t) { const res = V.res, c = CR.clock(bb.clock), cr = V.cr, b = V.ball; const { FW, FD } = V.bowl;
    if (c.state !== V.state) { if (c.state === 'live') { placeCricket(false); roar(.22, 2); bb.toast(c.inn === 1 ? `${res.batFirst.name} start their innings` : `${res.chase.name} need ${res.i1.runs + 1} to win`, '#ffc93c'); } if (c.state === 'break') bb.toast('Innings break · cheerleaders and music', '#d6c8e4'); if (c.state === 'ft') fullTime(); V.state = c.state; }
    if (c.state === 'live') { cr.t += dt; const inn = c.inn === 1 ? res.i1 : res.i2;
      if (cr.ph === 'idle' && cr.t > .4) { cr.ph = 'run'; cr.t = 0; // pick what this ball will be from the over being bowled right now
        const now = CR.inningsAt(inn, c.f); const overI = Math.min(inn.overs.length - 1, Math.floor(now.balls / 6)); const over = inn.overs[Math.max(0, overI)] || { ro: 7, fell: 0 };
        let out = 0; const wDue = cr.lastW != null && now.w > cr.lastW; cr.lastW = now.w; if (wDue) out = 'W'; else { const r = Math.random(), ro = over.ro; out = r < ro / 70 ? 6 : r < ro / 70 + ro / 32 ? 4 : r < .62 ? 1 : r < .7 ? 2 : 0; } cr.out = out; }
      const bw = V.bowler, st = V.striker;
      if (cr.ph === 'run') { const u = Math.min(1, cr.t / 1.4); bw.x = 1.2; bw.z = -24 + u * 13; bw.h = 0; bw.sp = 6; if (u >= 1) { cr.ph = 'bowl'; cr.t = 0; } b.y = -5; }
      else if (cr.ph === 'bowl') { const u = Math.min(1, cr.t / .5); b.x = .9 - u * .3; b.z = -10 + u * 19.4; b.y = u < .7 ? 2.2 - u / .7 * 2.1 : .1 + (u - .7) / .3 * .7; bw.sp = 2; if (u >= 1) { cr.ph = 'hit'; cr.t = 0; const o = cr.out; const a = (Math.random() - .5) * 5.2 + Math.PI; const dist = o === 6 ? 1.25 : o === 4 ? 1.02 : o === 2 ? .62 : o === 1 ? .38 : o === 'W' ? 0 : .14;
          // where the ball goes: scaled to the oval
          cr.hit = { a, d: dist, tx: Math.sin(a) * FW * dist, tz: 9 + Math.cos(a) * FD * dist, air: o === 6 ? 18 : o === 4 ? .2 : o === 1 || o === 2 ? .8 : 0 }; announce(o); } }
      else if (cr.ph === 'hit') { const o = cr.out, h = cr.hit; const dur = o === 6 ? 2 : o === 4 ? 1.6 : o === 'W' ? .6 : 1.3; const u = Math.min(1, cr.t / dur);
        if (o === 'W') { b.y = -5; const stp = V.g.userData.stumps && V.g.userData.stumps.b; if (stp) stp.forEach((s, i) => { s.rotation.z = (i - 1) * u * .9; s.rotation.x = -u * .7; s.position.y = .38 + Math.sin(u * Math.PI) * .6; }); }
        else { b.x = h.tx * u; b.z = 9.4 + (h.tz - 9.4) * u; b.y = .15 + Math.sin(u * Math.PI) * h.air; st.h = h.a; }
        // a fielder chases it; the batters run on 1s and 2s
        let near = null, nd = 1e9; for (const q of V.players) if (q.role === 'field') { const d = Math.hypot(q.x - h.tx, q.z - h.tz); if (d < nd) { nd = d; near = q; } } if (near && o !== 6 && o !== 'W') { near.tx = h.tx; near.tz = h.tz; }
        if (o === 1 || o === 2) { const k = Math.min(1, cr.t / (dur * .9)) * o; const n = Math.min(o, Math.floor(k)), leg = k >= o ? 0 : k - n; const going = n % 2 === 0;
          st.z = going ? 9.6 - 19 * leg : -9.4 + 19 * leg; V.non.z = going ? -9.4 + 19 * leg : 9.6 - 19 * leg; }
        if (u >= 1) { cr.ph = 'reset'; cr.t = 0; if (o === 1) { const tmp = V.striker; V.striker = V.non; V.non = tmp; } } }
      else if (cr.ph === 'reset') { if (cr.t > 1.1) { cr.ph = 'idle'; cr.t = 0; b.y = -5; const stp = V.g.userData.stumps && V.g.userData.stumps.b; if (stp) stp.forEach(s => { s.rotation.set(0, 0, 0); s.position.y = .38; }); V.striker.x = .7; V.striker.z = 9.6; V.striker.h = Math.PI; V.non.x = -.9; V.non.z = -9.4; V.non.h = 0; FIELD.forEach(([x, z], i) => { const q = V.players[i]; if (q) { q.tx = x; q.tz = z; } }); V.bowler.z = -24; } } }
    else { b.y = -5; for (const q of V.players) if (q.role !== 'ump') { if (c.state === 'ft') { const win = res.winner; q.tx = (q.t === 0 ? -6 : 6) + Math.sin(q.i) * 4; q.tz = -2 + Math.cos(q.i) * 3; } else if (c.state === 'pre' || c.state === 'break') { q.tx = Math.sin(t * .3 + q.i) * 25; q.tz = Math.cos(t * .27 + q.i * 1.7) * 22; } } }
    for (const q of V.players) { if (q === V.bowler && (cr.ph === 'run' || cr.ph === 'bowl')) { q.p.position.set(q.x, 0, q.z); q.p.rotation.y = 0; anim(q, t, 6); continue; } if (q.role === 'bat' && c.state === 'live') { q.p.position.set(q.x, 0, q.z); q.p.rotation.y = q.h; anim(q, t, cr.ph === 'hit' && (cr.out === 1 || cr.out === 2) ? 6 : 0); continue; }
      const dx = q.tx - q.x, dz = q.tz - q.z, d = Math.hypot(dx, dz); const v = d > .3 ? Math.min(c.state === 'live' ? 7 : 2.2, d * 2) : 0; if (v) { q.x += dx / d * v * dt; q.z += dz / d * v * dt; q.h = Math.atan2(dx, dz); } else if (c.state === 'live') q.h = Math.atan2(-q.x, 9 - q.z);
      q.p.position.set(q.x, 0, q.z); q.p.rotation.y = q.h; const cele = c.state === 'ft' && res.winner && ((q.t === 0 && V.batT === res.winner) || (q.t === 1 && V.fldT === res.winner)); anim(q, t, v, cele); }
    b.m.position.set(b.x, b.y, b.z); b.m.visible = b.y > -1; }
  function anim(q, t, v, cele) { const U = q.p.userData; const ph = t * 10 + q.i; if (U.legs) { const a = Math.sin(ph) * Math.min(.8, v / 6); U.legs[0].rotation.x = a; U.legs[1].rotation.x = -a; } if (U.arms) { U.arms[0].rotation.x = cele ? -2.8 : -Math.sin(ph) * .4 * Math.min(1, v / 3); U.arms[1].rotation.x = cele ? -2.8 : q.role === 'bat' ? -.9 : Math.sin(ph) * .4 * Math.min(1, v / 3); } }
  function announce(o) { const bt = V.batT; const lines = { 6: ['SIX!', `${bt.short} launch it into the stands`], 4: ['FOUR!', 'Races away to the boundary'], 'W': ['OUT!', `Bowled him! ${V.fldT.short} strike`], 2: ['', 'Pushed into the gap · they come back for two'], 1: ['', 'Nudged away for a single'], 0: ['', V.cr.out === 0 && Math.random() < .5 ? 'Dot ball · beaten outside off' : 'Defended back to the bowler'] }[o];
    if (lines[0]) { bb.big(lines[0], o === 'W' ? V.fldT.col : V.batT.col); roar(o === 'W' ? .3 : .4, 2.4); V.bounce = 3; } if (bb.CINE && bb.CINE.on) bb.CINE.setSub(lines[1]); }

  /* crowd, fireworks inside the bowl */
  function burstAt(x, y, z) { const n = 60, pos = new Float32Array(n * 3), vel = []; for (let i = 0; i < n; i++) { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; const a = Math.random() * 6.283, e = Math.acos(Math.random() * 2 - 1), s = 8 + Math.random() * 5; vel.push([Math.sin(e) * Math.cos(a) * s, Math.cos(e) * s, Math.sin(e) * Math.sin(a) * s]); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); const m = new T.PointsMaterial({ color: V.team.col, size: 1.2, transparent: true, depthWrite: false, blending: T.AdditiveBlending }); const pt = new T.Points(g, m); V.g.add(pt); V.fx.push({ pt, vel, life: 1.8 }); }
  function fxTick(dt, t) { const B = V.bowl; V.bounce = Math.max(0, (V.bounce || 0) - dt); const wave = Math.sin(t * .15) > .7; for (const s of B.sections) { s.m.position.y = V.bounce > 0 ? Math.abs(Math.sin(t * 9 + s.ph * 3)) * .35 : wave ? Math.max(0, Math.sin(t * 2.2 - s.ph * 2)) * .5 : Math.abs(Math.sin(t * 3 + s.ph * 5)) * .05; }
    for (let i = V.fx.length - 1; i >= 0; i--) { const f = V.fx[i]; f.life -= dt; const a = f.pt.geometry.attributes.position; for (let k = 0; k < f.vel.length; k++) { const v = f.vel[k]; v[1] -= 6 * dt; a.array[k * 3] += v[0] * dt; a.array[k * 3 + 1] += v[1] * dt; a.array[k * 3 + 2] += v[2] * dt; } a.needsUpdate = true; f.pt.material.opacity = Math.max(0, f.life / 1.8); if (f.life <= 0) { V.g.remove(f.pt); f.pt.geometry.dispose(); f.pt.material.dispose(); V.fx.splice(i, 1); } } }
  let scrT = 0;
  bb.onUpdate((dt, now) => { if (!V || bb.insideVenue == null || !bb.insideVenue.poi) return; V.t += dt; if (V.f) { if (V.sp === 'football') fbTick(dt, now); else crTick(dt, now); } fxTick(dt, now); scrT -= dt; if (scrT <= 0) { scrT = 1; drawScreen(); if (bb.CINE && bb.CINE.on && V.f) topBar(); } });

  /* taking your seat: the broadcast view */
  function topBar() { const sb = scoreboard(); bb.CINE.setTop(`<div class="sc"><em style="background:${V.f.home.col}"></em>${esc(sb.big)}<em style="background:${V.f.away.col}"></em></div><div class="tm">${esc(sb.small)}</div>`); }
  function sit() { if (!V || !bb.CINE) return; const fb = V.sp === 'football'; const { FD, D2 } = V.bowl; const seatZ = FD + 14; const camNames = { tv: '📺 TV camera', seat: '🪑 Your seat', top: '🚁 Spider-cam' }; const order = ['tv', 'seat', 'top'];
    bb.CINE.play({ kind: 'none', top: !!V.f, lookToggle: false, skipLabel: 'Leave seat', label: V.vip ? 'VIP box' : 'Stands', title: V.f ? `${V.f.home.name} v ${V.f.away.name}` : V.poi ? V.poi.name : 'Stadium tour', sub: V.f ? 'The stands bounce to the drums' : 'An empty stadium is a special sight',
      lines: V.f ? null : ['The groundsman rolls the pitch', 'Look up at the floodlights', 'Thousands sit here on matchday'],
      buttons: [{ id: 'cam', label: camNames[V.cam], fn: el => { V.cam = order[(order.indexOf(V.cam) + 1) % 3]; el.textContent = camNames[V.cam]; } }, { id: 'chant', label: '📣 Chant', fn: () => { const team = V.team; bb.toast(`${team.chant || 'Come on ' + team.short + '!'} · the stands join in`, team.col); roar(.2, 1.6); V.bounce = 2; } },
        { id: 'snack', label: `🍿 ${bb.inr(bb.cost('fb.snack', 80))}`, fn: snack }, { id: 'bet', label: '🎲 Bets', fn: () => { bb.CINE.stop(); betCounter(); } }],
      cam: (f, dt) => { const b = V.ball || { x: 0, z: 0, y: 0 }; const by = b.y > -1 ? b.y : 0; const bx = b.y > -1 ? b.x : 0, bz = b.y > -1 ? b.z : (fb ? 0 : 2);
        if (V.cam === 'tv') return fb ? { x: bx * .8, y: 12, z: FD + 8, lx: bx, ly: 0, lz: bz * .6 } : V.cr && V.cr.ph === 'hit' && V.cr.out !== 'W' && V.cr.out !== 0 ? { x: bx * .3, y: 16, z: -32, lx: bx, ly: by * .5, lz: bz, lookK: 4 } : { x: 0, y: 9, z: -30, lx: 0, ly: 1, lz: 8 };
        if (V.cam === 'seat') return { x: fb ? 6 : 24, y: 7.5, z: seatZ, lx: bx, ly: 1, lz: bz };
        return { x: bx, y: 34, z: bz + 18, lx: bx, ly: 0, lz: bz }; },
      onStart: () => { if (V.f) topBar(); }, onDone: () => {} }); bb.emit('stadiumSeat', { sp: V.sp }); }

  /* full time: bonus for fans, the walk out */
  function fullTime() { if (!V || !V.f || V.ended) return; V.ended = true; const f = V.f, team = V.team; const fbx = P().extra.fb || {}; const X = ex();
    let homeWin; if (V.sp === 'football') { const r = V.res; homeWin = r.hg > r.ag; bb.emit('football', { kind: 'watched', team: team.id, win: homeWin }); if (fbx) fbx.matches = (fbx.matches || 0) + 1; }
    else { homeWin = V.res.winner === f.home; bb.emit('cricket', { kind: 'watched', team: team.id, win: homeWin }); }
    X.matches = (X.matches || 0) + 1; bb.setDirty(); const mine = P().outfit.topCol === team.col || fbx.club === team.id || X.cr.club === team.id;
    bb.toast(V.sp === 'football' ? `Full time · ${f.home.short} ${V.res.hg}–${V.res.ag} ${f.away.short}${homeWin ? ' · home win! The stands erupt' : ''}` : `${V.res.winner ? V.res.winner.name + ' won by ' + V.res.margin : 'Match tied'}${homeWin ? ' · fireworks over the ground!' : ''}`, homeWin ? team.col : '#d6c8e4');
    if (homeWin) { V.bounce = 8; roar(.45, 3); for (let i = 0; i < 6; i++) setTimeout(() => V && burstAt((Math.random() - .5) * 60, 30 + Math.random() * 15, -(V.bowl.D2 - 10) + Math.random() * 20), i * 450); if (mine) { bb.earn(bb.price(150), 'football'); bb.toast(`Fan bonus · +${bb.inr(bb.price(150))}`, '#3ddc97'); } }
    setTimeout(() => { if (bb.CINE && bb.CINE.on && V) { bb.CINE.stop(); bb.toast('The match is over · walk to the exit when you are ready', '#d6c8e4'); } }, 9000); }

  bb.SPORTS = { open, enter, betSheet, odds, KB, SP, settle };
});
