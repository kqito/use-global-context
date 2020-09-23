import { Context } from 'react';

export interface Contexts<T> {
  [displayName: string]: T;
}

export type Option = {
  displayName: any;
};

export type HooksContext<State, Dispatch> = {
  state: {
    (): State;
    <SelectedState>(selector: (state: State) => SelectedState): SelectedState;
  };
  dispatch: () => Dispatch;
};

export type HooksContextValues<
  HooksArg extends unknown,
  State extends unknown,
  Dispatch extends unknown
> = {
  hooksArg: HooksArg;
  state: Context<State>;
  dispatch: Context<Dispatch>;
};
