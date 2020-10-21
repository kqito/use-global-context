import React, { useContext } from 'react';
import { UseStateContextSource } from './createUseStateContext';
import { Subscription } from '../core/subscription';
import { createUseSelector } from '../core/useSelector';

export type UseGlobalState<T extends UseStateContextSource> = {
  (): T;
  <SelectedState>(selector: (state: T) => SelectedState): SelectedState;
};

export type UseGlobalDispatch<T extends UseStateContextSource> = () => {
  [P in keyof T]: React.Dispatch<React.SetStateAction<T[P]>>;
};

export const createStore = <T extends UseStateContextSource>(
  stateContext: React.Context<any>,
  dispatchContext: React.Context<any>,
  subscription: Subscription,
  getCurrentState: () => T
) => {
  const useGlobalState = createUseSelector(
    stateContext,
    getCurrentState,
    subscription
  );
  const useGlobalDispatch = (() =>
    useContext(dispatchContext)) as UseGlobalDispatch<T>;

  return {
    useGlobalState,
    useGlobalDispatch,
  };
};
