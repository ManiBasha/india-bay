#!/bin/sh
cd "$(dirname "$0")"
cat src/core-1.js src/core-2.js src/core-3.js > js/game.js
for f in football garage apps jobs shops life travel festivals radio baygame media story economy; do [ -f features/$f.js ] || echo "// $f" > features/$f.js; done
node --check js/game.js && for f in features/*.js js/world-west.js js/world-southwest.js js/football-data.js js/cricket-data.js js/prices.js js/landmarks.js; do node --check $f || exit 1; done && echo BUILD_OK
