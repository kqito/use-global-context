import { createInitialStore } from '../core/store';

export const createStore = <T extends Record<string, unknown>>(
  initialValue: T
) => {
  return createInitialStore(initialValue);
};
