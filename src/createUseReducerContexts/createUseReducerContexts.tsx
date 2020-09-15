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
