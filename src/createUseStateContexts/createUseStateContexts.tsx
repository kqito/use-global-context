import { useState } from 'react';
import { createCombindedContextProviders } from '../core/combineContextProvider';
import { getUseStateContexts, UseStateValues } from './useStateContexts';

export const createUseStateContexts = <T extends UseStateValues>(values: T) => {
  const { useStateValueList, Contexts } = getUseStateContexts(values);
  const ContextProviders = createCombindedContextProviders(
    useStateValueList,
    useState
  );

  return [ContextProviders, Contexts] as const;
};
