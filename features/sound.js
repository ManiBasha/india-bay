// Sound (Beta v1.01.21): the 🔊 button on the start screen and in the game opens one pop-up with switches for
// all sound, the background music, vehicle sounds, voice chat and calls, and the radio.
// The background music is made in the browser while you play (an original, copyright-free score: a tanpura
// drone, a bansuri-like melody in an Indian scale and soft tabla), so there is nothing to download or license.
// It starts once the game has started, gets quieter in vehicles and pauses while the radio plays.
window.BBFeatures.push(function (bb) {
  const KEY = 'ib.snd';
  const load = () => { try { return Object.assign({ music: true, veh: true, voice: true, vol: .55 }, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return { music: true, veh: true, voice: true, vol: .55 }; } };
  const S = load(); const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  bb.vehSound = S.veh !== false;
  /* ---------- the pop-up ---------- */
  function radioOn() { return !!(bb.RADIO && bb.RADIO.on); }
  function sheet() { const row = (id, ic, name, sub, on) => `<div class="row sndrow"><div class="nm">${ic} ${name}<small>${sub}</small></div><button class="tgl${on ? ' on' : ''}" data-s="${id}" role="switch" aria-checked="${on}" aria-label="${name}"><i></i></button></div>`;
    const all = !bb.muted;
    bb.openSheet('🔊 Sound', all ? 'Choose what you hear' : 'All sound is off',
      row('all', '🔈', 'All sound', 'Everything in the game', all) +
      `<div class="sndsub${all ? '' : ' off'}">` + row('music', '🎵', 'Background music', 'Gentle Indian music while you play', S.music) +
      `<label class="sndvol">Music volume<input type="range" min="0" max="1" step=".05" value="${S.vol}" data-vol></label>` +
      row('veh', '🚗', 'Vehicle sounds', 'Engines, horns and police sirens', S.veh) +
      row('voice', '🎙', 'Voice chat and calls', 'Hear players nearby and phone calls', S.voice) +
      row('radio', '📻', 'Radio', radioOn() ? 'Playing · R switches stations' : 'Off · turn it on to listen while you drive', radioOn()) + '</div>' +
      '<p class="note">Your choices are saved on this device.</p>',
      s => { s.onclick = e => { const b = e.target.closest('[data-s]'); if (!b) return; const k = b.dataset.s;
          if (k === 'all') bb.setMuted(!bb.muted);
          else if (k === 'radio') { if (!bb.started) return bb.toast('The radio plays once the game starts', '#d6c8e4'); bb.emit('radioSetting', !radioOn()); setTimeout(sheet, 150); return; }
          else { S[k] = !S[k]; save(); apply(); }
          sheet(); };
        const v = s.querySelector('[data-vol]'); if (v) v.oninput = () => { S.vol = +v.value; save(); apply(); }; }); }
  function apply() { bb.vehSound = S.veh; if (bb.VOICE) bb.VOICE.speaker = S.voice; music.set(S.music && !bb.muted); btn(); }
  // the speaker buttons show the master switch
  function btn() { const ic = bb.muted ? '🔇' : '🔊'; for (const id of ['#sndBtn', '#introMute']) { const b = document.querySelector(id); if (b && b.textContent !== ic) b.textContent = ic; } }
  const hb = document.querySelector('#sndBtn'); if (hb) hb.onclick = () => { if (bb.started && !bb.uiLock()) sheet(); };
  bb.on('mute', () => { apply(); });
  /* ---------- background music ---------- */
  const music = (() => {
    let ac = null, out = null, timer = null, on = false, want = false, beat = 0, next = 0, phrase = [], mood = null, lastNote = 0;
    const MOODS = { morning: { root: 146.8, scale: [0, 1, 4, 5, 7, 8, 11, 12], bpm: 76 }, day: { root: 164.8, scale: [0, 2, 4, 7, 9, 12, 14], bpm: 84 }, evening: { root: 155.6, scale: [0, 2, 4, 6, 7, 9, 11, 12], bpm: 72 }, night: { root: 138.6, scale: [0, 2, 3, 5, 7, 9, 10, 12], bpm: 62 } };
    const pickMood = () => { const h = bb.clock; return h >= 5 && h < 10 ? MOODS.morning : h >= 10 && h < 17 ? MOODS.day : h >= 17 && h < 21 ? MOODS.evening : MOODS.night; };
    let noise = null;
    function ctx() { if (ac) return ac; ac = bb.audio || null; if (!ac) return null; out = ac.createGain(); out.gain.value = 0; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200; out.connect(lp); lp.connect(ac.destination);
      noise = ac.createBuffer(1, ac.sampleRate * .25, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4); return ac; }
    const hz = (m, deg, oct) => m.root * Math.pow(2, ((m.scale[((deg % m.scale.length) + m.scale.length) % m.scale.length] + 12 * (oct + Math.floor(deg / m.scale.length))) / 12));
    // tanpura: a soft plucked drone on Pa, Sa, Sa, low Sa
    function tanpura(t, f) { for (const [k, del] of [[1.5, 0], [2, .55], [2, 1.1], [1, 1.65]]) { const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter(); o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = f * k; o2.frequency.value = f * k * 1.003; fl.type = 'lowpass'; fl.frequency.setValueAtTime(2400, t + del); fl.frequency.exponentialRampToValueAtTime(500, t + del + 2);
        g.gain.setValueAtTime(.0001, t + del); g.gain.exponentialRampToValueAtTime(.05, t + del + .04); g.gain.exponentialRampToValueAtTime(.0001, t + del + 2.6); o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(out); o.start(t + del); o2.start(t + del); o.stop(t + del + 2.7); o2.stop(t + del + 2.7); } }
    // bansuri: breathy sine with a slow vibrato and a little slide into the note
    function flute(t, f, dur, from) { const o = ac.createOscillator(), g = ac.createGain(), v = ac.createOscillator(), vg = ac.createGain(); o.type = 'sine'; v.frequency.value = 5.2; vg.gain.value = f * .008; v.connect(vg); vg.connect(o.frequency);
      o.frequency.setValueAtTime(from || f, t); o.frequency.exponentialRampToValueAtTime(f, t + Math.min(.12, dur * .3)); const h = ac.createOscillator(), hg = ac.createGain(); h.type = 'triangle'; h.frequency.value = f * 2; hg.gain.value = .12; h.connect(hg); hg.connect(g);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.075, t + .09); g.gain.setValueAtTime(.065, t + dur * .7); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(out);
      for (const x of [o, v, h]) { x.start(t); x.stop(t + dur + .05); } }
    // tabla: "dha" (low drum with a pitch drop) and "na" (bright tap)
    function dha(t, vol) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(70, t + .25); g.gain.setValueAtTime(.12 * vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .32); o.connect(g); g.connect(out); o.start(t); o.stop(t + .34); na(t, vol * .6); }
    function na(t, vol) { const s = ac.createBufferSource(); s.buffer = noise; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 6; const g = ac.createGain(); g.gain.value = .22 * vol; s.connect(f); f.connect(g); g.connect(out); s.start(t);
      const o = ac.createOscillator(), og = ac.createGain(); o.frequency.value = 520; og.gain.setValueAtTime(.05 * vol, t); og.gain.exponentialRampToValueAtTime(.0001, t + .12); o.connect(og); og.connect(out); o.start(t); o.stop(t + .14); }
    const TAAL = [[1, 'dha'], [0, ''], [.6, 'na'], [.5, 'na'], [.9, 'dha'], [0, ''], [.6, 'na'], [.4, 'na'], [.8, 'dha'], [.3, 'na'], [.6, 'na'], [0, ''], [.7, 'dha'], [0, ''], [.6, 'na'], [.5, 'na']];
    function newPhrase(m) { const L = []; let d = Math.floor(Math.random() * 5); const n = 4 + Math.floor(Math.random() * 5); for (let i = 0; i < n; i++) { d = Math.max(0, Math.min(m.scale.length * 2 - 1, d + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)])); L.push([d, [1, 1, 2, 2, 3][Math.floor(Math.random() * 5)]]); } L.push([0, 4]); L.push([-1, 3 + Math.floor(Math.random() * 4)]); return L; }
    function schedule() { if (!ac || !on) return; const m = mood || (mood = pickMood()); const spb = 60 / m.bpm / 2;   // eighth notes
      while (next < ac.currentTime + .4) { const t = next; const b = beat % 16;
        if (b === 0 && (beat / 16) % 2 === 0) tanpura(t, m.root / 2);
        if (beat >= 32) { const [v, k] = TAAL[b]; if (v) (k === 'dha' ? dha : na)(t, v * .8); }
        if (beat >= 16 && t >= lastNote) { if (!phrase.length) phrase = newPhrase(m); const [deg, len] = phrase.shift(); const dur = len * spb; if (deg >= 0) { const f = hz(m, deg, 1); flute(t, f, dur * .95, Math.random() < .35 ? f * .94 : null); } lastNote = t + dur; }
        beat++; next += spb; if (beat % 128 === 0) mood = pickMood(); } }
    function level() { const drive = bb.player && bb.player.mode === 'drive'; return (drive ? .6 : 1) * S.vol * .9; }
    function set(v) { want = v; upd(); }
    function upd() { const play = want && bb.started && !bb.muted && !radioOn() && !(bb.CINE && bb.CINE.on && bb.CINE.state && bb.CINE.state.o && bb.CINE.state.o.quiet);
      if (play && !on) { if (!ctx()) return; on = true; next = ac.currentTime + .1; beat = 0; phrase = []; lastNote = 0; mood = pickMood(); clearInterval(timer); timer = setInterval(schedule, 100); }
      if (!play && on) { on = false; clearInterval(timer); }
      if (out) { const g = play ? level() : 0; out.gain.setTargetAtTime(g, ac.currentTime, .6); } }
    setInterval(upd, 1000);
    return { set, upd, get on() { return on; } };
  })();
  bb.onStart(() => { apply(); setTimeout(apply, 800); });
  setTimeout(btn, 0);
  bb.SOUND = { sheet, get prefs() { return S; }, get voice() { return S.voice; }, get music() { return S.music; }, apply };
});
