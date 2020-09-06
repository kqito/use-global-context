import React from 'react';

export type Value = (...args: any) => any;
export type Values = { [displayName: string]: Value };
export type ContextsType<T extends Values> = {
  [P in keyof T]: React.Context<ReturnType<T[P]>>;
};
export type ContextProviderType = {
  children: React.ReactNode;
};

export type ProviderContexts<T extends Values> = {
  displayName: keyof T;
  value: T[keyof T];
  Context: React.Context<ReturnType<T[keyof T]>>;
}[];

type Entries<T> = {
  [P in keyof T]: [P, T[P]];
}[keyof T][];

const entries = <T extends Values>(values: T): Entries<T> =>
  Object.entries(values) as Entries<T>;

export const createContexts = <T extends Values>(values: T) => {
  const providerContexts: ProviderContexts<T> = [];

  const Contexts = entries(values).reduce<ContextsType<T>>(
    (acc, [displayName, value]) => {
      const Context = React.createContext<ReturnType<T[keyof T]>>(null as any);
      Context.displayName = displayName as string;
      acc[displayName] = Context;

      providerContexts.push({
        displayName,
        value,
        Context,
      });

      return acc;
    },
    {} as ContextsType<T>
  );

  return {
    providerContexts,
    Contexts,
  };
};
