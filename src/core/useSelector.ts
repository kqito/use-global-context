import React, { useContext, useRef, useReducer } from 'react';
import { Subscription } from './createContext';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { devlog } from '../utils/devlog';

// The useSelector logic is based on the following repository.
// https://github.com/reduxjs/react-redux (MIT LICENSE)
// https://github.com/dai-shi/use-context-selector (MIT LICENSE)
export type UseSelector<T> = {
  (): T;
  <SelectedState>(
    selector: (state: T) => SelectedState,
    equalityFunction?: EqualityFunction
  ): SelectedState;
};
type EqualityFunction = (a: any, b: any) => boolean;
const refEquality: EqualityFunction = (a: any, b: any) => a === b;

export const createUseSelector = <State>(
  context: React.Context<State>,
  subscription: Subscription<State>
): UseSelector<State> => {
  const defaultSelector = (state: State) => state;

  function useSelector(): State;
  function useSelector<SelectedState>(
    selector: (state: State) => SelectedState,
    equalityFunction?: EqualityFunction
  ): SelectedState;
  function useSelector<SelectedState>(
    selector?: (state: State) => SelectedState,
    equalityFunction?: EqualityFunction
  ) {
    const state = useContext(context);
    const storeSelector = selector || defaultSelector;
    const [, forceRender] = useReducer((s) => s + 1, 0);

    let selectedState: SelectedState;
    const latestSelector = useRef<typeof storeSelector>();
    const latestStoreState = useRef<State>();
    const latestSelectedState = useRef<State | SelectedState>();

    selectedState = latestSelectedState.current as SelectedState;

    try {
      if (
        storeSelector !== latestSelector.current ||
        state !== latestStoreState.current
      ) {
        selectedState = storeSelector(state) as SelectedState;
      }
    } catch (err) {
      devlog.error(err);
    }

    useIsomorphicLayoutEffect(() => {
      latestSelector.current = storeSelector;
      latestStoreState.current = state;
      latestSelectedState.current = selectedState;
    });

    useIsomorphicLayoutEffect(() => {
      const refresh = (nextStore: State) => {
        if (
          latestSelector.current === undefined ||
          latestSelectedState.current === undefined
        ) {
          return;
        }

        try {
          const newSelectedState = latestSelector.current(nextStore);
          const equality = equalityFunction || refEquality;
          if (equality(newSelectedState, latestSelectedState.current)) {
            return;
          }

          latestSelectedState.current = newSelectedState;
        } catch (err) {
          devlog.error(err);
        }

        forceRender();
      };

      subscription.add(refresh);
      return () => {
        subscription.delete(refresh);
      };
    }, [context, subscription]);

    return selectedState;
  }

  return useSelector;
};
