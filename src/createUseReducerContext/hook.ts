import { UseReducerContextSource } from './createUseReducerContext';
import { UseReducerStore } from './createContext';
import { Subscription } from '../core/subscription';
import { createUseSelector } from '../core/useSelector';

export const createStore = <T extends UseReducerContextSource>(
  context: React.Context<UseReducerStore<T>>,
  subscription: Subscription<UseReducerStore<T>>
) => {
  const useGlobalContext = createUseSelector(context, subscription);
  return useGlobalContext;
};
