# Changelog

Reconstructed from the development conversation up to the move to GitHub.
From here on, one entry per change.

## 2026-09-21 — moved to GitHub
- Source now lives in this repo; GitHub Pages publishes it after the checks pass.
- Squarespace block replaced by a small loader; estimate links and auto-height
  pass between the site and the calculator by postMessage.
- Headless checks added for defaults, codec anchors, render math, formatting, links, embed mode.

## Estimate links (v51)
- Presets removed. Every setting lives in the URL; Copy link and Reset added.
- New defaults: ProRes 39 fps, MV-HEVC 35 fps, Denoise 1.5 fps, Delivery fps blank;
  Shots, Handles, Nodes blank; capture and edit runtime 00:00:00:00.
- Blank speed = render time unknown (row dashes, left out of totals).
- Typing a Custom fps that matches a preset selects that preset, else Custom.

## Website (v44–v50)
- Published to tomklane.squarespace.com under Not Linked, with a CALCULATOR footer link.
- Renamed Immersive Project Calculator.
- Fixed: Squarespace rewrote the `<html>` tag inside the embed; the embed now has no document wrapper.

## Pipeline growth (v38–v49)
- Trimmed BRAW stage between Dailies and Denoise, with its own transfer speed; uses shots and handles.
- None option for the denoise codec.
- MV-HEVC delivery on its own row; 8160 × 7200 added to delivery resolutions.
- Blank or zero MV-HEVC bitrate = stream not made.
- Detail toggle folds Rate, Data/hr, Runtime/TB and per-hour time columns.
- Durations past 24 hours read in days; zero totals read as a dash.
- Data total moved beside the render/offload/transfer total; total headers bold.
- Capture's last column renamed Offload total. Post row renamed Delivery codec.
- Single blue accent for the selected row.

## Foundations (to v37)
- Stereo doubling throughout; ProRes rates from Apple's published targets;
  BRAW rates from Blackmagic's URSA Cine Immersive figures; MV-HEVC as a total-stream bitrate.
- Stages: Capture, Dailies, Denoise, Delivery, Total; cameras × days; offload speed;
  render nodes; storage and render cost.
- White and black, one font, fragments only, no commas in numbers.
- Click a row to open a stage's alternatives, click again to choose.
- Single timecode field per runtime with per-digit editing.
