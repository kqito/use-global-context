import React, { useState, useReducer } from 'react';
import { HooksArg } from './types';
import { entries } from '../utils/entries';
import {
  UseStateArg,
  UseStateContextsWithArg,
} from '../createUseStateContexts/useStateContexts';
import {
  UseReducerArg,
  UseReducerContextsWithArg,
} from '../createUseReducerContexts/useReducerContexts';

export type ContextProviderType = {
  children: React.ReactNode;
};

const renderUseStateContexts = <T extends UseStateArg>(
  context: UseStateContextsWithArg<T>,
  children: React.ReactNode
) => {
  return entries(context).reduceRight(
    (acc, [, { hooksArg, state: State, dispatch: Dispatch }]) => {
      const [state, dispatch] = useState(hooksArg);
      return (
        <State.Provider value={state}>
          <Dispatch.Provider value={dispatch}>{acc}</Dispatch.Provider>
        </State.Provider>
      );
    },
    children
  );
};

const renderUseReducerContexts = <T extends UseReducerArg>(
  context: UseReducerContextsWithArg<T>,
  children: React.ReactNode
) => {
  return entries(context).reduceRight(
    (acc, [, { hooksArg, state: State, dispatch: Dispatch }]) => {
      const { reducer, initialState, initializer } = hooksArg;
      const [state, dispatch] = useReducer(reducer, initialState, initializer);
      return (
        <State.Provider value={state}>
          <Dispatch.Provider value={dispatch}>{acc}</Dispatch.Provider>
        </State.Provider>
      );
    },
    children
  );
};

export const createContextProvider = <T extends HooksArg<any>>(
  type: 'useState' | 'useReducer',
  context: T extends UseReducerArg
    ? UseReducerContextsWithArg<T>
    : T extends UseStateArg
    ? UseStateContextsWithArg<T>
    : never
) => {
  const ContextProviders: React.FC<ContextProviderType> = ({ children }) => {
    return (
      <>
        {type === 'useState' && renderUseStateContexts(context, children)}
        {type === 'useReducer' && renderUseReducerContexts(context, children)}
      </>
    );
  };

  return ContextProviders;
};
