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

export const createUseReducerContext = <T extends UseReducerContextSource>(
  source: T,
  currentState: CurrentState<T>
) => {
  const context = createBaseContext<T>(source);
  const store = createStore(context);
  const contextProvider: React.FC<ContextProvider<CurrentState<T>>> = ({
    children,
    value,
  }: ContextProvider<CurrentState<T>>) => {
    return (
      <>
        {entries(context).reduceRight(
          (acc, [displayName, { state: State, dispatch: Dispatch }]) => {
            const { reducer, initialState, initializer } = source[displayName];
            const initialValue =
              value && value[displayName] !== undefined
                ? value[displayName]
                : initialState;

            const [useReducerState, useReducerDispatch] = useReducer(
              reducer,
              initialValue,
              initializer
            );
            currentState[displayName] = useReducerState;
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
    context,
    store,
    contextProvider,
  };
};

export const createUseReducerServerSideContext = <
  T extends UseReducerContextSource
>(
  source: T,
  currentState: CurrentState<T>
) => {
  const { context, contextProvider } = createServerSideContext(currentState);
  const store = createServerSideStore(context, source, currentState);

  return {
    context,
    store,
    contextProvider,
  };
};
