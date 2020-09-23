import react from 'react';

declare module 'react' {
  function createContext<T>(
    defaultValue: T,
    calculateChangedBits?: (prev: T, next: T) => number
  ): React.Context<T>;

  interface Context<T> {
    Provider: React.Provider<T>;
    Consumer: React.Consumer<T>;
    displayName?: string;
    eventListener?: ((value: T) => void)[];
  }
}
