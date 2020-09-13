import { Dispatch, SetStateAction } from 'react';
import { createContextProvider } from '../core/createContextProvider';
import { getHooksContexts } from '../core/createHooksContexts';

import {
  Contexts,
  HooksContext,
  HooksContextWithArg,
  Option,
} from '../core/types';

export type UseStateArg = Contexts<any>;

export type UseStateContexts<T extends UseStateArg> = {
  [P in keyof T]: HooksContext<T[P], Dispatch<SetStateAction<T[P]>>>;
};

export type UseStateContextsWithArg<T extends UseStateArg> = {
  [P in keyof T]: HooksContextWithArg<
    T[P],
    T[P],
    Dispatch<SetStateAction<T[P]>>
  >;
};

export const createUseStateContexts = <T extends UseStateArg>(
  contexts: T,
  option?: Option
) => {
  const { hooksContexts, hooksContextsWithArg } = getHooksContexts<
    UseStateArg,
    T[keyof T],
    Dispatch<SetStateAction<T[keyof T]>>,
    UseStateContexts<T>,
    UseStateContextsWithArg<T>
  >(contexts, option);
  const ContextProviders = createContextProvider<
    UseStateContextsWithArg<UseStateArg>
  >('useState', hooksContextsWithArg);

  return [ContextProviders, hooksContexts] as const;
};
