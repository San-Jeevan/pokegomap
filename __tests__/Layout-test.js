jest.unmock('../src/components/Layout');

import React from 'react';
import ReactDOM from 'react-dom';
import { createRenderer } from 'react-addons-test-utils';
import Layout from '../src/components/Layout';

describe('Basic Layout tests - hello world', () => {

  it('contains Hello World string', () => {
    const shallowRenderer = createRenderer();
    shallowRenderer.render(<Layout />);
    let result = shallowRenderer.getRenderOutput();
    expect(result.type).toBe('div');
    expect(result.props.children).toEqual(<h1>Hello World</h1>);
  });
});
