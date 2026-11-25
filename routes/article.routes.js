const express = require("express");
const router = express.Router();
const articleController = require("../controllers/article.controller");
const { checkAdmin } = require("../middleware/auth");

router.get("/", articleController.getArticles);
router.post("/", checkAdmin, articleController.createArticle);
router.delete("/:id", checkAdmin, articleController.deleteArticle);

module.exports = router;
