import {
  GlobalContextValue,
  CreateGlobalContextReducers,
} from './createGlobalContext';
import { Subscription } from '../core/subscription';
import { createUseSelector } from '../core/useSelector';

export const createStore = <T extends CreateGlobalContextReducers>(
  context: React.Context<GlobalContextValue<T>>,
  subscription: Subscription<GlobalContextValue<T>>
) => {
  const useGlobalContext = createUseSelector(context, subscription);
  return useGlobalContext;
};
