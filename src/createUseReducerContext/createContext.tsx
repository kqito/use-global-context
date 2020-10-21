import React, { useReducer, useRef } from 'react';
import {
  UseReducerContextSource,
  CurrentState,
} from './createUseReducerContext';
import { createStore, UseGlobalDispatch } from './hook';
import { useIsomorphicLayoutEffect } from '../core/useIsomorphicLayoutEffect';
import { createBaseContext, ContextProvider } from '../core/createContext';
import { createCurrentState } from '../core/currentState';
import { Subscription } from '../core/subscription';
import { isBrowser } from '../utils/environment';
import { entries } from '../utils/entries';

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

const getInitialState = <T extends UseReducerContextSource>(
  contextSource: T
): CurrentState<T> => {
  return entries(contextSource).reduce(
    (acc, [displayName, { initialState }]) => {
      acc[displayName] = initialState;
      return acc;
    },
    {} as CurrentState<T>
  );
};

const createUseServerSideDispatch = <T extends UseReducerContextSource>(
  stateRef: React.MutableRefObject<CurrentState<T>>,
  getCurrentState: () => CurrentState<T>,
  setCurrentState: (
    value: CurrentState<T>[keyof T],
    key: keyof CurrentState<T>
  ) => void,
  displayName: keyof CurrentState<T>,
  reducer: T[keyof T]['reducer'],
  subscription: Subscription
): ReducerDispatch<typeof reducer> => {
  const useServerSideDispatch = (
    action?: React.ReducerAction<typeof reducer>
  ): void => {
    /* eslint no-param-reassign: 0 */
    const currentState = getCurrentState()[displayName];
    const newState =
      reducer.length === 1
        ? reducer(currentState, undefined)
        : reducer(currentState, action);

    stateRef.current[displayName] = newState;
    setCurrentState(newState, displayName);
    subscription.forEach((listener) => {
      listener();
    });
  };

  return useServerSideDispatch as any;
};

export const createContext = <T extends UseReducerContextSource>(
  contextSource: T
) => {
  const { getCurrentState, setCurrentState } = createCurrentState(
    getInitialState(contextSource)
  );

  const { stateContext, dispatchContext, subscription } = createBaseContext<T>(
    contextSource
  );
  const { useGlobalState, useGlobalDispatch } = createStore<T>(
    stateContext,
    dispatchContext,
    subscription,
    getCurrentState
  );
  const StateProvider = stateContext.Provider;
  const DispatchProvider = dispatchContext.Provider;
  const contextProvider: React.FC<ContextProvider<CurrentState<T>>> = ({
    children,
    value,
  }: ContextProvider<CurrentState<T>>) => {
    const stateRef = useRef({} as CurrentState<T>);
    const dispatchRef = useRef({} as ReturnType<UseGlobalDispatch<T>>);

    entries(contextSource).forEach(([displayName, source]) => {
      const { reducer, initialState, initializer } = source;
      const initialValue =
        value && value[displayName] !== undefined
          ? value[displayName]
          : initialState;

      const [hookState, hookDispatch] = useReducer(
        reducer,
        initialValue,
        initializer
      );

      setCurrentState(hookState, displayName);
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
  >> = ({ children, value }: ContextProvider<CurrentState<T>>) => {
    const stateRef = useRef({} as CurrentState<T>);
    const dispatchRef = useRef({} as ReturnType<UseGlobalDispatch<T>>);

    entries(contextSource).forEach(([displayName, { initialState }]) => {
      const initialValue =
        value && value[displayName] !== undefined
          ? value[displayName]
          : initialState;

      const hookDispatch = createUseServerSideDispatch(
        stateRef,
        getCurrentState,
        setCurrentState,
        displayName,
        contextSource[displayName].reducer,
        subscription
      );

      setCurrentState(initialValue, displayName);
      stateRef.current[displayName] = initialValue;
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

  return {
    useGlobalState,
    useGlobalDispatch,
    contextProvider: isBrowser ? contextProvider : contextServerSideProvider,
    getState: getCurrentState,
  };
};
