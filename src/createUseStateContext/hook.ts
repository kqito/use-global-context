import React from 'react';
import { UseStateContextSource } from './createUseStateContext';
import { UseStateStore } from './createContext';
import { Subscription } from '../core/subscription';
import { createUseSelector } from '../core/useSelector';

export const createStore = <T extends UseStateContextSource>(
  context: React.Context<UseStateStore<T>>,
  subscription: Subscription<UseStateStore<T>>
) => {
  const useGlobalContext = createUseSelector(context, subscription);

  return useGlobalContext;
};
