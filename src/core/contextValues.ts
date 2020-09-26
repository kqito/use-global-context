import React, { createContext, createElement } from 'react';
import { Options } from './options';

export interface Contexts<T> {
  [displayName: string]: T;
}

type GetHooksContexts = <HooksContextValues>(
  contexts: Contexts<any>,
  options?: Options
) => HooksContextValues;

const dispatchEventLister = (
  provider: React.Context<any>['Provider'],
  eventListener: React.Context<any>['eventListener'],
  displayName: string
) => {
  const dispatcher = React.memo(
    ({ value, children }: React.ProviderProps<any>) => {
      React.useLayoutEffect(() => {
        eventListener?.forEach((listener) => {
          listener(value);
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
      stateContext.eventListener,
      displayName
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
