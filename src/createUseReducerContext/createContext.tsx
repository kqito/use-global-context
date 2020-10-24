import React, { useReducer, useRef } from 'react';
import { UseReducerContextSource } from './createUseReducerContext';
import { createStore } from './hook';
import { createBaseContext, Subscription } from '../core/createContext';
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
export type Dispatch<T extends UseReducerContextSource> = {
  [P in keyof T]: ReducerDispatch<T[P]['reducer']>;
};

const createUseServerSideDispatch = <T extends UseReducerContextSource>(
  stateRef: React.MutableRefObject<State<T>>,
  displayName: keyof State<T>,
  reducer: T[keyof T]['reducer'],
  subscription: Subscription<State<T>>,
  store?: Store<State<T>>
): ReducerDispatch<typeof reducer> => {
  const useServerSideDispatch = (
    action?: React.ReducerAction<typeof reducer>
  ): void => {
    /* eslint no-param-reassign: 0 */
    const currentState = stateRef.current[displayName];
    const newState =
      reducer.length === 1
        ? reducer(currentState, undefined)
        : reducer(currentState, action);

    stateRef.current[displayName] = newState;
    if (store) {
      store.setState(newState, displayName);
    }

    subscription.forEach((listener) => {
      listener(stateRef.current);
    });
  };

  return useServerSideDispatch as any;
};

export const createContext = <T extends UseReducerContextSource>(
  contextSource: T
) => {
  const { state, dispatch } = createBaseContext<State<T>, Dispatch<T>>();
  const { useGlobalState, useGlobalDispatch } = createStore<T>(
    state.context,
    state.subscription,
    dispatch.context,
    dispatch.subscription
  );
  const StateProvider = state.context.Provider;
  const DispatchProvider = dispatch.context.Provider;
  const contextProvider: React.FC<ContextProvider<State<T>>> = ({
    children,
    store,
  }: ContextProvider<State<T>>) => {
    const stateRef = useRef({} as State<T>);
    const dispatchRef = useRef({} as Dispatch<T>);
    const storeState = store?.getState() ?? undefined;

    entries(contextSource).forEach(([displayName, source]) => {
      const { reducer, initialState, initializer } = source;
      const initialValue =
        storeState && storeState[displayName] !== undefined
          ? storeState[displayName]
          : initialState;

      const [hookState, hookDispatch] = useReducer(
        reducer,
        initialValue,
        initializer
      );

      stateRef.current[displayName] = hookState;
      dispatchRef.current[displayName] = hookDispatch as any;
    }, {} as any);

    return (
      <StateProvider value={stateRef.current}>
        <DispatchProvider value={dispatchRef.current}>
          {children}
        </DispatchProvider>
      </StateProvider>
    );
  };

  const contextServerSideProvider: React.FC<ContextProvider<State<T>>> = ({
    children,
    store,
  }: ContextProvider<State<T>>) => {
    const stateRef = useRef({} as State<T>);
    const dispatchRef = useRef({} as Dispatch<T>);
    const storeState = store?.getState() ?? undefined;

    entries(contextSource).forEach(([displayName, { initialState }]) => {
      const initialValue =
        storeState && storeState[displayName] !== undefined
          ? storeState[displayName]
          : initialState;

      const hookDispatch = createUseServerSideDispatch(
        stateRef,
        displayName,
        contextSource[displayName].reducer,
        state.subscription,
        store
      );

      stateRef.current[displayName] = initialValue;
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

  return {
    useGlobalState,
    useGlobalDispatch,
    contextProvider: isBrowser ? contextProvider : contextServerSideProvider,
  };
};
