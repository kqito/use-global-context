import { useState } from 'react';
import { createCombindedContextProviders } from '../core/combineContextProvider';
import { createContexts, UseStateValues } from './createContexts';

export const createUseStateContexts = <T extends UseStateValues>(values: T) => {
  const { contextProviderList, Contexts } = createContexts(values);
  const ContextProviders = createCombindedContextProviders(
    contextProviderList,
    useState
  );

  return [ContextProviders, Contexts] as const;
};
