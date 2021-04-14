import React, { useRef } from 'react';
import { createStore } from './hook';
import { createBaseContext } from '../core/context';
import { createSubscription } from '../core/subscription';
import { useIsomorphicLayoutEffect } from '../core/useIsomorphicLayoutEffect';
import { Store } from '../createStore/createStore';
import { entries } from '../utils/entries';
import { createDispatch } from './createDispatch';
import { UseSelector } from '../core/useSelector';

export type CreateGlobalContextArgs = {
  [partial: string]: {
    reducer: AnyReducer;
    initialState: any;
    initializer?: any;
  };
};

export type CreateGlobalContextResult<T extends CreateGlobalContextArgs> = [
  UseSelector<GlobalContextValue<T>>,
  React.FC<GlobalContextProviderProps<State<T>>>
];

export type GlobalContextProviderProps<T extends Record<string, unknown>> = {
  children: React.ReactNode;
  store?: Store<T>;
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

export type State<T extends CreateGlobalContextArgs> = {
  [P in keyof T]: T[P]['initialState'];
};
export type GlobalContextValue<T extends CreateGlobalContextArgs> = {
  state: {
    [P in keyof T]: T[P]['initialState'];
  };
  dispatch: {
    [P in keyof T]: ReducerDispatch<T[P]['reducer']>;
  };
};

export const createGlobalContext = <T extends CreateGlobalContextArgs>(
  contextSource: T
): CreateGlobalContextResult<T> => {
  const context = createBaseContext<GlobalContextValue<T>>();
  const subscription = createSubscription<GlobalContextValue<T>>();
  const useGlobalContext = createStore(context, subscription);
  const { Provider } = context;
  const GlobalContextProvider: React.FC<
    GlobalContextProviderProps<State<T>>
  > = ({ children, store }: GlobalContextProviderProps<State<T>>) => {
    const contextValueRef = useRef({
      state: {},
      dispatch: {},
    } as GlobalContextValue<T>);
    const storeState = store?.getState() ?? undefined;

    entries(contextSource).forEach(([partial, { initialState }]) => {
      const state =
        storeState && storeState[partial] !== undefined
          ? storeState[partial]
          : initialState;

      const dispatch = createDispatch(
        contextValueRef,
        partial,
        contextSource[partial].reducer,
        subscription,
        store
      );

      contextValueRef.current.state[partial] = state;
      contextValueRef.current.dispatch[partial] = dispatch;
      if (store) {
        store.setState(partial, state);
      }
    }, {} as any);

    useIsomorphicLayoutEffect(() => {
      subscription.trySubscribe(contextValueRef.current);
    });

    return <Provider value={contextValueRef.current}>{children}</Provider>;
  };

  return [useGlobalContext, GlobalContextProvider];
};
