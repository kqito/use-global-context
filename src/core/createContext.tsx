import React, { createContext, createElement } from 'react';
import { Store } from './store';
import { Subscription } from './subscription';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type ContextProvider<T extends Record<string, unknown>> = {
  children: React.ReactNode;
  store?: Store<T>;
};

export type ContextSource = {
  [displayName: string]: any;
};

const dispatchEventLister = <T extends ContextSource>(
  provider: React.Context<any>['Provider'],
  subscription: Subscription<T>
) => {
  const dispatcher = React.memo(
    ({ value, children }: React.ProviderProps<any>) => {
      useIsomorphicLayoutEffect(() => {
        subscription.forEach((listener) => {
          listener(value);
        });
      });

      return createElement(provider, { value }, children);
    }
  );

  return dispatcher;
};

export const createBaseContext = <T extends ContextSource>() => {
  const stateContext = createContext(null as any, () => 0);
  const dispatchContext = createContext(null as any);
  const subscription = new Set<() => void>();

  stateContext.Provider = dispatchEventLister<T>(
    stateContext.Provider,
    subscription
  );
  stateContext.displayName = 'UseGlobalStateContext';

  return { stateContext, dispatchContext, subscription };
};
