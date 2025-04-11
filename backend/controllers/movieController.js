const { Movie } = require('../models');
const { Op } = require('sequelize');

// Pobieranie wszystkich filmów
exports.getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const order = req.query.sort ? [[req.query.sort.replace('-', ''), req.query.sort.startsWith('-') ? 'DESC' : 'ASC']] : [['createdAt', 'DESC']];
    
    const whereClause = {};
    
    // Filtrowanie
    if (req.query.watched) {
      whereClause.watched = req.query.watched === 'true';
    }
    
    if (req.query.favorite) {
      whereClause.favorite = req.query.favorite === 'true';
    }
    
    // Wyszukiwanie po tytule
    if (req.query.title) {
      whereClause.title = { [Op.iLike]: `%${req.query.title}%` };
    }
    
    const { count, rows: movies } = await Movie.findAndCountAll({
      where: whereClause,
      order,
      limit,
      offset
    });
    
    res.json({
      page,
      pages: Math.ceil(count / limit),
      total: count,
      movies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Pobieranie szczegółów filmu
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Film nie został znaleziony' });
    }
    
    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Dodawanie nowego filmu
exports.createMovie = async (req, res) => {
  try {
    console.log('📥 Otrzymano żądanie dodania filmu:', JSON.stringify(req.body));
    
    const existingMovie = await Movie.findOne({ where: { imdbId: req.body.imdbId } });
    
    if (existingMovie) {
      return res.status(400).json({ message: 'Film o podanym ID już istnieje w kolekcji' });
    }
    
    const movieData = {
      ...req.body,
      actors: Array.isArray(req.body.actors) ? req.body.actors : [],
      genre: Array.isArray(req.body.genre) ? req.body.genre : []
    };
    
    const movie = await Movie.create(movieData);
    console.log('✅ Film zapisany pomyślnie:', movie.title);
    
    res.status(201).json(movie);
  } catch (error) {
    console.error('❌ Błąd przy dodawaniu filmu:', error);
    res.status(500).json({ message: 'Błąd serwera', error: error.message });
  }
};

// Aktualizacja filmu
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Film nie został znaleziony' });
    }
    
    await movie.update(req.body);
    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Usuwanie filmu
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Film nie został znaleziony' });
    }
    
    await movie.destroy();
    res.json({ message: 'Film został usunięty' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Wyszukiwanie filmów (lokalne)
exports.searchMovies = async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ message: 'Brak parametru wyszukiwania' });
    }
    
    const movies = await Movie.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { director: { [Op.iLike]: `%${query}%` } }
        ]
      },
      limit: 20
    });
    
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};