import React, { useState, useRef, useEffect } from 'react';
import { UseStateContextSource } from './createUseStateContext';
import { createStore } from './hook';
import { createBaseContext } from '../core/context';
import { createSubscription, Subscription } from '../core/subscription';
import { Store } from '../createStore/createStore';
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
  partial: keyof T,
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
    const currentState = contextValueRef.current.state[partial];
    const newState = isFunction<(prevState: T[keyof T]) => T[keyof T]>(state)
      ? state(currentState)
      : state;

    contextValueRef.current.state[partial] = newState;
    if (store) {
      store.setState(partial, newState);
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

    entries(contextSource).forEach(([partial, initialState]) => {
      const initialValue =
        storeState && storeState[partial] !== undefined
          ? storeState[partial]
          : initialState;

      const [state, dispatch] = useState(initialValue);

      contextValueRef.current.state[partial] = state;
      contextValueRef.current.dispatch[partial] = dispatch;

      if (store) {
        store.setState(partial, state);
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

    entries(contextSource).forEach(([partial, initialState]) => {
      const state =
        storeState && storeState[partial] !== undefined
          ? storeState[partial]
          : initialState;

      const dispatch = createUseServerSideDispatch(
        contextValueRef,
        partial,
        subscription,
        store
      );

      contextValueRef.current.state[partial] = state;
      contextValueRef.current.dispatch[partial] = dispatch;

      if (store) {
        store.setState(partial, state);
      }
    });

    return <Provider value={contextValueRef.current}>{children}</Provider>;
  };

  return {
    useGlobalContext,
    contextProvider: isBrowser ? contextProvider : contextServerSideProvider,
  };
};
