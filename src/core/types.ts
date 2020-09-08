export interface Values<T> {
  [displayName: string]: {
    value: T;
    options?: any;
  };
}
