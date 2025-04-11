const express = require('express');
const router = express.Router();
const omdbController = require('../controllers/omdbController');

router.get('/search', omdbController.searchOmdb);
router.get('/detail/:id', omdbController.getOmdbDetail);
router.get('/recommended', omdbController.getRecommendedMovies);
module.exports = router;