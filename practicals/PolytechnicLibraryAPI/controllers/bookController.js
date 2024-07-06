const Book = require("../models/book");

const getAllBooks = async (req, res) => {
    try {
        const books = await Book.getAllBooks();
        res.json(books)
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving books");
    }
}

// Controller to update event
const updateBook = async (req, res) => {
  const bookId = parseInt(req.params.bookid);
  const newAvailability = req.body.availability;

  try {
    const updatedBook = await Book.updateBook(bookId, newAvailability);
    if (!updatedBook) {
      return res.status(404).send("Book not found");
    }
    res.json(updatedBook);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating book");
  }
}; 

// Controller to get book by id
const getBookById = async (req, res) => {
    const bookId = parseInt(req.params.bookid);
    try {
      const book = await Book.getBookById(bookId);
      if (!book) {
        return res.status(404).send("Book not found");
      }
      res.json(book);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving book", error);
    }
};

module.exports = {
    getAllBooks,
    updateBook,
    getBookById
}