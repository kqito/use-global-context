import { useState } from 'react';

export interface Values<T> {
  [displayName: string]: {
    value: T;
    options?: any;
  };
}

export type AnyFunc = (...args: any[]) => any;
