import React, { useContext, useRef, useReducer } from 'react';
import { Subscription } from './subscription';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { log } from '../utils/log';

// The useSelector logic is based on the following repository.
// https://github.com/reduxjs/react-redux (MIT LICENSE)
// https://github.com/dai-shi/use-context-selector (MIT LICENSE)
export const createUseSelector = <State>(
  getContextValue: () => State,
  subscription: Subscription,
  getState: () => State
) => {
  const defaultSelector = (state: State) => state;

  function useSelector(): State;
  function useSelector<SelectedState>(
    selector: (state: State) => SelectedState
  ): SelectedState;
  function useSelector<SelectedState>(
    selector?: (state: State) => SelectedState
  ) {
    const state = getContextValue();
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
      log.error(err);
    }

    useIsomorphicLayoutEffect(() => {
      latestSelector.current = storeSelector;
      latestStoreState.current = state;
      latestSelectedState.current = selectedState;
    });

    useIsomorphicLayoutEffect(() => {
      const refresh = () => {
        const nextStore = getState();
        if (
          latestSelector.current === undefined ||
          latestSelectedState.current === undefined
        ) {
          return;
        }

        try {
          const newSelectedState = latestSelector.current(nextStore);
          console.log('selectedstate', newSelectedState);
          if (newSelectedState === latestSelectedState.current) {
            return;
          }

          latestSelectedState.current = newSelectedState;
        } catch (err) {
          log.error(err);
        }

        forceRender();
      };

      subscription.add(refresh);
      return () => {
        subscription.delete(refresh);
      };
    }, [getContextValue, subscription]);

    return selectedState;
  }

  return useSelector;
};
