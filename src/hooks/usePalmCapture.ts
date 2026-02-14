import { useCallback, useState } from 'react';
import { OpenCameraPermissionError, openCamera } from '@apps-in-toss/web-framework';
import type { PalmCapture } from '../types';

const CAMERA_OPTIONS = {
  base64: true,
  maxWidth: 1280,
} as const;

function normalizePreviewUri(rawDataUri: string): string {
  if (rawDataUri.startsWith('data:')) {
    return rawDataUri;
  }

  return `data:image/jpeg;base64,${rawDataUri}`;
}

export function usePalmCapture() {
  const [capture, setCapture] = useState<PalmCapture | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const capturePalm = useCallback(async (): Promise<PalmCapture | undefined> => {
    setIsCapturing(true);
    setErrorMessage(null);

    try {
      const response = await openCamera(CAMERA_OPTIONS);
      const nextCapture: PalmCapture = {
        id: response.id || `${Date.now()}`,
        rawDataUri: response.dataUri,
        previewUri: normalizePreviewUri(response.dataUri),
        capturedAt: Date.now(),
      };

      setCapture(nextCapture);
      return nextCapture;
    } catch (error) {
      if (error instanceof OpenCameraPermissionError) {
        setErrorMessage('카메라 권한이 거부되어 촬영할 수 없어요.');
        return undefined;
      }

      if (error instanceof Error) {
        setErrorMessage(error.message);
        return undefined;
      }

      setErrorMessage('사진 촬영 중 문제가 발생했어요.');
      return undefined;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const clearCapture = useCallback(() => {
    setCapture(null);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    capture,
    isCapturing,
    errorMessage,
    capturePalm,
    clearCapture,
    clearError,
  };
}
