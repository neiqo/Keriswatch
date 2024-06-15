const Article = require("../models/articles");
const sql = require("mssql");
const dbConfig = require("../dbConfig");

const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.getAllArticles();
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving Articles");
  }
};

module.exports = {
  getAllArticles,
};
