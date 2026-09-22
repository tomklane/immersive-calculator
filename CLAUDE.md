# Immersive Project Calculator — project brief

Read this before changing anything. It records decisions that were made on purpose,
so a new session does not quietly undo them.

Owner: Tom Klane (colorist). Live on tomklane.squarespace.com/immersive-project-calculator,
reached from the footer link CALCULATOR (page sits under "Not Linked", out of the nav).

## What it is

One self-contained page, `index.html`: no build step, no libraries, no network requests.
It plans a stereoscopic (two-eye) immersive project end to end:

Capture → Dailies → Trimmed BRAW → Denoise → Delivery → Total

For each stage: data rate, data per hour, runtime per TB, data total, render or
transfer time, and a Total panel with data, render hours, storage $, render $, cost.

## How the website gets it

- GitHub Pages publishes `index.html` from `main`, but only after `npm test` passes
  (`.github/workflows/check-and-deploy.yml`).
- The Squarespace page holds only `embed/squarespace-loader.html` in one Code Block.
  It frames the Pages copy and passes `?embed=<page url>` plus the page's `#estimate`.
- The calculator talks back with `postMessage` to the embed origin only:
  `idrc-height` (frame auto-height) and `idrc-hash` (keeps the site's address in step).
- So: edit `index.html`, push, and the site updates. The loader should almost never change.
- GitHub Pages caches for about 10 minutes, so a push can take that long to show.

## Estimate links

State lives in the URL hash, not storage. Only fields that differ from the defaults are
written, e.g. `#tcA=00:30:00:00&cams=2&selCap=b8&nodes=4&u=Gb`. Keys are the input ids.
`u=Gb` is the rate unit, `lean=1` folds the detail columns. Colons stay unencoded.
Copy link copies the site address (in embed mode) with the hash; Reset restores defaults.
There is no localStorage and no presets: they were removed on request.

## Design rules (from Tom — keep them)

- Pure white ground, black text. One accent only: blue `#0b53c9`, for the selected row.
- One font family (Helvetica). Size, weight and italic carry hierarchy.
- Labels are fragments. No sentences, no descriptions, no helper text.
- Exact industry terms, used the same way everywhere.
- No commas in any number. Tabular numerals; units in their own column span so decimals align.
- Inputs at the top in labelled bands (Project, Capture, Dailies, Post, Process, Cost);
  results flow down like a post diagram; Total last.
- Input band layout is deliberate: do not merge rows.
- Total columns (Data total, Render/Offload/Transfer total) are adjacent, shaded, bold headers.
- Zero or unknown values show a dash, never 00:00:00 or 0.
- Durations past 24 hours read `3d 18:00:00`.
- Units never uppercase-transformed (Gb/s vs GB/s is an 8x difference).

## Defaults

Resolution 8160 × 7200 per eye, 90 fps. Capture and edit runtime 00:00:00:00.
Capture BRAW 12:1. Dailies: edit codec ProRes 422 Proxy at half res + review bitrate (MV-HEVC) 50 Mb/s.
Trimmed BRAW always on: fixed to the capture codec, not a menu; only its transfer speed is set. Denoise ProRes 4444, stereo.
Delivery ProRes None + deliverable MV-HEVC 100 Mb/s at 4320 × 4320.
Process: ProRes 39 fps, MV-HEVC 35 fps, Delivery blank, Denoise 1.5 fps;
Shots, Handles, Nodes blank. Storage $62/TB, render $50/node hr, backups 1. Offload/transfer 1100 MB/s.

## The math (verified — keep the anchors)

- Stereo: every pixel count is `2 × W × H`.
- ProRes bits per pixel come from Apple's 1920 × 1080 29.97 targets (Mb/s):
  Proxy 45, LT 102, 422 147, HQ 220, 4444 330, 4444 XQ 500.
  `PRORES_PPS = 1920 * 1080 * 30000/1001`, rate scales with pixels × fps.
- BRAW rates are Blackmagic's URSA Cine Immersive figures (MB/s) at 8160 × 7200 × 2 @ 90 fps,
  scaled linearly by pixels × fps (`BRAW_PPS = 2*8160*7200*90`). Constant bitrate:
  5:1 3203, 8:1 2002, 12:1 1335, 18:1 889. Constant quality is a scene-dependent range:
  Q0 1779–4003, Q1 1456–3558, Q3 801–2002, Q5 534–1602. 3:1 is not offered in immersive mode.
- MV-HEVC is a single total-stream bitrate (both eyes); resolution does not change its data rate,
  which is why the delivery MV-HEVC row has no resolution control.
- Storage units are decimal (1 TB = 10^12 bytes).
- Render time = frames ÷ fps ÷ nodes (wall clock); node-hours drive cost.
  Denoise frames = edit frames + shots × handles × 2; mono render doubles denoise time.
- Trimmed BRAW = capture codec over the denoise frame count; its time is transfer, not render,
  so it is not in Total render hours (offload is not either).
- A blank or zero MV-HEVC bitrate means that stream is not made: row dashes, not in totals.
- A blank speed means render time unknown: that row dashes and is left out of the totals.
  Blank Nodes = 1; blank Shots/Handles = 0.
- Backups = number of copies of the whole data set: Storage $ = data × backups × $/TB.
  Total Data shows the set count beside it (× 2 sets).
- Timecode is non-drop at every rate (known limitation at 29.97 / 59.94).
- Timecode entry is four boxes (hr min sec fr) over a hidden `#tcA` / `#tcB` that holds the value.
  Click a box: that field is selected, two digits fill it and move on. Double-click (or Ctrl/Cmd+A):
  the whole timecode is selected and digits shift in from the right, NLE style. Up/Down steps a field.
  Overflow (95 frames at 90 fps) carries on commit.
- Typing a Custom fps that equals a preset switches Frame rate to that preset, else Custom.

## Pitfalls already hit

- Never put `<!doctype>`, `<html>`, `<head>` or `<body>` inside a Squarespace Code Block, not even
  in a comment: Squarespace rewrites any `<html` it finds, which once truncated the whole embed.
- The site page can miss the calculator's first height report, so the calculator repeats it and
  answers `idrc-ping`; the loader pings on load. Keep both if you touch either.
- Squarespace shows "JavaScript and iframe embeds is a Premium Feature" in the editor, yet
  the block serves and runs for visitors. If the page ever goes blank, that is the cause.
- While logged into Squarespace, opening the page redirects into the editor and drops the
  `#estimate`. Test links in a private window.
- `.irow > span { display:flex }` overrides the `hidden` attribute, so Custom fps and the
  delivery Width/Height are always visible. That is intended.
- CSS order matters in the matrix: zebra, then selection, all scoped through `tbody`,
  or the stripe beats the selection colour.

## Working on it

1. Describe the change. Edit `index.html` (and the brief here if a rule changes).
2. `npm install && npx playwright install chromium && npm test` — all checks must pass.
   Add a check when you add behaviour worth protecting.
3. Commit with a plain message saying what changed and why; add a line to `CHANGELOG.md`.
4. Push to `main`. The workflow tests, then publishes. Check the site in a private window.
