const Bookmark = require("../models/bookmarks");
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const path = require("path");

const getAllBookmarkedArticles = async (req, res) => {
  const userId = req.params.userId;

  try {
    const bookmarkedArticles = await Bookmark.getAllBookmarkedArticles(userId);
    res.json(bookmarkedArticles);
  } catch (error) {
    console.error('Error getting bookmarked articles:', error);
    res.status(500).send('Internal Server Error');
  }
};

const addBookmark = async (req, res) => {
  const { userId, articleId } = req.params; // Destructure from URL path parameters

  // Convert userId and articleId to integers
  const userIdInt = parseInt(userId, 10);
  const articleIdInt = parseInt(articleId, 10);

  // Validate that userId and articleId are integers
  if (isNaN(userIdInt) || isNaN(articleIdInt)) {
    return res.status(400).send("Invalid input: userId and articleId must be integers");
  }

  try {
    const addedBookmark = await Bookmark.addBookmark(userIdInt, articleIdInt);
    res.status(201).json(addedBookmark);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).send("Error creating bookmark");
  }
};

const deleteBookmark = async (req, res) => {
  const { userId, articleId } = req.params; // Destructure from URL path parameters

  // Convert userId and articleId to integers
  const userIdInt = parseInt(userId, 10);
  const articleIdInt = parseInt(articleId, 10);

  try {
    const success = await Bookmark.deleteBookmark(userIdInt, articleIdInt);
    if (!success) {
      return res.status(404).send("Bookmark not found");
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting bookmark");
  }
};

module.exports = {
  getAllBookmarkedArticles,
  addBookmark,
  deleteBookmark
};