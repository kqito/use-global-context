import { Dispatch, SetStateAction } from 'react';
import {
  createContextProvider,
  ContextProviderType,
} from '../core/createContextProvider';
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

/**
 * *useState* to create multiple contexts.
 * The created contexts are split into a state and a dispatch,
 * respectively, to prevent unnecessary rendering.
 */
export const createUseStateContexts = <T extends UseStateArg>(
  /**
   *  Object's value is passed as an argument to useState.
   *  Also, the object's key is set to the context's displayname.
   *  *@see* https://reactjs.org/docs/context.html#contextdisplayname
   */
  contexts: T,
  option?: Option
): [UseStateContexts<T>, React.FC<ContextProviderType>] => {
  const { hooksContexts, hooksContextsWithArg } = getHooksContexts<
    UseStateArg,
    UseStateContexts<T>,
    UseStateContextsWithArg<T>
  >(contexts, option);

  const ContextProviders = createContextProvider<
    UseStateContextsWithArg<UseStateArg>
  >('useState', hooksContextsWithArg);

  return [hooksContexts, ContextProviders];
};
