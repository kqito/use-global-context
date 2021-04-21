import { createStore } from './hook';
import { createBaseContext } from '../core/context';
import { Subscription } from '../core/subscription';
import { UseSelector } from '../core/useSelector';
import { createProvider, GlobalContextProviderProps } from './createProvider';

export type CreateGlobalContextReducers = {
  [partial in string]: {
    reducer: AnyReducer;
    initialState: Record<string, any>;
  };
};

export type CreateGlobalContextResult<T extends CreateGlobalContextReducers> = [
  UseSelector<GlobalContextValue<T>>,
  React.FC<GlobalContextProviderProps<T>>,
  () => GlobalContextValue<T>['state']
];

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
export type GlobalContextValue<T extends CreateGlobalContextReducers> = {
  state: {
    [P in keyof T]: T[P]['initialState'];
  };
  dispatch: {
    [P in keyof T]: ReducerDispatch<T[P]['reducer']>;
  };
};

export const createGlobalContext = <T extends CreateGlobalContextReducers>(
  reducers: T
): CreateGlobalContextResult<T> => {
  const initialStore = {
    state: {},
    dispatch: {},
  } as GlobalContextValue<T>;

  const context = createBaseContext<GlobalContextValue<T>>();
  const subscription = new Subscription<GlobalContextValue<T>>(initialStore);
  const useGlobalContext = createStore(context, subscription);
  const getStore = () => subscription.getStore().state;
  const GlobalContextProvider = createProvider({
    reducers,
    subscription,
    initialStore,
    ContextProvider: context.Provider,
  });

  return [useGlobalContext, GlobalContextProvider, getStore];
};
