const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const APP_URL = process.env.APP_URL || 'http://localhost:3001';
const RAW_DIR = path.resolve(__dirname, '..', 'raw');
const MOCK_CAPTURE_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2z4AAAAASUVORK5CYII=';

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  });

  await context.addInitScript(({ mockCaptureDataUri }) => {
    let permission = 'denied';

    const emitter = {
      events: {},
      emit(event, payload) {
        const listeners = this.events[event] || [];
        for (const listener of listeners) {
          listener(payload);
        }
      },
      on(event, listener) {
        this.events[event] = this.events[event] || [];
        this.events[event].push(listener);
        return () => {
          this.events[event] = (this.events[event] || []).filter((fn) => fn !== listener);
        };
      },
    };

    window.__GRANITE_NATIVE_EMITTER = emitter;
    window.__CONSTANT_HANDLER_MAP = {
      ...(window.__CONSTANT_HANDLER_MAP || {}),
      getPlatformOS: () => 'android',
      getOperationalEnvironment: () => 'sandbox',
      getLocale: () => 'ko-KR',
      getSchemeUri: () => 'https://localhost/palm-lifeline',
      getTossAppVersion: () => '5.300.0',
      getDeviceId: () => 'playwright-device',
      getSafeAreaTop: () => 0,
      getSafeAreaBottom: () => 0,
      getSafeAreaLeft: () => 0,
      getSafeAreaRight: () => 0,
      deploymentId: () => '0',
      brandDisplayName: () => '손금 수명 미리보기',
      brandIcon: () => '',
      brandPrimaryColor: () => '#1F7A3E',
      brandBridgeColorMode: () => 'basic',
    };

    function resolve(functionName, eventId, payload) {
      window.__GRANITE_NATIVE_EMITTER.emit(`${functionName}/resolve/${eventId}`, payload);
    }

    function reject(functionName, eventId, payload) {
      window.__GRANITE_NATIVE_EMITTER.emit(`${functionName}/reject/${eventId}`, payload);
    }

    window.ReactNativeWebView = {
      postMessage(message) {
        let payload;
        try {
          payload = JSON.parse(message);
        } catch {
          return;
        }

        if (!payload || payload.type !== 'method') {
          return;
        }

        const { functionName, eventId, args = [] } = payload;

        switch (functionName) {
          case 'getPermission': {
            const requestedPermission = args[0];
            if (requestedPermission && requestedPermission.name === 'camera') {
              resolve(functionName, eventId, permission);
              return;
            }
            resolve(functionName, eventId, 'allowed');
            return;
          }
          case 'openPermissionDialog':
          case 'requestPermission': {
            permission = 'allowed';
            resolve(functionName, eventId, permission);
            return;
          }
          case 'openCamera': {
            if (permission !== 'allowed') {
              reject(functionName, eventId, {
                __isError: true,
                name: 'openCamera permission error',
                message: '카메라 권한이 거부되었어요.',
              });
              return;
            }

            resolve(functionName, eventId, {
              id: `mock-capture-${Date.now()}`,
              dataUri: mockCaptureDataUri,
            });
            return;
          }
          case 'getTossShareLink': {
            resolve(functionName, eventId, 'https://toss.im/fake/palm-lifeline');
            return;
          }
          case 'share':
          case 'eventLog':
          case 'setScreenAwakeMode':
          case 'setDeviceOrientation':
          case 'setSecureScreen':
          case 'setIosSwipeGestureEnabled':
          case 'closeView':
          case 'generateHapticFeedback': {
            resolve(functionName, eventId, null);
            return;
          }
          default: {
            resolve(functionName, eventId, null);
          }
        }
      },
    };
  }, { mockCaptureDataUri: MOCK_CAPTURE_DATA_URI });

  const page = await context.newPage();
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  await page.screenshot({ path: path.join(RAW_DIR, 'screen-1.png') });
  console.log('[OK] raw/screen-1.png');

  await page.getByRole('button', { name: '손금 찍기 시작' }).click();
  await page.getByRole('button', { name: '손금 촬영하기' }).click();
  await page.waitForSelector('button:has-text("결과 분석하기")', { timeout: 10000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(RAW_DIR, 'screen-2.png') });
  console.log('[OK] raw/screen-2.png');

  await page.getByRole('button', { name: '결과 분석하기' }).click();
  await page.waitForSelector('text=핵심 해석', { timeout: 10000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(RAW_DIR, 'screen-3.png') });
  console.log('[OK] raw/screen-3.png');

  await browser.close();
  console.log('Done');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
