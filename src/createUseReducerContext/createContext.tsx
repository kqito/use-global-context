import React, { useReducer, useRef } from 'react';
import { UseReducerContextSource } from './createUseReducerContext';
import { createStore, UseGlobalDispatch } from './hook';
import { createBaseContext } from '../core/createContext';
import { Store } from '../core/store';
import { Subscription } from '../core/subscription';
import { isBrowser } from '../utils/environment';
import { entries } from '../utils/entries';

export type ContextProvider<T extends Record<string, unknown>> = {
  children: React.ReactNode;
  store?: Store<T>;
};

export type CurrentState<T extends UseReducerContextSource> = {
  [P in keyof T]: T[P]['initialState'];
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

export type UseReducerContext<T extends UseReducerContextSource> = {
  [P in keyof T]: {
    state: ReducerState<T[P]['reducer']>;
    dispatch: ReducerDispatch<T[P]['reducer']>;
  };
};

const createUseServerSideDispatch = <T extends UseReducerContextSource>(
  stateRef: React.MutableRefObject<CurrentState<T>>,
  displayName: keyof CurrentState<T>,
  reducer: T[keyof T]['reducer'],
  subscription: Subscription<CurrentState<T>>,
  store?: Store<CurrentState<T>>
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
  const { stateContext, dispatchContext, subscription } = createBaseContext<
    CurrentState<T>,
    ReturnType<UseGlobalDispatch<T>>
  >();
  const { useGlobalState, useGlobalDispatch } = createStore<T>(
    stateContext,
    dispatchContext,
    subscription
  );
  const StateProvider = stateContext.Provider;
  const DispatchProvider = dispatchContext.Provider;
  const contextProvider: React.FC<ContextProvider<CurrentState<T>>> = ({
    children,
    store,
  }: ContextProvider<CurrentState<T>>) => {
    const stateRef = useRef({} as CurrentState<T>);
    const dispatchRef = useRef({} as ReturnType<UseGlobalDispatch<T>>);
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

  const contextServerSideProvider: React.FC<ContextProvider<
    CurrentState<T>
  >> = ({ children, store }: ContextProvider<CurrentState<T>>) => {
    const stateRef = useRef({} as CurrentState<T>);
    const dispatchRef = useRef({} as ReturnType<UseGlobalDispatch<T>>);
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
        subscription,
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
