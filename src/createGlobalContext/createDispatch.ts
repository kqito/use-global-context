import { Subscription } from '../core/subscription';
import { Store } from '../createStore/createStore';
import {
  ReducerDispatch,
  State,
  GlobalContextValue,
  CreateGlobalContextArgs,
} from './createGlobalContext';

export const createDispatch = <T extends CreateGlobalContextArgs>(
  contextValueRef: React.MutableRefObject<GlobalContextValue<T>>,
  partial: keyof State<T>,
  reducer: T[keyof T]['reducer'],
  subscription: Subscription<GlobalContextValue<T>>,
  store?: Store<State<T>>
): ReducerDispatch<typeof reducer> => {
  const useServerSideDispatch = (
    action?: React.ReducerAction<typeof reducer>
  ): void => {
    /* eslint no-param-reassign: 0 */
    const currentState = contextValueRef.current.state[partial];
    const newState =
      reducer.length === 1
        ? reducer(currentState, undefined)
        : reducer(currentState, action);

    contextValueRef.current.state[partial] = newState;
    if (store) {
      store.setState(partial, newState);
    }

    subscription.trySubscribe(contextValueRef.current);
  };

  return useServerSideDispatch as any;
};
