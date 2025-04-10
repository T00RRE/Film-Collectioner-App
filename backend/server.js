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
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

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
  console.error(err.stack);
  res.status(500).send('Coś poszło nie tak!');
});