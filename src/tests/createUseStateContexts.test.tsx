import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { createUseStateContexts } from '../createUseStateContexts';
import { testId } from './utils';

const [UseStateContexts, UseStateContextProviders] = createUseStateContexts({
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
      const message = UseStateContexts.message.state();
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
      const message = UseStateContexts.message.state();
      const dispatch = UseStateContexts.message.dispatch();

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
      const id = UseStateContexts.user.state((user) => user.id);
      const nullable = UseStateContexts.user.state(() => null);
      const string = UseStateContexts.user.state(() => '');
      const dispatch = UseStateContexts.user.dispatch();

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
