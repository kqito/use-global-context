import React from 'react';
import {
  createContext,
  AnyReducer,
  ContextProvider,
  State,
  UseReducerStore,
} from './createContext';

import { UseSelector } from '../core/useSelector';

export type UseReducerContextSource = {
  [partial: string]: {
    reducer: AnyReducer;
    initialState: any;
    initializer?: any;
  };
};

/**
 * Use "useReducer" to create a useGlobalContext with global context.
 */
export const createUseReducerContext = <T extends UseReducerContextSource>(
  contextSource: T
): [UseSelector<UseReducerStore<T>>, React.FC<ContextProvider<State<T>>>] => {
  const { useGlobalContext, contextProvider } = createContext(contextSource);

  return [useGlobalContext, contextProvider];
};
