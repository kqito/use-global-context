import { Store } from '../core/store';
import { Subscription } from '../core/subscription';
import {
  GlobalContextReducers,
  GlobalContextValue,
  ReducerDispatch,
} from './type';

interface CreateDispatchArgs<T extends GlobalContextReducers> {
  getStore: Store<T>['getStore'];
  setPartialState: Store<T>['setPartialState'];
  trySubscribe: Subscription<GlobalContextValue<T>>['trySubscribe'];
  partial: keyof T;
  reducer: T[keyof T]['reducer'];
}

export const createDispatch = <T extends GlobalContextReducers>({
  getStore,
  setPartialState,
  trySubscribe,
  partial,
  reducer,
}: CreateDispatchArgs<T>): ReducerDispatch<typeof reducer> => {
  const dispatch = (action?: React.ReducerAction<typeof reducer>): void => {
    const store = getStore();
    const partialState = store.state[partial];
    const newPartialState =
      reducer.length === 1
        ? reducer(partialState, undefined)
        : reducer(partialState, action);

    const newState = setPartialState(partial, newPartialState);

    trySubscribe({ ...store, state: newState });
  };

  return dispatch as ReducerDispatch<typeof reducer>;
};
