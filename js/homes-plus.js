// Starter homes (Beta v1.01.03): every player gets one free small home with a garage in the city they choose.
// One starter home slot is added to every big and mid-sized city (and the hill and beach towns); it costs nothing,
// cannot be bought by others, and moves when you pick a new home city (Menu → Property).
(function () {
  const W = window.WORLD; if (!W || !W.homes) return;
  const has = new Set(W.homes.filter(h => h.starter).map(h => h.zone));
  for (const z of W.zones) { if (has.has(z.id)) continue; if (z.size === 'small' && !/lonavala|mahabaleshwar|alibaug|calangute|palolem|munnar|varkala|mountabu|gokarna|madikeri/.test(z.id)) continue;
    W.homes.push({ id: 'st_' + z.id, zone: z.id, name: `${z.name} starter home`, type: 'chawl', price: 0, starter: true }); }
})();
