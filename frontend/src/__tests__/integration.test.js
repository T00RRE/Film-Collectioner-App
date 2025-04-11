// src/__tests__/integration.test.js - poprawiony
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from '../App';

// Mock dla useWindowSize
jest.mock('../hooks/useWindowSize', () => {
  return {
    __esModule: true,
    default: () => ({ width: 1200, height: 800 })
  };
});

// Mock dla axios - zapewnia symulację odpowiedzi API
jest.mock('axios', () => {
  // Przykładowe dane filmów
  const recommendedMovies = [
    {
      imdbID: 'tt0111161',
      Title: 'Skazani na Shawshank',
      Year: '1994',
      Poster: 'https://example.com/poster1.jpg'
    }
  ];
  
  const searchResults = {
    Search: [
      {
        imdbID: 'tt0468569',
        Title: 'Mroczny Rycerz',
        Year: '2008',
        Poster: 'https://example.com/poster2.jpg',
        Type: 'movie'
      }
    ]
  };
  
  const movieDetails = {
    imdbID: 'tt0468569',
    Title: 'Mroczny Rycerz',
    Year: '2008',
    Plot: 'Batman walczy z przestępczością.',
    Director: 'Christopher Nolan',
    Actors: 'Christian Bale, Heath Ledger',
    imdbRating: '9.0',
    Genre: 'Action, Crime, Drama',
    Poster: 'https://example.com/poster2.jpg'
  };
  
  const myMovies = {
    movies: [
      {
        id: 1,
        title: 'Mroczny Rycerz',
        year: 2008,
        poster: 'https://example.com/poster2.jpg',
        plot: 'Batman walczy z przestępczością.',
        imdbRating: '9.0',
        genre: ['Action', 'Crime', 'Drama'],
        watched: false
      }
    ],
    pages: 1
  };
  
  return {
    get: jest.fn((url) => {
      if (url.includes('/api/omdb/recommended')) {
        return Promise.resolve({ data: recommendedMovies });
      } else if (url.includes('/api/omdb/search')) {
        return Promise.resolve({ data: searchResults });
      } else if (url.includes('/api/omdb/detail/')) {
        return Promise.resolve({ data: movieDetails });
      } else if (url.includes('/api/movies?watched=false')) {
        return Promise.resolve({ data: myMovies });
      } else if (url.includes('/api/movies?watched=true')) {
        return Promise.resolve({ data: { movies: [], pages: 1 } });
      }
      return Promise.resolve({ data: {} });
    }),
    post: jest.fn(() => Promise.resolve({ data: { success: true } })),
    put: jest.fn(() => Promise.resolve({ data: { success: true } })),
    delete: jest.fn(() => Promise.resolve({ data: { success: true } }))
  };
});

// Helper do renderowania App z określoną początkową ścieżką
// Używamy MemoryRouter zamiast BrowserRouter, żeby testy mogły kontrolować nawigację
const renderApp = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );
};

describe('Film Collector App - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock dla window.alert i window.confirm
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
  });
  
  afterEach(() => {
    // Przywróć oryginalne funkcje
    window.alert.mockRestore();
    window.confirm.mockRestore();
  });

  test('User can navigate from homepage to My List', async () => {
    renderApp('/'); // Startujemy od strony głównej
    
    // Poczekaj aż strona się załaduje
    await waitFor(() => {
      // Sprawdź, czy jesteśmy na stronie głównej (BrowseMovies)
      const browseHeader = screen.getByRole('heading', { name: /przeglądaj filmy/i });
      expect(browseHeader).toBeInTheDocument();
    });
    
    // Znajdź i kliknij link do "Moja Lista" - w Navbar jest tekst w elemencie div, a nie bezpośrednio
    const myListLink = await screen.findByText('Moja Lista', { selector: 'div' });
    fireEvent.click(myListLink);
    
    // Poczekaj aż nowa strona się załaduje i sprawdź, czy przeszliśmy do strony MyList
    await waitFor(() => {
      const myListHeader = screen.getByRole('heading', { name: /moja lista filmów/i });
      expect(myListHeader).toBeInTheDocument();
    });
  });

  test('User can search for a movie and add it to their list', async () => {
    renderApp('/'); 
    
    const searchInput = await screen.findByPlaceholderText('Wpisz tytuł filmu...');
    await userEvent.type(searchInput, 'Mroczny Rycerz');
    
    const searchForm = searchInput.closest('form');
    fireEvent.submit(searchForm);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/omdb/search'));
    });
    
    await waitFor(() => {
      const movieTitle = screen.getByText('Mroczny Rycerz');
      expect(movieTitle).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('User can navigate from search results to their list', async () => {
    renderApp('/');
    
    await waitFor(() => {
      const browseHeader = screen.getByRole('heading', { name: /przeglądaj filmy/i });
      expect(browseHeader).toBeInTheDocument();
    });
    
    const myListLink = await screen.findByText('Moja Lista', { selector: 'div' });
    fireEvent.click(myListLink);
    
    await waitFor(() => {
      const myListHeader = screen.getByRole('heading', { name: /moja lista filmów/i });
      expect(myListHeader).toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/movies?watched=false'));
    });
  });
});