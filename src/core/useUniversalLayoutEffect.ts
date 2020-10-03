import { useLayoutEffect } from 'react';

export const useUniversalLayoutEffect =
  typeof window !== 'undefined'
    ? useLayoutEffect
    : (callback: () => void) => callback();
