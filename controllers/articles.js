const Article = require('../models/articles');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, description, publishedAt, source, url, urlToImage,
  } = req.body;
  const owner = req.user._id;

  Article.create({
    keyword, title, description, publishedAt, source, url, urlToImage, owner,
  })
    .catch(() => {
      throw new BadRequestError({ message: 'Указаны некорректные данные' });
    })
    .then((article) => res.status(201).send({
      keyword: article.keyword,
      title: article.title,
      description: article.description,
      publishedAt: article.publishedAt,
      source: article.source,
      url: article.url,
      urlToImage: article.urlToImage,
      _id: article._id,
    }))
    .catch(next);
};
module.exports.getArticles = (req, res, next) => {
  const owner = req.user._id;
  Article.find({ owner })
    .populate('user')
    .then((articles) => res.send({ data: articles }))
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  const owner = req.user._id;
  const id = req.params._id;
  Article.findById(id, {
    keyword: 1,
    title: 1,
    description: 1,
    publishedAt: 1,
    source: 1,
    url: 1,
    urlToImage: 1,
    owner: 1,
  })
    .catch(() => {
      throw new NotFoundError({ message: 'Нет статьи с таким id' });
    })
    .then((article) => {
      if (article.owner.toString() !== owner) {
        throw new ForbiddenError({ message: 'Недостаточно прав для удаления статьи' });
      }
      Article.findByIdAndDelete(id)
        .then((deletedArticle) => {
          res.send({ data: deletedArticle });
        })
        .catch(next);
    })
    .catch(next);
};
