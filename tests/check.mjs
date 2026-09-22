// Headless checks for the calculator. Run: npm test
// Every check here guards a decision that was made on purpose; see CLAUDE.md.
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const URL0 = pathToFileURL(resolve("index.html")).href;
let failed = 0;
function check(name, ok, got) {
  console.log((ok ? "PASS " : "FAIL ") + name + (ok ? "" : "  -> got: " + JSON.stringify(got)));
  if (!ok) failed++;
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1100, height: 1400 } });
const errors = [];
async function open(url) {
  const p = await ctx.newPage();
  p.on("pageerror", e => errors.push(e.message));
  p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await p.goto(url);
  await p.waitForTimeout(300);
  return p;
}
const val = (p, id) => p.$eval("#" + id, el => el.value);
const txt = (p, sel) => p.$eval(sel, el => el.innerText.replace(/\s+/g, " ").trim());
async function setTc(p, id, v) {
  await p.$eval("#" + id, (el, v) => { el.value = v; el.dispatchEvent(new Event("blur")); }, v);
  await p.waitForTimeout(80);
}
async function fill(p, id, v) { await p.fill("#" + id, v); await p.waitForTimeout(80); }
async function pick(p, id, v) { await p.selectOption("#" + id, v); await p.waitForTimeout(80); }

// ---- defaults ----
let p = await open(URL0);
const want = { prfps: "39", mvfps: "35", dlfps: "", dspeed: "1.5", shots: "", handles: "", nodes: "",
               tcA: "00:00:00:00", tcB: "00:00:00:00", selDai: "proxy", selPost: "4444", fps: "90" };
for (const [id, v] of Object.entries(want)) check("default " + id + " = " + JSON.stringify(v), (await val(p, id)) === v, await val(p, id));
check("presets removed", (await p.$("#pSel")) === null, "pSel present");
check("clean start has no link state", (await p.evaluate(() => location.hash)) === "", await p.evaluate(() => location.hash));

// ---- codec anchors ----
// BRAW 12:1 at 8160x7200 x2 @ 90 fps: Blackmagic's URSA Cine Immersive figure
const braw = await txt(p, "#tCap tr");
check("BRAW 12:1 @ 8160x7200 90fps = 1.34 GB/s", braw.replace(/ /g, "").includes("1.34GB/s"), braw);
// ProRes 422 HQ is 220 Mb/s at 1920x1080 29.97 per Apple; stereo doubles it: 440 Mb/s = 55.0 MB/s
await fill(p, "cw", "1920"); await fill(p, "ch", "1080"); await pick(p, "fps", "29.97"); await pick(p, "selPost", "hq");
const hq = await txt(p, "#tPost tr.on");
check("ProRes 422 HQ 1080p29.97 stereo = 55.0 MB/s", hq.replace(/ /g, "").includes("55.0MB/s"), hq);

// ---- render time ----
p = await open(URL0);
await setTc(p, "tcB", "00:05:00:00");
check("denoise 5 min @ 90fps, 1.5 fps, stereo = 5.0 hr", (await txt(p, "#tDnHr")) === "5.0", await txt(p, "#tDnHr"));
const del = await txt(p, "#tDel");
check("blank delivery fps dashes the render total", /MV-HEVC .* — *$/.test(del) || del.trim().endsWith("—"), del);
await setTc(p, "tcA", "00:10:00:00");
// dailies ProRes 54000 fr / 39 + MV-HEVC 54000 fr / 35 + denoise 18000 s = 5.8 node-hours
check("total render hours = 5.8", (await txt(p, "#tNodeHr")) === "5.8", await txt(p, "#tNodeHr"));

// ---- formatting ----
const body = await txt(p, "body");
check("no commas inside numbers", !/\d,\d/.test(body), body.match(/\d,\d.{0,10}/));
await setTc(p, "tcA", "10:00:00:00"); await fill(p, "days", "3");
check("durations past 24 h read in days", (await txt(p, "#tDai")).includes("d "), await txt(p, "#tDai"));

// ---- custom fps picks the preset or Custom ----
p = await open(URL0);
for (const [typed, sel] of [["24", "24"], ["23.976", "23.98"], ["23.98", "23.98"], ["48", "custom"]]) {
  await fill(p, "cfps", typed);
  check(`custom fps ${typed} -> Frame rate ${sel}`, (await val(p, "fps")) === sel, await val(p, "fps"));
}

// ---- estimate links ----
p = await open(URL0);
await setTc(p, "tcA", "00:30:00:00"); await fill(p, "cams", "2"); await pick(p, "selCap", "b8");
await fill(p, "nodes", "4"); await p.click("#uGb"); await p.waitForTimeout(100);
const hash = await p.evaluate(() => location.hash);
check("link keeps colons readable", hash.includes("tcA=00:30:00:00"), hash);
const t1 = await txt(p, "#total");
const p2 = await open(URL0 + hash);
check("a link reproduces the estimate", (await txt(p2, "#total")) === t1, await txt(p2, "#total"));
await p2.click("#reset"); await p2.waitForTimeout(100);
check("Reset clears the link", (await p2.evaluate(() => location.hash)) === "", await p2.evaluate(() => location.hash));

// ---- embed mode (the website loads this in a frame and passes ?embed=) ----
const host = "https://example.com/calc";
const pe = await open(URL0 + "?embed=" + encodeURIComponent(host) + "#nodes=3");
check("embed mode hides the dock", (await pe.$eval(".dock", el => getComputedStyle(el).display)) === "none", "dock visible");
check("embed mode reads the passed estimate", (await val(pe, "nodes")) === "3", await val(pe, "nodes"));
await pe.click("#share"); await pe.waitForTimeout(200);
const out = await pe.$eval("#shareOut", el => el.value);
check("embed Copy link points at the website", out === "" || out.startsWith(host + "#nodes=3"), out);

check("no page errors", errors.length === 0, errors);
await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
