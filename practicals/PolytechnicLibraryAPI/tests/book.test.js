// book.test.js
const Book = require("../models/book");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe("Book.getAllBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all books from the database", async () => {
    const mockBooks = [
      {
        id: 1,
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        availability: "Y",
      },
      {
        id: 2,
        title: "The Hitchhiker's Guide to the Galaxy",
        author: "Douglas Adams",
        availability: "N",
      },
    ];

    const mockRequest = {
      query: jest.fn().mockResolvedValue({ recordset: mockBooks }),
    };
    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection); // Return the mock connection

    const books = await Book.getAllBooks();

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.close).toHaveBeenCalledTimes(1);
    expect(books).toHaveLength(2);
    expect(books[0]).toBeInstanceOf(Book);
    expect(books[0].id).toBe(1);
    expect(books[0].title).toBe("The Lord of the Rings");
    expect(books[0].author).toBe("J.R.R. Tolkien");
    expect(books[0].availability).toBe("Y");
    // ... Add assertions for the second book
    expect(books[1]).toBeInstanceOf(Book);
    expect(books[1].id).toBe(2);
    expect(books[1].title).toBe("The Hitchhiker's Guide to the Galaxy");
    expect(books[1].author).toBe("Douglas Adams");
    expect(books[1].availability).toBe("N");
  });

  it("should handle errors when retrieving books", async () => {
    const errorMessage = "Database Error";
    sql.connect.mockRejectedValue(new Error(errorMessage));
    await expect(Book.getAllBooks()).rejects.toThrow(errorMessage);
  });
});

describe("Book.updateBook", () => {
  it("should update the availability of a book", async () => {
    const bookId = 1;
    const newAvailability = 'N';

    const mockBookBefore = {
      id: bookId,
      title: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      availability: "Y",
    };

    const mockBookAfter = {
      ...mockBookBefore,
      availability: newAvailability,
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValueOnce({ rowsAffected: [1] })
                      .mockResolvedValueOnce({ recordset: [mockBookAfter] }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const updatedBook = await Book.updateBook(bookId, newAvailability);

    // Assert that the connection was established and closed
    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockConnection.close).toHaveBeenCalledTimes(2);

    // Assert that the correct query was made with the right inputs
    expect(mockRequest.input).toHaveBeenCalledWith('id', sql.Int, bookId);
    expect(mockRequest.input).toHaveBeenCalledWith('availability', newAvailability || null);
    expect(mockRequest.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE Books'));

    // Assert that the returned book has the correct properties
    expect(updatedBook).toBeInstanceOf(Book);
    expect(updatedBook.id).toBe(bookId);
    expect(updatedBook.title).toBe("The Lord of the Rings");
    expect(updatedBook.author).toBe("J.R.R. Tolkien");
    expect(updatedBook.availability).toBe(newAvailability);
  });

  it("should return null if book with the given id does not exist", async () => {
    const bookId = 999; // Non-existent book id
    const newAvailability = 'N';

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValueOnce({ rowsAffected: [0] }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn().mockResolvedValue(undefined),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const updatedBook = await Book.updateBook(bookId, newAvailability);

    expect(updatedBook).toBeNull();
    expect(mockRequest.query).toHaveBeenCalledTimes(2); // Only the UPDATE query should be called
  });

  it("should handle database errors when updating a book", async () => {
    const bookId = 1;
    const newAvailability = 'N';

    sql.connect.mockRejectedValue(new Error("Database connection error"));

    await expect(Book.updateBook(bookId, newAvailability)).rejects.toThrow("Database connection error");
  });
});