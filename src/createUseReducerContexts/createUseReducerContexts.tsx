import React from 'react';
import {
  createUseReducerContext,
  createUseReducerServerSideContext,
  AnyReducer,
} from './createContext';
import { UseReducerStore } from './store';
import { ContextProvider } from '../core/createContext';
import { isBrowser } from '../utils/environment';
import { entries } from '../utils/entries';

export type UseReducerContextSource = {
  [displayName: string]: {
    reducer: AnyReducer;
    initialState: any;
    initializer?: undefined;
  };
};

export type CurrentState<T extends UseReducerContextSource> = {
  [P in keyof T]: T[P]['initialState'];
};

/**
 * *useReducer* to create multiple contexts.
 * The created contexts are split into a state and a dispatch,
 * respectively, to prevent unnecessary rendering.
 */
export const createUseReducerContexts = <T extends UseReducerContextSource>(
  /**
   *  Object's value is passed as an argument to useReducer.
   *  Also, the object's key is set to the context's displayname.
   *  *@see* https://reactjs.org/docs/context.html#contextdisplayname
   */
  contextSource: T
): [
  UseReducerStore<T>,
  React.FC<ContextProvider<CurrentState<T>>>,
  CurrentState<T>
] => {
  const currentState: CurrentState<T> = entries(contextSource).reduce(
    (acc, [displayName, { initialState }]) => {
      acc[displayName] = initialState;
      return acc;
    },
    {} as CurrentState<T>
  );
  const { store, contextProvider } = isBrowser
    ? createUseReducerContext(contextSource, currentState)
    : createUseReducerServerSideContext(contextSource, currentState);

  return [store, contextProvider, currentState];
};
