import { Context } from 'react';

export interface Contexts<T> {
  [displayName: string]: T;
}

export type Option = {
  displayName: any;
};

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
