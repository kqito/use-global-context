import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { createUseReducerContext } from '../createUseReducerContext';
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
    const [
      useGlobalState,
      ,
      UseReducerContextProvider,
    ] = createUseReducerContext({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const user = useGlobalState.user();
      return (
        <>
          <p data-testid="id">{user.id}</p>
          <p data-testid="name">{user.name}</p>
        </>
      );
    };

    const wrapper = mount(
      <UseReducerContextProvider>
        <Container />
      </UseReducerContextProvider>
    );

    expect(wrapper.find(testId('id')).text()).toBe('id');
    expect(wrapper.find(testId('name')).text()).toBe('name');
  });

  it('Dispatch', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      UseReducerContextProvider,
    ] = createUseReducerContext({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const user = useGlobalState.user();
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
      <UseReducerContextProvider>
        <Container />
      </UseReducerContextProvider>
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
      UseReducerContextProvider,
    ] = createUseReducerContext({
      counter: {
        reducer: withoutReducer,
        initialState: 0,
      },
    });

    const Container = () => {
      const count = useGlobalState.counter();
      const disptach = useGlobalDispatch();
      useEffect(() => {
        disptach.counter();
      }, []);

      return <p data-testid="count">{count}</p>;
    };

    const wrapper = mount(
      <UseReducerContextProvider>
        <Container />
      </UseReducerContextProvider>
    );

    expect(wrapper.find(testId('count')).text()).toBe('1');
  });

  it('UseSelector', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      UseReducerContextProvider,
    ] = createUseReducerContext({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const id = useGlobalState.user((user) => user.id);
      const dispatch = useGlobalDispatch();

      useEffect(() => {
        dispatch.user({
          type: 'UPDATE_PROFILE',
          payload: {
            user: {
              id: 'id',
              name: '',
            },
          },
        });
        dispatch.user({
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
      <UseReducerContextProvider>
        <Container />
      </UseReducerContextProvider>
    );

    expect(wrapper.find(testId('id')).text()).toBe('id');
  });

  it('getState', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      UseReducerContextProvider,
      getState,
    ] = createUseReducerContext({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const id = useGlobalState.user((user) => user.id);
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
      <UseReducerContextProvider>
        <Container />
      </UseReducerContextProvider>
    );

    const expectCurrentState = {
      user: {
        id: 'dispatched-id',
        name: '',
      },
    };
    expect(getState()).toStrictEqual(expectCurrentState);
  });

  it('Initial value', () => {
    const [
      useGlobalState,
      ,
      UseReducerContextProvider,
    ] = createUseReducerContext({
      user: {
        reducer,
        initialState,
      },
    });

    const Container = () => {
      const id = useGlobalState.user((user) => user.id);

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
      <UseReducerContextProvider value={value}>
        <Container />
      </UseReducerContextProvider>
    );
  });
});
