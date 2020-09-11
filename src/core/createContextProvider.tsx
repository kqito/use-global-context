import React, { useState } from 'react';
import { entries } from '../utils/entries';
import {
  UseStateArg,
  UseStateContextWithArg,
} from '../createUseStateContexts/useStateContexts';

export type ContextProviderType = {
  children: React.ReactNode;
};

export const createContextProvider = <T extends UseStateArg>(
  context: UseStateContextWithArg<T>,
  hook: typeof useState
) => {
  const ContextProviders: React.FC<ContextProviderType> = ({ children }) => {
    return (
      <>
        {entries(context).reduceRight(
          (acc, [, { hooksArg, state: State, dispatch: Dispatch }]) => {
            const [state, dispatch] = hook(hooksArg);
            return (
              <State.Provider value={state}>
                <Dispatch.Provider value={dispatch}>{acc}</Dispatch.Provider>
              </State.Provider>
            );
          },
          children
        )}
      </>
    );
  };

  return ContextProviders;
};
