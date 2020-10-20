import { useContext } from 'react';
import {
  UseReducerContextSource,
  CurrentState,
} from './createUseReducerContext';
import { ReducerState, ReducerDispatch } from './createContext';
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
  stateContext: React.Context<any>,
  dispatchContext: React.Context<any>,
  subscription: Subscription,
  getCurrentState: () => CurrentState<T>
) => {
  const useGlobalState = createUseSelector(
    stateContext,
    getCurrentState,
    subscription
  ) as UseGlobalState<CurrentState<T>>;
  const useGlobalDispatch = (() =>
    useContext(dispatchContext)) as UseGlobalDispatch<T>;

  return {
    useGlobalState,
    useGlobalDispatch,
  };
};
