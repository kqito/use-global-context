import React from 'react';
import { Actions } from '../actions/user';

type User = {
  id: string;
  name: string;
};

const initialState: User = {
  id: '',
  name: '',
};

const reducer: React.Reducer<User, Actions> = (state, action) => {
  switch (action.type) {
    case 'UPDATE_USER_PROFILE': {
      const { user } = action.payload;
      return {
        ...state,
        ...user,
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
