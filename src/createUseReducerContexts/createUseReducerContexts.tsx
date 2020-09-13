import { createContextProvider } from '../core/createContextProvider';
import {
  Contexts,
  HooksContext,
  HooksContextWithArg,
  Option,
} from '../core/types';
import { getHooksContexts } from '../core/createHooksContexts';

type Reducer = React.Reducer<any, any> | React.ReducerWithoutAction<any>;

export type UseReducerArg = Contexts<{
  reducer: Reducer;
  initialState: any;
  initializer?: undefined;
}>;

export type UseReducerContexts<T extends UseReducerArg> = {
  [P in keyof T]: HooksContext<
    React.ReducerState<T[P]['reducer']>,
    React.Dispatch<React.ReducerAction<T[P]['reducer']>>
  >;
};

export type UseReducerContextsWithArg<T extends UseReducerArg> = {
  [P in keyof T]: HooksContextWithArg<
    { [K in keyof T[P]]: T[P][K] },
    React.ReducerState<T[P]['reducer']>,
    React.Dispatch<React.ReducerAction<T[P]['reducer']>>
  >;
};

export const createUseReducerContexts = <T extends UseReducerArg>(
  contexts: T,
  option?: Option
) => {
  const { hooksContexts, hooksContextsWithArg } = getHooksContexts<
    UseReducerArg,
    T[keyof T]['reducer'],
    T[keyof T]['reducer'],
    UseReducerContexts<T>,
    UseReducerContextsWithArg<T>
  >(contexts, option);
  const ContextProviders = createContextProvider<
    UseReducerContextsWithArg<UseReducerArg>
  >('useReducer', hooksContextsWithArg);

  return [ContextProviders, hooksContexts] as const;
};
