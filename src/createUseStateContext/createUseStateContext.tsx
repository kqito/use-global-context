import React from 'react';
import {
  createContext,
  ContextProvider,
  UseStateContextValue,
} from './createContext';
import { UseSelector } from '../core/useSelector';

export type UseStateContextSource = {
  [partial: string]: any;
};

/**
 * Use "useState" to create a useGlobalContext with global context.
 */
export const createUseStateContext = <T extends UseStateContextSource>(
  contextSource: T
): [UseSelector<UseStateContextValue<T>>, React.FC<ContextProvider<T>>] => {
  const { useGlobalContext, contextProvider } = createContext(contextSource);

  return [useGlobalContext, contextProvider];
};
