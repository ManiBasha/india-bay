// In-game radio: four stations of generated, royalty-free music with presenters and fake ads.
// Starts only when the player turns it on (R or Phone → Radio); the on/off choice and station are remembered.
window.BBFeatures.push(function (bb) {
  const STATIONS = [
    { id: 'bambai', name: 'Bambai Beats 98.3', bpm: 112, root: 220, scale: [0, 2, 4, 7, 9, 12, 14], drum: 'filmi', host: 'RJ Pinky' },
    { id: 'rangeela', name: 'Rangeela FM 104', bpm: 96, root: 196, scale: [0, 1, 4, 5, 7, 8, 11, 12], drum: 'folk', host: 'Padharo Pappu' },
    { id: 'garba', name: 'Garba Junction 91.1', bpm: 132, root: 233, scale: [0, 2, 4, 5, 7, 9, 11, 12], drum: 'garba', host: 'DJ Dandiya' },
    { id: 'talk', name: 'Talk Bay AM 720', bpm: 70, root: 147, scale: [0, 3, 5, 7, 10, 12], drum: 'none', host: 'Uncle Mike' }];
  const HOST = ['Traffic update: the Western Express Highway is moving at the speed of a sleepy tortoise.', 'Weather: chance of chai. Very high chance of chai.', 'If you can hear this, your auto has a better radio than my car.', 'Shout-out to the bus driver who waited for me today. Legend.', 'Reminder: helmets look cool. Fines do not.', 'Caller says the vada pav at Dadar is the best. Pune callers, please calm down.', 'Next song is dedicated to everyone stuck at the toll plaza.', 'We are live from the Bay, and the Bay is live from us.'];
  const ADS = ['Chaiwala Express: chai so strong, your phone charges faster.', 'Jugaad Insurance: if it breaks, we fix it with tape. Terms and tape apply.', 'Aunty\'s Tiffin Service: just like home, but someone else washes the dabba.', 'PotholePro tyres: made for Indian roads, tested on the moon.', 'Matrimonial dot Bay: your mother already made your profile.', 'Sapna Homes: the flat is small, the dreams are big, the EMI is bigger.', 'Bharat Bay Bank: we keep your money safe from your cousin.', 'Do-Pahiya two-wheelers: mileage so good, the pump attendant misses you.'];
  let ac = null, out = null, cur = -1, timer = null, step = 0, songT = 0, seed = 1, mel = [], bass = [], on = false, speak = true;
  const el = document.querySelector('#radio');
  function rng() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function newSong() { const S = STATIONS[cur]; seed = Math.floor(Math.random() * 1e6) + 1; mel = []; let n = 2; for (let i = 0; i < 32; i++) { n = Math.max(0, Math.min(S.scale.length - 1, n + Math.floor(rng() * 5) - 2)); mel.push(rng() < .72 ? S.scale[n] : null); } bass = [0, 0, 7, 0, 5, 5, 7, 3].map(x => x - 12); songT = 0; }
  function tone(freq, t, dur, type, vol, dest) { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(dest || out); o.start(t); o.stop(t + dur + .05); }
  function drum(kind, t) { const o = ac.createOscillator(), g = ac.createGain(); if (kind === 'kick') { o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(45, t + .15); g.gain.setValueAtTime(.35, t); g.gain.exponentialRampToValueAtTime(.001, t + .22); }
    else if (kind === 'dhol') { o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(110, t + .08); g.gain.setValueAtTime(.22, t); g.gain.exponentialRampToValueAtTime(.001, t + .12); }
    else { o.type = 'square'; o.frequency.value = 2400 + Math.random() * 800; g.gain.setValueAtTime(.04, t); g.gain.exponentialRampToValueAtTime(.001, t + .04); } o.connect(g); g.connect(out); o.start(t); o.stop(t + .25); }
  const PAT = { filmi: { kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0], dhol: [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0], tick: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }, folk: { kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0], dhol: [0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0], tick: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1] }, garba: { kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0], dhol: [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0], tick: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0] }, none: { kick: [], dhol: [], tick: [] } };
  let nextT = 0;
  function sched() { if (!on || !ac) return; const S = STATIONS[cur]; const spb = 60 / S.bpm / 4; while (nextT < ac.currentTime + .25) { const t = nextT, s = step % 16, p = PAT[S.drum];
      if (p.kick[s]) drum('kick', t); if (p.dhol[s]) drum('dhol', t); if (p.tick[s]) drum('tick', t);
      if (S.drum === 'none') { if (s % 8 === 0) { tone(S.root * Math.pow(2, S.scale[Math.floor(Math.random() * S.scale.length)] / 12) / 2, t, spb * 7, 'sine', .05); } }
      else { const m = mel[step % 32]; if (m != null && s % 2 === 0) tone(S.root * Math.pow(2, m / 12) * 2, t, spb * 1.8, S.drum === 'folk' ? 'sawtooth' : 'triangle', .06); if (s % 4 === 0) tone(S.root * Math.pow(2, bass[(step >> 2) % 8] / 12) / 2, t, spb * 3.5, 'sine', .12); if (s === 0) tone(S.root / 2, t, spb * 16, 'sawtooth', .015); }
      step++; nextT += spb; } songT += .1; if (songT > (STATIONS[cur].drum === 'none' ? 25 : 70)) { interlude(); newSong(); } }
  function say(text) { el.innerHTML = `<div>📻 ${bb.esc(STATIONS[cur].name)}<br><span style="font-weight:500">${bb.esc(text)}</span></div><button aria-label="Turn radio off" data-roff>✕</button>`; el.querySelector('[data-roff]').onclick = () => { userStop(); bb.toast('Radio off · start it again from Phone → Radio or R', '#d6c8e4'); }; if (speak && !bb.muted && window.speechSynthesis) { try { const u = new SpeechSynthesisUtterance(text); u.lang = 'en-IN'; u.rate = 1.05; u.volume = .8; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} } }
  function interlude() { const S = STATIONS[cur]; say(Math.random() < .5 ? `${S.host}: ${bb.mpick(HOST)}` : `Ad break · ${bb.mpick(ADS)}`); }
  function start(i) { ac = bb.audio; if (!ac) return; if (!out) { out = ac.createGain(); out.gain.value = .5; out.connect(ac.destination); } cur = i; on = true; out.gain.value = bb.muted ? 0 : .5; newSong(); nextT = ac.currentTime + .05; if (!timer) timer = setInterval(sched, 100); el.hidden = false; say(`${STATIONS[i].host} on air`); bb.emit('radio', STATIONS[i].id); }
  function stop() { on = false; el.hidden = true; if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {} }
  // Radio never starts by itself. The player's last choice (on or off, and the station) is remembered.
  const pref = () => (bb.P.extra.radio = bb.P.extra.radio || { on: false, st: 0 });
  function userStart(i) { const p = pref(); p.on = true; p.st = i; bb.setDirty(); start(i); }
  function userStop() { const p = pref(); p.on = false; bb.setDirty(); stop(); }
  function cycle() { if (!bb.audio) return; if (!on) userStart(pref().st || 0); else if (cur === STATIONS.length - 1) { userStop(); bb.toast('Radio off · R turns it back on', '#d6c8e4'); return; } else userStart(cur + 1); bb.toast(`📻 ${STATIONS[cur].name}`, '#ffc93c'); }
  bb.onKey('KeyR', cycle);
  bb.on('radioSetting', en => { if (!en) userStop(); else userStart(pref().st || 0); });
  bb.on('enterVehicle', v => { const p = pref(); if (!v.spec.pedal && !on && p.on) start(p.st || 0); });
  bb.on('exitVehicle', () => { if (bb.P.phone !== 'smart') stop(); });
  bb.on('mute', m => { if (out) out.gain.value = m ? 0 : .5; if (m && window.speechSynthesis) speechSynthesis.cancel(); });
  bb.RADIO = { get on() { return pref().on; }, userStart, userStop, cycle };
  bb.addApp({ id: 'radio', label: 'Radio', icon: '📻', fn: () => bb.openSheet('Radio', on ? `Playing ${STATIONS[cur].name}` : 'Off · pick a station to start', STATIONS.map((s, i) => bb.rowHtml(i, s.name, `Host ${s.host}`, on && cur === i ? 'Playing' : 'Play', on && cur === i ? 'ghost' : '')).join('') + bb.rowHtml('off', 'Turn off', 'Stays off until you start it again', 'Off', 'ghost') + bb.rowHtml('voice', 'Presenter voice', speak ? 'Spoken and captioned' : 'Captions only', speak ? 'Captions only' : 'Speak', 'ghost'),
    s => s.onclick = e => { const id = e.target.dataset.id; if (id == null) return; if (id === 'off') userStop(); else if (id === 'voice') speak = !speak; else userStart(+id); bb.closeSheet(); }) });
});
