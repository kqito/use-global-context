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
 * *useReducer* to create multiple contexts.
 * The created contexts are split into a state and a dispatch,
 * respectively, to prevent unnecessary rendering.
 */
export const createUseReducerContext = <T extends UseReducerContextSource>(
  contextSource: T
): [UseSelector<UseReducerStore<T>>, React.FC<ContextProvider<State<T>>>] => {
  const { useGlobalContext, contextProvider } = createContext(contextSource);

  return [useGlobalContext, contextProvider];
};
