import { Dispatch, SetStateAction } from 'react';
import {
  createContextProvider,
  ContextProviderType,
} from '../core/contextProvider';
import { createContextValues, Contexts } from '../core/contextValues';
import { createStore, HooksContext, HooksContextValues } from '../core/store';
import { Options } from '../core/options';

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
  options?: Options
): [UseContexts<T>, React.FC<ContextProviderType>] => {
  const contextValues = createContextValues<UseStateContextValues<T>>(
    contexts,
    options
  );
  const store = createStore<UseContexts<T>>(contextValues);
  const ContextProviders = createContextProvider<
    UseStateContextValues<UseStateArg>
  >('useState', contextValues);

  return [store, ContextProviders];
};
