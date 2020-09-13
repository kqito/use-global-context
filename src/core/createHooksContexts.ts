import { createContext } from 'react';
import { Contexts, Option } from './types';

type GetHooksContexts = <
  T extends Contexts<any>,
  State,
  Dispatch,
  HooksContexts,
  HooksContextsWithArg
>(
  contexts: T,
  option?: Option
) => {
  hooksContexts: HooksContexts;
  hooksContextsWithArg: HooksContextsWithArg;
};

export const getHooksContexts: GetHooksContexts = <
  ContextsType extends Contexts<any>,
  State,
  Dispatch
>(
  contexts: ContextsType
) => {
  const hooksContexts: Record<string, any> = {};
  const hooksContextsWithArg: Record<string, any> = {};

  Object.entries(contexts).forEach(([displayName, hooksArg]) => {
    const StateContext = createContext<State>(null as any);
    const DispatchContext = createContext<Dispatch>(null as any);

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
