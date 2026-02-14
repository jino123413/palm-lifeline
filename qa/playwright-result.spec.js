const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const APP_URL = process.env.APP_URL || 'http://localhost:3001';
const OUTPUT_DIR = path.resolve(__dirname, 'artifacts');
const RESULT_SCREENSHOT_PATH = path.join(OUTPUT_DIR, 'palm-lifeline-result.png');
const MOCK_CAPTURE_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2z4AAAAASUVORK5CYII=';

test('camera permission flow reaches result screen', async ({ page, context }) => {
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

  await page.goto(APP_URL, { waitUntil: 'networkidle' });

  await expect(page.getByRole('button', { name: '손금 찍기 시작' })).toBeVisible();
  await page.getByRole('button', { name: '손금 찍기 시작' }).click();

  await expect(page.getByRole('button', { name: '손금 촬영하기' })).toBeVisible();
  await page.getByRole('button', { name: '손금 촬영하기' }).click();

  await expect(page.getByRole('button', { name: '결과 분석하기' })).toBeVisible();
  await page.getByRole('button', { name: '결과 분석하기' }).click();

  await expect(page.getByText('핵심 해석')).toBeVisible();

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  await page.screenshot({ path: RESULT_SCREENSHOT_PATH, fullPage: true });
  console.log(`RESULT_SCREENSHOT=${RESULT_SCREENSHOT_PATH}`);
});
