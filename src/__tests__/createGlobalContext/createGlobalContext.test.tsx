import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { createSelector } from 'reselect';
import deepEqual from 'fast-deep-equal';
import {
  createGlobalContext,
  GlobalContextValue,
  mergeInitialState,
} from '../../index';
import { updateUserProfile } from './actions/user';
import { userReducerArgs } from './reducer/user';
import { counterReducerArgs } from './reducer/counter';
import { isBrowser } from '../../utils/environment';
import { testId } from '../utils';

type ContextValue = GlobalContextValue<typeof contextValue>;

const contextValue = {
  user: userReducerArgs,
  counter: counterReducerArgs,
};

const initialState = {
  user: userReducerArgs.initialState,
  counter: counterReducerArgs.initialState,
};

describe('createGlobalContext', () => {
  it('Initial state', () => {
    const [useGlobalContext, GlobalContextProvider] = createGlobalContext(
      contextValue
    );

    const Container = () => {
      const globalState = useGlobalContext(({ state }) => state);
      const counter = useGlobalContext(({ state }) => state.counter);
      const user = useGlobalContext(({ state }) => state.user);
      const id = useGlobalContext(({ state }) => state.user.id);
      const nullValue = useGlobalContext(() => null);
      const undefinedValue = useGlobalContext(() => undefined);
      const arrayValue = useGlobalContext(() => []);
      const stringValue = useGlobalContext(() => '');

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
      <GlobalContextProvider>
        <Container />
      </GlobalContextProvider>
    );
  });

  it('Dispatch', () => {
    const [useGlobalContext, GlobalContextProvider] = createGlobalContext(
      contextValue
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
        userDispatch(
          updateUserProfile({
            id: 'id',
            name: 'name',
          })
        );
      }, [userDispatch]);

      return (
        <>
          <p data-testid="id">{user.id}</p>
          <p data-testid="name">{user.name}</p>
        </>
      );
    };

    const wrapper = mount(
      <GlobalContextProvider>
        <Container />
      </GlobalContextProvider>
    );

    expect(wrapper.find(testId('id')).text()).toBe('id');
    expect(wrapper.find(testId('name')).text()).toBe('name');
  });

  it('Without action', () => {
    const [useGlobalContext, GlobalContextProvider] = createGlobalContext(
      contextValue
    );

    const Container = () => {
      const count = useGlobalContext(({ state }) => state.counter);
      const counterDispatch = useGlobalContext(
        ({ dispatch }) => dispatch.counter
      );

      useEffect(() => {
        counterDispatch();
      }, [counterDispatch]);

      return <p data-testid="count">{count}</p>;
    };

    const wrapper = mount(
      <GlobalContextProvider>
        <Container />
      </GlobalContextProvider>
    );

    expect(wrapper.find(testId('count')).text()).toBe('1');
  });

  it('GetState', () => {
    const ssrState: ContextValue['state'] = {
      user: {
        id: 'id',
        name: '',
      },
      counter: 0,
    };

    const [
      useGlobalContext,
      GlobalContextProvider,
      getStore,
    ] = createGlobalContext(mergeInitialState(contextValue, ssrState));

    const Container = () => {
      const id = useGlobalContext(({ state }) => state.user.id);
      const userDispatch = useGlobalContext(({ dispatch }) => dispatch.user);

      useEffect(() => {
        userDispatch(
          updateUserProfile({
            id: 'id',
            name: '',
          })
        );
      }, [userDispatch]);

      return <p data-testid="id">{id}</p>;
    };

    mount(
      <GlobalContextProvider>
        <Container />
      </GlobalContextProvider>
    );

    expect(getStore()).toStrictEqual(ssrState);
  });

  it('InitialState of store', () => {
    const ssrState: ContextValue['state'] = {
      user: {
        id: 'id',
        name: '',
      },
      counter: 0,
    };

    const [useGlobalContext, GlobalContextProvider] = createGlobalContext(
      mergeInitialState(contextValue, ssrState)
    );
    const Container = () => {
      const globalState = useGlobalContext(({ state }) => state);

      expect(globalState).toStrictEqual(ssrState);

      return null;
    };

    mount(
      <GlobalContextProvider>
        <Container />
      </GlobalContextProvider>
    );
  });

  it('Prevent inifinite loop', () => {
    const [useGlobalContext, GlobalContextProvider] = createGlobalContext(
      contextValue
    );

    const Container = () => {
      const user = useGlobalContext(({ state }) => state.user, deepEqual);
      const userDispatch = useGlobalContext(({ dispatch }) => dispatch.user);

      // SSR
      if (!isBrowser) {
        userDispatch(
          updateUserProfile({
            id: 'id',
            name: 'name',
          })
        );
      }

      useEffect(() => {
        userDispatch(
          updateUserProfile({
            id: 'id',
            name: 'name',
          })
        );
      }, [userDispatch]);

      return (
        <>
          <p data-testid="id">{user.id}</p>
          <p data-testid="name">{user.name}</p>
        </>
      );
    };

    const wrapper = mount(
      <GlobalContextProvider>
        <Container />
      </GlobalContextProvider>
    );

    expect(wrapper.find(testId('id')).text()).toBe('id');
    expect(wrapper.find(testId('name')).text()).toBe('name');
  });

  it('Reselect', () => {
    const getUserSelector = ({ state }: ContextValue) => state.user;
    const getHaveIdSelector = createSelector(
      [getUserSelector],
      (user) => user.id !== ''
    );

    const [useGlobalContext, GlobalContextProvider] = createGlobalContext(
      contextValue
    );

    const Container = () => {
      const haveId = useGlobalContext(getHaveIdSelector);
      const userDispatch = useGlobalContext(({ dispatch }) => dispatch.user);

      useEffect(() => {
        userDispatch(
          updateUserProfile({
            id: 'id',
            name: 'name',
          })
        );
      }, [userDispatch]);

      return <p data-testid="have-id">{haveId ? 'true' : 'false'}</p>;
    };

    const wrapper = mount(
      <GlobalContextProvider>
        <Container />
      </GlobalContextProvider>
    );

    expect(wrapper.find(testId('have-id')).text()).toBe('true');
  });
});
