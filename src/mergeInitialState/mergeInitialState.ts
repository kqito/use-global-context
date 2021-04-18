import {
  CreateGlobalContextArgs,
  GlobalContextValue,
} from '../createGlobalContext';

export const mergeInitialState = <T extends CreateGlobalContextArgs>(
  target: T,
  source?: Partial<GlobalContextValue<T>['state']>
): T => {
  const targetKeys = Object.keys(target) as [keyof T];

  const newTarget = { ...target };

  targetKeys.forEach((key) => {
    const targetPartial = target[key];
    const newInitialState =
      (source && source[key]) ?? targetPartial.initialState;

    newTarget[key] = {
      ...targetPartial,
      initialState: newInitialState,
    };
  });

  return newTarget;
};
