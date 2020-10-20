import React, { createContext, createElement } from 'react';
import { Subscription } from './subscription';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type ContextProvider<T> = {
  children: React.ReactNode;
  value?: T;
};

export type ContextSource = {
  [displayName: string]: any;
};

const dispatchEventLister = (
  provider: React.Context<any>['Provider'],
  subscription: Subscription
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

  return dispatcher;
};

export const createBaseContext = <T extends ContextSource>(
  contextSource: T
) => {
  const stateContext = createContext(null as any, () => 0);
  const dispatchContext = createContext(null as any);
  const subscription = new Set<() => void>();

  stateContext.Provider = dispatchEventLister(
    stateContext.Provider,
    subscription
  );
  stateContext.displayName = 'UseGlobalStateContext';

  return { stateContext, dispatchContext, subscription };
};
