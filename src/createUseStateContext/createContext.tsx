import React, { useState, useRef } from 'react';
import { UseStateContextSource } from './createUseStateContext';
import { createStore, UseGlobalDispatch } from './hook';
import { createBaseContext, ContextProvider } from '../core/createContext';
import { Subscription } from '../core/subscription';
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
  displayName: keyof T,
  subscription: Subscription<T>
): React.Dispatch<React.SetStateAction<T[keyof T]>> => {
  /* eslint no-param-reassign: 0 */

  function useServerSideDispatch(state: T[keyof T]): void;
  function useServerSideDispatch(
    selector: (prevState: T[keyof T]) => T[keyof T]
  ): void;
  function useServerSideDispatch(
    state: T[keyof T] | ((prevState: T[keyof T]) => T[keyof T])
  ): void {
    const currentState = stateRef.current[displayName];
    const newState = isFunction<(prevState: T[keyof T]) => T[keyof T]>(state)
      ? state(currentState)
      : state;

    stateRef.current[displayName] = newState;
    subscription.forEach((listener) => {
      listener(newState);
    });
  }

  return useServerSideDispatch as any;
};

export const createContext = <T extends UseStateContextSource>(
  contextSource: T
) => {
  const { stateContext, dispatchContext, subscription } = createBaseContext<
    UseStateContext<T>
  >();
  const { useGlobalState, useGlobalDispatch } = createStore(
    stateContext,
    dispatchContext,
    subscription
  );

  const StateProvider = stateContext.Provider;
  const DispatchProvider = dispatchContext.Provider;
  const contextProvider: React.FC<ContextProvider<T>> = ({
    children,
    store,
  }: ContextProvider<T>) => {
    const stateRef = useRef({} as T);
    const dispatchRef = useRef({} as ReturnType<UseGlobalDispatch<T>>);
    const storeState = store?.getState() ?? undefined;

    entries(contextSource).forEach(([displayName, initialState]) => {
      const initialValue =
        storeState && storeState[displayName] !== undefined
          ? storeState[displayName]
          : initialState;

      const [hookState, hookDispatch] = useState(initialValue);

      stateRef.current[displayName] = hookState;
      dispatchRef.current[displayName] = hookDispatch;

      if (store) {
        store.setState(hookState, displayName);
      }
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
    store,
  }: ContextProvider<T>) => {
    const stateRef = useRef({} as T);
    const dispatchRef = useRef({} as ReturnType<UseGlobalDispatch<T>>);
    const storeState = store?.getState() ?? undefined;

    entries(contextSource).forEach(([displayName, initialState]) => {
      const initialValue =
        storeState && storeState[displayName] !== undefined
          ? storeState[displayName]
          : initialState;

      const hookDispatch = createUseServerSideDispatch(
        stateRef,
        displayName,
        subscription
      );

      stateRef.current[displayName] = initialValue;
      dispatchRef.current[displayName] = hookDispatch;
      if (store) {
        store.setState(initialValue, displayName);
      }
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
  };
};
