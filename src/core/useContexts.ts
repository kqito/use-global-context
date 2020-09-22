import React, { useContext, useLayoutEffect, useRef } from 'react';
import { HooksContextValues } from './types';

const createUseSelector = <State>(context: React.Context<any>) => {
  const defaultSelector = (state: State) => state;

  function useSelector(): State;
  function useSelector<SelectedState>(
    selector: (state: State) => SelectedState
  ): SelectedState;
  function useSelector<SelectedState>(
    selector?: (state: State) => SelectedState
  ) {
    const { eventListener } = context;
    const value = useContext(context);

    const [, update] = React.useReducer((c) => c + 1, 0);
    const callback = selector || defaultSelector;
    const selectedValue = callback(value);
    const state = useRef<{
      value: any;
      selector: any;
      selectedValue: any;
    } | null>(null);

    useLayoutEffect(() => {
      state.current = { value, selector: callback, selectedValue };
    });

    useLayoutEffect(() => {
      const refresh = (nextValue: State) => {
        if (!state.current) {
          return;
        }

        if (
          state.current.value === nextValue ||
          Object.is(
            state.current.selectedValue,
            state.current.selector(nextValue)
          )
        ) {
          return;
        }

        update();
      };

      eventListener?.push(refresh);

      return () => {
        context.eventListener = eventListener?.filter(
          (listener) => listener !== refresh
        );
      };
    }, [eventListener]);

    return selectedValue;
  }

  return useSelector;
};

export const createUseContexts = <T>(contextValues: {
  [displayName: string]: HooksContextValues<any, any, any>;
}): T => {
  const useContexts: Record<string, any> = {};
  Object.entries(contextValues).forEach(
    ([displayName, { state, dispatch }]) => {
      useContexts[displayName] = {
        state: createUseSelector(state),
        dispatch: () => useContext(dispatch),
      };
    }
  );

  return useContexts as any;
};
