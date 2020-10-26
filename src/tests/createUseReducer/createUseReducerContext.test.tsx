import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import {
  createUseReducerContext,
  createStore,
  UseReducerState,
} from '../../index';
import { updateUserProfile } from './actions/user';
import { userReducerArgs } from './reducer/user';
import { counterReducerArgs } from './reducer/counter';
import { isBrowser } from '../../utils/environment';
import { testId } from '../utils';

const reducers = {
  user: userReducerArgs,
  counter: counterReducerArgs,
};

const initialState: UseReducerState<typeof reducers> = {
  user: userReducerArgs.initialState,
  counter: counterReducerArgs.initialState,
};

describe('createUseRedcuerContext', () => {
  it('Initial state', () => {
    const [useGlobalState, , ContextProvider] = createUseReducerContext(
      reducers
    );

    const Container = () => {
      const globalState = useGlobalState();
      const counter = useGlobalState((state) => state.counter);
      const user = useGlobalState((state) => state.user);
      const id = useGlobalState((state) => state.user.id);
      const nullValue = useGlobalState(() => null);
      const undefinedValue = useGlobalState(() => undefined);
      const arrayValue = useGlobalState(() => []);
      const stringValue = useGlobalState(() => '');

      expect(globalState).toStrictEqual(initialState);
      expect(counter).toBe(initialState.counter);
      expect(user).toBe(initialState.user);
      expect(id).toBe(initialState.user.id);
      expect(nullValue).toBeNull();
      expect(undefinedValue).toBeUndefined();
      expect(arrayValue).toStrictEqual([]);
      expect(stringValue).toBe('');

      return null;
    };

    mount(
      <ContextProvider>
        <Container />
      </ContextProvider>
    );
  });

  it('Dispatch', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseReducerContext(reducers);

    const Container = () => {
      const user = useGlobalState((state) => state.user);

      const globalDispatch = useGlobalDispatch();
      const userDispatch = useGlobalDispatch((dispatch) => dispatch.user);
      const counterDispatch = useGlobalDispatch((dispatch) => dispatch.counter);
      const undefinedValue = useGlobalDispatch(() => undefined);
      const arrayValue = useGlobalDispatch(() => []);
      const stringValue = useGlobalDispatch(() => '');

      expect(Object.keys(globalDispatch)).toStrictEqual(['user', 'counter']);
      expect(typeof globalDispatch.user).toBe('function');
      expect(typeof globalDispatch.counter).toBe('function');
      expect(typeof userDispatch).toBe('function');
      expect(typeof counterDispatch).toBe('function');
      expect(undefinedValue).toBeUndefined();
      expect(arrayValue).toStrictEqual([]);
      expect(stringValue).toBe('');

      useEffect(() => {
        userDispatch(
          updateUserProfile({
            id: 'id',
            name: 'name',
          })
        );
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

    expect(wrapper.find(testId('id')).text()).toBe('id');
    expect(wrapper.find(testId('name')).text()).toBe('name');
  });

  it('Without action', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseReducerContext(reducers);

    const Container = () => {
      const count = useGlobalState((state) => state.counter);
      const counterDispatch = useGlobalDispatch((dispatch) => dispatch.counter);

      useEffect(() => {
        counterDispatch();
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

  it('GetState', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseReducerContext(reducers);
    const store = createStore({
      user: {
        id: 'id',
        name: '',
      },
      counter: 0,
    });

    const Container = () => {
      const id = useGlobalState((state) => state.user.id);
      const userDispatch = useGlobalDispatch((disptach) => disptach.user);

      useEffect(() => {
        userDispatch(
          updateUserProfile({
            id: 'id',
            name: '',
          })
        );
      }, []);

      return <p data-testid="id">{id}</p>;
    };

    mount(
      <ContextProvider store={store}>
        <Container />
      </ContextProvider>
    );

    const expectState: UseReducerState<typeof reducers> = {
      user: {
        id: 'id',
        name: '',
      },
      counter: 0,
    };

    expect(store.getState()).toStrictEqual(expectState);
  });

  it('InitialState of store', () => {
    const [useGlobalState, , ContextProvider] = createUseReducerContext(
      reducers
    );

    const Container = () => {
      const id = useGlobalState((state) => state.user.id);

      expect(id).toBe('id');

      return <p data-testid="id">{id}</p>;
    };

    const store = createStore({
      user: {
        id: 'id',
        name: '',
      },
      counter: 0,
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
    ] = createUseReducerContext(reducers);

    const Container = () => {
      const user = useGlobalState((state) => state.user);
      const userDispatch = useGlobalDispatch((dispatch) => dispatch.user);

      // SSR
      if (!isBrowser) {
        userDispatch(
          updateUserProfile({
            id: 'id',
            name: 'name',
          })
        );
      }

      if (isBrowser) {
        useEffect(() => {
          userDispatch(
            updateUserProfile({
              id: 'id',
              name: 'name',
            })
          );
        }, []);
      }

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
});
