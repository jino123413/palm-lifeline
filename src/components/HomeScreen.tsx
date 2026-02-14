import React from 'react';
import type { PermissionStatus } from '@apps-in-toss/web-framework';

interface HomeScreenProps {
  permission: PermissionStatus | null;
  isCheckingPermission: boolean;
  isRequestingPermission: boolean;
  message: string | null;
  onStart: () => void;
  onRequestPermission: () => void;
}

const PERMISSION_TEXT: Record<string, string> = {
  allowed: '카메라 권한이 허용되어 바로 손금을 촬영할 수 있어요.',
  denied: '카메라 권한이 거부되어 있어요. 다시 허용해 주세요.',
  restricted: '디바이스 설정으로 카메라 사용이 제한되어 있어요.',
  unavailable: '현재 환경에서 카메라 사용이 어려워요.',
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  permission,
  isCheckingPermission,
  isRequestingPermission,
  message,
  onStart,
  onRequestPermission,
}) => {
  const permissionStatus = permission ?? 'unknown';
  const permissionMessage =
    PERMISSION_TEXT[permissionStatus] ?? '카메라 권한 상태를 확인 중이에요.';

  return (
    <section className="section-pad">
      <div className="hero-card">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-deep">손금 수명 미리보기</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">손바닥 한 컷으로 보는 수명 흐름</h2>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          손바닥 사진 한 장으로 생기, 안정, 회복 흐름을 간단히 읽어드려요. 결과는 로컬에서 즉시 계산되며 재미용
          리딩으로 제공됩니다.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-4">
        <h3 className="text-sm font-semibold text-slate-900">진행 방식</h3>
        <ol className="mt-2 space-y-2 text-sm text-slate-700">
          <li>1. 카메라 권한 허용</li>
          <li>2. 손바닥 중앙 촬영</li>
          <li>3. 점수/가이드 확인 후 공유</li>
        </ol>
      </div>

      <div className="info-card mt-4 rounded-2xl p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary-deep">권한 상태</p>
        <p className="mt-1 text-sm text-slate-700">{permissionMessage}</p>
        {message ? <p className="mt-2 text-sm font-medium text-primary-deep">{message}</p> : null}
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          className="primary-btn"
          onClick={onStart}
          disabled={isCheckingPermission || isRequestingPermission}
        >
          {isCheckingPermission || isRequestingPermission ? '권한 확인 중...' : '손금 찍기 시작'}
        </button>

        {permission !== 'allowed' ? (
          <button
            type="button"
            className="secondary-btn"
            onClick={onRequestPermission}
            disabled={isRequestingPermission}
          >
            {isRequestingPermission ? '권한 요청 중...' : '카메라 권한 다시 요청'}
          </button>
        ) : null}
      </div>
    </section>
  );
};
