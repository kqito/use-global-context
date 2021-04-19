import React from 'react';

const initialState = { counter: 0 };

const withoutReducer: React.ReducerWithoutAction<typeof initialState> = ({
  counter,
}) => ({
  counter: counter + 1,
});
export const counterReducerArgs = {
  reducer: withoutReducer,
  initialState,
};
