import { useState } from 'react';
import { createContextProvider } from '../core/createContextProvider';
import { getUseStateContexts, UseStateArg } from './useStateContexts';

export const createUseStateContexts = <T extends UseStateArg>(hooksArg: T) => {
  const { useStateContexts, useStateContextsWithArg } = getUseStateContexts(
    hooksArg
  );
  const ContextProviders = createContextProvider(
    useStateContextsWithArg,
    useState
  );

  return [ContextProviders, useStateContexts] as const;
};
