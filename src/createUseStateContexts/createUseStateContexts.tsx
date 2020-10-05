import React from 'react';
import {
  createUseStateContext,
  createUseStateServerSideContext,
} from './createContext';
import { UseStateStore } from './store';
import { ContextProvider } from '../core/createContext';
import { isBrowser } from '../utils/environment';

export type UseStateContextSource = {
  [displayName: string]: any;
};

/**
 * *useState* to create multiple contexts.
 * The created contexts are split into a state and a dispatch,
 * respectively, to prevent unnecessary rendering.
 */
export const createUseStateContexts = <T extends UseStateContextSource>(
  /**
   *  Object's value is passed as an argument to useState.
   *  Also, the object's key is set to the context's displayname.
   *  *@see* https://reactjs.org/docs/context.html#contextdisplayname
   */
  contextSource: T
): [UseStateStore<T>, React.FC<ContextProvider<T>>, T] => {
  const currentState: T = contextSource;
  const { store, contextProvider } = isBrowser
    ? createUseStateContext(contextSource, currentState)
    : createUseStateServerSideContext(currentState);

  return [store, contextProvider, currentState];
};
