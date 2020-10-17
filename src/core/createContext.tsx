import React, { createContext, createElement } from 'react';
import { Subscription } from './subscription';
import { entries } from '../utils/entries';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type ContextProvider<T> = {
  children: React.ReactNode;
  value?: T;
};

export type ContextSource = {
  [displayName: string]: any;
};
export type BaseContext<T extends ContextSource> = {
  store: {
    [P in keyof T]: {
      state: React.Context<any>;
      dispatch: React.Context<any>;
    };
  };
  subscription: Subscription;
};

const dispatchEventLister = (
  provider: React.Context<any>['Provider'],
  subscription: Subscription,
  displayName: string
) => {
  const dispatcher = React.memo(
    ({ value, children }: React.ProviderProps<any>) => {
      useIsomorphicLayoutEffect(() => {
        subscription.forEach((listener) => {
          listener();
        });
      });

      return createElement(provider, { value }, children);
    }
  );

  // A bug where the displayname is anonymous will be fixed in react v17
  // see: https://github.com/facebook/react/issues/18026#issuecomment-675900452
  dispatcher.displayName = displayName;

  return dispatcher;
};

export const createBaseContext = <T extends ContextSource>(
  contextSource: T
): BaseContext<T> => {
  const baseContext = { store: {} } as BaseContext<T>;

  const subscription = new Set<() => void>();
  baseContext.subscription = subscription;

  entries(contextSource).forEach(([displayName]) => {
    const stateContext = createContext(null as any, () => 0);
    const dispatchContext = createContext(null as any);

    stateContext.Provider = dispatchEventLister(
      stateContext.Provider,
      subscription,
      displayName as string
    );
    stateContext.displayName = displayName as string;
    dispatchContext.displayName = displayName as string;

    baseContext.store[displayName] = {
      state: stateContext,
      dispatch: dispatchContext,
    };
  });

  return baseContext;
};
