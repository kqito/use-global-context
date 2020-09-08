import React, { Context, Dispatch, SetStateAction } from 'react';
import { Values } from '../core/types';
import { entries } from '../utils/entries';

export type UseStateValues = Values<unknown>;

export type UseStateContexts<T extends unknown> = {
  state: Context<T>;
  dispatch: Context<Dispatch<SetStateAction<T>>>;
};

export type UseStateContextProviderList<T extends UseStateValues> = {
  value: T[keyof T]['value'];
  Context: UseStateContexts<T[keyof T]['value']>;
}[];

export type ContextsType<T extends UseStateValues> = {
  [P in keyof T]: UseStateContexts<T[P]['value']>;
};

export const createContexts = <T extends UseStateValues>(values: T) => {
  const contextProviderList: UseStateContextProviderList<T> = [];

  const Contexts = entries(values).reduce<ContextsType<T>>(
    (acc, [displayName, { value }]) => {
      const StateContext = React.createContext<T[keyof T]['value']>(
        null as any
      );

      const DispatchContext = React.createContext<
        Dispatch<SetStateAction<T[keyof T]['value']>>
      >(null as any);

      StateContext.displayName = `${displayName as string}State`;
      DispatchContext.displayName = `${displayName as string}Dispatch`;

      acc[displayName] = {
        state: StateContext,
        dispatch: DispatchContext,
      };

      contextProviderList.push({
        value,
        Context: {
          state: StateContext,
          dispatch: DispatchContext,
        },
      });

      return acc;
    },
    {} as ContextsType<T>
  );

  return {
    contextProviderList,
    Contexts,
  };
};
