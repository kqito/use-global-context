import { useContext } from 'react';
import {
  UseReducerContextSource,
  CurrentState,
} from './createUseReducerContexts';
import { ReducerState, ReducerDispatch } from './createContext';
import { entries } from '../utils/entries';
import { BaseContext } from '../core/createContext';
import { createUseSelector } from '../core/useSelector';

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

export const createUseServerSideDispatch = <T extends UseReducerContextSource>(
  currentState: CurrentState<T>,
  displayName: keyof CurrentState<T>,
  reducer: T[keyof T]['reducer'],
  eventListener: React.Context<CurrentState<T>>['eventListener']
): ReducerDispatch<typeof reducer> => {
  const useServerSideDispatch = (
    action?: React.ReducerAction<typeof reducer>
  ): void => {
    /* eslint no-param-reassign: 0 */
    const state = currentState[displayName];
    if (reducer.length === 1) {
      currentState[displayName] = reducer(state, undefined);
    } else {
      currentState[displayName] = reducer(state, action);
    }

    eventListener?.forEach((listener) => {
      listener(currentState[displayName]);
    });
  };

  return useServerSideDispatch as any;
};

export const createStore = <T extends UseReducerContextSource>(
  contexts: BaseContext<T>
): UseReducerStore<T> => {
  const store: UseReducerStore<T> = {} as UseReducerStore<T>;

  entries(contexts).forEach(([displayName, { state, dispatch }]) => {
    store[displayName] = {
      state: createUseSelector(state),
      dispatch: () => useContext(dispatch),
    };
  });

  return store;
};

export const createServerSideStore = <T extends UseReducerContextSource>(
  context: React.Context<CurrentState<T>>,
  contextSource: T,
  currentState: CurrentState<T>
): UseReducerStore<T> => {
  const store: UseReducerStore<T> = {} as UseReducerStore<T>;

  entries(currentState).forEach(([displayName]) => {
    store[displayName] = {
      state: createUseSelector(context, (c) => {
        return useContext(c)[displayName];
      }),
      dispatch: () =>
        createUseServerSideDispatch(
          currentState,
          displayName,
          contextSource[displayName].reducer,
          context.eventListener
        ),
    };
  });

  return store;
};
