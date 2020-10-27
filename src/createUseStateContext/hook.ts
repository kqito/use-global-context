import React from 'react';
import { UseStateContextSource } from './createUseStateContext';
import { Dispatch } from './createContext';
import { Subscription } from '../core/createContext';
import { createUseSelector } from '../core/useSelector';

export const createStore = <T extends UseStateContextSource>(
  stateContext: React.Context<T>,
  stateSubscription: Subscription<T>,
  dispatchContext: React.Context<Dispatch<T>>,
  dispatchSubscription: Subscription<Dispatch<T>>
) => {
  const useGlobalState = createUseSelector<T>(stateContext, stateSubscription);
  const useGlobalDispatch = createUseSelector<
    {
      [P in keyof T]: React.Dispatch<React.SetStateAction<T[P]>>;
    }
  >(dispatchContext, dispatchSubscription);

  return {
    useGlobalState,
    useGlobalDispatch,
  };
};
