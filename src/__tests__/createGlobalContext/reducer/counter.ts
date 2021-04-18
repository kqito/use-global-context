import React from 'react';

const initialState = 0;

const withoutReducer: React.ReducerWithoutAction<number> = (count) => count + 1;

export const counterReducerArgs = {
  reducer: withoutReducer,
  initialState,
};
