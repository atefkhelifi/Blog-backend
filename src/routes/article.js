const express = require("express");
const router = express.Router();

const articleController = require("../controllers/articleController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware"); // Import direct car export simple

router.post("/", authMiddleware, articleController.createArticle);
router.get("/", articleController.getArticles);
router.get("/:id", articleController.getArticleById);
router.put("/:id", authMiddleware, articleController.updateArticle);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin"),
  articleController.deleteArticle
);

module.exports = router;
