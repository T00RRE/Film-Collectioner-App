import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { moviesApi } from '../services/api';

const initialState = {
  movies: [],
  movie: null,
  loading: false,
  error: null,
  page: 1,
  pages: 0,
  total: 0,
};

const movieReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        movies: action.payload.movies,
        page: action.payload.page,
        pages: action.payload.pages,
        total: action.payload.total,
      };
    case 'FETCH_MOVIE':
      return { ...state, loading: false, movie: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_MOVIE':
      return { ...state, movies: [...state.movies, action.payload] };
    case 'UPDATE_MOVIE':
      return {
        ...state,
        movies: state.movies.map((movie) =>
          movie._id === action.payload._id ? action.payload : movie
        ),
        movie: action.payload,
      };
    case 'DELETE_MOVIE':
      return {
        ...state,
        movies: state.movies.filter((movie) => movie._id !== action.payload),
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  const fetchMovies = async (page = 1, limit = 10, sort = '-createdAt', filters = {}) => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await moviesApi.getMovies(page, limit, sort, filters);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_FAIL', payload: error.response?.data?.message || 'Błąd pobierania filmów' });
    }
  };

  const fetchMovie = async (id) => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await moviesApi.getMovie(id);
      dispatch({ type: 'FETCH_MOVIE', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_FAIL', payload: error.response?.data?.message || 'Błąd pobierania filmu' });
    }
  };

  const addMovie = async (movieData) => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await moviesApi.addMovie(movieData);
      dispatch({ type: 'ADD_MOVIE', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'FETCH_FAIL', payload: error.response?.data?.message || 'Błąd dodawania filmu' });
      throw error;
    }
  };

  const updateMovie = async (id, movieData) => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await moviesApi.updateMovie(id, movieData);
      dispatch({ type: 'UPDATE_MOVIE', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'FETCH_FAIL', payload: error.response?.data?.message || 'Błąd aktualizacji filmu' });
      throw error;
    }
  };

  const deleteMovie = async (id) => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      await moviesApi.deleteMovie(id);
      dispatch({ type: 'DELETE_MOVIE', payload: id });
    } catch (error) {
      dispatch({ type: 'FETCH_FAIL', payload: error.response?.data?.message || 'Błąd usuwania filmu' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <MovieContext.Provider
      value={{
        ...state,
        fetchMovies,
        fetchMovie,
        addMovie,
        updateMovie,
        deleteMovie,
        clearError,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovieContext = () => {
  return useContext(MovieContext);
};