import React, { useMemo } from 'react';
import { createStore } from './hook';
import { createBaseContext } from '../core/context';
import { Subscription } from '../core/subscription';
import { useIsomorphicLayoutEffect } from '../core/useIsomorphicLayoutEffect';
import { entries } from '../utils/entries';
import { createDispatch } from './createDispatch';
import { UseSelector } from '../core/useSelector';

export type CreateGlobalContextArgs = {
  [partial: string]: {
    reducer: AnyReducer;
    initialState: Record<string, any>;
  };
};

export type CreateGlobalContextResult<T extends CreateGlobalContextArgs> = [
  UseSelector<GlobalContextValue<T>>,
  React.FC,
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

const initialStore = {
  state: {},
  dispatch: {},
};

export const createGlobalContext = <T extends CreateGlobalContextArgs>(
  args: T
): CreateGlobalContextResult<T> => {
  const context = createBaseContext<GlobalContextValue<T>>();
  const subscription = new Subscription<GlobalContextValue<T>>(
    initialStore as GlobalContextValue<T>
  );
  const useGlobalContext = createStore(context, subscription);
  const getStore = () => subscription.getStore().state;
  const { Provider } = context;

  const GlobalContextProvider: React.FC = ({ children }) => {
    const store = useMemo(() => subscription.getStore(), []);
    useMemo(() => {
      subscription.reset(initialStore as GlobalContextValue<T>);
      entries(args).forEach(([partial, { initialState }]) => {
        const state = initialState;

        const dispatch = createDispatch(
          subscription,
          partial,
          args[partial].reducer
        );

        subscription.setState(partial, state);
        subscription.setDispatchs(partial, dispatch);
      });

      return subscription.getStore;
    }, []);

    useIsomorphicLayoutEffect(() => {
      subscription.trySubscribe();

      return () => {
        subscription.reset(initialStore as GlobalContextValue<T>);
      };
    }, []);

    return <Provider value={store}>{children}</Provider>;
  };

  return [useGlobalContext, GlobalContextProvider, getStore];
};
