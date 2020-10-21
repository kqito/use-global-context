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
  stateContext: React.Context<T>,
  dispatchContext: React.Context<ReturnType<UseGlobalDispatch<T>>>,
  subscription: Subscription<T>
) => {
  const useGlobalState = createUseSelector(stateContext, subscription);
  const useGlobalDispatch: UseGlobalDispatch<T> = () =>
    useContext(dispatchContext);

  return {
    useGlobalState,
    useGlobalDispatch,
  };
};
