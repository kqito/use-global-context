import { useContext, useRef, useReducer } from 'react';
import { globalContext } from './context';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { devlog } from '../utils/devlog';

export type UseSelector<Store> = <SelectedStore>(
  selector: (store: Store) => SelectedStore,
  equalityFunction?: EqualityFunction
) => SelectedStore;
type EqualityFunction = (a: any, b: any) => boolean;
const refEquality: EqualityFunction = (a: any, b: any) => a === b;

export const createUseSelector = <Store>(): UseSelector<Store> => {
  function useSelector<SelectedStore>(
    selector: (store: Store) => SelectedStore,
    equalityFunction?: EqualityFunction
  ) {
    const contextValue = useContext(globalContext);
    const store = contextValue.getStore() as any;
    const subscription = contextValue.getSubscription();
    const [, forceRender] = useReducer((s) => s + 1, 0);

    let selectedStore: SelectedStore;
    const latestSelector = useRef<typeof selector>();
    const latestStore = useRef<Store>();
    const latestSelectedStore = useRef<SelectedStore>();

    selectedStore = selector(store);

    useIsomorphicLayoutEffect(() => {
      latestSelector.current = selector;
      latestStore.current = store;
      latestSelectedStore.current = selectedStore;
    });

    useIsomorphicLayoutEffect(() => {
      const refresh = (nextStore: Store) => {
        if (
          latestSelector.current === undefined ||
          latestSelectedStore.current === undefined
        ) {
          return;
        }

        try {
          const newSelectedStore = latestSelector.current(nextStore);
          const isEqualityFunction = equalityFunction || refEquality;

          if (
            isEqualityFunction(newSelectedStore, latestSelectedStore.current)
          ) {
            return;
          }

          latestStore.current = nextStore;
          latestSelectedStore.current = newSelectedStore;
        } catch (err) {
          devlog.error(err);
        }

        forceRender();
      };

      subscription.addListener(refresh);
      return () => {
        subscription.deleteListener(refresh);
      };
    }, [subscription]);

    return selectedStore;
  }

  return useSelector;
};
