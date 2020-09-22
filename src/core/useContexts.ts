import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { HooksContextValues } from './types';

// The useSelector logic is based on the following repository.
// https://github.com/dai-shi/use-context-selector (MIT LICENSE)
const createUseSelector = <State>(context: React.Context<any>) => {
  const defaultSelector = (state: State) => state;

  function useSelector(): State;
  function useSelector<SelectedState>(
    selector: (state: State) => SelectedState
  ): SelectedState;
  function useSelector<SelectedState>(
    selector?: (state: State) => SelectedState
  ) {
    const value = useContext(context);
    const [, update] = useState<State>();
    const prev = useRef<{
      value: any;
      selectedValue: any;
    } | null>(null);

    const { eventListener } = context;
    const callback = selector || defaultSelector;
    const selectedValue = callback(value);

    useLayoutEffect(() => {
      prev.current = { value, selectedValue };
    });

    useLayoutEffect(() => {
      const refresh = (nextValue: State) => {
        if (!prev.current) {
          return;
        }

        if (
          prev.current.value === nextValue ||
          Object.is(prev.current.selectedValue, callback(nextValue))
        ) {
          return;
        }

        update(nextValue);
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
