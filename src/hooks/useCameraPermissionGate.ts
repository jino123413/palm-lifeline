import { useCallback, useEffect, useRef, useState } from 'react';
import type { PermissionStatus } from '@apps-in-toss/web-framework';
import { openCamera } from '@apps-in-toss/web-framework';

function isAllowed(status: PermissionStatus): boolean {
  return status === 'allowed';
}

export function useCameraPermissionGate() {
  const [permission, setPermission] = useState<PermissionStatus | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const mountedRef = useRef(false);

  const runIfMounted = useCallback((fn: () => void) => {
    if (mountedRef.current) {
      fn();
    }
  }, []);

  const checkPermission = useCallback(async (): Promise<PermissionStatus> => {
    runIfMounted(() => setIsCheckingPermission(true));
    try {
      const current = await openCamera.getPermission();
      runIfMounted(() => setPermission(current));
      return current;
    } finally {
      runIfMounted(() => setIsCheckingPermission(false));
    }
  }, [runIfMounted]);

  const requestPermission = useCallback(async (): Promise<PermissionStatus> => {
    runIfMounted(() => setIsRequestingPermission(true));
    try {
      const requested = await openCamera.openPermissionDialog();
      runIfMounted(() => setPermission(requested));
      return requested;
    } finally {
      runIfMounted(() => setIsRequestingPermission(false));
    }
  }, [runIfMounted]);

  const ensureCameraPermission = useCallback(async (): Promise<boolean> => {
    const current = permission ?? (await checkPermission());
    if (isAllowed(current)) {
      return true;
    }

    const requested = await requestPermission();
    return isAllowed(requested);
  }, [permission, checkPermission, requestPermission]);

  useEffect(() => {
    mountedRef.current = true;
    checkPermission().catch(() => undefined);

    return () => {
      mountedRef.current = false;
    };
  }, [checkPermission]);

  return {
    permission,
    isCheckingPermission,
    isRequestingPermission,
    checkPermission,
    requestPermission,
    ensureCameraPermission,
  };
}
