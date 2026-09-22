# Immersive Project Calculator

Data rate, storage, render time and cost for stereoscopic immersive projects:
capture, dailies, trimmed BRAW, denoise, delivery.

Live: https://tomklane.squarespace.com/immersive-project-calculator

- `index.html` — the whole calculator, one self-contained file
- `embed/squarespace-loader.html` — the small block on the Squarespace page that loads it
- `tests/check.mjs` — headless checks, run on every push
- `CLAUDE.md` — the project brief: design rules, the math and its sources, known pitfalls
- `CHANGELOG.md` — what changed and why

Change `index.html`, run `npm test`, push to `main`. If the checks pass, GitHub Pages
publishes it and the website picks it up.
