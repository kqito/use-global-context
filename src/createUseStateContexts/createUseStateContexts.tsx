import { createContextProvider } from '../core/createContextProvider';
import { getUseStateContexts, UseStateArg } from './useStateContexts';

export const createUseStateContexts = <T extends UseStateArg>(hooksArg: T) => {
  const { useStateContexts, useStateContextsWithArg } = getUseStateContexts(
    hooksArg
  );
  const ContextProviders = createContextProvider<UseStateArg>(
    'useState',
    useStateContextsWithArg
  );

  return [ContextProviders, useStateContexts] as const;
};
