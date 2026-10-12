// Invite friends: share your link (indiabaygame.com/?ref=YOURNAME). A friend who opens it and starts a new
// account is linked to you; once their account is a Google account you get the invite reward (₹10,000 by
// default, Admin → Time and prices → Invites and rewards), up to 20 friends. The friend gets a welcome gift.
// Needs online/supabase-update-4.sql.
window.BBFeatures.push(function (bb) {
  const KEY = 'ib.ref', DONE = 'ib.refDone';
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }, del: k => { try { localStorage.removeItem(k); } catch (e) {} } };
  // 1. Remember the invite code from the link, then tidy the address bar
  try { const u = new URL(location.href); const r = u.searchParams.get('ref'); if (r && /^[A-Za-z0-9]{1,10}$/.test(r) && !ls.get(DONE)) ls.set(KEY, r); if (r) { u.searchParams.delete('ref'); history.replaceState(null, '', u.pathname + (u.search || '') + u.hash); } } catch (e) {}
  const bonus = () => Math.round(bb.cost('refer.bonus', bb.CFG.referBonus || 10000)), welcome = () => Math.round(bb.cost('refer.welcome', 2000));
  const O = () => bb.ONLINE;
  // 2. A new player who came from a link: link them to the inviter once, give the welcome gift
  async function register() { const code = ls.get(KEY); if (!code || !O() || !O().signedIn || !bb.started) return; const { data, error } = await O().rpc('register_referral', { code }); if (error) return;
    ls.del(KEY); ls.set(DONE, '1');
    if (data === 'ok') { bb.earn(welcome(), 'invite'); bb.big('🎁 ' + bb.inr(welcome()), '#ffc93c'); bb.toast(`Welcome! ${bb.esc(code)} invited you · welcome gift +${bb.inr(welcome())}${O().guest ? '<br><span style="font-size:14px;font-weight:600">Sign in with Google in your profile so ' + bb.esc(code) + ' gets their reward too</span>' : ''}`, '#ffc93c'); bb.save(); bb.emit('invite', { kind: 'joined' }); } }
  // 3. The inviter: collect rewards for friends who joined
  async function claim() { if (!O() || !O().signedIn || !bb.started) return; const { data, error } = await O().rpc('claim_referrals'); if (error || !data) return; const n = +data || 0; if (!n) return;
    const amt = n * bonus(); bb.earn(amt, 'invite'); bb.big('🎉 +' + bb.inr(amt), '#3ddc97'); bb.toast(`${n === 1 ? 'A friend' : n + ' friends'} joined with your invite · +${bb.inr(amt)}`, '#3ddc97'); bb.P.extra = bb.P.extra || {}; bb.P.extra.invites = (bb.P.extra.invites || 0) + n; bb.save(); bb.emit('invite', { kind: 'reward', n }); }
  bb.onStart(() => setTimeout(() => { register(); claim(); }, 6000)); setInterval(() => { register(); claim(); }, 180000);

  /* the Invite app */
  function link() { const name = O() && O().profile ? O().profile.username : ''; const base = /indiabaygame\.com$/i.test(location.hostname) ? 'https://indiabaygame.com/' : location.origin + location.pathname; return name ? `${base}?ref=${encodeURIComponent(name)}` : ''; }
  async function app() { if (!O() || !O().signedIn) return bb.openSheet('🎁 Invite friends', `Earn ${bb.inr(bonus())} for every friend`, `<p class="note" style="font-size:14px">Go online first: your invite link uses your username. Open 👤 Profile and sign in.</p>`);
    const L = link(); const msg = `Play India Bay with me: a free open-world India game in your browser. Drive from Rajasthan to Kerala! ${L}`;
    let stats = ''; try { const { data } = await O().rpc('my_referrals'); const r = Array.isArray(data) ? data[0] : data; if (r) stats = `<p class="note" style="font-size:14px">Friends who joined: <b>${r.joined}</b> · rewarded: <b>${r.rewarded}</b>${+r.guests ? ` · still guests: <b>${r.guests}</b> (they need to sign in with Google)` : ''}</p>`; } catch (e) {}
    bb.openSheet('🎁 Invite friends', `${bb.inr(bonus())} for every friend who joins with your link`,
      `<div class="selcard"><div><b>Your invite link</b><small style="word-break:break-all">${bb.esc(L)}</small></div></div>
      <div class="btnrow"><button class="go" data-i="share">Share</button><button class="buy" data-i="wa">WhatsApp</button><button class="buy ghost" data-i="copy">Copy link</button></div>${stats}
      <p class="note">How it works: your friend opens your link and starts a new game. When their account is signed in with Google (not a guest), you get ${bb.inr(bonus())} and they get a ${bb.inr(welcome())} welcome gift. Up to 20 friends. Game money only.</p>`,
      s => s.onclick = async e => { const k = e.target.dataset.i; if (!k) return;
        if (k === 'share') { if (navigator.share) { try { await navigator.share({ title: 'India Bay', text: msg, url: L }); } catch (er) {} } else { copy(msg); } }
        if (k === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        if (k === 'copy') copy(L); }); }
  async function copy(t) { try { await navigator.clipboard.writeText(t); bb.toast('Link copied · paste it to your friends', '#3ddc97'); } catch (e) { prompt('Copy your invite link', t); } }
  bb.addApp({ id: 'invite', label: 'Invite', icon: '🎁', fn: app });
});
