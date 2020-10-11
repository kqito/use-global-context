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
  getState: () => T,
  setState: (value: T[keyof T], key: keyof T) => void,
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
    const currentState = getState()[displayName];

    if (isFunction<(prevState: T[keyof T]) => T[keyof T]>(state)) {
      setState(state(currentState), displayName);
    } else {
      setState(state, displayName);
    }

    eventListener?.forEach((listener) => {
      listener(currentState);
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
  source: T,
  getState: () => T,
  setState: (value: T[keyof T], key: keyof T) => void
): UseStateStore<T> => {
  const store: UseStateStore<T> = {} as UseStateStore<T>;

  entries(source).forEach(([displayName]) => {
    store[displayName] = {
      state: createUseSelector(context, (c) => {
        return useContext(c)[displayName];
      }),
      dispatch: () =>
        createUseServerSideDispatch(
          getState,
          setState,
          displayName,
          context.eventListener
        ),
    };
  });

  return store;
};
