import React, { useReducer, useRef, useEffect } from 'react';
import { UseReducerContextSource } from './createUseReducerContext';
import { createStore } from './hook';
import { createBaseContext } from '../core/context';
import { createSubscription, Subscription } from '../core/subscription';
import { useIsomorphicLayoutEffect } from '../core/useIsomorphicLayoutEffect';
import { Store } from '../core/store';
import { isBrowser } from '../utils/environment';
import { entries } from '../utils/entries';

export type ContextProvider<T extends Record<string, unknown>> = {
  children: React.ReactNode;
  store?: Store<T>;
};

export type AnyReducer<S = any, A = any> =
  | React.Reducer<S, A>
  | React.ReducerWithoutAction<S>;
export type ReducerState<R> = R extends React.ReducerWithoutAction<any>
  ? React.ReducerStateWithoutAction<R>
  : R extends React.Reducer<any, any>
  ? React.ReducerState<R>
  : never;
export type ReducerDispatch<R> = R extends React.ReducerWithoutAction<any>
  ? React.DispatchWithoutAction
  : R extends React.Reducer<any, any>
  ? React.Dispatch<React.ReducerAction<R>>
  : never;

export type State<T extends UseReducerContextSource> = {
  [P in keyof T]: T[P]['initialState'];
};
export type UseReducerStore<T extends UseReducerContextSource> = {
  state: {
    [P in keyof T]: T[P]['initialState'];
  };
  dispatch: {
    [P in keyof T]: ReducerDispatch<T[P]['reducer']>;
  };
};

const createUseServerSideDispatch = <T extends UseReducerContextSource>(
  contextValueRef: React.MutableRefObject<UseReducerStore<T>>,
  displayName: keyof State<T>,
  reducer: T[keyof T]['reducer'],
  subscription: Subscription<UseReducerStore<T>>,
  store?: Store<State<T>>
): ReducerDispatch<typeof reducer> => {
  const useServerSideDispatch = (
    action?: React.ReducerAction<typeof reducer>
  ): void => {
    /* eslint no-param-reassign: 0 */
    const currentState = contextValueRef.current.state[displayName];
    const newState =
      reducer.length === 1
        ? reducer(currentState, undefined)
        : reducer(currentState, action);

    contextValueRef.current.state[displayName] = newState;
    if (store) {
      store.setState(newState, displayName);
    }

    subscription.trySubscribe(contextValueRef.current);
  };

  return useServerSideDispatch as any;
};

export const createContext = <T extends UseReducerContextSource>(
  contextSource: T
) => {
  const context = createBaseContext<UseReducerStore<T>>();
  const subscription = createSubscription<UseReducerStore<T>>();
  const useGlobalContext = createStore(context, subscription);
  const { Provider } = context;
  const contextProvider: React.FC<ContextProvider<State<T>>> = ({
    children,
    store,
  }: ContextProvider<State<T>>) => {
    const contextValueRef = useRef({
      state: {},
      dispatch: {},
    } as UseReducerStore<T>);
    const storeState = store?.getState() ?? undefined;

    entries(contextSource).forEach(([displayName, source]) => {
      const { reducer, initialState, initializer } = source;
      const initialValue =
        storeState && storeState[displayName] !== undefined
          ? storeState[displayName]
          : initialState;

      const [state, dispatch] = useReducer(reducer, initialValue, initializer);

      contextValueRef.current.state[displayName] = state;
      contextValueRef.current.dispatch[displayName] = dispatch as any;
      if (store) {
        store.setState(state, displayName);
      }
    }, {} as any);

    useEffect(() => {
      subscription.trySubscribe(contextValueRef.current);
    });

    return <Provider value={contextValueRef.current}>{children}</Provider>;
  };

  const contextServerSideProvider: React.FC<ContextProvider<State<T>>> = ({
    children,
    store,
  }: ContextProvider<State<T>>) => {
    const contextValueRef = useRef({
      state: {},
      dispatch: {},
    } as UseReducerStore<T>);
    const storeState = store?.getState() ?? undefined;

    entries(contextSource).forEach(([displayName, { initialState }]) => {
      const state =
        storeState && storeState[displayName] !== undefined
          ? storeState[displayName]
          : initialState;

      const dispatch = createUseServerSideDispatch(
        contextValueRef,
        displayName,
        contextSource[displayName].reducer,
        subscription,
        store
      );

      contextValueRef.current.state[displayName] = state;
      contextValueRef.current.dispatch[displayName] = dispatch;
      if (store) {
        store.setState(state, displayName);
      }
    }, {} as any);

    useIsomorphicLayoutEffect(() => {
      subscription.trySubscribe(contextValueRef.current);
    });

    return <Provider value={contextValueRef.current}>{children}</Provider>;
  };

  return {
    useGlobalContext,
    contextProvider: isBrowser ? contextProvider : contextServerSideProvider,
  };
};
