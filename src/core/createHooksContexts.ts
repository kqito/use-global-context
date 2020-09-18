import { createContext } from 'react';
import { Contexts, Option } from './types';

type GetHooksContexts = <HooksContexts, HooksContextsWithArg>(
  contexts: Contexts<any>,
  option?: Option
) => {
  hooksContexts: HooksContexts;
  hooksContextsWithArg: HooksContextsWithArg;
};

export const getHooksContexts: GetHooksContexts = <
  ContextsType extends Contexts<any>
>(
  contexts: ContextsType
) => {
  const hooksContexts: Record<string, any> = {};
  const hooksContextsWithArg: Record<string, any> = {};

  Object.entries(contexts).forEach(([displayName, hooksArg]) => {
    const StateContext = createContext(null as any);
    const DispatchContext = createContext(null as any);

    StateContext.displayName = displayName;
    DispatchContext.displayName = displayName;

    hooksContexts[displayName] = {
      state: StateContext,
      dispatch: DispatchContext,
    };
    hooksContextsWithArg[displayName] = {
      hooksArg,
      state: StateContext,
      dispatch: DispatchContext,
    };
  });

  return {
    hooksContexts: hooksContexts as any,
    hooksContextsWithArg: hooksContextsWithArg as any,
  };
};
