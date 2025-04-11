const axios = require('axios');

// Wyszukiwanie filmów w OMDB
exports.searchOmdb = async (req, res) => {
  try {
    const { title } = req.query;
    
    if (!title) {
      return res.status(400).json({ message: 'Parametr title jest wymagany' });
    }
    
    const response = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${title}`);
    
    if (response.data.Response === 'False') {
      return res.status(404).json({ message: response.data.Error });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Pobieranie szczegółów filmu z OMDB
exports.getOmdbDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Parametr id jest wymagany' });
    }
    
    const response = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${id}`);
    
    if (response.data.Response === 'False') {
      return res.status(404).json({ message: response.data.Error });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};
// controllers/omdbController.js

// Pobieranie rekomendowanych filmów z OMDB
exports.getRecommendedMovies = async (req, res) => {
  try {
    // Ustaw nagłówki JSON dla odpowiedzi
    res.setHeader('Content-Type', 'application/json');
    
    const limit = parseInt(req.query.limit) || 50;
    
    // Lista popularnych filmów (możesz dostosować tę listę)
    const popularMovies = [
      'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 'Pulp Fiction',
      'Fight Club', 'Forrest Gump', 'Inception', 'The Matrix', 'Goodfellas',
      'The Lord of the Rings', 'Star Wars', 'The Avengers', 'Interstellar',
      'Parasite', 'Joker', '1917', 'The Green Mile', 'Gladiator',
      'Whiplash', 'The Departed', 'The Prestige', 'Eternal Sunshine of the Spotless Mind',
      'Memento', 'The Social Network', 'Mad Max: Fury Road', 'Inglourious Basterds',
      'Saving Private Ryan', 'Back to the Future', 'The Silence of the Lambs',
      'The Lion King', 'Titanic', 'Jurassic Park', 'Terminator 2', 'The Sixth Sense',
      'The Truman Show', 'The Grand Budapest Hotel', 'The Big Lebowski', 'No Country for Old Men',
      'There Will Be Blood', 'Black Swan', 'The Revenant', 'Django Unchained',
      'The Wolf of Wall Street', 'La La Land', 'The Shape of Water', 'Get Out',
      'Her', 'Gone Girl', 'Blade Runner 2049', 'Arrival', 'Nomadland'
    ];
    
    // Wybierz losowo limit filmów
    const shuffled = [...popularMovies].sort(() => 0.5 - Math.random());
    const selectedMovies = shuffled.slice(0, limit);
    
   // Pobierz dane dla każdego filmu
    // Dla bezpieczeństwa zastosujmy limitowanie równoległych zapytań
    const recommendedMovies = [];
    
    try {
      for (const title of selectedMovies) {
        try {
          const response = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${encodeURIComponent(title)}`);
          if (response.data && response.data.Response === 'True') {
            recommendedMovies.push(response.data);
          }
        } catch (movieError) {
          console.error(`Błąd pobierania danych dla filmu ${title}:`, movieError.message);
          // Kontynuuj z następnym filmem
        }
        
        // Dodaj małe opóźnienie, aby nie przekroczyć limitu zapytań API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Sprawdź czy udało się pobrać jakiekolwiek filmy
      if (recommendedMovies.length === 0) {
        return res.status(404).json({ message: 'Nie udało się pobrać żadnych rekomendowanych filmów' });
      }
      
      // Upewnij się, że zwracamy poprawną odpowiedź JSON
      res.set('Content-Type', 'application/json');
      return res.send(JSON.stringify(recommendedMovies));
    } catch (error) {
      console.error('Błąd w pętli pobierania filmów:', error);
      return res.status(500).json({ message: 'Wystąpił błąd podczas pobierania rekomendowanych filmów' });
    }
  } catch (error) {
    console.error('Błąd pobierania polecanych filmów:', error);
    res.status(500).json({ message: 'Błąd serwera przy pobieraniu polecanych filmów' });
  }
};