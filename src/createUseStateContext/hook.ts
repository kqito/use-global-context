import React from 'react';
import { UseStateContextSource } from './createUseStateContext';
import { Dispatch } from './createContext';
import { Subscription } from '../core/createContext';
import { createUseSelector } from '../core/useSelector';

export type UseGlobalState<T extends UseStateContextSource> = {
  (): T;
  <SelectedState>(selector: (state: T) => SelectedState): SelectedState;
};

export type UseGlobalDispatch<T extends UseStateContextSource> = {
  (): {
    [P in keyof T]: React.Dispatch<React.SetStateAction<T[P]>>;
  };
  <SelectedState>(
    selector: (
      state: {
        [P in keyof T]: React.Dispatch<React.SetStateAction<T[P]>>;
      }
    ) => SelectedState
  ): SelectedState;
};

export const createStore = <T extends UseStateContextSource>(
  stateContext: React.Context<T>,
  stateSubscription: Subscription<T>,
  dispatchContext: React.Context<Dispatch<T>>,
  dispatchSubscription: Subscription<Dispatch<T>>
) => {
  const useGlobalState: UseGlobalState<T> = createUseSelector(
    stateContext,
    stateSubscription
  );
  const useGlobalDispatch: UseGlobalDispatch<T> = createUseSelector(
    dispatchContext,
    dispatchSubscription
  );

  return {
    useGlobalState,
    useGlobalDispatch,
  };
};
