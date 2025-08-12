const Article = require("../models/Article");

const createArticle = async (req, res) => {
  try {
    const { title, content, image, tags } = req.body;

    const article = new Article({
      title,
      content,
      image,
      tags,
      author: req.user.id,
    });

    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate("author", "username role");
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate(
      "author",
      "username role"
    );
    if (!article)
      return res.status(404).json({ message: "Article non trouvé" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article)
      return res.status(404).json({ message: "Article non trouvé" });

    if (
      req.user.role === "Redacteur" &&
      article.author.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    article.title = req.body.title ?? article.title;
    article.content = req.body.content ?? article.content;
    article.image = req.body.image ?? article.image;
    article.tags = req.body.tags ?? article.tags;

    await article.save();
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Accès interdit" });
    }

    const article = await Article.findById(req.params.id);
    if (!article)
      return res.status(404).json({ message: "Article non trouvé" });

    await article.deleteOne();
    res.json({ message: "Article supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};
