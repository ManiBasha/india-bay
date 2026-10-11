# India Bay · West India build 3.3

An open-world India browser game. The live region is **West India**: Maharashtra, Gujarat, Rajasthan,
Dadra & Nagar Haveli and Daman & Diu, built as one map with the Arabian Sea coast.

## Folder layout

```
index.html              page shell: HUD, buttons, start screen, script list
css/game.css            all styling
js/world-west.js        the West region map data: coast, cities, highways, lakes, rivers, airports, places, menus, homes
js/landmarks.js         simple 3D builders for each famous place (LOD 200)
js/game.js              core engine (built from src/core-1.js, core-2.js, core-3.js)
features/               add-on systems, one file each
  jobs.js               job agent, 6 jobs, ratings, RTO licences
  shops.js              two-wheeler dealer, clothes, furniture, mobile shop, wardrobe
  life.js               traffic police checks, e-challans, tolls, speed cameras, mechanic, insurance, floods
  travel.js             India map, West India map, GPS, trains, flights, buses, bot taxi, Mumbai local, ferry
  festivals.js          Navratri, Diwali, Uttarayan, Holi, Ganpati
  radio.js              four generated radio stations with presenters and fake ads
  baygame.js            Ludo, Snakes and Ladders, Tic-tac-toe, Gully cricket, quiz
  media.js              photo mode, photos, 30 and 60 second clips
  story.js              chapter 1, achievements, daily rewards
  economy.js            chai business and renting homes
  online.js             sign-in, usernames, cloud saves, other players, chat (needs js/online-config.js)
online/
  supabase-setup.sql    database tables and rules for Supabase
  server/               Cloudflare Worker for the live world (npx wrangler deploy)
  SETUP.md              step-by-step setup
```

## Host it for free

**Netlify Drop (1 minute):** unzip, open https://app.netlify.com/drop and drag the folder in.

**GitHub Pages:** new public repository → upload everything (keep folders) → Settings → Pages → Deploy from branch `main`, folder `/ (root)`.

**Cloudflare Pages** (the host named in the online spec): Workers & Pages → Create → Pages → Upload assets → drop the folder.

**itch.io:** zip the folder contents (index.html at the top) → New project → Kind: HTML → "played in the browser".

To update, upload only the files you changed.

## Online play

See `online/SETUP.md`: Supabase for accounts and saves, Cloudflare for the live server. Until `js/online-config.js` is filled in, the game runs offline.

## Admin

Inside Claude the admin panel is tied to the owner's account and saves for every player.
On your own hosting, open the game with `#admin` at the end of the link. Changes there stay on that device
until the online backend (Supabase) is connected.

## Add a feature without touching the core

1. Create `features/my-feature.js`:
   ```js
   window.BBFeatures.push(function (bb) {
     bb.addPoi({ type: 'food', name: 'Misal corner', x: 4560, z: 9330, rot: 0, extra: 'MH' });
     bb.addApp({ id: 'hello', label: 'Hello', icon: '👋', fn: () => bb.toast('Namaste!') });
   });
   ```
2. Add `<script src="features/my-feature.js"></script>` in `index.html` above `js/game.js`.

Useful parts of `bb`: `addPoi`, `poiHandlers[type]`, `addApp`, `addMission`, `addPrompt`, `onUpdate`, `onStart`, `onKey`,
`on(event, fn)` for events (`job`, `buy`, `travel`, `discover`, `zone`, `crash`, `stars`, `eat`, `sleep`, `festival` …),
`openSheet`, `openWait`, `startActivity`, `startQueue`, `spend`, `earn`, `addChallan`, `addWanted`, `teleport`,
`makeVeh`, `buyVehicle`, `P` (save), `CFG` (admin settings), `WORLD` (map data), `scene`, `THREE`.

## Add a city or place

Edit `js/world-west.js`: add a zone (`x0, z0, nx, nz, style, size, food, specials`), a highway polyline that reaches it,
and optional places and landmarks. Landmark shapes live in `js/landmarks.js`.
New regions (North, South-West…) get their own `world-<region>.js` file in a later phase.
