import { Provider, useMemo } from 'react';
import { Subscription } from '../core/subscription';
import { useIsomorphicLayoutEffect } from '../core/useIsomorphicLayoutEffect';
import { mergeInitialState } from '../mergeInitialState';
import { entries } from '../utils/entries';
import { createDispatch } from './createDispatch';
import {
  GlobalContextReducers,
  GlobalContextValue,
  PartialState,
  State,
} from './type';

export type GlobalContextProviderProps<
  T extends GlobalContextReducers
> = Readonly<{
  state?: PartialState<T>;
}>;

export const createProvider = <T extends GlobalContextReducers>({
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
        ? mergeInitialState<T>(reducers, state)
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
        subscription.reset(initialStore);
      };
    }, []);

    return <ContextProvider value={store}>{children}</ContextProvider>;
  };

  return GlobalContextProvider;
};
