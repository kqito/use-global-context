export type CreateGlobalContextReducers = {
  [partial in string]: {
    reducer: AnyReducer;
    initialState: Record<string, any>;
  };
};

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

export type State<T extends CreateGlobalContextReducers> = {
  [P in keyof T]: T[P]['initialState'];
};

export type PartialState<T extends CreateGlobalContextReducers> = {
  [P in keyof State<T>]?: Partial<State<T>[P]>;
};

export type GlobalContextValue<T extends CreateGlobalContextReducers> = {
  state: State<T>;
  dispatch: {
    [P in keyof T]: ReducerDispatch<T[P]['reducer']>;
  };
};
