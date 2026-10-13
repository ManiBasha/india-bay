// The start screen (Beta v1.01.05): a game title screen over a live tour of the map.
// Shows a loading bar while the world builds, then a menu (Start, Choose your city, Sign in with Google,
// How to play, What's new), a player card, and a BAY NEWS ticker with festivals, events and tips.
(function () {
  const $ = s => document.querySelector(s);
  const TIPS = ['Tip: press N for the map and tap a place for directions', 'Tip: E gets in and out of vehicles, and opens shops and doors', 'Tip: Menu → Local work has 74 regional jobs',
    'Tip: ride the Mumbai–Ahmedabad bullet train from any of its 12 stations', 'Tip: your free starter home and garage are in your home city · Menu → Property', 'Tip: Phone → Roadside help sends a mechanic to your vehicle',
    'Tip: Settings → Steering has a steering wheel, a slider and tilt', 'Tip: press P for photo mode and post your best shots on BayGram', 'Tip: fairs and festivals change with the real calendar',
    'Follow @indiabaygame on Instagram for news and updates'];
  const T0 = performance.now(); let ready = false;
  function tick() { const bar = $('#iloadBar'), txt = $('#iloadTxt'); if (!bar) return;
    if (window.BB && !ready) { ready = true; bar.style.width = '100%'; txt.textContent = 'Ready'; setTimeout(() => document.body.classList.add('iready'), 350); const go = $('#go'); if (go) { go.disabled = false; } return; }
    if (ready) return; const t = (performance.now() - T0) / 1000; const f = 1 - Math.exp(-t / 6); bar.style.width = Math.round(f * 92) + '%';
    const steps = ['Building West India…', 'Laying highways and flyovers…', 'Lighting the streets…', 'Waking up the cities…', 'Parking the autos…', 'Almost there…']; txt.textContent = steps[Math.min(steps.length - 1, Math.floor(t / 3))];
    requestAnimationFrame(tick); }
  // the news ticker: the admin's announcement, festivals and events from #ann, what's new and tips
  function news() { const el = $('#tick'); if (!el) return; const ann = $('#ann'); const items = [];
    if (ann && ann.innerHTML.trim()) ann.innerHTML.split(/<br\s*\/?>/i).forEach(l => { const t = l.replace(/<[^>]+>/g, '').trim(); if (t) items.push('🎉 ' + t); });
    items.push('🚄 New: the Mumbai–Ahmedabad bullet train', '🛣 New: Delhi–Mumbai and Amritsar–Jamnagar expressways', '🗺 45 new towns across Maharashtra, Gujarat and Rajasthan');
    for (let i = 0; i < 4; i++) items.push('💡 ' + TIPS[(Math.floor(Date.now() / 86400000) + i * 3) % TIPS.length]);
    const html = items.map(t => `<span>${t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])}</span>`).join('');
    if (el.dataset.h !== html) { el.dataset.h = html; el.innerHTML = html + html; el.style.animationDuration = Math.max(30, items.length * 7) + 's'; } }
  function wire() {
    const panel = $('#iMapPanel'); const open = v => { if (panel) panel.classList.toggle('open', v); document.body.classList.toggle('imap', v); };
    const c = $('#iCity'); if (c) c.onclick = () => open(!panel.classList.contains('open')); const x = $('#iMapClose'); if (x) x.onclick = () => open(false);
    const h = $('#iHow'); if (h) h.onclick = () => window.BB && window.BB.howTo && window.BB.howTo(0);
    const n = $('#iNew'); if (n) n.onclick = () => window.BB && (window.BB.whatsNew ? window.BB.whatsNew(false) : null);
    addEventListener('keydown', e => { if (e.code !== 'Enter' || !$('#intro') || $('#intro').hidden) return; if (document.querySelector('#sheetWrap:not([hidden])')) return; const go = $('#go'); if (go && !go.disabled) { e.preventDefault(); go.click(); } });
    news(); setInterval(news, 5000); tick();
    // on a wide screen the city map stays open on the right
    if (matchMedia('(min-width: 980px)').matches) open(true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire();
})();
