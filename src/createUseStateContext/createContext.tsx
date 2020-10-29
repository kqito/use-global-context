import React, { useState, useRef, useEffect } from 'react';
import { UseStateContextSource } from './createUseStateContext';
import { createStore } from './hook';
import { createBaseContext } from '../core/context';
import { createSubscription, Subscription } from '../core/subscription';
import { useIsomorphicLayoutEffect } from '../core/useIsomorphicLayoutEffect';
import { Store } from '../core/store';
import { isBrowser } from '../utils/environment';
import { isFunction } from '../utils/isFunction';
import { entries } from '../utils/entries';

export type ContextProvider<T extends Record<string, unknown>> = {
  children: React.ReactNode;
  store?: Store<T>;
};

export type UseStateStore<T extends UseStateContextSource> = {
  state: T;
  dispatch: {
    [P in keyof T]: React.Dispatch<React.SetStateAction<T[P]>>;
  };
};

const createUseServerSideDispatch = <T extends UseStateContextSource>(
  contextValueRef: React.MutableRefObject<UseStateStore<T>>,
  displayName: keyof T,
  subscription: Subscription<UseStateStore<T>>,
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
    const currentState = contextValueRef.current.state[displayName];
    const newState = isFunction<(prevState: T[keyof T]) => T[keyof T]>(state)
      ? state(currentState)
      : state;

    contextValueRef.current.state[displayName] = newState;
    if (store) {
      store.setState(newState, displayName);
    }

    subscription.trySubscribe(contextValueRef.current);
  }

  return useServerSideDispatch as any;
};

export const createContext = <T extends UseStateContextSource>(
  contextSource: T
) => {
  const context = createBaseContext<UseStateStore<T>>();
  const subscription = createSubscription<UseStateStore<T>>();
  const useGlobalContext = createStore(context, subscription);

  const { Provider } = context;
  const contextProvider: React.FC<ContextProvider<T>> = ({
    children,
    store,
  }: ContextProvider<T>) => {
    const contextValueRef = useRef({ state: {}, dispatch: {} } as UseStateStore<
      T
    >);
    const storeState = store?.getState() ?? undefined;

    entries(contextSource).forEach(([displayName, initialState]) => {
      const initialValue =
        storeState && storeState[displayName] !== undefined
          ? storeState[displayName]
          : initialState;

      const [state, dispatch] = useState(initialValue);

      contextValueRef.current.state[displayName] = state;
      contextValueRef.current.dispatch[displayName] = dispatch;

      if (store) {
        store.setState(state, displayName);
      }
    });

    useEffect(() => {
      subscription.trySubscribe(contextValueRef.current);
    });

    return <Provider value={contextValueRef.current}>{children}</Provider>;
  };

  const contextServerSideProvider: React.FC<ContextProvider<T>> = ({
    children,
    store,
  }: ContextProvider<T>) => {
    const contextValueRef = useRef({ state: {}, dispatch: {} } as UseStateStore<
      T
    >);
    const storeState = store?.getState() ?? undefined;

    entries(contextSource).forEach(([displayName, initialState]) => {
      const state =
        storeState && storeState[displayName] !== undefined
          ? storeState[displayName]
          : initialState;

      const dispatch = createUseServerSideDispatch(
        contextValueRef,
        displayName,
        subscription,
        store
      );

      contextValueRef.current.state[displayName] = state;
      contextValueRef.current.dispatch[displayName] = dispatch;

      if (store) {
        store.setState(state, displayName);
      }
    });

    return <Provider value={contextValueRef.current}>{children}</Provider>;
  };

  return {
    useGlobalContext,
    contextProvider: isBrowser ? contextProvider : contextServerSideProvider,
  };
};
