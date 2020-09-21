import {
  createContextProvider,
  ContextProviderType,
} from '../core/contextProvider';
import {
  Contexts,
  HooksContext,
  HooksContextValues,
  Option,
} from '../core/types';
import { createContextValues } from '../core/contextValues';
import { createUseContexts } from '../core/useContexts';

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

export type UseContexts<T extends UseReducerArg> = {
  [P in keyof T]: HooksContext<
    ReducerState<T[P]['reducer']>,
    ReducerDispatch<T[P]['reducer']>
  >;
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
  option?: Option
): [UseContexts<T>, React.FC<ContextProviderType>] => {
  const contextValues = createContextValues<UseReducerContextValues<T>>(
    contexts,
    option
  );
  const useSelector = createUseContexts<UseContexts<T>>(contextValues);
  const ContextProviders = createContextProvider<
    UseReducerContextValues<UseReducerArg>
  >('useReducer', contextValues);

  return [useSelector, ContextProviders];
};
