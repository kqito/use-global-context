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
  [displayName: string]: {
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
  /**
   *  Object's value is passed as an argument to useReducer.
   *  Also, the object's key is set to the context's displayname.
   *  *@see* https://reactjs.org/docs/context.html#contextdisplayname
   */
  contextSource: T
): [UseSelector<UseReducerStore<T>>, React.FC<ContextProvider<State<T>>>] => {
  const { useGlobalContext, contextProvider } = createContext(contextSource);

  return [useGlobalContext, contextProvider];
};
