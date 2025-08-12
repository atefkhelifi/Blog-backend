const Comment = require("../models/Comment");
const { io } = require("../server"); // <-- importer comme objet destructuré

const getCommentsByArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!articleId) {
      return res.status(400).json({ message: "ID d'article requis" });
    }

    const comments = await Comment.find({ article: articleId })
      .populate("author", "username")
      .populate("parent")
      .sort({ createdAt: 1 }); // tri chronologique

    res.status(200).json(comments);
  } catch (error) {
    console.error("Erreur getCommentsByArticle:", error);
    res.status(500).json({ message: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { content, article, parent } = req.body;

    if (!content || !article) {
      return res.status(400).json({ message: "Contenu et article requis" });
    }

    const comment = new Comment({
      content,
      article,
      parent: parent || null,
      author: req.user.id,
    });

    await comment.save();

    // **Vérification que io est défini avant d’émettre**
    if (io) {
      io.to(article.toString()).emit("newComment", comment);
    } else {
      console.warn("Socket.io non initialisé");
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error("Erreur createComment:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommentsByArticle,
  createComment,
};
