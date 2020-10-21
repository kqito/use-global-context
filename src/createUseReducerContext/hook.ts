import { useContext } from 'react';
import { UseReducerContextSource } from './createUseReducerContext';
import { ReducerState, ReducerDispatch, CurrentState } from './createContext';
import { Subscription } from '../core/subscription';
import { createUseSelector } from '../core/useSelector';

export type UseGlobalState<T extends UseReducerContextSource> = {
  (): { [P in keyof T]: ReducerState<T[P]['reducer']> };
  <SelectedState>(
    selector: (
      state: { [P in keyof T]: ReducerState<T[P]['reducer']> }
    ) => SelectedState
  ): SelectedState;
};

export type UseGlobalDispatch<T extends UseReducerContextSource> = () => {
  [P in keyof T]: ReducerDispatch<T[P]['reducer']>;
};

export const createStore = <T extends UseReducerContextSource>(
  stateContext: React.Context<CurrentState<T>>,
  dispatchContext: React.Context<ReturnType<UseGlobalDispatch<T>>>,
  subscription: Subscription<CurrentState<T>>
) => {
  const useGlobalState = createUseSelector(
    stateContext,
    subscription
  ) as UseGlobalState<CurrentState<T>>;
  const useGlobalDispatch: UseGlobalDispatch<T> = () =>
    useContext(dispatchContext);

  return {
    useGlobalState,
    useGlobalDispatch,
  };
};
