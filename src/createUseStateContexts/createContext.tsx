import React, { useState } from 'react';
import { UseStateContextSource } from './createUseStateContexts';
import { createStore, createServerSideStore } from './store';
import {
  createBaseContext,
  createServerSideContext,
  ContextProvider,
} from '../core/createContext';
import { entries } from '../utils/entries';

export type UseStateContext<T extends UseStateContextSource> = {
  [P in keyof T]: {
    state: React.Context<T[P]>;
    dispatch: React.Context<React.Dispatch<React.SetStateAction<T[P]>>>;
  };
};

export const createUseStateContext = <T extends UseStateContextSource>(
  source: T,
  currentState: T
) => {
  const context = createBaseContext<UseStateContext<T>>(source);
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
                : source[displayName];

            const [state, dispatch] = useState(initialValue);
            currentState[displayName] = state;

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
  };
};

export const createUseStateServerSideContext = <
  T extends UseStateContextSource
>(
  currentState: T
) => {
  const { context, contextProvider } = createServerSideContext(currentState);
  const store = createServerSideStore(context, currentState);

  return {
    context,
    store,
    contextProvider,
  };
};
