import { FC } from 'react';
import { Store } from '../core/store';
import { Subscription } from '../core/subscription';
import { createUseSelector, UseSelector } from '../core/useSelector';
import { createProvider } from './createProvider';
import { GlobalContextReducers, GlobalContextValue } from './type';

interface StateController<T extends GlobalContextReducers> {
  getState: () => Store<T>['state'];
  setState: Store<T>['setState'];
}

export type CreateGlobalContextResult<T extends GlobalContextReducers> = [
  UseSelector<GlobalContextValue<T>>,
  FC,
  StateController<T>
];

export const createGlobalContext = <T extends GlobalContextReducers>(
  reducers: T
): CreateGlobalContextResult<T> => {
  const subscription = new Subscription<GlobalContextValue<T>>();
  const store = new Store(reducers, subscription);
  const useGlobalContext = createUseSelector<GlobalContextValue<T>>();
  const GlobalContextProvider = createProvider(store);

  const stateController = {
    getState: () => store.getStore().state,
    setState: store.setState,
  };

  return [useGlobalContext, GlobalContextProvider, stateController];
};
