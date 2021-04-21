import { GlobalContextReducers } from '../createGlobalContext';
import { PartialState } from '../createGlobalContext/type';

export const mergeInitialState = <T extends GlobalContextReducers>(
  target: T,
  source?: PartialState<T>
): T => {
  const targetKeys = Object.keys(target) as [keyof T];

  const newTarget = { ...target };

  targetKeys.forEach((key) => {
    const targetPartial = target[key];
    const sourceInitialState = source?.[key];

    newTarget[key] = {
      ...targetPartial,
      initialState: {
        ...targetPartial.initialState,
        ...sourceInitialState,
      },
    };
  });

  return newTarget;
};
