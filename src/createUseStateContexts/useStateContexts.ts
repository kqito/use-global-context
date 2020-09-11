import { createContext, Dispatch, SetStateAction } from 'react';
import { HooksArg, HooksContext, HooksContextWithArg } from '../core/types';
import { entries } from '../utils/entries';

export type UseStateArg = HooksArg<unknown>;

export type UseStateContexts<T extends UseStateArg> = {
  [P in keyof T]: HooksContext<
    T[P]['hooksArg'],
    Dispatch<SetStateAction<T[P]['hooksArg']>>
  >;
};

export type UseStateContextsWithArg<T extends UseStateArg> = {
  [P in keyof T]: HooksContextWithArg<
    T[P]['hooksArg'],
    T[P]['hooksArg'],
    Dispatch<SetStateAction<T[P]['hooksArg']>>
  >;
};

type UseState<T extends UseStateArg> = {
  useStateContexts: UseStateContexts<T>;
  useStateContextsWithArg: UseStateContextsWithArg<T>;
};

export const getUseStateContexts = <T extends UseStateArg>(hooksArgs: T) => {
  const contexts = entries(hooksArgs).reduce<UseState<T>>(
    (acc, [displayName, { hooksArg }]) => {
      const StateContext = createContext<T[keyof T]['hooksArg']>(null as any);

      const DispatchContext = createContext<
        Dispatch<SetStateAction<T[keyof T]['hooksArg']>>
      >(null as any);

      StateContext.displayName = `${displayName as string}State`;
      DispatchContext.displayName = `${displayName as string}Dispatch`;

      acc.useStateContexts[displayName] = {
        state: StateContext,
        dispatch: DispatchContext,
      };
      acc.useStateContextsWithArg[displayName] = {
        hooksArg,
        state: StateContext,
        dispatch: DispatchContext,
      };

      return acc;
    },
    {
      useStateContexts: {},
      useStateContextsWithArg: {},
    } as UseState<T>
  );

  return contexts;
};
