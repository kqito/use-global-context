import React from 'react';
import { createContext, ContextProvider } from './createContext';
import { UseGlobalState, UseGlobalDispatch } from './hook';

export type UseStateContextSource = {
  [displayName: string]: any;
};

/**
 * *useState* to create multiple contexts.
 * The created contexts are split into a state and a dispatch,
 * respectively, to prevent unnecessary rendering.
 */
export const createUseStateContext = <T extends UseStateContextSource>(
  /**
   *  Object's value is passed as an argument to useState.
   *  Also, the object's key is set to the context's displayname.
   *  *@see* https://reactjs.org/docs/context.html#contextdisplayname
   */
  contextSource: T
): [UseGlobalState<T>, UseGlobalDispatch<T>, React.FC<ContextProvider<T>>] => {
  const { useGlobalState, useGlobalDispatch, contextProvider } = createContext(
    contextSource
  );

  return [useGlobalState, useGlobalDispatch, contextProvider];
};
