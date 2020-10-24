import { UseReducerContextSource } from './createUseReducerContext';
import {
  ReducerState,
  ReducerDispatch,
  State,
  Dispatch,
} from './createContext';
import { Subscription } from '../core/createContext';
import { createUseSelector } from '../core/useSelector';

export type UseGlobalState<T extends UseReducerContextSource> = {
  (): { [P in keyof T]: ReducerState<T[P]['reducer']> };
  <SelectedState>(
    selector: (
      state: { [P in keyof T]: ReducerState<T[P]['reducer']> }
    ) => SelectedState
  ): SelectedState;
};

export type UseGlobalDispatch<T extends UseReducerContextSource> = {
  (): { [P in keyof T]: ReducerDispatch<T[P]['reducer']> };
  <SelectedState>(
    selector: (
      state: { [P in keyof T]: ReducerDispatch<T[P]['reducer']> }
    ) => SelectedState
  ): SelectedState;
};

export const createStore = <T extends UseReducerContextSource>(
  stateContext: React.Context<State<T>>,
  stateSubscription: Subscription<State<T>>,
  dispatchContext: React.Context<Dispatch<T>>,
  dispatchSubscription: Subscription<Dispatch<T>>
) => {
  const useGlobalState = createUseSelector(stateContext, stateSubscription);
  const useGlobalDispatch = createUseSelector(
    dispatchContext,
    dispatchSubscription
  );

  return {
    useGlobalState,
    useGlobalDispatch,
  };
};
