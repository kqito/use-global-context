import React from 'react';
import {
  Values,
  ProviderContexts,
  ContextProviderType,
} from './createContexts';

export const createCombindedContextProviders = <T extends Values>(
  providerContexts: ProviderContexts<T>
): React.FC<ContextProviderType> => {
  const ContextProviders: React.FC<ContextProviderType> = ({ children }) => {
    return (
      <>
        {providerContexts.reduceRight(
          (acc, { value, Context }) => (
            <Context.Provider value={value()}>{acc}</Context.Provider>
          ),
          children
        )}
      </>
    );
  };

  return ContextProviders;
};
