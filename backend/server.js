const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const movieRoutes = require('./routes/movieRoutes');
const omdbRoutes = require('./routes/omdbRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://film-collectioner-app-1.onrender.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json({ limit: '10mb', strict: false }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/movies', movieRoutes);
app.use('/omdb', omdbRoutes);

app.get('/', (req, res) => {
  res.send('API Kolekcjonera Filmów działa!');
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Połączono z bazą danych PostgreSQL');
    return sequelize.sync({ alter: true });
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

app.use((err, req, res, next) => {
  console.error('Błąd serwera:', err);
  
  if (err instanceof SyntaxError) {
    return res.status(400).json({ message: 'Błąd parsowania' });
  }
  
  const errorResponse = {
    message: 'Coś poszło nie tak!',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack
    } : {}
  };
  
  res.status(500).json(errorResponse);
});