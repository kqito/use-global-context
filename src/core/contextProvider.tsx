import React, { useState, useReducer } from 'react';
import { entries } from '../utils/entries';
import {
  UseStateArg,
  UseStateContextValues,
} from '../createUseStateContexts/createUseStateContexts';
import {
  UseReducerArg,
  UseReducerContextValues,
} from '../createUseReducerContexts/createUseReducerContexts';

export type ContextProviderType = {
  children: React.ReactNode;
};

const renderUseStateContexts = <T extends UseStateArg>(
  context: UseStateContextValues<T>,
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
  context: UseReducerContextValues<T>,
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
  T extends UseReducerContextValues<any> | UseStateContextValues<any>
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
