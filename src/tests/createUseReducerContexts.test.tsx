import React, { useContext, useEffect } from 'react';
import { mount } from 'enzyme';
import { createUseReducerContexts } from '../createUseReducerContexts';

const sel = (id: string): string => `[data-testid="${id}"]`;
type User = {
  id: string;
  name: string;
};

const initialState: User = {
  id: 'id',
  name: 'name',
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

const reducer: React.Reducer<User, UserAction> = (state, action) => {
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

const [
  UseReducerContextProviders,
  UseReducerContexts,
] = createUseReducerContexts({
  user: {
    reducer,
    initialState,
  },
});

describe('createUseRedcuerContexts', () => {
  it('InitialState', () => {
    const Container = () => {
      const user = useContext(UseReducerContexts.user.state);
      return (
        <>
          <p data-testid="id">{user.id}</p>
          <p data-testid="name">{user.name}</p>
        </>
      );
    };

    const wrapper = mount(
      <UseReducerContextProviders>
        <Container />
      </UseReducerContextProviders>
    );

    expect(wrapper.find(sel('id')).text()).toBe('id');
    expect(wrapper.find(sel('name')).text()).toBe('name');
  });

  it('Dispatch', () => {
    const Container = () => {
      const user = useContext(UseReducerContexts.user.state);
      const userDispatch = useContext(UseReducerContexts.user.dispatch);
      useEffect(() => {
        userDispatch({
          type: 'UPDATE_PROFILE',
          payload: {
            user: {
              id: 'dispatched-id',
              name: 'dispatched-name',
            },
          },
        });
      }, []);

      return (
        <>
          <p data-testid="id">{user.id}</p>
          <p data-testid="name">{user.name}</p>
        </>
      );
    };

    const wrapper = mount(
      <UseReducerContextProviders>
        <Container />
      </UseReducerContextProviders>
    );

    expect(wrapper.find(sel('id')).text()).toBe('dispatched-id');
    expect(wrapper.find(sel('name')).text()).toBe('dispatched-name');
  });
});
