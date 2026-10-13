// Steering styles for touch screens (⚙ Settings → Steering): ◀ ▶ arrows, a steering wheel you turn with your thumb
// (like Dr. Driving), a slider, or tilting the phone. The wheel, slider and tilt only replace the arrows while you
// drive; on foot the arrows come back. Also the small Bay Time clock (⚙ Settings → Bay Time clock).
window.BBFeatures.push(function (bb) {
  const KEY = 'ib.steer', get = () => { try { return localStorage.getItem(KEY) || 'arrows'; } catch (e) { return 'arrows'; } }, setS = v => { try { localStorage.setItem(KEY, v); } catch (e) {} };
  let style = get(), sens = 1; try { sens = +(localStorage.getItem('ib.steerSens') || 1); } catch (e) {}
  const STYLES = [['arrows', '◀ ▶ Arrows', 'Two buttons, left and right'], ['wheel', '🛞 Steering wheel', 'Turn the wheel with your thumb; it centres itself when you let go'], ['slider', '↔ Slider', 'Slide left or right along a bar'], ['tilt', '📱 Tilt', 'Tilt the phone like a steering wheel']];
  /* the wheel */
  const wheel = document.createElement('div'); wheel.id = 'steerWheel'; wheel.hidden = true;
  wheel.innerHTML = `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><radialGradient id="swg" cx="50%" cy="40%"><stop offset="0" stop-color="#4a4d55"/><stop offset="1" stop-color="#1c1d22"/></radialGradient></defs>
    <circle cx="60" cy="60" r="54" fill="none" stroke="url(#swg)" stroke-width="12"/><circle cx="60" cy="60" r="54" fill="none" stroke="#5c606a" stroke-width="1.5" stroke-dasharray="3 5"/>
    <path d="M10 62 Q60 48 110 62 L110 70 Q60 60 10 70Z" fill="#2a2c32"/><path d="M54 66 L50 112 L70 112 L66 66Z" fill="#2a2c32"/><circle cx="60" cy="64" r="15" fill="#33363d" stroke="#5c606a" stroke-width="2"/>
    <text x="60" y="69" text-anchor="middle" font-size="11" font-weight="800" fill="#ffc93c" font-family="Baloo 2,sans-serif">IB</text><rect x="56" y="4" width="8" height="12" rx="3" fill="#ffc93c"/></svg>`;
  document.body.appendChild(wheel);
  let wAng = 0, wDrag = null;
  const MAXA = 135;
  wheel.addEventListener('pointerdown', e => { e.preventDefault(); const r = wheel.getBoundingClientRect(); wDrag = { id: e.pointerId, cx: r.left + r.width / 2, cy: r.top + r.height / 2, a0: Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI, w0: wAng }; try { wheel.setPointerCapture(e.pointerId); } catch (er) {} });
  wheel.addEventListener('pointermove', e => { if (!wDrag || e.pointerId !== wDrag.id) return; let a = Math.atan2(e.clientX - wDrag.cx, -(e.clientY - wDrag.cy)) * 180 / Math.PI - wDrag.a0; if (a > 180) a -= 360; if (a < -180) a += 360; wAng = Math.max(-MAXA, Math.min(MAXA, wDrag.w0 + a)); });
  const wUp = e => { if (wDrag && e.pointerId === wDrag.id) wDrag = null; }; wheel.addEventListener('pointerup', wUp); wheel.addEventListener('pointercancel', wUp);
  /* the slider */
  const slider = document.createElement('div'); slider.id = 'steerSlider'; slider.hidden = true; slider.innerHTML = '<i></i><b></b>'; document.body.appendChild(slider);
  let sVal = 0, sDrag = null;
  slider.addEventListener('pointerdown', e => { e.preventDefault(); sDrag = e.pointerId; try { slider.setPointerCapture(e.pointerId); } catch (er) {} move(e); });
  const move = e => { if (sDrag !== e.pointerId) return; const r = slider.getBoundingClientRect(); sVal = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)); };
  slider.addEventListener('pointermove', move); const sUp = e => { if (sDrag === e.pointerId) sDrag = null; }; slider.addEventListener('pointerup', sUp); slider.addEventListener('pointercancel', sUp);
  /* tilt */
  let tilt = 0, tiltOn = false;
  addEventListener('deviceorientation', e => { if (style !== 'tilt') return; tiltOn = true; const ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0; let v = Math.abs(ang) === 90 ? (ang > 0 ? e.beta : -e.beta) : e.gamma; tilt = Math.max(-1, Math.min(1, -(v || 0) / 30)); });
  async function askTilt() { try { if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') { bb.toast('Tilt needs motion access · using arrows', '#ff9f1c'); return false; } } } catch (e) {} return true; }
  /* each frame: show the right control and feed the analog steering */
  const touch = matchMedia('(hover: none)').matches || (navigator.maxTouchPoints || 0) > 0;
  bb.onUpdate(dt => { const drv = bb.player.mode === 'drive' && !!bb.player.veh && !bb.inside && !(bb.CINE && bb.CINE.on); const on = touch && drv && style !== 'arrows';
    document.body.classList.toggle('steer-alt', on); wheel.hidden = !(on && style === 'wheel'); slider.hidden = !(on && style === 'slider');
    if (!on) { bb.setSteer(null); return; }
    if (style === 'wheel') { if (!wDrag) wAng *= Math.max(0, 1 - dt * 6); wheel.firstElementChild.style.transform = `rotate(${wAng}deg)`; bb.setSteer(-wAng / 90 * sens); }
    else if (style === 'slider') { if (sDrag == null) sVal *= Math.max(0, 1 - dt * 7); slider.querySelector('b').style.left = `${(sVal + 1) * 50}%`; bb.setSteer(-sVal * sens); }
    else if (style === 'tilt') bb.setSteer(tiltOn ? tilt * sens : null); });
  /* settings */
  function sheet() { bb.openSheet('🛞 Steering', touch ? 'How you steer while driving on a touch screen' : 'These controls show on phones and tablets; on a computer use A and D or the arrow keys',
    STYLES.map(([k, n, d]) => bb.rowHtml('s_' + k, n, d, style === k ? 'In use' : 'Use', style === k ? '' : 'ghost')).join('') +
    `<h3 class="sub">Sensitivity</h3><div class="chips">${[[.7, 'Gentle'], [1, 'Normal'], [1.35, 'Sharp']].map(([v, n]) => `<button class="chip${sens === v ? ' on' : ''}" data-sens="${v}">${n}</button>`).join('')}</div>`,
    s => s.onclick = async e => { const id = e.target.dataset.id; if (e.target.dataset.sens) { sens = +e.target.dataset.sens; try { localStorage.setItem('ib.steerSens', sens); } catch (er) {} return sheet(); }
      if (!id) return; const k = id.slice(2); if (k === 'tilt' && !(await askTilt())) return; style = k; setS(k); bb.toast(`Steering: ${STYLES.find(q => q[0] === k)[1]}`, '#ffc93c'); sheet(); }); }
  bb.addApp({ id: 'steer', label: 'Steering', icon: '🛞', group: 'settings', fn: sheet });

  /* Bay Time clock: a small pill under the money, so you can plan for opening hours, matches and festivals */
  const clock = document.createElement('div'); clock.id = 'bayClock'; clock.className = 'pill'; clock.setAttribute('aria-label', 'Bay time');
  const lcol = document.querySelector('#top .lcol'); if (lcol) lcol.insertBefore(clock, lcol.children[1] || null);
  const clockOn = () => { try { return localStorage.getItem('ib.clock') !== 'off'; } catch (e) { return true; } };
  let last = ''; bb.onUpdate(() => { const on = clockOn() && bb.started; clock.hidden = !on; if (!on) return; const t = bb.bayTime(); const h = bb.clock; const ic = h >= 6 && h < 18 ? '☀' : '🌙'; const s = `${ic} ${t}`; if (s !== last) { last = s; clock.textContent = s; } });
  clock.onclick = () => bb.toast(`Bay time ${bb.bayTime()} · real time ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, '#d6c8e4');
  bb.addApp({ id: 'clock', label: 'Bay Time', icon: '🕐', group: 'settings', fn: () => { const on = clockOn(); try { localStorage.setItem('ib.clock', on ? 'off' : 'on'); } catch (e) {} bb.toast(on ? 'Bay Time clock hidden' : 'Bay Time clock shown', '#d6c8e4'); } });
});
