import {
  CreateGlobalContextReducers,
  GlobalContextValue,
} from '../createGlobalContext';

export const mergeInitialState = <
  T extends CreateGlobalContextReducers,
  S extends GlobalContextValue<T>['state']
>(
  target: T,
  source?: { [P in keyof S]?: Partial<S[P]> }
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
