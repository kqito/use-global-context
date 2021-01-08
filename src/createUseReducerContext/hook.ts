import { UseReducerContextSource } from './createUseReducerContext';
import { UseReducerContextValue } from './createContext';
import { Subscription } from '../core/subscription';
import { createUseSelector } from '../core/useSelector';

export const createStore = <T extends UseReducerContextSource>(
  context: React.Context<UseReducerContextValue<T>>,
  subscription: Subscription<UseReducerContextValue<T>>
) => {
  const useGlobalContext = createUseSelector(context, subscription);
  return useGlobalContext;
};
