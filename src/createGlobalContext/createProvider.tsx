import { Provider, useMemo } from 'react';
import { Subscription } from '../core/subscription';
import { useIsomorphicLayoutEffect } from '../core/useIsomorphicLayoutEffect';
import { mergeInitialState } from '../mergeInitialState';
import { entries } from '../utils/entries';
import { createDispatch } from './createDispatch';
import {
  CreateGlobalContextReducers,
  GlobalContextValue,
} from './createGlobalContext';

export type GlobalContextProviderProps<
  T extends CreateGlobalContextReducers,
  S = GlobalContextValue<T>['state']
> = Readonly<{
  state?: { [P in keyof S]?: Partial<S[P]> };
}>;

export const createProvider = <T extends CreateGlobalContextReducers>({
  reducers,
  subscription,
  initialStore,
  ContextProvider,
}: {
  reducers: T;
  subscription: Subscription<GlobalContextValue<T>>;
  initialStore: GlobalContextValue<T>;
  ContextProvider: Provider<GlobalContextValue<T>>;
}) => {
  const GlobalContextProvider: React.FC<GlobalContextProviderProps<T>> = ({
    state,
    children,
  }) => {
    const store = useMemo(() => subscription.getStore(), []);
    useMemo(() => {
      const mergedReducers = state
        ? mergeInitialState<T, GlobalContextValue<T>['state']>(reducers, state)
        : reducers;
      subscription.reset(initialStore);
      entries(mergedReducers).forEach(([partial, { initialState }]) => {
        const partialState = initialState;

        const dispatch = createDispatch(
          subscription,
          partial,
          reducers[partial].reducer
        );

        subscription.setState(partial, partialState);
        subscription.setDispatchs(partial, dispatch);
      });

      return subscription.getStore;
    }, [state]);

    useIsomorphicLayoutEffect(() => {
      subscription.trySubscribe();

      return () => {
        subscription.reset(initialStore as GlobalContextValue<T>);
      };
    }, []);

    return <ContextProvider value={store}>{children}</ContextProvider>;
  };

  return GlobalContextProvider;
};
