import React, { useState, useCallback } from 'react';
import { UseStateContextSource } from './createUseStateContexts';
import { createStore, UseGlobalDispatch } from './hook';
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
  getCurrentState: () => T,
  setCurrentState: (value: T[keyof T], key: keyof T) => void,
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
    const currentState = getCurrentState()[displayName];
    let newState: T[keyof T];

    if (isFunction<(prevState: T[keyof T]) => T[keyof T]>(state)) {
      newState = state(currentState);
    } else {
      newState = state;
    }

    setCurrentState(newState, displayName);

    subscription.forEach((listener) => {
      listener();
    });
  }

  return useServerSideDispatch as any;
};

export const createUseStateContext = <T extends UseStateContextSource>(
  contextSource: T
) => {
  const { getCurrentState, setCurrentState } = createCurrentState(
    contextSource
  );
  const { stateContexts, dispatchContext } = createBaseContext<
    UseStateContext<T>
  >(contextSource);
  const { useGlobalState, useGlobalDispatch } = createStore(
    stateContexts,
    dispatchContext,
    getCurrentState
  );

  const globalDispatch = {} as ReturnType<UseGlobalDispatch<T>>;
  const DispatchProvider = dispatchContext.Provider;
  const contextProvider: React.FC<ContextProvider<T>> = ({
    children,
    value,
  }: ContextProvider<T>) => {
    return (
      <>
        {entries(stateContexts).reduceRight(
          (acc, [displayName, { state: State }]) => {
            const initialValue =
              value && value[displayName] !== undefined
                ? value[displayName]
                : contextSource[displayName];

            const [hookState, hookDispatch] = useState(initialValue);
            useIsomorphicLayoutEffect(() => {
              globalDispatch[displayName] = hookDispatch;
            }, []);

            const getState = useCallback(() => hookState, [hookState]);

            setCurrentState(hookState, displayName);

            return <State.Provider value={getState}>{acc}</State.Provider>;
          },
          <DispatchProvider value={globalDispatch}>{children}</DispatchProvider>
        )}
      </>
    );
  };

  const contextServerSideProvider: React.FC<ContextProvider<T>> = ({
    children,
    value,
  }: ContextProvider<T>) => {
    return (
      <>
        {entries(stateContexts).reduceRight(
          (acc, [displayName, { state: State, subscription }]) => {
            const initialValue =
              value && value[displayName] !== undefined
                ? value[displayName]
                : contextSource[displayName];

            useIsomorphicLayoutEffect(() => {
              setCurrentState(initialValue, displayName);
              globalDispatch[displayName] = createUseServerSideDispatch(
                getCurrentState,
                setCurrentState,
                displayName,
                subscription
              );
            }, []);

            const getState = useCallback(() => {
              const currentState = getCurrentState();
              return currentState[displayName];
            }, [getCurrentState, displayName]);

            return <State.Provider value={getState}>{acc}</State.Provider>;
          },
          <DispatchProvider value={globalDispatch}>{children}</DispatchProvider>
        )}
      </>
    );
  };

  return {
    useGlobalState,
    useGlobalDispatch,
    contextProvider: isBrowser ? contextProvider : contextServerSideProvider,
    getState: getCurrentState,
  };
};
