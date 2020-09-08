import React, { useState } from 'react';
import {
  UseStateValues,
  UseStateValueList,
} from '../createUseStateContexts/useStateContexts';

export type ContextProviderType = {
  children: React.ReactNode;
};

export const createCombindedContextProviders = <R extends UseStateValues>(
  providerContexts: UseStateValueList<R>,
  hook: typeof useState
) => {
  const ContextProviders: React.FC<ContextProviderType> = ({ children }) => {
    return (
      <>
        {providerContexts.reduceRight((acc, { value, Context }) => {
          const [state, dispatch] = hook(value);

          return (
            <Context.state.Provider value={state}>
              <Context.dispatch.Provider value={dispatch}>
                {acc}
              </Context.dispatch.Provider>
            </Context.state.Provider>
          );
        }, children)}
      </>
    );
  };

  return ContextProviders;
};
