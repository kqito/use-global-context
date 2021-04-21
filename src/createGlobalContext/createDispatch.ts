import { Subscription } from '../core/subscription';
import {
  GlobalContextReducers,
  GlobalContextValue,
  ReducerDispatch,
} from './type';

export const createDispatch = <T extends GlobalContextReducers>(
  subscription: Subscription<GlobalContextValue<T>>,
  partial: keyof T,
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
