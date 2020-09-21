import React, { createContext, createElement } from 'react';
import { Contexts, Option } from './types';

type GetHooksContexts = <HooksContextValues>(
  contexts: Contexts<any>,
  option?: Option
) => HooksContextValues;

/* eslint react/display-name: 0 */
const dispatchEventLister = (
  provider: React.Provider<any>,
  eventListener: React.Context<any>['eventListener']
) =>
  React.memo(({ value, children }: React.ProviderProps<any>) => {
    if (eventListener) {
      eventListener.forEach((listener) => {
        listener(value);
      });
    }

    return createElement(provider, { value }, children);
  });

export const createContextValues: GetHooksContexts = <
  ContextsType extends Contexts<any>
>(
  contexts: ContextsType
) => {
  const contextValues: Record<string, any> = {};

  Object.entries(contexts).forEach(([displayName, hooksArg]) => {
    const stateContext = createContext(null as any, () => 0);
    const dispatchContext = createContext(null as any);

    stateContext.eventListener = [];
    stateContext.Provider = dispatchEventLister(
      stateContext.Provider,
      stateContext.eventListener
    );
    stateContext.displayName = displayName;
    dispatchContext.displayName = displayName;

    contextValues[displayName] = {
      hooksArg,
      state: stateContext,
      dispatch: dispatchContext,
    };
  });

  return contextValues as any;
};
