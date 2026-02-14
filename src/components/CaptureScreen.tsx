import React from 'react';
import type { PermissionStatus } from '@apps-in-toss/web-framework';
import type { PalmCapture } from '../types';

interface CaptureScreenProps {
  capture: PalmCapture | null;
  permission: PermissionStatus | null;
  isCapturing: boolean;
  isRequestingPermission: boolean;
  message: string | null;
  onBack: () => void;
  onCapture: () => void;
  onAnalyze: () => void;
  onClear: () => void;
  onRequestPermission: () => void;
}

export const CaptureScreen: React.FC<CaptureScreenProps> = ({
  capture,
  permission,
  isCapturing,
  isRequestingPermission,
  message,
  onBack,
  onCapture,
  onAnalyze,
  onClear,
  onRequestPermission,
}) => {
  const isAllowed = permission === 'allowed';

  return (
    <section className="section-pad">
      <button type="button" className="ghost-btn mb-3" onClick={onBack}>
        홈으로
      </button>

      <div className="preview-frame">
        {capture ? (
          <img src={capture.previewUri} alt="손금 촬영 이미지" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <i className="ri-hand-heart-line text-5xl text-secondary" />
            <p className="mt-3 text-sm font-medium text-slate-700">손바닥 전체가 프레임에 들어오게 맞춰 주세요.</p>
            <p className="mt-1 text-xs text-slate-500">밝은 곳에서 배경 대비를 확보하면 분석 품질이 좋아져요.</p>
          </div>
        )}
      </div>

      {!isAllowed ? (
        <div className="warning-card mt-4 rounded-2xl p-4">
          <p className="text-sm font-semibold text-accent-deep">카메라 권한이 필요해요.</p>
          <p className="mt-1 text-sm text-accent-deep">권한을 허용하면 바로 촬영할 수 있어요.</p>
          <button
            type="button"
            className="secondary-btn mt-3"
            onClick={onRequestPermission}
            disabled={isRequestingPermission}
          >
            {isRequestingPermission ? '권한 요청 중...' : '권한 허용하기'}
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p> : null}

      <div className="mt-5 grid grid-cols-1 gap-3">
        <button
          type="button"
          className="primary-btn"
          onClick={onCapture}
          disabled={!isAllowed || isCapturing || isRequestingPermission}
        >
          {isCapturing ? '촬영 중...' : capture ? '다시 촬영하기' : '손금 촬영하기'}
        </button>

        {capture ? (
          <>
            <button type="button" className="secondary-btn" onClick={onAnalyze}>
              결과 분석하기
            </button>
            <button type="button" className="ghost-btn" onClick={onClear}>
              촬영 이미지 지우기
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
};
