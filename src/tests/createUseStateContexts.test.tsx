import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { createUseStateContexts } from '../createUseStateContexts';

const sel = (id: string): string => `[data-testid="${id}"]`;
const [UseStateContexts, UseStateContextProviders] = createUseStateContexts({
  string: 'string',
  user: {
    id: '',
    name: '',
    age: 0,
  },
});

describe('createUseRedcuerContexts', () => {
  it('InitialState', () => {
    const Container = () => {
      const string = UseStateContexts.string.state();
      return (
        <>
          <p data-testid="string">{string}</p>
        </>
      );
    };

    const wrapper = mount(
      <UseStateContextProviders>
        <Container />
      </UseStateContextProviders>
    );

    expect(wrapper.find(sel('string')).text()).toBe('string');
  });

  it('Dispatch', () => {
    const Container = () => {
      const string = UseStateContexts.string.state();
      const dispatch = UseStateContexts.string.dispatch();

      useEffect(() => {
        dispatch('dispatched-string');
      }, []);
      return (
        <>
          <p data-testid="string">{string}</p>
        </>
      );
    };

    const wrapper = mount(
      <UseStateContextProviders>
        <Container />
      </UseStateContextProviders>
    );

    expect(wrapper.find(sel('string')).text()).toBe('dispatched-string');
  });

  it('UseSelector', () => {
    const Container = () => {
      const id = UseStateContexts.user.state((user) => user.id);
      const dispatch = UseStateContexts.user.dispatch();

      useEffect(() => {
        dispatch((user) => ({
          ...user,
          id: 'id',
          name: '',
          age: 0,
        }));
      }, []);
      return (
        <>
          <p data-testid="id">{id}</p>
        </>
      );
    };

    const wrapper = mount(
      <UseStateContextProviders>
        <Container />
      </UseStateContextProviders>
    );

    expect(wrapper.find(sel('id')).text()).toBe('id');
  });
});
