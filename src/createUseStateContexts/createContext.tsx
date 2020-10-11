import React, { useState } from 'react';
import { UseStateContextSource } from './createUseStateContexts';
import { createStore, createServerSideStore } from './store';
import {
  createBaseContext,
  createServerSideContext,
  ContextProvider,
} from '../core/createContext';
import { createCurrentState } from '../core/currentState';
import { entries } from '../utils/entries';

export type UseStateContext<T extends UseStateContextSource> = {
  [P in keyof T]: {
    state: React.Context<T[P]>;
    dispatch: React.Context<React.Dispatch<React.SetStateAction<T[P]>>>;
  };
};

export const createUseStateContext = <T extends UseStateContextSource>(
  contextSource: T
) => {
  const { getState, setState } = createCurrentState(contextSource);
  const context = createBaseContext<UseStateContext<T>>(contextSource);
  const store = createStore(context);
  const contextProvider: React.FC<ContextProvider<T>> = ({
    children,
    value,
  }: ContextProvider<T>) => {
    return (
      <>
        {entries(context).reduceRight(
          (acc, [displayName, { state: State, dispatch: Dispatch }]) => {
            const initialValue =
              value && value[displayName] !== undefined
                ? value[displayName]
                : contextSource[displayName];

            const [state, dispatch] = useState(initialValue);
            setState(state, displayName);

            return (
              <State.Provider value={state}>
                <Dispatch.Provider value={dispatch}>{acc}</Dispatch.Provider>
              </State.Provider>
            );
          },
          children
        )}
      </>
    );
  };

  return {
    context,
    store,
    contextProvider,
    getState,
  };
};

export const createUseStateServerSideContext = <
  T extends UseStateContextSource
>(
  contextSource: T
) => {
  const { getState, setState, resetState } = createCurrentState(contextSource);
  const { context, contextProvider } = createServerSideContext(
    getState,
    resetState
  );
  const store = createServerSideStore(
    context,
    contextSource,
    getState,
    setState
  );

  return {
    context,
    store,
    contextProvider,
    getState,
  };
};
