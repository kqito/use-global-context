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
    /* eslint no-param-reassign: 0 */
    const currentState = subscription.getStore().state[partial];
    const state =
      reducer.length === 1
        ? reducer(currentState, undefined)
        : reducer(currentState, action);

    const newState: Partial<GlobalContextValue<T>['state']> = {};
    newState[partial] = state;

    subscription.updateStore({
      newState,
    });

    subscription.trySubscribe();
  };

  return dispatch as ReducerDispatch<typeof reducer>;
};
