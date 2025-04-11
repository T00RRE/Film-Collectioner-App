
import '@testing-library/jest-dom';


jest.mock('./hooks/useWindowSize', () => {
  return {
    __esModule: true,
    default: () => ({ width: 1200, height: 800 })
  };
});
