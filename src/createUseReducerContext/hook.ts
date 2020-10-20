import { useContext } from 'react';
import {
  UseReducerContextSource,
  CurrentState,
} from './createUseReducerContext';
import { ReducerState, ReducerDispatch } from './createContext';
import { StateContexts, DispatchContext } from '../core/createContext';
import { createUseSelector } from '../core/useSelector';
import { entries } from '../utils/entries';

export type UseGlobalState<T extends UseReducerContextSource> = {
  [P in keyof T]: {
    (): ReducerState<T[P]['reducer']>;
    <SelectedState>(
      selector: (state: ReducerState<T[P]['reducer']>) => SelectedState
    ): SelectedState;
  };
};

export type UseGlobalDispatch<T extends UseReducerContextSource> = () => {
  [P in keyof T]: ReducerDispatch<T[P]['reducer']>;
};

export const createStore = <T extends UseReducerContextSource>(
  stateContexts: StateContexts<T>,
  dispatchContext: DispatchContext<T>,
  getCurrentState: () => CurrentState<T>
) => {
  const useGlobalState = {} as UseGlobalState<T>;
  const useGlobalDispatch = (() =>
    useContext(dispatchContext)) as UseGlobalDispatch<T>;

  entries(stateContexts).forEach(([displayName, context]) => {
    const getStateContextValue = () => {
      const getStateValue = useContext(context.state);
      return getStateValue();
    };

    const getCurrentStateValue = () => {
      const currentState = getCurrentState();
      return currentState[displayName];
    };

    useGlobalState[displayName] = createUseSelector(
      getStateContextValue,
      context.subscription,
      getCurrentStateValue
    );
  });

  return { useGlobalState, useGlobalDispatch };
};
