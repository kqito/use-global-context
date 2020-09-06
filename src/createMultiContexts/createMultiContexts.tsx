import React from 'react';
import { createCombindedContextProviders } from './combineContextProvider';
import {
  createContexts,
  Values,
  ContextsType,
  ContextProviderType,
} from './createContexts';

export type CreateMultiContexts = <T extends Values>(
  values: T
) => [React.FC<ContextProviderType>, ContextsType<T>];

export const createMultiContexts: CreateMultiContexts = (values) => {
  const { providerContexts, Contexts } = createContexts(values);
  const ContextProviders = createCombindedContextProviders(providerContexts);

  return [ContextProviders, Contexts];
};
