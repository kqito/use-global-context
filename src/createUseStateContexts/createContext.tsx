import React, { useState } from 'react';
import { UseStateContextSource } from './createUseStateContexts';
import { createStore } from './store';
import { useIsomorphicLayoutEffect } from '../core/useIsomorphicLayoutEffect';
import { createBaseContext, ContextProvider } from '../core/createContext';
import { Subscription } from '../core/subscription';
import { createCurrentState } from '../core/currentState';
import { isBrowser } from '../utils/environment';
import { entries } from '../utils/entries';

export type UseStateContext<T extends UseStateContextSource> = {
  [P in keyof T]: {
    state: React.Context<T[P]>;
    dispatch: React.Context<React.Dispatch<React.SetStateAction<T[P]>>>;
  };
};

const isFunction = <T extends unknown>(value: unknown): value is T =>
  value && {}.toString.call(value) === '[object Function]';

const createUseServerSideDispatch = <T extends UseStateContextSource>(
  getState: () => T,
  setState: (value: T[keyof T], key: keyof T) => void,
  displayName: keyof T,
  subscription: Subscription
): React.Dispatch<React.SetStateAction<T[keyof T]>> => {
  /* eslint no-param-reassign: 0 */

  function useServerSideDispatch(state: T[keyof T]): void;
  function useServerSideDispatch(
    selector: (prevState: T[keyof T]) => T[keyof T]
  ): void;
  function useServerSideDispatch(
    state: T[keyof T] | ((prevState: T[keyof T]) => T[keyof T])
  ): void {
    const currentState = getState()[displayName];

    if (isFunction<(prevState: T[keyof T]) => T[keyof T]>(state)) {
      setState(state(currentState), displayName);
    } else {
      setState(state, displayName);
    }

    subscription.forEach((listener) => {
      listener();
    });
  }

  return useServerSideDispatch as any;
};

export const createUseStateContext = <T extends UseStateContextSource>(
  contextSource: T
) => {
  const { getState, setState } = createCurrentState(contextSource);
  const context = createBaseContext<UseStateContext<T>>(contextSource);
  const store = createStore(context, getState);
  const contextProvider: React.FC<ContextProvider<T>> = ({
    children,
    value,
  }: ContextProvider<T>) => {
    return (
      <>
        {entries(context.store).reduceRight(
          (acc, [displayName, { state: State, dispatch: Dispatch }]) => {
            const initialValue =
              value && value[displayName] !== undefined
                ? value[displayName]
                : contextSource[displayName];

            useIsomorphicLayoutEffect(() => {
              setState(initialValue, displayName);
            }, []);

            const [clientSideState, clientSideDispatch] = useState(
              initialValue
            );
            const state = isBrowser ? clientSideState : getState()[displayName];
            const dispatch = isBrowser
              ? clientSideDispatch
              : createUseServerSideDispatch(
                  getState,
                  setState,
                  displayName,
                  context.subscription
                );

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
