import { Context } from 'react';

export interface HooksArg<T> {
  [displayName: string]: {
    hooksArg: T;
    options?: any;
  };
}

export interface HooksContext<T extends unknown, R extends unknown> {
  state: Context<T>;
  dispatch: Context<R>;
}

export interface HooksContextWithArg<
  V extends unknown,
  K extends unknown,
  R extends unknown
> extends HooksContext<K, R> {
  hooksArg: V;
}
