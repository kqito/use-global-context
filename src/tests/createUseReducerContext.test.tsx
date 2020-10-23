import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { createUseReducerContext, createStore } from '..';
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

describe('createUseRedcuerContext', () => {
  it('Initial state', () => {
    const [useGlobalState, , ContextProvider] = createUseReducerContext({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const user = useGlobalState((state) => state.user);
      return (
        <>
          <p data-testid="id">{user.id}</p>
          <p data-testid="name">{user.name}</p>
        </>
      );
    };

    const wrapper = mount(
      <ContextProvider>
        <Container />
      </ContextProvider>
    );

    expect(wrapper.find(testId('id')).text()).toBe('id');
    expect(wrapper.find(testId('name')).text()).toBe('name');
  });

  it('Dispatch', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseReducerContext({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const user = useGlobalState((state) => state.user);
      const disptach = useGlobalDispatch();
      useEffect(() => {
        disptach.user({
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
      <ContextProvider>
        <Container />
      </ContextProvider>
    );

    expect(wrapper.find(testId('id')).text()).toBe('dispatched-id');
    expect(wrapper.find(testId('name')).text()).toBe('dispatched-name');
  });

  it('Without action', () => {
    const withoutReducer: React.ReducerWithoutAction<number> = (count) =>
      count + 1;

    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseReducerContext({
      counter: {
        reducer: withoutReducer,
        initialState: 0,
      },
    });

    const Container = () => {
      const count = useGlobalState((state) => state.counter);
      const disptach = useGlobalDispatch();
      useEffect(() => {
        disptach.counter();
      }, []);

      return <p data-testid="count">{count}</p>;
    };

    const wrapper = mount(
      <ContextProvider>
        <Container />
      </ContextProvider>
    );

    expect(wrapper.find(testId('count')).text()).toBe('1');
  });

  it('UseSelector', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseReducerContext({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const id = useGlobalState((state) => state.user.id);
      const userDispatch = useGlobalDispatch((dispatch) => dispatch.user);

      useEffect(() => {
        userDispatch({
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
      <ContextProvider>
        <Container />
      </ContextProvider>
    );

    expect(wrapper.find(testId('id')).text()).toBe('id');
  });

  it('getState', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseReducerContext({
      user: {
        reducer,
        initialState,
      },
    });
    const store = createStore({
      user: {
        id: 'dispatched-id',
        name: '',
      },
    });

    const Container = () => {
      const id = useGlobalState((state) => state.user.id);
      const disptach = useGlobalDispatch();

      useEffect(() => {
        disptach.user({
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
      <ContextProvider store={store}>
        <Container />
      </ContextProvider>
    );

    const expectCurrentState = {
      user: {
        id: 'dispatched-id',
        name: '',
      },
    };
    expect(store.getState()).toStrictEqual(expectCurrentState);
  });

  it('Initial value', () => {
    const [useGlobalState, , ContextProvider] = createUseReducerContext({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const id = useGlobalState((state) => state.user.id);

      expect(id).toBe('dispatched-id');

      return <p data-testid="id">{id}</p>;
    };

    const store = createStore({
      user: {
        id: 'dispatched-id',
        name: '',
      },
    });

    mount(
      <ContextProvider store={store}>
        <Container />
      </ContextProvider>
    );
  });

  it('Prevent inifinite loop', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseReducerContext({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const id = useGlobalState((state) => state.user.id);
      const dispatch = useGlobalDispatch();

      useEffect(() => {
        dispatch.user({
          type: 'UPDATE_PROFILE',
          payload: {
            user: {
              id: 'dispatched-id',
              name: '',
            },
          },
        });
      });

      return <p data-testid="id">{id}</p>;
    };

    const wrapper = mount(
      <ContextProvider>
        <Container />
      </ContextProvider>
    );

    expect(wrapper.find(testId('id')).text()).toBe('dispatched-id');
  });
});
