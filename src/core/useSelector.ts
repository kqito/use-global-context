import React, { useContext, useRef, useReducer } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { log } from '../utils/log';

// The useSelector logic is based on the following repository.
// https://github.com/reduxjs/react-redux (MIT LICENSE)
// https://github.com/dai-shi/use-context-selector (MIT LICENSE)
export const createUseSelector = <State>(
  context: React.Context<any>,
  contextSelector?: (c: React.Context<any>) => State
) => {
  const defaultSelector = (state: State) => state;

  function useSelector(): State;
  function useSelector<SelectedState>(
    selector: (state: State) => SelectedState
  ): SelectedState;
  function useSelector<SelectedState>(
    selector?: (state: State) => SelectedState
  ) {
    const storeState = contextSelector
      ? contextSelector(context)
      : (useContext(context) as State);
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
        storeState !== latestStoreState.current
      ) {
        selectedState = storeSelector(storeState) as SelectedState;
      }
    } catch (err) {
      log.error(err);
    }

    useIsomorphicLayoutEffect(() => {
      latestSelector.current = storeSelector;
      latestStoreState.current = storeState;
      latestSelectedState.current = selectedState;
    });

    useIsomorphicLayoutEffect(() => {
      const refresh = (nextStoreValue: State) => {
        if (
          latestSelector.current === undefined ||
          latestSelectedState.current === undefined
        ) {
          return;
        }

        try {
          const newSelectedState = latestSelector.current(nextStoreValue);
          if (newSelectedState === latestSelectedState.current) {
            return;
          }

          latestSelectedState.current = newSelectedState;
        } catch (err) {
          log.error(err);
        }

        forceRender();
      };

      context.eventListener?.add(refresh);
      return () => {
        context.eventListener?.delete(refresh);
      };
    }, [context]);

    return selectedState;
  }

  return useSelector;
};
