import {
  UseReducerContextValue,
  CreateGlobalContextArgs,
} from './createGlobalContext';
import { Subscription } from '../core/subscription';
import { createUseSelector } from '../core/useSelector';

export const createStore = <T extends CreateGlobalContextArgs>(
  context: React.Context<UseReducerContextValue<T>>,
  subscription: Subscription<UseReducerContextValue<T>>
) => {
  const useGlobalContext = createUseSelector(context, subscription);
  return useGlobalContext;
};
