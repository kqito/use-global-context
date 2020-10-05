import React, { useContext } from 'react';
import { UseStateContextSource } from './createUseStateContexts';
import { UseStateContext } from './createContext';
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

const isFunction = <T>(value: unknown): value is T =>
  value && {}.toString.call(value) === '[object Function]';

export const createSSRContext = <T>() => {
  const context = React.createContext<T>(null as any);
  context.eventListener = new Set();

  return context;
};

export const createUseServerSideDispatch = <T extends UseStateContextSource>(
  currentState: T,
  displayName: keyof T,
  eventListener: React.Context<T>['eventListener']
): React.Dispatch<React.SetStateAction<T[keyof T]>> => {
  /* eslint no-param-reassign: 0 */

  function useServerSideDispatch(state: T[keyof T]): void;
  function useServerSideDispatch(
    selector: (prevState: T[keyof T]) => T[keyof T]
  ): void;
  function useServerSideDispatch(
    state: T[keyof T] | ((prevState: T[keyof T]) => T[keyof T])
  ): void {
    if (isFunction<(prevState: T[keyof T]) => T[keyof T]>(state)) {
      currentState[displayName] = state(currentState[displayName]);
    } else {
      currentState[displayName] = state;
    }

    eventListener?.forEach((listener) => {
      listener(currentState[displayName]);
    });
  }

  return useServerSideDispatch as any;
};

export const createStore = <T extends UseStateContextSource>(
  context: UseStateContext<T>
): UseStateStore<T> => {
  const store: UseStateStore<T> = {} as UseStateStore<T>;

  entries(context).forEach(([displayName, { state, dispatch }]) => {
    store[displayName] = {
      state: createUseSelector(state),
      dispatch: () => useContext(dispatch),
    };
  });

  return store;
};

export const createServerSideStore = <T extends UseStateContextSource>(
  context: React.Context<T>,
  currentState: T
): UseStateStore<T> => {
  const store: UseStateStore<T> = {} as UseStateStore<T>;

  entries(currentState).forEach(([displayName]) => {
    store[displayName] = {
      state: createUseSelector(context, (c) => {
        return useContext(c)[displayName];
      }),
      dispatch: () =>
        createUseServerSideDispatch(
          currentState,
          displayName,
          context.eventListener
        ),
    };
  });

  return store;
};
