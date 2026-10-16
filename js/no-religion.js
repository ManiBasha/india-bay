// Beta v1.01.26: India Bay leaves out places of worship and pilgrimage (temples, mosques, dargahs, churches,
// gurudwaras, pilgrimage ghats and hills). Forts, palaces, caves, tombs and monuments stay. This runs after the world
// files and before the game is built, so the places, their landmarks and their map pins are simply not there.
(function () {
  const W = window.WORLD; if (!W) return;
  const RE = /temple|mandir|masjid|mosque|dargah|church|cathedral|basilica|chapel|bom jesus|conception|gurudwara|sahib|sabarimala|siddhivinayak|dagdusheth|trimbak|matha\b|ghats?\b|deekshabhoomi|akshardham|shatrunjaya|palitana|girnar|bet dwarka|statue of belief|murudeshwar|shravanabelagola|gommateshwara|chamundi|osian|dilwara|pushkar lake|sai temple|tulja|ambaji|guruvayur|padmanabha|vitthal/i;
  const KINDS = new Set(['hajiAli', 'ganpatipuleTemple', 'ramkund', 'trimbak', 'somnathTemple', 'pushkarGhats', 'seCathedral', 'mangueshi', 'murudeshwar', 'belurTemple', 'gommateshwara', 'chamundiHill', 'goldenTemple', 'sabarimala']);
  window.IB_NORELIGION = RE;
  if (Array.isArray(W.places)) W.places = W.places.filter(p => !RE.test(p[0]));
  if (Array.isArray(W.landmarks)) W.landmarks = W.landmarks.filter(l => !KINDS.has(l.kind) && !(l.name && RE.test(l.name)));
  for (const h of W.highways || []) if (h.name && /sabarimala/i.test(h.name)) h.name = 'Pathanamthitta Road';
})();
