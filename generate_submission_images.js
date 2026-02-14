const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = __dirname;
const RAW = path.join(BASE, 'raw');
const SUB = path.join(BASE, 'submission');
const LOGOS = path.join(BASE, '..', 'app-logos');

const APP = {
  displayName: '손금 수명 미리보기',
  desc: '손바닥 한 컷으로 보는 수명 흐름',
  color: '#1F7A3E',
  light: '#DDF3E7',
  accent: '#F4C95D',
};

const FONTS = `
<link href="https://cdn.jsdelivr.net/gh/webfontworld/gmarket/GmarketSans.css" rel="stylesheet">
<link rel="stylesheet" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
`;

function readB64(file) {
  return fs.readFileSync(file).toString('base64');
}

function resolveIconPath() {
  const candidates = [
    path.join(LOGOS, 'palm-lifeline.png'),
    path.join(LOGOS, 'palm-lifeline-palm_logo_v3.png'),
    path.join(LOGOS, 'palm-lifeline-palm_logo_v2.png'),
    path.join(LOGOS, 'palm-lifeline-palm_logo_v1.png'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error('No palm-lifeline logo found in app-logos/');
}

function phoneCSS(width) {
  const frameRadius = Math.round(width * 0.13);
  const screenRadius = Math.round(width * 0.11);
  const pad = Math.round(width * 0.03);
  const notchW = Math.round(width * 0.33);
  const notchH = Math.round(width * 0.07);
  return `
.phone {
  width:${width}px;
  padding:${pad}px;
  border-radius:${frameRadius}px;
  background:#101010;
  box-shadow:0 ${Math.round(width * 0.08)}px ${Math.round(width * 0.17)}px rgba(0,0,0,0.32),
             inset 0 1px 0 rgba(255,255,255,0.12);
  position:relative;
  flex-shrink:0;
}
.phone::before {
  content:'';
  position:absolute;
  top:${pad}px;
  left:50%;
  transform:translateX(-50%);
  width:${notchW}px;
  height:${notchH}px;
  background:#101010;
  border-radius:0 0 ${Math.round(notchH * 0.7)}px ${Math.round(notchH * 0.7)}px;
  z-index:9;
}
.screen {
  border-radius:${screenRadius}px;
  overflow:hidden;
  background:#fff;
}
.screen img {
  width:100%;
  display:block;
}`;
}

function thumbSquareHTML(iconB64) {
  return `<!doctype html><html><head><meta charset="UTF-8">${FONTS}
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body {
  width:1000px; height:1000px; overflow:hidden;
  background:
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.25), transparent 42%),
    radial-gradient(circle at 15% 85%, rgba(255,255,255,0.22), transparent 36%),
    linear-gradient(140deg, #2A9A54, #1F7A3E 55%, #14502A);
  display:flex; align-items:center; justify-content:center;
  font-family:'GmarketSans', 'Pretendard Variable', sans-serif;
  color:#fff;
}
.wrap { text-align:center; }
.halo {
  width:320px; height:320px; margin:0 auto 28px;
  border-radius:80px;
  background:rgba(255,255,255,0.18);
  backdrop-filter:blur(3px);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 18px 48px rgba(0,0,0,0.22);
}
.icon {
  width:238px; height:238px; border-radius:58px; object-fit:cover;
  box-shadow:0 8px 28px rgba(0,0,0,0.18);
}
h1 { font-size:64px; line-height:1.18; letter-spacing:-1.2px; text-shadow:0 2px 8px rgba(0,0,0,0.18); }
p { margin-top:16px; font-size:30px; color:rgba(255,255,255,0.88); letter-spacing:-0.4px; }
.badge {
  margin:26px auto 0; width:max-content;
  padding:10px 18px;
  border-radius:999px;
  background:rgba(255,255,255,0.16);
  border:1px solid rgba(255,255,255,0.34);
  font-size:20px;
}
</style></head><body>
  <div class="wrap">
    <div class="halo"><img class="icon" src="data:image/png;base64,${iconB64}" /></div>
    <h1>${APP.displayName}</h1>
    <p>${APP.desc}</p>
    <div class="badge">카메라 촬영 · 즉시 리딩</div>
  </div>
</body></html>`;
}

function thumbLandscapeHTML(iconB64, screen1B64) {
  return `<!doctype html><html><head><meta charset="UTF-8">${FONTS}
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body {
  width:1932px; height:828px; overflow:hidden;
  background:
    radial-gradient(circle at 85% 12%, rgba(255,255,255,0.28), transparent 34%),
    radial-gradient(circle at 18% 88%, rgba(255,255,255,0.19), transparent 30%),
    linear-gradient(140deg, #2AAE5F, #1F7A3E 58%, #104C28);
  font-family:'GmarketSans', 'Pretendard Variable', sans-serif;
  color:#fff;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 110px;
}
.left { width:58%; }
.logo-row { display:flex; align-items:center; gap:20px; margin-bottom:28px; }
.icon { width:148px; height:148px; border-radius:34px; box-shadow:0 12px 34px rgba(0,0,0,0.22); }
.brand { font-size:54px; letter-spacing:-1px; text-shadow:0 2px 7px rgba(0,0,0,0.17); }
.desc { font-size:32px; color:rgba(255,255,255,0.9); line-height:1.4; max-width:760px; }
.chips { margin-top:22px; display:flex; gap:10px; }
.chip {
  padding:10px 16px; border-radius:999px;
  background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.34);
  font-size:18px;
}
.right { position:relative; margin-right:40px; }
${phoneCSS(262)}
.phone { transform:rotate(5deg); }
</style></head><body>
  <section class="left">
    <div class="logo-row">
      <img class="icon" src="data:image/png;base64,${iconB64}" />
      <h1 class="brand">${APP.displayName}</h1>
    </div>
    <p class="desc">${APP.desc}</p>
    <div class="chips">
      <span class="chip">권한 확인</span>
      <span class="chip">손바닥 촬영</span>
      <span class="chip">점수 리딩</span>
    </div>
  </section>
  <section class="right">
    <div class="phone"><div class="screen"><img src="data:image/png;base64,${screen1B64}" /></div></div>
  </section>
</body></html>`;
}

function screenshotLandscapeHTML(iconB64, s1B64, s2B64, s3B64) {
  return `<!doctype html><html><head><meta charset="UTF-8">${FONTS}
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body {
  width:1504px; height:741px; overflow:hidden;
  font-family:'GmarketSans', 'Pretendard Variable', sans-serif;
  background:
    radial-gradient(circle at 78% 22%, rgba(255,255,255,0.25), transparent 34%),
    radial-gradient(circle at 22% 82%, rgba(255,255,255,0.2), transparent 38%),
    linear-gradient(155deg, #E9F8EF 0%, #CDEEDB 35%, #A5DABF 66%, #7EC79E 100%);
  position:relative;
  color:#0B3B21;
}
.grain {
  position:absolute; inset:0; pointer-events:none;
  background-image: radial-gradient(rgba(31,122,62,0.08) 1px, transparent 1px);
  background-size: 12px 12px;
  opacity:0.28;
}
.brand {
  position:absolute; top:24px; left:50%; transform:translateX(-50%);
  display:flex; align-items:center; gap:12px;
  padding:10px 16px;
  border-radius:999px;
  background:rgba(255,255,255,0.6);
  border:1px solid rgba(31,122,62,0.18);
  backdrop-filter: blur(6px);
  z-index:20;
}
.brand img { width:36px; height:36px; border-radius:10px; }
.brand span { font-size:24px; color:#155E34; letter-spacing:-0.4px; }

.track {
  position:absolute;
  left:92px; right:92px; top:188px; height:300px;
  border-radius:999px;
  border:3px dashed rgba(31,122,62,0.28);
  z-index:3;
}
.track::before {
  content:'';
  position:absolute;
  inset:-14px;
  border-radius:999px;
  border:2px solid rgba(255,255,255,0.52);
}

.stage {
  position:absolute;
  width:170px; text-align:center; z-index:15;
  color:rgba(11,59,33,0.8); font-size:14px;
}
.stage b {
  display:inline-flex; align-items:center; justify-content:center;
  width:28px; height:28px; border-radius:50%;
  background:#1F7A3E; color:#fff; font-size:14px; margin-bottom:6px;
  box-shadow:0 6px 14px rgba(31,122,62,0.32);
}

.phones {
  position:absolute;
  inset:0;
  z-index:10;
}
${phoneCSS(184)}
.phone-left { position:absolute; left:190px; top:256px; transform:rotate(-10deg); }
.phone-mid { position:absolute; left:640px; top:170px; transform:rotate(0deg) scale(1.12); }
.phone-right { position:absolute; right:190px; top:256px; transform:rotate(10deg); }

.label {
  position:absolute;
  left:50%; transform:translateX(-50%);
  bottom:28px;
  padding:10px 18px;
  border-radius:999px;
  background:rgba(255,255,255,0.72);
  border:1px solid rgba(31,122,62,0.2);
  color:#155E34;
  font-size:19px;
  z-index:20;
}

.spark {
  position:absolute;
  border-radius:50%;
  background: radial-gradient(circle, rgba(244,201,93,0.9) 0%, rgba(244,201,93,0.2) 45%, transparent 70%);
  filter: blur(0.4px);
}
</style></head><body>
  <div class="grain"></div>
  <div class="track"></div>

  <header class="brand">
    <img src="data:image/png;base64,${iconB64}" />
    <span>${APP.displayName}</span>
  </header>

  <section class="phones">
    <div class="phone phone-left"><div class="screen"><img src="data:image/png;base64,${s1B64}" /></div></div>
    <div class="phone phone-mid"><div class="screen"><img src="data:image/png;base64,${s2B64}" /></div></div>
    <div class="phone phone-right"><div class="screen"><img src="data:image/png;base64,${s3B64}" /></div></div>
  </section>

  <div class="stage" style="left:200px; top:530px;"><b>1</b><div>권한/시작</div></div>
  <div class="stage" style="left:667px; top:102px;"><b>2</b><div>손금 촬영</div></div>
  <div class="stage" style="right:200px; top:530px;"><b>3</b><div>리딩 결과</div></div>

  <div class="spark" style="width:38px;height:38px;left:304px;top:186px;"></div>
  <div class="spark" style="width:26px;height:26px;left:460px;top:146px;"></div>
  <div class="spark" style="width:32px;height:32px;left:966px;top:146px;"></div>
  <div class="spark" style="width:30px;height:30px;right:320px;top:188px;"></div>
  <div class="spark" style="width:26px;height:26px;left:742px;bottom:120px;"></div>

  <div class="label">${APP.desc}</div>
</body></html>`;
}

async function main() {
  fs.mkdirSync(SUB, { recursive: true });

  const iconPath = resolveIconPath();
  const iconB64 = readB64(iconPath);
  const s1 = readB64(path.join(RAW, 'screen-1.png'));
  const s2 = readB64(path.join(RAW, 'screen-2.png'));
  const s3 = readB64(path.join(RAW, 'screen-3.png'));

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1000, height: 1000 });
  await page.setContent(thumbSquareHTML(iconB64));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(SUB, 'thumb-square.png') });
  console.log('[OK] submission/thumb-square.png');

  await page.setViewportSize({ width: 1932, height: 828 });
  await page.setContent(thumbLandscapeHTML(iconB64, s1));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(SUB, 'thumb-landscape.png') });
  console.log('[OK] submission/thumb-landscape.png');

  await page.setViewportSize({ width: 1504, height: 741 });
  await page.setContent(screenshotLandscapeHTML(iconB64, s1, s2, s3));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(SUB, 'screenshot-landscape.png') });
  console.log('[OK] submission/screenshot-landscape.png');

  await page.close();
  await browser.close();

  console.log('Done');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
