// Registra il teaser del gestionale dalla home di produzione, fotogramma per fotogramma.
// Il tempo della pagina (GSAP, requestAnimationFrame) e le animazioni CSS avanzano di 1/30 s
// tra un'istantanea e l'altra, così il video è fluido anche su una macchina lenta.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.env.TEASER_URL ?? "https://www.tiberiusmc.it/";
const W = Number(process.env.W ?? 1920);
const H = Number(process.env.H ?? 1080);
const FPS = 30;
const OUT = process.env.OUT ?? "frames";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--disable-gpu-vsync", "--force-color-profile=srgb"] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: Number(process.env.DSF ?? 1) });
page.on("console", (m) => console.log("[page]", m.type(), m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.clock.install();
console.log("goto");
await page.goto(URL, { waitUntil: "load", timeout: 60000 });
console.log("loaded");
await page.screenshot({ path: `${OUT}-debug-load.png` });
await page.waitForSelector(".tz-frame .tz-screen .gx-stage", { state: "attached", timeout: 30000 });
console.log("teaser found");
// lascia caricare skin, immagini e font
await page.waitForTimeout(4000);
await page.evaluate(() => document.fonts.ready);

const now = await page.evaluate(() => Date.now());
await page.clock.pauseAt(now + 1000);

// Il teaser occupa tutto lo schermo, senza comandi
await page.addStyleTag({
  content: `
    .tz-frame { position: fixed !important; inset: 0 !important; z-index: 2147483647 !important; width: 100vw !important; height: 100vh !important;
      aspect-ratio: auto !important; border-radius: 0 !important; border: 0 !important; }
    .tz-controls, .tz-bar { display: none !important; }
    html, body { overflow: hidden !important; }
  `,
});
await page.evaluate(() => {
  window.__stepCss = (dt) => {
    for (const a of document.getAnimations()) {
      if (a.playState === "running") a.pause();
      if (a.currentTime !== null) a.currentTime = Number(a.currentTime) + dt;
    }
  };
});

// ricostruzione della regia sulla nuova grandezza (ResizeObserver + 120 ms)
await page.waitForTimeout(600);
await page.clock.runFor(400);
await page.waitForTimeout(300);

const dt = 1000 / FPS;
const total = Number(process.env.SECONDS ?? 25.5) * FPS;
for (let i = 0; i < total; i++) {
  await page.clock.runFor(dt);
  await page.evaluate((d) => window.__stepCss(d), dt);
  await page.screenshot({ path: `${OUT}/f${String(i).padStart(5, "0")}.png` });
  if (i % 60 === 0) console.log(`frame ${i}/${total}`);
}
await browser.close();
