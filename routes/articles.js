const article = require('express').Router();
const { validateArticle, validateId } = require('../middlewares/requestValidation');

const {
  createArticle,
  getArticles,
  deleteArticle,
} = require('../controllers/articles');

article.post('/', validateArticle, createArticle);
article.get('/', getArticles);
article.delete('/:_id', validateId, deleteArticle);

module.exports = article;
