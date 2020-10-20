import React, { useContext } from 'react';
import { UseStateContextSource } from './createUseStateContexts';
import { UseStateContext } from './createContext';
import { StateContexts, DispatchContext } from '../core/createContext';
import { createUseSelector } from '../core/useSelector';
import { entries } from '../utils/entries';

export type UseGlobalState<T extends UseStateContextSource> = {
  [P in keyof T]: {
    (): T[P];
    <SelectedState>(selector: (state: T[P]) => SelectedState): SelectedState;
  };
};

export type UseGlobalDispatch<T extends UseStateContextSource> = () => {
  [P in keyof T]: React.Dispatch<React.SetStateAction<T[P]>>;
};

export const createStore = <T extends UseStateContextSource>(
  stateContexts: StateContexts<UseStateContext<T>>,
  dispatchContext: DispatchContext<UseStateContext<T>>,
  getCurrentState: () => T
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

  return {
    useGlobalState,
    useGlobalDispatch,
  };
};
