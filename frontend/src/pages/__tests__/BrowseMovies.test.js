// src/pages/__tests__/BrowseMovies.test.js - poprawiona wersja
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrowseMovies from '../BrowseMovies';

// Mock dla useWindowSize
jest.mock('../../hooks/useWindowSize', () => {
  return {
    __esModule: true,
    default: () => ({ width: 1200, height: 800 })
  };
});

// Mock dla axios
jest.mock('axios', () => {
  return {
    get: jest.fn((url) => {
      // Mockuj dokładną odpowiedź dla każdego URL
      if (url === 'http://localhost:5000/api/omdb/recommended?limit=10') {
        return Promise.resolve({ 
          data: [
            {
              imdbID: 'tt0111161',
              Title: 'Skazani na Shawshank',
              Year: '1994',
              Poster: 'https://example.com/poster1.jpg'
            }
          ]
        });
      } else if (url === `http://localhost:5000/api/omdb/search?title=${encodeURIComponent('Mroczny Rycerz')}`) {
        return Promise.resolve({
          data: {
            Search: [
              {
                imdbID: 'tt0468569',
                Title: 'Mroczny Rycerz',
                Year: '2008',
                Poster: 'https://example.com/poster2.jpg',
                Type: 'movie'
              }
            ]
          }
        });
      } else if (url.includes('/api/omdb/detail/')) {
        return Promise.resolve({
          data: {
            imdbID: 'tt0468569',
            Title: 'Mroczny Rycerz',
            Year: '2008',
            Plot: 'Batman walczy z przestępczością w Gotham City.',
            Director: 'Christopher Nolan',
            Actors: 'Christian Bale, Heath Ledger',
            imdbRating: '9.0',
            Genre: 'Action, Crime, Drama',
            Poster: 'https://example.com/poster2.jpg'
          }
        });
      }
      // Domyślna odpowiedź dla nieznanych URL
      return Promise.resolve({ data: {} });
    }),
    post: jest.fn(() => Promise.resolve({ data: { success: true } }))
  };
});

// Proste testy dla BrowseMovies
describe('BrowseMovies Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders header and search input', async () => {
    render(<BrowseMovies />);
    
    const header = await screen.findByText('Przeglądaj Filmy');
    expect(header).toBeInTheDocument();
    
    const searchInput = await screen.findByPlaceholderText('Wpisz tytuł filmu...');
    expect(searchInput).toBeInTheDocument();
  });
  
  test('shows recommended movies section', async () => {
    render(<BrowseMovies />);
    
    const recommendedHeader = await screen.findByText('Polecane Filmy');
    expect(recommendedHeader).toBeInTheDocument();
  });
  
  test('can enter search text', async () => {
    render(<BrowseMovies />);
    
    const searchInput = await screen.findByPlaceholderText('Wpisz tytuł filmu...');
    await userEvent.type(searchInput, 'Mroczny Rycerz');
    
    expect(searchInput.value).toBe('Mroczny Rycerz');
  });
});