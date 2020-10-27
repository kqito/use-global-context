import React from 'react';
import {
  createContext,
  AnyReducer,
  ContextProvider,
  State,
  ReducerState,
  ReducerDispatch,
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
): [
  UseSelector<{ [P in keyof T]: ReducerState<T[P]['reducer']> }>,
  UseSelector<{ [P in keyof T]: ReducerDispatch<T[P]['reducer']> }>,
  React.FC<ContextProvider<State<T>>>
] => {
  const { useGlobalState, useGlobalDispatch, contextProvider } = createContext(
    contextSource
  );

  return [useGlobalState, useGlobalDispatch, contextProvider];
};
