import React from 'react';
import { UseStateContextSource } from './createUseStateContext';
import { UseStateContextValue } from './createContext';
import { Subscription } from '../core/subscription';
import { createUseSelector } from '../core/useSelector';

export const createStore = <T extends UseStateContextSource>(
  context: React.Context<UseStateContextValue<T>>,
  subscription: Subscription<UseStateContextValue<T>>
) => {
  const useGlobalContext = createUseSelector(context, subscription);

  return useGlobalContext;
};
