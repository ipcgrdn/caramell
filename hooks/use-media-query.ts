"use client";

import { useEffect, useState } from "react";

interface DeviceSize {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useDevice(): DeviceSize {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const updateDeviceSize = () => {
      const width = window.innerWidth;

      setDeviceSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    // 초기값 설정
    updateDeviceSize();

    // 리스너 등록
    window.addEventListener("resize", updateDeviceSize);

    // 클린업
    return () => window.removeEventListener("resize", updateDeviceSize);
  }, []);

  return deviceSize;
}

// 개별 hook들도 export (필요시 사용)
export function useIsMobile(): boolean {
  const { isMobile } = useDevice();
  return isMobile;
}

export function useIsTablet(): boolean {
  const { isTablet } = useDevice();
  return isTablet;
}

export function useIsDesktop(): boolean {
  const { isDesktop } = useDevice();
  return isDesktop;
}
