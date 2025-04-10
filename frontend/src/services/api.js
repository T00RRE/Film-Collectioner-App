import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Utworzenie instancji axios z bazowym URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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