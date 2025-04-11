import { render, screen } from '@testing-library/react';
import App from './App';

test('renders film collector app name', () => {
  render(<App />);
  const filmText = screen.getByText(/film/i, { selector: 'div[style*="left: 30px"]' });
  const collectorText = screen.getByText(/collector/i);
  expect(filmText).toBeInTheDocument();
  expect(collectorText).toBeInTheDocument();
});

test('renders browse movies header', () => {
  render(<App />);
  const browseMoviesHeader = screen.getByRole('heading', { 
    name: /przeglądaj filmy/i,
    level: 2 
  });
  expect(browseMoviesHeader).toBeInTheDocument();
});

test('renders search input', () => {
  render(<App />);
  // Szukamy pola wyszukiwania
  const searchInput = screen.getByPlaceholderText('Wpisz tytuł filmu...');
  expect(searchInput).toBeInTheDocument();
});