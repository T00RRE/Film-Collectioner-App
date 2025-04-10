// src/pages/__tests__/MyList.test.js - poprawiona wersja
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MyList from '../MyList';

// Mock dla useWindowSize
jest.mock('../../hooks/useWindowSize', () => {
  return {
    __esModule: true,
    default: () => ({ width: 1200, height: 800 })
  };
});

// Mock dla axios - uproszczony do tylko podstawowych testów
jest.mock('axios', () => {
  return {
    get: jest.fn((url) => {
      if (url.includes('api/movies?watched=false')) {
        return Promise.resolve({ 
          data: {
            movies: [],
            pages: 1
          }
        });
      } else if (url.includes('api/movies?watched=true')) {
        return Promise.resolve({ 
          data: {
            movies: [],
            pages: 1
          }
        });
      }
      return Promise.resolve({ data: {} });
    }),
    put: jest.fn().mockResolvedValue({ data: { success: true } }),
    delete: jest.fn().mockResolvedValue({ data: { success: true } })
  };
});

// Proste testy dla MyList
describe('MyList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main heading', async () => {
    render(<MyList />);
    
    const heading = await screen.findByText('Moja Lista Filmów');
    expect(heading).toBeInTheDocument();
  });

  test('renders tab buttons', async () => {
    render(<MyList />);
    
    const toWatchButton = await screen.findByText('Do obejrzenia');
    const watchedButton = await screen.findByText('Obejrzane');
    
    expect(toWatchButton).toBeInTheDocument();
    expect(watchedButton).toBeInTheDocument();
  });

  test('fetches movies on initial load', async () => {
    render(<MyList />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('api/movies?watched=false'));
    });
  });

  test('switches tabs when "Obejrzane" tab is clicked', async () => {
    render(<MyList />);
    
    // Znajdź i kliknij zakładkę "Obejrzane"
    const watchedButton = await screen.findByText('Obejrzane');
    fireEvent.click(watchedButton);
    
    // Sprawdź, czy wykonano nowe żądanie API
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('api/movies?watched=true'));
    });
  });
});