'use client';

import { useEffect } from 'react';
import { getDeviceType } from '@/lib/useDeviceType';

/** Sets data-device on <html> so CSS can adapt layout for mobile / tablet / desktop. */
export default function DeviceAdapt() {
  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const device = getDeviceType(width);
      const touch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;

      document.documentElement.dataset.device = device;
      document.documentElement.dataset.touch = touch ? 'true' : 'false';
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return null;
}