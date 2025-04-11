import axios from 'axios';

const DEBUG = true;

const API_URL = process.env.REACT_APP_API_URL || 'https://film-collectioner-backend.onrender.com/api';

if (DEBUG) {
  console.log('Using API URL:', API_URL);
}

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

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// API do filmów
export const moviesApi = {
  getMovies: (page = 1, limit = 10, sort = '-createdAt', filters = {}) => {
    const queryParams = new URLSearchParams({
      page,
      limit,
      sort,
      ...filters,
    });
    return api.get(`/movies?${queryParams}`);
  },
  
  getMovie: (id) => api.get(`/movies/${id}`),
  
  addMovie: (movieData) => api.post('/movies', movieData),
  
  updateMovie: (id, movieData) => api.put(`/movies/${id}`, movieData),
  
  deleteMovie: (id) => api.delete(`/movies/${id}`),
  
  searchMovies: (query) => api.get(`/movies/search?q=${query}`),
};

// API do OMDB
export const omdbApi = {
  searchMovies: (title) => api.get(`/omdb/search?title=${title}`),
  
  getMovieDetails: (imdbId) => api.get(`/omdb/detail/${imdbId}`),
};

export default api;