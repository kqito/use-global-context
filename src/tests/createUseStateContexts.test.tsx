import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { createUseStateContexts } from '../createUseStateContexts';
import { testId } from './utils';

const [store, UseStateContextProviders] = createUseStateContexts({
  message: '',
  user: {
    id: '',
    name: '',
    age: 0,
  },
});

describe('createUseStateContexts', () => {
  it('InitialState', () => {
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
});
