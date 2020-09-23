import { Dispatch, SetStateAction } from 'react';
import {
  createContextProvider,
  ContextProviderType,
} from '../core/contextProvider';
import { createContextValues } from '../core/contextValues';
import { createUseContexts } from '../core/useContexts';
import {
  Contexts,
  HooksContext,
  HooksContextValues,
  Option,
} from '../core/types';

export type UseStateArg = Contexts<any>;

export type UseContexts<T extends UseStateArg> = {
  [P in keyof T]: HooksContext<T[P], Dispatch<SetStateAction<T[P]>>>;
};

export type UseStateContextValues<T extends UseStateArg> = {
  [P in keyof T]: HooksContextValues<
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
): [UseContexts<T>, React.FC<ContextProviderType>] => {
  const contextValues = createContextValues<UseStateContextValues<T>>(
    contexts,
    option
  );
  const useContexts = createUseContexts<UseContexts<T>>(contextValues);
  const ContextProviders = createContextProvider<
    UseStateContextValues<UseStateArg>
  >('useState', contextValues);

  return [useContexts, ContextProviders];
};
