import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { createUseStateContext, createStore } from '..';
import { isBrowser } from '../utils/environment';
import { testId, deepEqual } from './utils';

type State = {
  user: {
    id: string;
    name: string;
  };
  counter: number;
};

const initialState: State = {
  user: {
    id: '',
    name: '',
  },
  counter: 0,
};

describe('createUseStateContext', () => {
  it('Initial state', () => {
    const [useGlobalState, , ContextProvider] = createUseStateContext<State>(
      initialState
    );

    const Container = () => {
      const globalState = useGlobalState();
      const counter = useGlobalState((state) => state.counter);
      const user = useGlobalState((state) => state.user);
      const id = useGlobalState((state) => state.user.id);
      const nullValue = useGlobalState(() => null);
      const undefinedValue = useGlobalState(() => undefined);
      const stringValue = useGlobalState(() => '');

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
    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseStateContext<State>(initialState);

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
    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseStateContext<State>(initialState);

    const store = createStore(initialState);

    const Container = () => {
      const counter = useGlobalState((state) => state.counter);
      const counterDispatch = useGlobalDispatch((dispatch) => dispatch.counter);

      useEffect(() => {
        counterDispatch(100);
      }, []);

      return null;
    };

    mount(
      <ContextProvider store={store}>
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

    expect(store.getState()).toStrictEqual(expectState);
  });

  it('InitialState of store', () => {
    const [useGlobalState, , ContextProvider] = createUseStateContext<State>(
      initialState
    );

    const expectState: State = {
      user: {
        id: '',
        name: '',
      },
      counter: 100,
    };

    const store = createStore<State>(expectState);

    const Container = () => {
      const globalState = useGlobalState();

      expect(globalState).toStrictEqual(expectState);

      return null;
    };

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
    ] = createUseStateContext<State>(initialState);

    const Container = () => {
      const user = useGlobalState((state) => state.user, deepEqual);
      const userDispatch = useGlobalDispatch((dispatch) => dispatch.user);

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
});
