import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { createUseStateContext } from '../createUseStateContext';
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
    const [useGlobalState, , UseStateContextProvider] = createUseStateContext<
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
      const message = useGlobalState((state) => state.message);
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
    const [useGlobalState, , UseStateContextProvider] = createUseStateContext<
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
      const counter = useGlobalState((state) => state.counter);
      const message = useGlobalState((state) => state.message);

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
