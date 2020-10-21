import React from 'react';
import {
  createContext,
  AnyReducer,
  ContextProvider,
  CurrentState,
} from './createContext';
import { UseGlobalState, UseGlobalDispatch } from './hook';

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
  UseGlobalState<T>,
  UseGlobalDispatch<T>,
  React.FC<ContextProvider<CurrentState<T>>>
] => {
  const { useGlobalState, useGlobalDispatch, contextProvider } = createContext(
    contextSource
  );

  return [useGlobalState, useGlobalDispatch, contextProvider];
};
