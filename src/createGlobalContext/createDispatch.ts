import { Subscription } from '../core/subscription';
import {
  ReducerDispatch,
  State,
  GlobalContextValue,
  CreateGlobalContextArgs,
} from './createGlobalContext';

export const createDispatch = <T extends CreateGlobalContextArgs>(
  subscription: Subscription<GlobalContextValue<T>>,
  partial: keyof State<T>,
  reducer: T[keyof T]['reducer']
): ReducerDispatch<typeof reducer> => {
  const dispatch = (action?: React.ReducerAction<typeof reducer>): void => {
    const currentState = subscription.getStore().state[partial];
    const state =
      reducer.length === 1
        ? reducer(currentState, undefined)
        : reducer(currentState, action);

    subscription.setState(partial, state);
    subscription.trySubscribe();
  };

  return dispatch as ReducerDispatch<typeof reducer>;
};
