import { createContextProvider } from '../core/createContextProvider';
import { getUseReducerContexts, UseReducerArg } from './useReducerContexts';

export const createUseReducerContexts = <T extends UseReducerArg>(
  hooksArg: T
) => {
  const {
    useReducerContexts,
    useReducerContextsWithArg,
  } = getUseReducerContexts(hooksArg);
  const ContextProviders = createContextProvider<UseReducerArg>(
    'useReducer',
    useReducerContextsWithArg
  );

  return [ContextProviders, useReducerContexts] as const;
};
