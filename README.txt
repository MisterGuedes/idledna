DNA Evolution Idle — organized first-pass prototype

Architecture:
- index.html: semantic UI shell only
- css/: presentation split by responsibility
- js/main.js: game loop and UI wiring
- js/persistence.js: save/load
- js/creature.js: procedural SVG creature
- js/evolution.js: mutation selection and evolution
- js/shop.js: behavior shop
- js/data/: expandable game content

No external dependencies or build tools. Designed for Capacitor wrapping later.
Persistence currently uses localStorage and can later be swapped for Capacitor Preferences.
