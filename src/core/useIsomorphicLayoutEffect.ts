import { useLayoutEffect } from 'react';
import { isBrowser } from '../utils/environment';

export const onClientFn = useLayoutEffect;
export const onServerFn = (fn: () => any) => fn();

export const useIsomorphicLayoutEffect = isBrowser ? onClientFn : onServerFn;
