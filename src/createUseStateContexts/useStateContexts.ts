import React, { Context, Dispatch, SetStateAction } from 'react';
import { Values } from '../core/types';
import { entries } from '../utils/entries';

export type UseStateValues = Values<unknown>;

export type UseStateContexts<T extends unknown> = {
  state: Context<T>;
  dispatch: Context<Dispatch<SetStateAction<T>>>;
};

export type UseStateValueList<T extends UseStateValues> = {
  value: T[keyof T]['value'];
  Context: UseStateContexts<T[keyof T]['value']>;
}[];

export type ContextsType<T extends UseStateValues> = {
  [P in keyof T]: UseStateContexts<T[P]['value']>;
};

export const getUseStateContexts = <T extends UseStateValues>(values: T) => {
  const useStateValueList: UseStateValueList<T> = [];

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

      useStateValueList.push({
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
    useStateValueList,
    Contexts,
  };
};
