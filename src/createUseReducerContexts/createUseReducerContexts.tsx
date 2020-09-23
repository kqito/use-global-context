import {
  createContextProvider,
  ContextProviderType,
} from '../core/createContextProvider';
import {
  Contexts,
  HooksContext,
  HooksContextWithArg,
  Option,
} from '../core/types';
import { getHooksContexts } from '../core/createHooksContexts';

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

export type UseReducerContexts<T extends UseReducerArg> = {
  [P in keyof T]: HooksContext<
    ReducerState<T[P]['reducer']>,
    ReducerDispatch<T[P]['reducer']>
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
): [UseReducerContexts<T>, React.FC<ContextProviderType>] => {
  const { hooksContexts, hooksContextsWithArg } = getHooksContexts<
    UseReducerContexts<T>,
    UseReducerContextsWithArg<T>
  >(contexts, option);

  const ContextProviders = createContextProvider<
    UseReducerContextsWithArg<UseReducerArg>
  >('useReducer', hooksContextsWithArg);

  return [hooksContexts, ContextProviders];
};
