import React, { createContext, createElement } from 'react';
import { Subscription } from './subscription';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

const dispatchEventLister = <State extends any>(
  provider: React.Context<State>['Provider'],
  subscription: Subscription<State>
) => {
  const dispatcher = React.memo(
    ({ value, children }: React.ProviderProps<State>) => {
      useIsomorphicLayoutEffect(() => {
        subscription.forEach((listener) => {
          listener(value);
        });
      });

      return createElement(provider, { value }, children);
    }
  );

  dispatcher.displayName = 'UseGlobalContextProvider';

  return dispatcher;
};

export const createBaseContext = <State, Dispatch>() => {
  const stateContext = createContext<State>(null as any, () => 0);
  const dispatchContext = createContext<Dispatch>(null as any, () => 0);
  const stateSubscription = new Set<(state: State) => void>();
  const dispatchSubscription = new Set<(dispatch: Dispatch) => void>();

  stateContext.Provider = dispatchEventLister<State>(
    stateContext.Provider,
    stateSubscription
  );
  dispatchContext.Provider = dispatchEventLister(
    dispatchContext.Provider,
    dispatchSubscription
  );

  stateContext.displayName = 'UseGlobalStateContext';
  dispatchContext.displayName = 'UseGlobalDispatchContext';

  return {
    state: {
      context: stateContext,
      subscription: stateSubscription,
    },
    dispatch: {
      context: dispatchContext,
      subscription: dispatchSubscription,
    },
  };
};
