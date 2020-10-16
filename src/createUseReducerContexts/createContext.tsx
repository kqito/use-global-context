import React, { useReducer } from 'react';
import {
  UseReducerContextSource,
  CurrentState,
} from './createUseReducerContexts';
import { createStore } from './store';
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
  getState: () => CurrentState<T>,
  setState: (
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
    const currentState = getState()[displayName];
    if (reducer.length === 1) {
      setState(reducer(currentState, undefined), displayName);
    } else {
      setState(reducer(currentState, action), displayName);
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
  const { getState, setState } = createCurrentState(
    getInitialState(contextSource)
  );

  const context = createBaseContext<T>(contextSource);
  const store = createStore(context, getState);
  const contextProvider: React.FC<ContextProvider<CurrentState<T>>> = ({
    children,
    value,
  }: ContextProvider<CurrentState<T>>) => {
    return (
      <>
        {entries(context.store).reduceRight(
          (acc, [displayName, { state: State, dispatch: Dispatch }]) => {
            const { reducer, initialState, initializer } = contextSource[
              displayName
            ];
            const initialValue =
              value && value[displayName] !== undefined
                ? value[displayName]
                : initialState;

            const [clientSideState, clientSideDispatch] = useReducer(
              reducer,
              initialValue,
              initializer
            );

            const state = isBrowser ? clientSideState : initialValue;
            const dispatch = isBrowser
              ? clientSideDispatch
              : createUseServerSideDispatch(
                  getState,
                  setState,
                  displayName,
                  contextSource[displayName].reducer,
                  context.subscription
                );

            setState(state, displayName);

            return (
              <State.Provider value={state}>
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
    contextProvider,
    getState,
  };
};
