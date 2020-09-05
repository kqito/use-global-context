import React from 'react';
import { createCombindedContextProviders } from './combineContextProvider';
import {
  createContexts,
  ContextsType,
  ContextProviderType,
} from './createContexts';

export type CreateMultiContexts = <T extends Record<string, unknown>>(
  values: T
) => [React.FC<ContextProviderType>, ContextsType<T>];

export const createMultiContexts: CreateMultiContexts = (values) => {
  const { providerContexts, Contexts } = createContexts(values);
  const ContextProviders = createCombindedContextProviders(providerContexts);

  return [ContextProviders, Contexts];
};
