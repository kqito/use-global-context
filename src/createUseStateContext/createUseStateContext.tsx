import React from 'react';
import { createContext, ContextProvider, UseStateStore } from './createContext';
import { UseSelector } from '../core/useSelector';

export type UseStateContextSource = {
  [partial: string]: any;
};

/**
 * *useState* to create multiple contexts.
 * The created contexts are split into a state and a dispatch,
 * respectively, to prevent unnecessary rendering.
 */
export const createUseStateContext = <T extends UseStateContextSource>(
  contextSource: T
): [UseSelector<UseStateStore<T>>, React.FC<ContextProvider<T>>] => {
  const { useGlobalContext, contextProvider } = createContext(contextSource);

  return [useGlobalContext, contextProvider];
};
