import { createContext } from 'react';

export const createBaseContext = <S,>() => {
  const context = createContext<S>(null as any, () => 0);

  context.displayName = 'GlobalContext';

  return context;
};
