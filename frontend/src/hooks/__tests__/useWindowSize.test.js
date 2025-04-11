import React from 'react';
import { render } from '@testing-library/react';
import useWindowSize from '../useWindowSize';

function TestHook({ callback }) {
  callback();
  return null;
}

function renderHook(callback) {
  let results;
  render(<TestHook callback={() => { results = callback(); }} />);
  return { result: { current: results } };
}

describe('useWindowSize Hook', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  const originalAddEventListener = window.addEventListener;
  
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1200 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 800 });
    
    window.addEventListener = jest.fn();
  });
  
  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: originalInnerWidth });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: originalInnerHeight });
    window.addEventListener = originalAddEventListener;
    
    jest.clearAllMocks();
  });
  
  test('should return initial window dimensions', () => {
    const { result } = renderHook(() => useWindowSize());
    a
    expect(result.current).toEqual({ width: 1200, height: 800 });
  });
  
});