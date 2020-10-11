import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { createUseReducerContexts } from '../createUseReducerContexts';
import { testId } from './utils';

type User = {
  id: string;
  name: string;
};

const initialState: User = {
  id: 'id',
  name: 'name',
};

const ActionType = {
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  RESET_PROFILE: 'RESET_PROFILE',
} as const;

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

describe('createUseRedcuerContexts', () => {
  it('InitialState', () => {
    const [store, UseReducerContextProviders] = createUseReducerContexts({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const user = store.user.state();
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

    expect(wrapper.find(testId('id')).text()).toBe('id');
    expect(wrapper.find(testId('name')).text()).toBe('name');
  });

  it('Dispatch', () => {
    const [store, UseReducerContextProviders] = createUseReducerContexts({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const user = store.user.state();
      const userDispatch = store.user.dispatch();
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

    expect(wrapper.find(testId('id')).text()).toBe('dispatched-id');
    expect(wrapper.find(testId('name')).text()).toBe('dispatched-name');
  });

  it('Without action', () => {
    const withoutReducer: React.ReducerWithoutAction<number> = (count) =>
      count + 1;

    const [store, UseReducerContextProviders] = createUseReducerContexts({
      counter: {
        reducer: withoutReducer,
        initialState: 0,
      },
    });

    const Container = () => {
      const count = store.counter.state();
      const increment = store.counter.dispatch();
      useEffect(() => {
        increment();
      }, []);

      return <p data-testid="count">{count}</p>;
    };

    const wrapper = mount(
      <UseReducerContextProviders>
        <Container />
      </UseReducerContextProviders>
    );

    expect(wrapper.find(testId('count')).text()).toBe('1');
  });

  it('UseSelector', () => {
    const [store, UseReducerContextProviders] = createUseReducerContexts({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const id = store.user.state((user) => user.id);
      const dispatch = store.user.dispatch();

      useEffect(() => {
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: {
            user: {
              id: 'id',
              name: '',
            },
          },
        });
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: {
            user: {
              id: 'id',
              name: '',
            },
          },
        });
      }, []);

      return <p data-testid="id">{id}</p>;
    };

    const wrapper = mount(
      <UseReducerContextProviders>
        <Container />
      </UseReducerContextProviders>
    );

    expect(wrapper.find(testId('id')).text()).toBe('id');
  });

  it('getState', () => {
    const [
      store,
      UseReducerContextProviders,
      getState,
    ] = createUseReducerContexts({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const id = store.user.state((user) => user.id);
      const userDispatch = store.user.dispatch();

      useEffect(() => {
        userDispatch({
          type: 'UPDATE_PROFILE',
          payload: {
            user: {
              id: 'dispatched-id',
              name: '',
            },
          },
        });
      }, []);

      return <p data-testid="id">{id}</p>;
    };

    mount(
      <UseReducerContextProviders>
        <Container />
      </UseReducerContextProviders>
    );

    const expectCurrentState = {
      user: {
        id: 'dispatched-id',
        name: '',
      },
    };
    expect(getState()).toStrictEqual(expectCurrentState);
  });

  it('InitialState', () => {
    const [store, UseReducerContextProviders] = createUseReducerContexts({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const id = store.user.state((user) => user.id);

      expect(id).toBe('dispatched-id');

      return <p data-testid="id">{id}</p>;
    };

    const value = {
      user: {
        id: 'dispatched-id',
        name: '',
      },
    };

    mount(
      <UseReducerContextProviders value={value}>
        <Container />
      </UseReducerContextProviders>
    );
  });
});
