import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { createSelector } from 'reselect';
import deepEqual from 'fast-deep-equal';
import { createUseStateContext, createStore, UseStateStore } from '..';
import { isBrowser } from '../utils/environment';
import { testId } from './utils';

type State = {
  user: {
    id: string;
    name: string;
  };
  counter: number;
};

type GlobalContextValue = UseStateStore<State>;

const initialState: State = {
  user: {
    id: '',
    name: '',
  },
  counter: 0,
};

describe('createUseStateContext', () => {
  it('Initial state', () => {
    const [useGlobalContext, ContextProvider] = createUseStateContext<State>(
      initialState
    );

    const Container = () => {
      const globalState = useGlobalContext(({ state }) => state);
      const counter = useGlobalContext(({ state }) => state.counter);
      const user = useGlobalContext(({ state }) => state.user);
      const id = useGlobalContext(({ state }) => state.user.id);
      const nullValue = useGlobalContext(() => null);
      const undefinedValue = useGlobalContext(() => undefined);
      const stringValue = useGlobalContext(() => '');

      expect(globalState).toStrictEqual(initialState);
      expect(counter).toBe(initialState.counter);
      expect(user).toBe(initialState.user);
      expect(id).toBe(initialState.user.id);
      expect(nullValue).toBeNull();
      expect(undefinedValue).toBeUndefined();
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
    const [useGlobalContext, ContextProvider] = createUseStateContext<State>(
      initialState
    );

    const Container = () => {
      const user = useGlobalContext(({ state }) => state.user);
      const globalDispatch = useGlobalContext(({ dispatch }) => dispatch);
      const userDispatch = useGlobalContext(({ dispatch }) => dispatch.user);
      const counterDispatch = useGlobalContext(
        ({ dispatch }) => dispatch.counter
      );
      const undefinedValue = useGlobalContext(() => undefined);
      const arrayValue = useGlobalContext(() => []);
      const stringValue = useGlobalContext(() => '');

      expect(Object.keys(globalDispatch)).toStrictEqual(['user', 'counter']);
      expect(typeof globalDispatch.user).toBe('function');
      expect(typeof globalDispatch.counter).toBe('function');
      expect(typeof userDispatch).toBe('function');
      expect(typeof counterDispatch).toBe('function');
      expect(undefinedValue).toBeUndefined();
      expect(arrayValue).toStrictEqual([]);
      expect(stringValue).toBe('');

      useEffect(() => {
        userDispatch({
          id: 'id',
          name: 'name',
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

    expect(wrapper.find(testId('id')).text()).toBe('id');
    expect(wrapper.find(testId('name')).text()).toBe('name');
  });

  it('GetState', () => {
    const [useGlobalContext, ContextProvider] = createUseStateContext<State>(
      initialState
    );

    const valueStore = createStore<GlobalContextValue['state']>(initialState);

    const Container = () => {
      const counterDispatch = useGlobalContext(
        ({ dispatch }) => dispatch.counter
      );

      useEffect(() => {
        counterDispatch(100);
      }, []);

      return null;
    };

    mount(
      <ContextProvider store={valueStore}>
        <Container />
      </ContextProvider>
    );

    const expectState: State = {
      user: {
        id: '',
        name: '',
      },
      counter: 100,
    };

    expect(valueStore.getState()).toStrictEqual(expectState);
  });

  it('InitialState of store', () => {
    const [useGlobalContext, ContextProvider] = createUseStateContext<State>(
      initialState
    );

    const expectedState: State = {
      user: {
        id: '',
        name: '',
      },
      counter: 100,
    };

    const store = createStore<GlobalContextValue['state']>(expectedState);

    const Container = () => {
      const globalState = useGlobalContext(({ state }) => state);

      expect(globalState).toStrictEqual(expectedState);

      return null;
    };

    mount(
      <ContextProvider store={store}>
        <Container />
      </ContextProvider>
    );
  });

  it('Prevent inifinite loop', () => {
    const [useGlobalContext, ContextProvider] = createUseStateContext<State>(
      initialState
    );

    const Container = () => {
      const user = useGlobalContext(({ state }) => state.user, deepEqual);
      const userDispatch = useGlobalContext(({ dispatch }) => dispatch.user);

      // SSR
      if (!isBrowser) {
        userDispatch({
          id: 'id',
          name: 'name',
        });
      }

      if (isBrowser) {
        useEffect(() => {
          userDispatch({
            id: 'id',
            name: 'name',
          });
        });
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

  it('Reselect', () => {
    const getUserSelector = ({ state }: GlobalContextValue) => state.user;
    const getHaveIdSelector = createSelector(
      [getUserSelector],
      (user) => user.id !== ''
    );

    const [useGlobalContext, ContextProvider] = createUseStateContext<State>(
      initialState
    );

    const Container = () => {
      const haveId = useGlobalContext(getHaveIdSelector);
      const userDispatch = useGlobalContext(({ dispatch }) => dispatch.user);

      useEffect(() => {
        userDispatch({
          id: 'id',
          name: 'name',
        });
      }, []);

      return <p data-testid="have-id">{haveId ? 'true' : 'false'}</p>;
    };

    const wrapper = mount(
      <ContextProvider>
        <Container />
      </ContextProvider>
    );

    expect(wrapper.find(testId('have-id')).text()).toBe('true');
  });
});
