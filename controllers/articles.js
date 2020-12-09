const Article = require('../models/articles');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.createArticle = (req, res, next) => {
  const { _id } = req.user;
  const {
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
  } = req.body;

  Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner: _id,
  })
    .catch(() => {
      throw new BadRequestError({ message: 'Указаны некорректные данные' });
    })
    .then((article) => res.status(201).send({
      data: {
        keyword: article.keyword,
        title: article.title,
        text: article.text,
        date: article.date,
        source: article.source,
        link: article.link,
        image: article.image,
      },
    }))
    .catch(next);
};

module.exports.getArticles = (req, res, next) => {
  Article.find({})
    .then((article) => res.status(200).send(article))
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params._id).select('+owner')
    .orFail(new NotFoundError({ message: 'Нет статьи с таким id' }))
    .then((article) => {
      if (article.owner.toString() !== req.user._id) {
        throw new ForbiddenError({ message: 'Недостаточно прав для удаления статьи' });
      }
      Article.findByIdAndRemove(req.params._id)
        .then((articleData) => res.send({ data: articleData }))
        .catch(next);
    })
    .catch(next);
};
