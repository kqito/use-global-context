import React, { useReducer } from 'react';
import {
  UseReducerContextSource,
  CurrentState,
} from './createUseReducerContexts';
import { createStore, createServerSideStore } from './store';
import {
  createBaseContext,
  createServerSideContext,
  ContextProvider,
} from '../core/createContext';
import { createCurrentState } from '../core/currentState';
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

export const createUseReducerContext = <T extends UseReducerContextSource>(
  contextSource: T
) => {
  const { getState, setState } = createCurrentState(
    getInitialState(contextSource)
  );

  const context = createBaseContext<T>(contextSource);
  const store = createStore(context);
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

            const [useReducerState, useReducerDispatch] = useReducer(
              reducer,
              initialValue,
              initializer
            );
            setState(useReducerState, displayName);

            return (
              <State.Provider value={useReducerState}>
                <Dispatch.Provider value={useReducerDispatch}>
                  {acc}
                </Dispatch.Provider>
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

export const createUseReducerServerSideContext = <
  T extends UseReducerContextSource
>(
  contextSource: T
) => {
  const { getState, setState, resetState } = createCurrentState(
    getInitialState(contextSource)
  );
  const { context, contextProvider } = createServerSideContext(
    getState,
    resetState
  );
  const store = createServerSideStore(
    context,
    contextSource,
    getState,
    setState
  );

  return {
    store,
    contextProvider,
    getState,
  };
};
