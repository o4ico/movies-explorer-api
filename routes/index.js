const router = require('express').Router();
const auth = require('../middlewares/auth');
const { login, createUser, userLogout } = require('../controllers/users');
const { loginValidation, createUserValidation } = require('../middlewares/validation');
const { NotFoundError } = require('../errors/NotFoundError');

router.use('/movies', auth, require('./movies'));

router.use('/users', auth, require('./users'));

router.post('/signin', loginValidation, login);
router.post('/signup', createUserValidation, createUser);
router.post('/signout', userLogout);

router.use('*', auth, (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

module.exports = router;
