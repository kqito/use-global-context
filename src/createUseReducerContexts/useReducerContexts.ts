import { createContext } from 'react';
import { HooksArg, HooksContext, HooksContextWithArg } from '../core/types';

type Reducer = React.Reducer<any, any> | React.ReducerWithoutAction<any>;
type UseReducerState<T extends Reducer> = T extends React.ReducerWithoutAction<
  any
>
  ? React.ReducerStateWithoutAction<T>
  : T extends React.Reducer<any, any>
  ? React.ReducerState<T>
  : never;
type UseReducerDispatch<
  T extends Reducer
> = T extends React.ReducerWithoutAction<any>
  ? React.DispatchWithoutAction
  : T extends React.Reducer<any, any>
  ? React.Dispatch<React.ReducerAction<T>>
  : never;

export type UseReducerArg = HooksArg<{
  reducer: Reducer;
  initialState: any;
  initializer?: undefined;
}>;

export type UseReducerContexts<T extends UseReducerArg> = {
  [P in keyof T]: HooksContext<
    React.ReducerState<T[P]['hooksArg']['reducer']>,
    React.Dispatch<React.ReducerAction<T[P]['hooksArg']['reducer']>>
  >;
};

export type UseReducerContextsWithArg<T extends UseReducerArg> = {
  [P in keyof T]: HooksContextWithArg<
    { [K in keyof T[P]['hooksArg']]: T[P]['hooksArg'][K] },
    React.ReducerState<T[P]['hooksArg']['reducer']>,
    React.Dispatch<React.ReducerAction<T[P]['hooksArg']['reducer']>>
  >;
};

type GetUseReducerContexts = <T extends UseReducerArg>(
  hooksArgs: T
) => {
  useReducerContexts: UseReducerContexts<T>;
  useReducerContextsWithArg: UseReducerContextsWithArg<T>;
};

export const getUseReducerContexts: GetUseReducerContexts = <
  T extends UseReducerArg
>(
  hooksArgs: T
) => {
  type HooksArgReducer = T[keyof T]['hooksArg']['reducer'];

  const useReducerContexts: Record<string, any> = {};
  const useReducerContextsWithArg: Record<string, any> = {};

  Object.entries(hooksArgs).forEach(([displayName, { hooksArg }]) => {
    const StateContext = createContext<UseReducerState<HooksArgReducer>>(
      null as any
    );

    const DispatchContext = createContext<UseReducerDispatch<HooksArgReducer>>(
      null as any
    );

    StateContext.displayName = `${displayName}State`;
    DispatchContext.displayName = `${displayName}Dispatch`;

    useReducerContexts[displayName] = {
      state: StateContext,
      dispatch: DispatchContext,
    };
    useReducerContextsWithArg[displayName] = {
      hooksArg,
      state: StateContext,
      dispatch: DispatchContext,
    };
  });

  return {
    useReducerContexts: useReducerContexts as any,
    useReducerContextsWithArg: useReducerContextsWithArg as any,
  };
};
