import React, { useReducer, useCallback } from 'react';
import {
  UseReducerContextSource,
  CurrentState,
} from './createUseReducerContexts';
import { createStore } from './store';
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

  const context = createBaseContext<T>(contextSource);
  const store = createStore(context, getCurrentState);
  const contextProvider: React.FC<ContextProvider<CurrentState<T>>> = ({
    children,
    value,
  }: ContextProvider<CurrentState<T>>) => {
    return (
      <>
        {entries(context).reduceRight(
          (acc, [displayName, { state: State, dispatch: Dispatch }]) => {
            const { reducer, initialState, initializer } = contextSource[
              displayName
            ];
            const initialValue =
              value && value[displayName] !== undefined
                ? value[displayName]
                : initialState;

            const [state, dispatch] = useReducer(
              reducer,
              initialValue,
              initializer
            );
            const getState = useCallback(() => state, [state]);

            setCurrentState(state, displayName);

            return (
              <State.Provider value={getState}>
                <Dispatch.Provider value={dispatch}>{acc}</Dispatch.Provider>
              </State.Provider>
            );
          },
          children
        )}
      </>
    );
  };

  const contextServerSideProvider: React.FC<ContextProvider<
    CurrentState<T>
  >> = ({ children, value }: ContextProvider<CurrentState<T>>) => {
    return (
      <>
        {entries(context).reduceRight(
          (
            acc,
            [displayName, { state: State, dispatch: Dispatch, subscription }]
          ) => {
            const { initialState } = contextSource[displayName];
            const initialValue =
              value && value[displayName] !== undefined
                ? value[displayName]
                : initialState;

            useIsomorphicLayoutEffect(() => {
              setCurrentState(initialValue, displayName);
            }, []);

            const dispatch = createUseServerSideDispatch(
              getCurrentState,
              setCurrentState,
              displayName,
              contextSource[displayName].reducer,
              subscription
            );

            const getState = useCallback(() => {
              const currentState = getCurrentState();
              return currentState[displayName];
            }, [getCurrentState, displayName]);

            return (
              <State.Provider value={getState}>
                <Dispatch.Provider value={dispatch}>{acc}</Dispatch.Provider>
              </State.Provider>
            );
          },
          children
        )}
      </>
    );
  };

  return {
    store,
    contextProvider: isBrowser ? contextProvider : contextServerSideProvider,
    getState: getCurrentState,
  };
};
