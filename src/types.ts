import react from 'react';

declare module 'react' {
  function createContext<T>(
    defaultValue: T,
    calculateChangedBits?: (prev: T, next: T) => number
  ): React.Context<T>;
}
