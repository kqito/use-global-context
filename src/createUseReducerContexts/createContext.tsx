import React, { useReducer, useCallback } from 'react';
import {
  UseReducerContextSource,
  CurrentState,
} from './createUseReducerContexts';
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
    if (reducer.length === 1) {
      setCurrentState(reducer(currentState, undefined), displayName);
    } else {
      setCurrentState(reducer(currentState, action), displayName);
    }

    subscription.forEach((listener) => {
      listener();
    });
  };

  return useServerSideDispatch as any;
};

export const createUseReducerContext = <T extends UseReducerContextSource>(
  contextSource: T
) => {
  const { getCurrentState, setCurrentState } = createCurrentState(
    getInitialState(contextSource)
  );

  const { stateContexts, dispatchContext } = createBaseContext<T>(
    contextSource
  );
  const { useGlobalState, useGlobalDispatch } = createStore(
    stateContexts,
    dispatchContext,
    getCurrentState
  );
  const globalDispatch = {} as ReturnType<UseGlobalDispatch<T>>;
  const DispatchProvider = dispatchContext.Provider;
  const contextProvider: React.FC<ContextProvider<CurrentState<T>>> = ({
    children,
    value,
  }: ContextProvider<CurrentState<T>>) => {
    return (
      <>
        {entries(stateContexts).reduceRight(
          (acc, [displayName, { state: State }]) => {
            const { reducer, initialState, initializer } = contextSource[
              displayName
            ];
            const initialValue =
              value && value[displayName] !== undefined
                ? value[displayName]
                : initialState;

            const [hookState, hookDispatch] = useReducer(
              reducer,
              initialValue,
              initializer
            );
            useIsomorphicLayoutEffect(() => {
              globalDispatch[displayName] = hookDispatch as any;
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

  const contextServerSideProvider: React.FC<ContextProvider<
    CurrentState<T>
  >> = ({ children, value }: ContextProvider<CurrentState<T>>) => {
    return (
      <>
        {entries(stateContexts).reduceRight(
          (acc, [displayName, { state: State, subscription }]) => {
            const { initialState } = contextSource[displayName];
            const initialValue =
              value && value[displayName] !== undefined
                ? value[displayName]
                : initialState;

            useIsomorphicLayoutEffect(() => {
              setCurrentState(initialValue, displayName);
              globalDispatch[displayName] = createUseServerSideDispatch(
                getCurrentState,
                setCurrentState,
                displayName,
                contextSource[displayName].reducer,
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
