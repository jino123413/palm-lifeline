import React, { useCallback, useMemo, useState } from 'react';
import { getTossShareLink, share } from '@apps-in-toss/web-framework';
import { CaptureScreen, DeviceViewport, HomeScreen, ResultScreen } from './components';
import { useCameraPermissionGate, usePalmCapture } from './hooks';
import { analyzePalmLifeline } from './utils';
import type { AppScreen, PalmReadingResult } from './types';

const APP_NAME = '손금 수명 미리보기';
const APP_DEEP_LINK = 'intoss://palm-lifeline/home';
const SHARE_OG_IMAGE = 'https://static.toss.im/icons/png/4x/icon-person-man.png';

const SCREEN_TITLE: Record<AppScreen, string> = {
  home: APP_NAME,
  capture: '손금 촬영',
  result: '분석 결과',
};

function permissionNotice(permission: string | null): string | null {
  if (permission === null || permission === 'allowed') {
    return null;
  }

  if (permission === 'denied') {
    return '권한이 거부되어 있어요. 권한 허용 후 다시 시도해 주세요.';
  }

  if (permission === 'restricted') {
    return '디바이스 정책으로 카메라 권한이 제한되어 있어요.';
  }

  if (permission === 'unavailable') {
    return '현재 환경에서 카메라를 사용할 수 없어요.';
  }

  return '카메라 권한 확인이 필요해요.';
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [result, setResult] = useState<PalmReadingResult | null>(null);
  const [appMessage, setAppMessage] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const {
    permission,
    isCheckingPermission,
    isRequestingPermission,
    requestPermission,
    ensureCameraPermission,
  } = useCameraPermissionGate();

  const { capture, isCapturing, errorMessage, capturePalm, clearCapture, clearError } = usePalmCapture();

  const ensurePermission = useCallback(async (): Promise<boolean> => {
    const allowed = await ensureCameraPermission();

    if (!allowed) {
      setAppMessage('손금 촬영을 위해 카메라 권한을 허용해 주세요.');
    } else {
      setAppMessage(null);
    }

    return allowed;
  }, [ensureCameraPermission]);

  const handleStart = useCallback(async () => {
    clearError();
    const allowed = await ensurePermission();
    if (!allowed) {
      return;
    }
    setScreen('capture');
  }, [clearError, ensurePermission]);

  const handleRequestPermission = useCallback(async () => {
    const status = await requestPermission();
    if (status !== 'allowed') {
      setAppMessage('권한이 허용되지 않으면 촬영 기능을 사용할 수 없어요.');
      return;
    }

    setAppMessage(null);
  }, [requestPermission]);

  const handleCapture = useCallback(async () => {
    clearError();
    const allowed = await ensurePermission();
    if (!allowed) {
      return;
    }

    await capturePalm();
  }, [clearError, ensurePermission, capturePalm]);

  const handleAnalyze = useCallback(() => {
    if (!capture) {
      setAppMessage('먼저 손금 사진을 촬영해 주세요.');
      return;
    }

    const analyzed = analyzePalmLifeline(capture);
    setResult(analyzed);
    setShareError(null);
    setAppMessage(null);
    setScreen('result');
  }, [capture]);

  const handleBackToCapture = useCallback(() => {
    setScreen('capture');
    setShareError(null);
  }, []);

  const handleRestart = useCallback(() => {
    clearCapture();
    clearError();
    setResult(null);
    setShareError(null);
    setAppMessage(null);
    setScreen('home');
  }, [clearCapture, clearError]);

  const handleShare = useCallback(async () => {
    if (!result) {
      return;
    }

    setIsSharing(true);
    setShareError(null);

    const messagePrefix = [
      `[${APP_NAME} 결과]`,
      `${result.tierLabel} · ${result.headline}`,
      result.summary,
      `생기 ${result.scores.vitality} / 안정 ${result.scores.stability} / 회복 ${result.scores.recovery} / 집중 ${result.scores.focus}`,
    ].join('\n');

    try {
      let shareText = messagePrefix;

      try {
        const tossLink = await getTossShareLink(APP_DEEP_LINK, SHARE_OG_IMAGE);
        shareText = `${messagePrefix}\n${tossLink}`;
      } catch {
        shareText = `${messagePrefix}\n${APP_DEEP_LINK}`;
      }

      await share({ message: shareText });
    } catch (error) {
      if (error instanceof Error) {
        setShareError(error.message);
      } else {
        setShareError('공유 중 문제가 발생했어요.');
      }
    } finally {
      setIsSharing(false);
    }
  }, [result]);

  const homeMessage = useMemo(
    () => appMessage ?? permissionNotice(permission ?? null),
    [appMessage, permission],
  );

  const captureMessage = useMemo(
    () => errorMessage ?? appMessage ?? permissionNotice(permission ?? null),
    [errorMessage, appMessage, permission],
  );

  return (
    <>
      <DeviceViewport />
      <div className="app-shell">
        <div className="app-panel">
          <header className="section-pad border-b border-slate-200/80 bg-white/80 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-deep">{APP_NAME}</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">{SCREEN_TITLE[screen]}</h1>
            <p className="mt-2 text-sm text-slate-600">손금 리딩은 오락용 참고 콘텐츠이며 결과는 로컬에서 계산됩니다.</p>
          </header>

          {screen === 'home' ? (
            <HomeScreen
              permission={permission}
              isCheckingPermission={isCheckingPermission}
              isRequestingPermission={isRequestingPermission}
              message={homeMessage}
              onStart={handleStart}
              onRequestPermission={handleRequestPermission}
            />
          ) : null}

          {screen === 'capture' ? (
            <CaptureScreen
              capture={capture}
              permission={permission}
              isCapturing={isCapturing}
              isRequestingPermission={isRequestingPermission}
              message={captureMessage}
              onBack={handleRestart}
              onCapture={handleCapture}
              onAnalyze={handleAnalyze}
              onClear={clearCapture}
              onRequestPermission={handleRequestPermission}
            />
          ) : null}

          {screen === 'result' && result && capture ? (
            <ResultScreen
              capture={capture}
              result={result}
              isSharing={isSharing}
              shareError={shareError}
              onBackToCapture={handleBackToCapture}
              onRestart={handleRestart}
              onShare={handleShare}
            />
          ) : null}
        </div>
      </div>
    </>
  );
};

export default App;
