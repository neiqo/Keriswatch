const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Book {
    constructor(id, title, author, availability) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.availability = availability;
    }

    static async getAllBooks() {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Books`;
        const request = connection.request();
        const result = await request.query(sqlQuery);

        connection.close();
        
        return result.recordset.map(
            (row) => new Book(row.book_id, row.title, 
                row.author, row.availability)
        );
    }

    static async updateBook(id, newAvailability) {
        const connection = await sql.connect(dbConfig);
    
        const sqlQuery = `UPDATE Books SET availability = @availability
                        WHERE book_id = @id`; // Parameterized query

        const request = connection.request();

        request.input("id", id);
        request.input("availability", newAvailability || null); // Handle optional fields
        
        await request.query(sqlQuery);

        connection.close();

        return this.getBookById(id); // returning the updated book data
    }

    static async getBookById(id) {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `SELECT * FROM Books WHERE book_id = @id`;
        const request = connection.request();
        request.input("id", sql.Int, id);
        const result = await request.query(sqlQuery);

        connection.close();

        const row = result.recordset[0];
        if (!row) {
            return null;
        }

        return new Book(row.book_id, row.title, row.author, row.availability);
    }

}


module.exports = Book;