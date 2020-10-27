import { UseReducerContextSource } from './createUseReducerContext';
import {
  ReducerState,
  ReducerDispatch,
  State,
  Dispatch,
} from './createContext';
import { Subscription } from '../core/createContext';
import { createUseSelector } from '../core/useSelector';

export const createStore = <T extends UseReducerContextSource>(
  stateContext: React.Context<State<T>>,
  stateSubscription: Subscription<State<T>>,
  dispatchContext: React.Context<Dispatch<T>>,
  dispatchSubscription: Subscription<Dispatch<T>>
) => {
  const useGlobalState = createUseSelector<
    { [P in keyof T]: ReducerState<T[P]['reducer']> }
  >(stateContext, stateSubscription);
  const useGlobalDispatch = createUseSelector<
    { [P in keyof T]: ReducerDispatch<T[P]['reducer']> }
  >(dispatchContext, dispatchSubscription);

  return {
    useGlobalState,
    useGlobalDispatch,
  };
};
