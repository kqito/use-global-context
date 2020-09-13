import React, { useState, useReducer } from 'react';
import { Contexts } from './types';
import { entries } from '../utils/entries';
import {
  UseStateArg,
  UseStateContextsWithArg,
} from '../createUseStateContexts/createUseStateContexts';
import {
  UseReducerArg,
  UseReducerContextsWithArg,
} from '../createUseReducerContexts/createUseReducerContexts';

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

export const createContextProvider = <
  T extends UseReducerContextsWithArg<any> | UseStateContextsWithArg<any>
>(
  type: 'useState' | 'useReducer',
  context: T
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
