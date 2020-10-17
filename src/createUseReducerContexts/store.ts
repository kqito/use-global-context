import { useContext } from 'react';
import {
  UseReducerContextSource,
  CurrentState,
} from './createUseReducerContexts';
import { ReducerState, ReducerDispatch } from './createContext';
import { BaseContext } from '../core/createContext';
import { createUseSelector } from '../core/useSelector';
import { entries } from '../utils/entries';

type Store<State, Dispatch> = {
  state: {
    (): State;
    <SelectedState>(selector: (state: State) => SelectedState): SelectedState;
  };
  dispatch: () => Dispatch;
};

export type UseReducerStore<T extends UseReducerContextSource> = {
  [P in keyof T]: Store<
    ReducerState<T[P]['reducer']>,
    ReducerDispatch<T[P]['reducer']>
  >;
};

export const createStore = <T extends UseReducerContextSource>(
  baseContext: BaseContext<T>,
  getCurrentState: () => CurrentState<T>
): UseReducerStore<T> => {
  const store: UseReducerStore<T> = {} as UseReducerStore<T>;

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
