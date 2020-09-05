import React from 'react';
import {
  createContexts,
  ContextsType,
  ContextProviderType,
} from './createContexts';

export type CreateMultiContexts = <T extends Record<string, unknown>>(
  values: T
) => [React.FC<ContextProviderType>, ContextsType<T>];

export const createMultiContexts: CreateMultiContexts = (values) => {
  const { Providers, Contexts } = createContexts(values);

  return [Providers, Contexts];
};
