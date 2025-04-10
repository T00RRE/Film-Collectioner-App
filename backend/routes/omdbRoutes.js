const express = require('express');
const router = express.Router();
const omdbController = require('../controllers/omdbController');

// Trasy dla OMDB API
router.get('/search', omdbController.searchOmdb);
router.get('/detail/:id', omdbController.getOmdbDetail);
router.get('/recommended', omdbController.getRecommendedMovies);
module.exports = router;