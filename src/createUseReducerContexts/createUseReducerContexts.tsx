import React, { useReducer } from 'react';
import { entries } from '../utils/entries';
import { ContextProvider } from '../core/contextProvider';
import { createContextValues, Contexts } from '../core/contextValues';
import { createStore, HooksContext, HooksContextValues } from '../core/store';
import { Options } from '../core/options';

type Reducer = React.Reducer<any, any> | React.ReducerWithoutAction<any>;
type ReducerState<R> = R extends React.ReducerWithoutAction<any>
  ? React.ReducerStateWithoutAction<R>
  : R extends React.Reducer<any, any>
  ? React.ReducerState<R>
  : never;
type ReducerDispatch<R> = R extends React.ReducerWithoutAction<any>
  ? React.DispatchWithoutAction
  : R extends React.Reducer<any, any>
  ? React.Dispatch<React.ReducerAction<R>>
  : never;

export type UseReducerArg = Contexts<{
  reducer: Reducer;
  initialState: any;
  initializer?: undefined;
}>;
export type Store<T extends UseReducerArg> = {
  [P in keyof T]: HooksContext<
    ReducerState<T[P]['reducer']>,
    ReducerDispatch<T[P]['reducer']>
  >;
};
export type CurrentState<T extends UseReducerArg> = {
  [P in keyof T]: T[P]['initialState'];
};
export type UseReducerContextValues<T extends UseReducerArg> = {
  [P in keyof T]: HooksContextValues<
    { [K in keyof T[P]]: T[P][K] },
    React.ReducerState<T[P]['reducer']>,
    React.Dispatch<React.ReducerAction<T[P]['reducer']>>
  >;
};

/**
 * *useReducer* to create multiple contexts.
 * The created contexts are split into a state and a dispatch,
 * respectively, to prevent unnecessary rendering.
 */
export const createUseReducerContexts = <T extends UseReducerArg>(
  /**
   *  Object's value is passed as an argument to useReducer.
   *  Also, the object's key is set to the context's displayname.
   *  *@see* https://reactjs.org/docs/context.html#contextdisplayname
   */
  contexts: T,
  options?: Options
): [Store<T>, React.FC<ContextProvider<CurrentState<T>>>, CurrentState<T>] => {
  const contextValues = createContextValues<UseReducerContextValues<T>>(
    contexts,
    options
  );
  const store = createStore<Store<T>>(contextValues);
  const currentState: CurrentState<T> = entries(contexts).reduceRight(
    (acc, [displayName, hooksArg]) => {
      acc[displayName] = hooksArg.initialState;

      return acc;
    },
    {} as CurrentState<T>
  );
  const ContextProviders: React.FC<ContextProvider<CurrentState<T>>> = ({
    children,
    value,
  }: ContextProvider<CurrentState<T>>) => {
    return (
      <>
        {entries(contextValues).reduceRight(
          (
            acc,
            [displayName, { hooksArg, state: State, dispatch: Dispatch }]
          ) => {
            const { reducer, initialState, initializer } = hooksArg;
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

  return [store, ContextProviders, currentState];
};
