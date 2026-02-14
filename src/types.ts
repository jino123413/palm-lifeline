import type { PermissionStatus } from '@apps-in-toss/web-framework';

export type AppScreen = 'home' | 'capture' | 'result';

export type CameraPermission = PermissionStatus | null;

export interface PalmCapture {
  id: string;
  rawDataUri: string;
  previewUri: string;
  capturedAt: number;
}

export type PalmReadingTier =
  | 'strong-vitality'
  | 'steady-growth'
  | 'balanced-explorer'
  | 'recovery-first';

export interface PalmReadingResult {
  generatedAt: number;
  tier: PalmReadingTier;
  tierLabel: string;
  headline: string;
  summary: string;
  scores: {
    vitality: number;
    stability: number;
    recovery: number;
    focus: number;
  };
  highlights: string[];
  guides: string[];
  disclaimer: string;
}
