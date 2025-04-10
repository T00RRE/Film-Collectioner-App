// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// src/setupTests.js
import '@testing-library/jest-dom';

// Mock dla useWindowSize
jest.mock('./hooks/useWindowSize', () => {
  return {
    __esModule: true,
    default: () => ({ width: 1200, height: 800 })
  };
});

// Tutaj możesz dodać inne globalne mocki