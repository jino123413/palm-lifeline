import React from 'react';
import type { PalmCapture, PalmReadingResult } from '../types';
import BannerAd from './BannerAd';

const BANNER_AD_GROUP_ID = 'ait.v2.live.70026985178a4a52';

interface ResultScreenProps {
  capture: PalmCapture;
  result: PalmReadingResult;
  isDetailUnlocked: boolean;
  adLoading: boolean;
  onBackToCapture: () => void;
  onRestart: () => void;
  onUnlockDetail: () => void;
}

const SCORE_LABELS: Array<{
  key: keyof PalmReadingResult['scores'];
  label: string;
}> = [
  { key: 'vitality', label: '활력' },
  { key: 'stability', label: '안정' },
  { key: 'recovery', label: '회복' },
  { key: 'focus', label: '집중' },
];

export const ResultScreen: React.FC<ResultScreenProps> = ({
  capture,
  result,
  isDetailUnlocked,
  adLoading,
  onBackToCapture,
  onRestart,
  onUnlockDetail,
}) => {
  return (
    <section className="section-pad">
      <div className="result-hero-card rounded-2xl p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary-deep">{result.tierLabel}</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">{result.headline}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700 copy-block">{result.summary}</p>
      </div>

      <div className="mt-4 grid grid-cols-[84px_1fr] gap-3 rounded-2xl border border-slate-200 bg-white p-3">
        <img src={capture.previewUri} alt="손바닥 촬영 미리보기" className="h-20 w-20 rounded-xl object-cover" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">촬영 시각</p>
          <p className="mt-1 text-sm text-slate-700">{new Date(result.generatedAt).toLocaleString('ko-KR')}</p>
          <p className="mt-2 text-xs text-slate-500 copy-block">{result.disclaimer}</p>
        </div>
      </div>

      {!isDetailUnlocked ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">상세 수명 분석</h3>
          <p className="mt-2 text-sm text-slate-700 copy-block">
            광고를 본 뒤 수명 흐름 지수, 주요 포인트, 생활 팁을 볼 수 있어요.
          </p>
          <button
            type="button"
            className="primary-btn mt-4"
            onClick={onUnlockDetail}
            disabled={adLoading}
          >
            <span className="inline-flex items-center gap-2">
              <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-[0.08em]">
                AD
              </span>
              <span>{adLoading ? '광고 준비 중...' : '상세 분석 보기'}</span>
            </span>
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">수명 흐름 지수</h3>
            <div className="mt-3 space-y-3">
              {SCORE_LABELS.map((scoreItem) => {
                const scoreValue = result.scores[scoreItem.key];
                return (
                  <div key={scoreItem.key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{scoreItem.label}</span>
                      <span className="font-semibold text-slate-900">{scoreValue}</span>
                    </div>
                    <div className="score-track">
                      <div className="score-fill" style={{ width: `${scoreValue}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">오늘의 흐름 포인트</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {result.highlights.map((item) => (
                <li key={item} className="copy-block">
                  - {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">생활 관리 팁</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {result.guides.map((guide) => (
                <li key={guide} className="copy-block">
                  - {guide}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="mt-6">
        <BannerAd adGroupId={BANNER_AD_GROUP_ID} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <button type="button" className="secondary-btn" onClick={onBackToCapture}>
          촬영 화면으로 돌아가기
        </button>
        <button type="button" className="ghost-btn" onClick={onRestart}>
          처음부터 다시 시작
        </button>
      </div>
    </section>
  );
};
