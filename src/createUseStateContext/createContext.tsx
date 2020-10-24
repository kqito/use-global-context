import React, { useState, useRef } from 'react';
import { UseStateContextSource } from './createUseStateContext';
import { createStore } from './hook';
import { createBaseContext } from '../core/createContext';
import { Store } from '../core/store';
import { Subscription } from '../core/subscription';
import { isBrowser } from '../utils/environment';
import { entries } from '../utils/entries';

export type ContextProvider<T extends Record<string, unknown>> = {
  children: React.ReactNode;
  store?: Store<T>;
};

export type UseStateContext<T extends UseStateContextSource> = {
  [P in keyof T]: {
    state: React.Context<T[P]>;
    dispatch: React.Context<React.Dispatch<React.SetStateAction<T[P]>>>;
  };
};

export type Dispatch<T extends UseStateContextSource> = {
  [P in keyof T]: React.Dispatch<React.SetStateAction<T[P]>>;
};

const isFunction = <T extends unknown>(value: unknown): value is T =>
  value && {}.toString.call(value) === '[object Function]';

const createUseServerSideDispatch = <T extends UseStateContextSource>(
  stateRef: React.MutableRefObject<T>,
  displayName: keyof T,
  subscription: Subscription<T>,
  store?: Store<T>
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
    if (store) {
      store.setState(newState, displayName);
    }

    subscription.forEach((listener) => {
      listener(stateRef.current);
    });
  }

  return useServerSideDispatch as any;
};

export const createContext = <T extends UseStateContextSource>(
  contextSource: T
) => {
  const { state, dispatch } = createBaseContext<T, Dispatch<T>>();
  const { useGlobalState, useGlobalDispatch } = createStore(
    state.context,
    state.subscription,
    dispatch.context,
    dispatch.subscription
  );

  const StateProvider = state.context.Provider;
  const DispatchProvider = dispatch.context.Provider;
  const contextProvider: React.FC<ContextProvider<T>> = ({
    children,
    store,
  }: ContextProvider<T>) => {
    const stateRef = useRef({} as T);
    const dispatchRef = useRef({} as Dispatch<T>);
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
    const dispatchRef = useRef({} as Dispatch<T>);
    const storeState = store?.getState() ?? undefined;

    entries(contextSource).forEach(([displayName, initialState]) => {
      const initialValue =
        storeState && storeState[displayName] !== undefined
          ? storeState[displayName]
          : initialState;

      const hookDispatch = createUseServerSideDispatch(
        stateRef,
        displayName,
        state.subscription,
        store
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
