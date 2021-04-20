import React from 'react';

const initialState = { isLoaded: false };

const withoutReducer: React.ReducerWithoutAction<typeof initialState> = () => ({
  isLoaded: true,
});
export const applicationReducerArgs = {
  reducer: withoutReducer,
  initialState,
};
