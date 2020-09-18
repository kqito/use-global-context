import { Context } from 'react';

export interface Contexts<T> {
  [displayName: string]: T;
}

export type Option = {
  displayName: any;
};

export type HooksContext<State extends unknown, Dispatch extends unknown> = {
  state: () => State;
  dispatch: () => Dispatch;
};

export type HooksContextWithArg<
  HooksArg extends unknown,
  State extends unknown,
  Dispatch extends unknown
> = {
  hooksArg: HooksArg;
  state: Context<State>;
  dispatch: Context<Dispatch>;
};
