import { FC } from 'react';
import { globalContext } from '../core/context';
import { Store } from '../core/store';
import { Subscription } from '../core/subscription';
import { useIsomorphicLayoutEffect } from '../core/useIsomorphicLayoutEffect';
import { GlobalContextReducers } from './type';

const ContextProvider = globalContext.Provider;

export const createProvider = <R extends GlobalContextReducers>(
  store: Store<R>
) => {
  const GlobalContextProvider: FC = ({ children }) => {
    useIsomorphicLayoutEffect(() => {
      store.trySubscribe();

      return () => {
        store.reset(new Subscription());
      };
    }, []);

    return <ContextProvider value={store}>{children}</ContextProvider>;
  };

  return GlobalContextProvider;
};
