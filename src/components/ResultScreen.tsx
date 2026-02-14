import React from 'react';
import type { PalmCapture, PalmReadingResult } from '../types';

interface ResultScreenProps {
  capture: PalmCapture;
  result: PalmReadingResult;
  isSharing: boolean;
  shareError: string | null;
  onBackToCapture: () => void;
  onRestart: () => void;
  onShare: () => void;
}

const SCORE_LABELS: Array<{
  key: keyof PalmReadingResult['scores'];
  label: string;
}> = [
  { key: 'vitality', label: '생기' },
  { key: 'stability', label: '안정' },
  { key: 'recovery', label: '회복' },
  { key: 'focus', label: '집중' },
];

export const ResultScreen: React.FC<ResultScreenProps> = ({
  capture,
  result,
  isSharing,
  shareError,
  onBackToCapture,
  onRestart,
  onShare,
}) => {
  return (
    <section className="section-pad">
      <div className="result-hero-card rounded-2xl p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary-deep">{result.tierLabel}</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">{result.headline}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">{result.summary}</p>
      </div>

      <div className="mt-4 grid grid-cols-[84px_1fr] gap-3 rounded-2xl border border-slate-200 bg-white p-3">
        <img src={capture.previewUri} alt="분석한 손금 이미지" className="h-20 w-20 rounded-xl object-cover" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">분석 시각</p>
          <p className="mt-1 text-sm text-slate-700">{new Date(result.generatedAt).toLocaleString('ko-KR')}</p>
          <p className="mt-2 text-xs text-slate-500">{result.disclaimer}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">지표 점수</h3>
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
        <h3 className="text-sm font-semibold text-slate-900">핵심 해석</h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          {result.highlights.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">추천 액션</h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          {result.guides.map((guide) => (
            <li key={guide}>- {guide}</li>
          ))}
        </ul>
      </div>

      {shareError ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{shareError}</p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-3">
        <button type="button" className="primary-btn" onClick={onShare} disabled={isSharing}>
          {isSharing ? '공유 준비 중...' : '결과 공유하기'}
        </button>
        <button type="button" className="secondary-btn" onClick={onBackToCapture}>
          사진 다시 찍고 재분석
        </button>
        <button type="button" className="ghost-btn" onClick={onRestart}>
          처음부터 다시
        </button>
      </div>
    </section>
  );
};
