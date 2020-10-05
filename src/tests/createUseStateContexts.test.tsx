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
  it('InitialState', () => {
    const [store, UseStateContextProviders] = createUseStateContexts<State>({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const Container = () => {
      const message = store.message.state();
      return <p data-testid="message">{message}</p>;
    };

    const wrapper = mount(
      <UseStateContextProviders>
        <Container />
      </UseStateContextProviders>
    );

    expect(wrapper.find(testId('message')).text()).toBe('');
  });

  it('Dispatch', () => {
    const [store, UseStateContextProviders] = createUseStateContexts<State>({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const Container = () => {
      const message = store.message.state();
      const dispatch = store.message.dispatch();

      useEffect(() => {
        dispatch('message');
      }, []);
      return <p data-testid="message">{message}</p>;
    };

    const wrapper = mount(
      <UseStateContextProviders>
        <Container />
      </UseStateContextProviders>
    );

    expect(wrapper.find(testId('message')).text()).toBe('message');
  });

  it('UseSelector', () => {
    const [store, UseStateContextProviders] = createUseStateContexts<State>({
      counter: 0,
      message: '',
      user: {
        id: '',
        name: '',
        age: 0,
      },
    });

    const Container = () => {
      const id = store.user.state((user) => user.id);
      const nullable = store.user.state(() => null);
      const string = store.user.state(() => '');
      const dispatch = store.user.dispatch();

      expect(nullable).toBe(null);
      expect(string).toBe('');

      useEffect(() => {
        dispatch((user) => ({
          ...user,
          id: 'id',
        }));
      }, []);

      return <p data-testid="id">{id}</p>;
    };

    const wrapper = mount(
      <UseStateContextProviders>
        <Container />
      </UseStateContextProviders>
    );

    expect(wrapper.find(testId('id')).text()).toBe('id');
  });

  it('CurrentState', () => {
    const [
      store,
      UseStateContextProviders,
      currentState,
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
      const counter = store.counter.state();
      const counterDispatch = store.counter.dispatch();

      useEffect(() => {
        expect(currentState.counter).toBe(0);
        counterDispatch(100);
      }, []);

      return <p data-testid="id">{counter}</p>;
    };

    mount(
      <UseStateContextProviders>
        <Container />
      </UseStateContextProviders>
    );

    expect(currentState.counter).toBe(100);
  });

  it('InitialState', () => {
    const [store, UseStateContextProviders] = createUseStateContexts<State>({
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
      const counter = store.counter.state();
      const message = store.message.state();

      expect(counter).toBe(100);
      expect(message).toBe('');

      return null;
    };

    mount(
      <UseStateContextProviders value={initialState as any}>
        <Container />
      </UseStateContextProviders>
    );
  });
});
