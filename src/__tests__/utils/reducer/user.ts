import React from 'react';
import { Actions } from '../actions/user';

export type User = {
  id: string;
  name: string;
  loginCount: number;
};

const initialState: User = {
  id: '',
  name: '',
  loginCount: 0,
};

const reducer: React.Reducer<typeof initialState, Actions> = (
  state,
  action
) => {
  switch (action.type) {
    case 'UPDATE_USER_NAME': {
      const { name } = action.payload;

      return {
        ...state,
        name,
      };
    }

    case 'INCREMENT_COUNT': {
      return {
        ...state,
        loginCount: state.loginCount + 1,
      };
    }

    default: {
      return state;
    }
  }
};

export const userReducerArgs = {
  reducer,
  initialState,
};
