import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { createUseStateContexts } from '../createUseStateContexts';
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

describe('createUseStateContexts', () => {
  it('Initial state', () => {
    const [useGlobalState, , UseStateContextProvider] = createUseStateContexts<
      State
    >({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const Container = () => {
      const message = useGlobalState.message();
      return <p data-testid="message">{message}</p>;
    };

    const wrapper = mount(
      <UseStateContextProvider>
        <Container />
      </UseStateContextProvider>
    );

    expect(wrapper.find(testId('message')).text()).toBe('');
  });

  it('Dispatch', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      UseStateContextProvider,
    ] = createUseStateContexts<State>({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const Container = () => {
      const message = useGlobalState.message();
      const dispatch = useGlobalDispatch();
      useEffect(() => {
        dispatch.message('message');
      }, []);
      return <p data-testid="message">{message}</p>;
    };

    const wrapper = mount(
      <UseStateContextProvider>
        <Container />
      </UseStateContextProvider>
    );

    expect(wrapper.find(testId('message')).text()).toBe('message');
  });

  it('UseSelector', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      UseStateContextProvider,
    ] = createUseStateContexts<State>({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const Container = () => {
      const id = useGlobalState.user((user) => user.id);
      const nullable = useGlobalState.user(() => null);
      const string = useGlobalState.user(() => '');
      const dispatch = useGlobalDispatch();

      expect(nullable).toBe(null);
      expect(string).toBe('');

      useEffect(() => {
        dispatch.user((user) => ({
          ...user,
          id: 'id',
        }));
      }, []);

      return <p data-testid="id">{id}</p>;
    };

    const wrapper = mount(
      <UseStateContextProvider>
        <Container />
      </UseStateContextProvider>
    );

    expect(wrapper.find(testId('id')).text()).toBe('id');
  });

  it('CurrentState', () => {
    const [
      useGlobalState,
      useGlobalDispatch,
      UseStateContextProvider,
      getState,
    ] = createUseStateContexts<State>({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const Container = () => {
      const counter = useGlobalState.counter();
      const dispatch = useGlobalDispatch();

      useEffect(() => {
        expect(getState().counter).toBe(0);
        dispatch.counter(100);
      }, []);

      return <p data-testid="id">{counter}</p>;
    };

    mount(
      <UseStateContextProvider>
        <Container />
      </UseStateContextProvider>
    );

    expect(getState().counter).toBe(100);
  });

  it('Initial Value', () => {
    const [useGlobalState, , UseStateContextProvider] = createUseStateContexts<
      State
    >({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const initialState = {
      counter: 100,
    };

    const Container = () => {
      const counter = useGlobalState.counter();
      const message = useGlobalState.message();

      expect(counter).toBe(100);
      expect(message).toBe('');

      return null;
    };

    mount(
      <UseStateContextProvider value={initialState as any}>
        <Container />
      </UseStateContextProvider>
    );
  });
});
