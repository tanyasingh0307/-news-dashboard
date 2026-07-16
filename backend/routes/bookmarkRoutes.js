const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All bookmark routes require a logged-in user
router.use(protect);

// GET /api/bookmarks - list the current user's saved articles
router.get("/", async (req, res) => {
  const user = await User.findById(req.userId).select("bookmarks");
  res.json({ bookmarks: user.bookmarks });
});

// POST /api/bookmarks - save an article
// Body: { articleId, title, imageUrl, sourceId, link }
router.post("/", async (req, res) => {
  const { articleId, title, imageUrl, sourceId, link } = req.body;

  if (!articleId || !title) {
    return res.status(400).json({ message: "articleId and title are required" });
  }

  const user = await User.findById(req.userId);

  const alreadySaved = user.bookmarks.some((b) => b.articleId === articleId);
  if (alreadySaved) {
    return res.status(409).json({ message: "Article already bookmarked" });
  }

  user.bookmarks.push({ articleId, title, imageUrl, sourceId, link });
  await user.save();

  res.status(201).json({ bookmarks: user.bookmarks });
});

// DELETE /api/bookmarks/:articleId - remove a saved article
router.delete("/:articleId", async (req, res) => {
  const user = await User.findById(req.userId);

  user.bookmarks = user.bookmarks.filter(
    (b) => b.articleId !== req.params.articleId
  );
  await user.save();

  res.json({ bookmarks: user.bookmarks });
});

module.exports = router;
