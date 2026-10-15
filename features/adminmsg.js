// ✉ Message admin (Beta v1.01.21): a phone app to send the India Bay admin a suggestion, feedback or a message.
// Everything arrives on the admin page (Admin → Messages to admin). Needs online play (sign in from 👤 Profile).
window.BBFeatures.push(function (bb) {
  const KINDS = [['suggestion', '💡 Suggestion', 'An idea for the game: places, features, festivals, events'], ['feedback', '⭐ Feedback', 'What you like, and what could be better'], ['message', '✉ Message', 'Anything else for the India Bay team']];
  function app(kind) { kind = kind || 'suggestion'; const O = bb.ONLINE, can = !!(O && O.signedIn && O.client); const k = KINDS.find(q => q[0] === kind) || KINDS[0];
    bb.openSheet('✉ Message admin', 'The India Bay team reads every message', `<div class="chips">${KINDS.map(q => `<button class="chip${q[0] === kind ? ' on' : ''}" data-k="${q[0]}" type="button">${q[1]}</button>`).join('')}</div><p class="note">${k[2]}</p>
      <form class="form" id="am" novalidate><label>Your ${k[1].split(' ')[1].toLowerCase()}<textarea id="am_t" maxlength="600" placeholder="${kind === 'suggestion' ? 'Add a night market in Jaipur' : kind === 'feedback' ? 'I love the buses! The map could be bigger on my phone' : 'Hello India Bay team…'}"></textarea></label>
      <div class="btnrow"><button class="go" type="submit">Send</button></div><p class="note" id="am_m">${can ? 'Sent with your username so the admin can reply in the game news or on Instagram.' : 'Sign in (👤 Profile) to send messages to the admin.'}</p></form>`,
      s => { s.onclick = e => { const b = e.target.closest('[data-k]'); if (b) app(b.dataset.k); };
        s.querySelector('#am').onsubmit = async e => { e.preventDefault(); const t = s.querySelector('#am_t').value.trim(), m = s.querySelector('#am_m'); if (t.length < 5) { m.textContent = 'Write a few more words first.'; m.className = 'note bad'; return; }
          if (!can) { m.textContent = 'Sign in from 👤 Profile first. Your text is still here.'; m.className = 'note bad'; return; }
          m.textContent = 'Sending…'; m.className = 'note';
          const row = { name: O.username || bb.P.name || 'player', region: (bb.zoneAt(bb.ppos().x, bb.ppos().z, 100) || {}).name || '', text: t.slice(0, 600), kind };
          let { error } = await O.client.from('suggestions').insert(row);
          if (error && /kind/.test(error.message || '')) { delete row.kind; row.text = `[${kind}] ` + row.text; ({ error } = await O.client.from('suggestions').insert(row)); }
          if (error) { m.textContent = 'Could not send: ' + error.message; m.className = 'note bad'; return; }
          bb.closeSheet(); bb.toast('✉ Sent to the admin · thank you!', '#3ddc97'); bb.emit('adminMsg', kind); }; }); }
  bb.addApp({ id: 'msgadmin', label: 'Message admin', icon: '✉', fn: () => app() });
  bb.ADMINMSG = { open: app };
});
