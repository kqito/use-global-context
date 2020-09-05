import React, {
  useState,
  useContext,
  useEffect,
  useReducer,
  Reducer,
} from 'react';
import { shallow, mount, render } from 'enzyme';
import { createMultiContexts } from '../createMultiContexts';

const createNumberState = () => {
  return useState(0);
};
const createStringState = () => {
  return useState('');
};
const createBooleanState = () => {
  return useState(false);
};

type User = {
  id: string;
  name: string;
};

const initialState: User = {
  id: '',
  name: '',
};

enum ActionType {
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  RESET_PROFILE = 'RESET_PROFILE',
}

type UserAction = {
  type: keyof typeof ActionType;
  payload?: {
    user?: User;
  };
};

const reducer: Reducer<User, UserAction> = (state, action) => {
  switch (action.type) {
    case ActionType.UPDATE_PROFILE: {
      const user = action.payload?.user;
      if (!user) {
        return state;
      }

      return {
        ...state,
        ...user,
      };
    }

    case ActionType.RESET_PROFILE: {
      return initialState;
    }

    default: {
      return state;
    }
  }
};

const createReducer = () => useReducer(reducer, initialState);

describe('CreateMultiContexts', () => {
  it('useState', () => {
    const App = () => {
      const [ContextProviders, Contexts] = createMultiContexts({
        number: createNumberState(),
        string: createStringState(),
        bool: createBooleanState(),
      });

      const [num] = useContext(Contexts.number);
      const [str] = useContext(Contexts.string);
      const [bool] = useContext(Contexts.bool);

      expect(num).toBe(0);
      expect(str).toBe('');
      expect(bool).toBe(false);

      return (
        <ContextProviders>
          <p>hi</p>
        </ContextProviders>
      );
    };

    render(<App />);
  });

  it('useReducer', () => {
    const App = () => {
      const [ContextProviders, Contexts] = createMultiContexts({
        number: createNumberState(),
        string: createStringState(),
        bool: createBooleanState(),
        reduce: createReducer(),
      });

      const [num] = useContext(Contexts.number);
      const [str] = useContext(Contexts.string);
      const [bool] = useContext(Contexts.bool);
      const [state, dispatch] = useContext(Contexts.reduce);

      expect(num).toBe(0);
      expect(str).toBe('');
      expect(bool).toBe(false);
      expect(state).toBe(initialState);

      return (
        <ContextProviders>
          <p>hi</p>
        </ContextProviders>
      );
    };

    render(<App />);
  });
});
