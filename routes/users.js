const users = require('express').Router();
const {
  getCurrentUser,
} = require('../controllers/users');

users.get('/me', getCurrentUser);

module.exports = users;
