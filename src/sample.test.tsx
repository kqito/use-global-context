import React from 'react';
import { shallow } from 'enzyme';

describe('test', () => {
  it('shallow', () => {
    const wrapper = shallow(<p>hi</p>);
    expect(wrapper);
  });
});
