import React, { useState, useRef } from 'react';
import { UseStateContextSource } from './createUseStateContext';
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
  stateRef: React.MutableRefObject<T>,
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
    const newState = isFunction<(prevState: T[keyof T]) => T[keyof T]>(state)
      ? state(currentState)
      : state;

    stateRef.current[displayName] = newState;
    setCurrentState(newState, displayName);
    subscription.forEach((listener) => {
      listener();
    });
  }

  return useServerSideDispatch as any;
};

export const createContext = <T extends UseStateContextSource>(
  contextSource: T
) => {
  const { getCurrentState, setCurrentState } = createCurrentState(
    contextSource
  );
  const { stateContext, dispatchContext, subscription } = createBaseContext<
    UseStateContext<T>
  >(contextSource);
  const { useGlobalState, useGlobalDispatch } = createStore(
    stateContext,
    dispatchContext,
    subscription,
    getCurrentState
  );

  const StateProvider = stateContext.Provider;
  const DispatchProvider = dispatchContext.Provider;
  const contextProvider: React.FC<ContextProvider<T>> = ({
    children,
    value,
  }: ContextProvider<T>) => {
    const stateRef = useRef({} as T);
    const dispatchRef = useRef({} as ReturnType<UseGlobalDispatch<T>>);

    entries(contextSource).forEach(([displayName, initialState]) => {
      const initialValue =
        value && value[displayName] !== undefined
          ? value[displayName]
          : initialState;

      const [hookState, hookDispatch] = useState(initialValue);

      setCurrentState(hookState, displayName);
      stateRef.current[displayName] = hookState;
      dispatchRef.current[displayName] = hookDispatch;
    }, {} as any);

    return (
      <StateProvider value={stateRef.current}>
        <DispatchProvider value={dispatchRef.current}>
          {children}
        </DispatchProvider>
      </StateProvider>
    );
  };

  const contextServerSideProvider: React.FC<ContextProvider<T>> = ({
    children,
    value,
  }: ContextProvider<T>) => {
    const stateRef = useRef({} as T);
    const dispatchRef = useRef({} as ReturnType<UseGlobalDispatch<T>>);

    entries(contextSource).forEach(([displayName, initialState]) => {
      const initialValue =
        value && value[displayName] !== undefined
          ? value[displayName]
          : initialState;

      useIsomorphicLayoutEffect(() => {
        setCurrentState(initialValue, displayName);
      }, []);

      const hookDispatch = createUseServerSideDispatch(
        stateRef,
        getCurrentState,
        setCurrentState,
        displayName,
        subscription
      );
      stateRef.current[displayName] = initialValue;
      dispatchRef.current[displayName] = hookDispatch;
    });

    return (
      <StateProvider value={stateRef.current}>
        <DispatchProvider value={dispatchRef.current}>
          {children}
        </DispatchProvider>
      </StateProvider>
    );
  };

  return {
    useGlobalState,
    useGlobalDispatch,
    contextProvider: isBrowser ? contextProvider : contextServerSideProvider,
    getState: getCurrentState,
  };
};
