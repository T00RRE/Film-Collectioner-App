const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const movieRoutes = require('./routes/movieRoutes');
const omdbRoutes = require('./routes/omdbRoutes');

// Konfiguracja zmiennych środowiskowych
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Obsługa błędów parsowania JSON
app.use(express.json({ limit: '10mb', strict: false }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trasy (routes)
app.use('/api/movies', movieRoutes);
app.use('/api/omdb', omdbRoutes);

app.get('/', (req, res) => {
  res.send('API Kolekcjonera Filmów działa!');
});

// Połączenie z bazą danych i uruchomienie serwera
sequelize.authenticate()
  .then(() => {
    console.log('✅ Połączono z bazą danych PostgreSQL');
    // Synchronizacja modeli z bazą danych
    return sequelize.sync({ alter: true }); // alter: true pozwala na aktualizację tabel
  })
  .then(() => {
    console.log('✅ Modele zsynchronizowane z bazą danych');
    app.listen(PORT, () => {
      console.log(`Serwer działa na porcie: ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Błąd połączenia z bazą danych:', err);
  });

// Obsługa błędów
app.use((err, req, res, next) => {
  console.error('Błąd serwera:', err);
  
  // Sprawdź czy jest to błąd XML
  if (err instanceof SyntaxError) {
    return res.status(400).json({ message: 'Błąd parsowania' });
  }
  
  // Zwracamy szczegóły błędu w środowisku deweloperskim
  const errorResponse = {
    message: 'Coś poszło nie tak!',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack
    } : {}
  };
  
  res.status(500).json(errorResponse);
});