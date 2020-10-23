import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { createUseStateContext, createStore } from '..';
import { testId } from './utils';

type State = {
  counter: number;
  message: string;
  user: {
    id: string;
    name: string;
    age: number;
  };
};

describe('createUseStateContext', () => {
  it('Initial state', () => {
    const [useGlobalState, , ContextProvider] = createUseStateContext<State>({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const Container = () => {
      const message = useGlobalState((state) => state.message);
      return <p data-testid="message">{message}</p>;
    };

    const wrapper = mount(
      <ContextProvider>
        <Container />
      </ContextProvider>
    );

    expect(wrapper.find(testId('message')).text()).toBe('');
  });

  it('Dispatch', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseStateContext<State>({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const Container = () => {
      const message = useGlobalState((state) => state.message);
      const dispatch = useGlobalDispatch();
      useEffect(() => {
        dispatch.message('message');
      }, []);
      return <p data-testid="message">{message}</p>;
    };

    const wrapper = mount(
      <ContextProvider>
        <Container />
      </ContextProvider>
    );

    expect(wrapper.find(testId('message')).text()).toBe('message');
  });

  it('UseSelector', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseStateContext<State>({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const Container = () => {
      const id = useGlobalState((state) => state.user.id);
      const nullable = useGlobalState(() => null);
      const string = useGlobalState(() => '');
      const userDispatch = useGlobalDispatch((dispatch) => dispatch.user);

      expect(nullable).toBe(null);
      expect(string).toBe('');

      useEffect(() => {
        userDispatch((user) => ({
          ...user,
          id: 'id',
        }));
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

  it('CurrentState', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      ContextProvider,
    ] = createUseStateContext<State>({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const store = createStore({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const Container = () => {
      const counter = useGlobalState((state) => state.counter);
      const dispatch = useGlobalDispatch();

      useEffect(() => {
        expect(store.getState().counter).toBe(0);
        dispatch.counter(100);
      }, []);

      return <p data-testid="id">{counter}</p>;
    };

    mount(
      <ContextProvider store={store}>
        <Container />
      </ContextProvider>
    );

    expect(store.getState().counter).toBe(100);
  });

  it('Store', () => {
    const [useGlobalState, , ContextProvider] = createUseStateContext<State>({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const store = createStore<State>({
      counter: 100,
    } as any);

    const Container = () => {
      const counter = useGlobalState((state) => state.counter);
      const message = useGlobalState((state) => state.message);

      expect(counter).toBe(100);
      expect(message).toBe('');

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
    ] = createUseStateContext<State>({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const Container = () => {
      const counter = useGlobalState((state) => state.counter);
      const dispatch = useGlobalDispatch();

      useEffect(() => {
        dispatch.counter(100);
      });

      return <p data-testid="id">{counter}</p>;
    };

    const wrapper = mount(
      <ContextProvider>
        <Container />
      </ContextProvider>
    );

    expect(wrapper.find(testId('id')).text()).toBe('100');
  });
});
