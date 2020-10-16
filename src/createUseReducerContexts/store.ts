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
  getState: () => CurrentState<T>
): UseReducerStore<T> => {
  const store: UseReducerStore<T> = {} as UseReducerStore<T>;

  entries(baseContext.store).forEach(([displayName, { state, dispatch }]) => {
    store[displayName] = {
      state: createUseSelector(
        () => useContext(state),
        baseContext.subscription,
        () => getState()[displayName]
      ),
      dispatch: () => useContext(dispatch),
    };
  });

  return store;
};
