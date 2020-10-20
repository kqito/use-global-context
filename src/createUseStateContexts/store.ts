import React, { useContext } from 'react';
import { UseStateContextSource } from './createUseStateContexts';
import { UseStateContext } from './createContext';
import { BaseContext } from '../core/createContext';
import { createUseSelector } from '../core/useSelector';
import { entries } from '../utils/entries';

export type Store<State, Dispatch> = {
  state: {
    (): State;
    <SelectedState>(selector: (state: State) => SelectedState): SelectedState;
  };
  dispatch: () => Dispatch;
};

export type UseStateStore<T extends UseStateContextSource> = {
  [P in keyof T]: Store<T[P], React.Dispatch<React.SetStateAction<T[P]>>>;
};

export const createStore = <T extends UseStateContextSource>(
  baseContext: BaseContext<UseStateContext<T>>,
  getCurrentState: () => T
): UseStateStore<T> => {
  const store: UseStateStore<T> = {} as UseStateStore<T>;

  entries(baseContext).forEach(
    ([displayName, { state, dispatch, subscription }]) => {
      const getStateContextValue = () => {
        const getStateValue = useContext(state);
        return getStateValue();
      };

      const getCurrentStateValue = () => {
        const currentState = getCurrentState();
        return currentState[displayName];
      };

      store[displayName] = {
        state: createUseSelector(
          getStateContextValue,
          subscription,
          getCurrentStateValue
        ),
        dispatch: () => useContext(dispatch),
      };
    }
  );

  return store;
};
