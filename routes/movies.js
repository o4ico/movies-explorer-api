const router = require('express').Router();
const {
  getMovies, createMovie, deleteSavedMovie
} = require('../controllers/movies');
const { movieIdValidation, movieCreateValidation } = require('../middlewares/validation');

router.get('/', getMovies);

router.post('/', movieCreateValidation, createMovie);

router.delete('/:movieId', movieIdValidation, deleteSavedMovie);

module.exports = router;
