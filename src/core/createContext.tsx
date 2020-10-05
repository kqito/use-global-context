import React, { createContext, createElement } from 'react';
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
  [P in keyof T]: {
    state: React.Context<any>;
    dispatch: React.Context<any>;
  };
};

const dispatchEventLister = (
  provider: React.Context<any>['Provider'],
  eventListener: React.Context<any>['eventListener'],
  displayName: string
) => {
  const dispatcher = React.memo(
    ({ value, children }: React.ProviderProps<any>) => {
      useIsomorphicLayoutEffect(() => {
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

export const createBaseContext = <T extends ContextSource>(
  contextSource: T
): BaseContext<T> => {
  const baseContext: BaseContext<T> = {} as BaseContext<T>;

  entries(contextSource).forEach(([displayName]) => {
    const stateContext = createContext(null as any, () => 0);
    const dispatchContext = createContext(null as any);

    stateContext.eventListener = new Set();
    stateContext.Provider = dispatchEventLister(
      stateContext.Provider,
      stateContext.eventListener,
      displayName as string
    );
    stateContext.displayName = displayName as string;
    dispatchContext.displayName = displayName as string;

    baseContext[displayName] = {
      state: stateContext,
      dispatch: dispatchContext,
    };
  });

  return baseContext;
};

export const createServerSideContext = <
  T extends Record<string, any> = Record<string, any>
>(
  initialState: T
) => {
  const context = React.createContext<T>(null as any);
  context.eventListener = new Set();
  const { Provider } = context;

  const contextProvider: React.FC<ContextProvider<T>> = ({
    children,
    value,
  }: ContextProvider<T>) => {
    const initialValue = {
      ...initialState,
      ...(value || {}),
    };

    return <Provider value={initialValue}>{children}</Provider>;
  };

  return {
    context,
    contextProvider,
  };
};
