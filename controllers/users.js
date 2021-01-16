const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;
  if (!name || !email || !password) {
    throw new BadRequestError({ message: 'Не переданы данные' });
  }
  User.findOne({ email })
    .then((admin) => {
      if (admin) {
        throw new ConflictError({ message: 'Пользователь с таким email уже существует' });
      }
      bcrypt.hash(password, 10)
        .then((hash) => User.create({
          name,
          email: req.body.email,
          password: hash,
        }))
        .then((user) => {
          res.status(201).send({
            data: {
              name: user.name,
              email: user.email,
            },
          });
        })
        .catch(next);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .populate('owner')
    .orFail(new NotFoundError('Нет пользователя с таким id'))
    .then((user) => res.send({ data: { email: user.email, name: user.name } }))
    .catch(next);
};
