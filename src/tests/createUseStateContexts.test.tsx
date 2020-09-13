import React, { useContext, useEffect } from 'react';
import { mount } from 'enzyme';
import { createUseStateContexts } from '../createUseStateContexts';

const sel = (id: string): string => `[data-testid="${id}"]`;
const [UseStateContextProviders, UseStateContexts] = createUseStateContexts({
  string: 'string',
});

describe('createUseRedcuerContexts', () => {
  it('InitialState', () => {
    const Container = () => {
      const string = useContext(UseStateContexts.string.state);
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
      const string = useContext(UseStateContexts.string.state);
      const dispatch = useContext(UseStateContexts.string.dispatch);
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
});
