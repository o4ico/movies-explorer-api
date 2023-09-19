const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');

const { SECRET_KEY } = process.env;
const { ConflictError } = require('../errors/ConflictError');
const { NotFoundError } = require('../errors/NotFoundError');
const { UnauthorizedError } = require('../errors/UnauthorizedError');
const { BadRequestError } = require('../errors/BadRequestError');

/* eslint-disable consistent-return */
module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Переданы некорректные данные при добавлении пользователя'));
  }
  bcrypt.hash(req.body.password, 8)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then((user) => res.status(201).send({
      name: user.name, email: user.email, _id: user.id,
    }))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при добавлении пользователя'));
      } if (err.code === 11000) {
        return next(new ConflictError('Пользователь с этим email уже существует'));
      }
      return next(err);
    });
};

module.exports.patchUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  const { _id } = req.user;
  User.findByIdAndUpdate(req.user._id, { name, email }, {
    new: true, // обработчик then получит на вход обновлённую запись
    runValidators: true, // данные будут валидированы перед изменением
    upsert: false,
  })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError(`Пользователь по указанному ${_id} не найден`));
      }
      if (name === undefined || email === undefined) {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } if (err.code === 11000) {
        return next(new ConflictError('Пользователь с этим email уже существует'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      // аутентификация успешна
      const token = jwt.sign(
        { _id: user._id },
        SECRET_KEY,
        { expiresIn: '7d' },
      );

      return res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      })
        .send({ token, email });
    })

    .catch(() => next(new UnauthorizedError('Ошибка авторизации')));
};

module.exports.userLogout = (req, res, next) => res.clearCookie('jwt', {
  httpOnly: true,
})
  .send({ massage: 'выполнен выход' })

  .catch((err) => next(err));

module.exports.getCurrentUserInfo = (req, res, next) => {
  const { _id } = req.user;
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError(`Пользователь по указанному ${_id} не найден`));
      }

      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные'));
      }
      return next(err);
    });
};
