import axios from 'axios';

// Sprawdź czy wiadomości diagnostyczne są włączone
const DEBUG = true;

// Ustaw URL API - sprawdź obie możliwości
const API_URL = process.env.REACT_APP_API_URL || 'https://film-collectioner-backend.onrender.com/api';

// Pokaż informacje diagnostyczne
if (DEBUG) {
  console.log('Using API URL:', API_URL);
}

// Sprawdzanie URL API przy starcie aplikacji
if (DEBUG) {
  (async () => {
    try {
      console.log('Testowanie połączenia z API...');
      const testEndpoint = `${API_URL.replace(/\/api$/, '')}`;
      console.log('Testuję endpoint:', testEndpoint);
      
      const response = await fetch(testEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Status połączenia:', response.status, response.ok ? 'OK' : 'Błąd');
      if (response.ok) {
        const text = await response.text();
        console.log('Odpowiedź API:', text.substring(0, 100) + '...');
      }
    } catch (error) {
      console.error('Błąd połączenia z API:', error.message);
    }
  })();
}

// Utworzenie instancji axios z bazowym URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false  // Zmień na true jeśli potrzebujesz cookies
});

// API do filmów
export const moviesApi = {
  // Pobieranie filmów z paginacją, sortowaniem i filtrowaniem
  getMovies: (page = 1, limit = 10, sort = '-createdAt', filters = {}) => {
    const queryParams = new URLSearchParams({
      page,
      limit,
      sort,
      ...filters,
    });
    return api.get(`/movies?${queryParams}`);
  },
  
  // Pobieranie szczegółów filmu
  getMovie: (id) => api.get(`/movies/${id}`),
  
  // Dodawanie nowego filmu
  addMovie: (movieData) => api.post('/movies', movieData),
  
  // Aktualizacja filmu
  updateMovie: (id, movieData) => api.put(`/movies/${id}`, movieData),
  
  // Usuwanie filmu
  deleteMovie: (id) => api.delete(`/movies/${id}`),
  
  // Wyszukiwanie filmów w kolekcji
  searchMovies: (query) => api.get(`/movies/search?q=${query}`),
};

// API do OMDB
export const omdbApi = {
  // Wyszukiwanie filmów w OMDB
  searchMovies: (title) => api.get(`/omdb/search?title=${title}`),
  
  // Pobieranie szczegółów filmu z OMDB
  getMovieDetails: (imdbId) => api.get(`/omdb/detail/${imdbId}`),
};

export default api;