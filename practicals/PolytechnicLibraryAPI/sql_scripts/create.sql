-- Create Users Table
CREATE TABLE Users (
    user_id INT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('member', 'librarian')) NOT NULL
);

-- Create Books Table
CREATE TABLE Books (
    book_id INT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    availability CHAR(1) CHECK (availability IN ('Y', 'N')) NOT NULL
);

-- Sample books data
INSERT INTO Books (book_id, title, author, availability) VALUES 
(1, 'To Kill a Mockingbird', 'Harper Lee', 'Y'),
(2, '1984', 'George Orwell', 'Y'),
(3, 'The Great Gatsby', 'F. Scott Fitzgerald', 'N'),
(4, 'The Catcher in the Rye', 'J.D. Salinger', 'Y'),
(5, 'Moby-Dick', 'Herman Melville', 'N'),
(6, 'War and Peace', 'Leo Tolstoy', 'Y'),
(7, 'Pride and Prejudice', 'Jane Austen', 'Y'),
(8, 'The Lord of the Rings', 'J.R.R. Tolkien', 'N'),
(9, 'The Hobbit', 'J.R.R. Tolkien', 'Y'),
(10, 'Crime and Punishment', 'Fyodor Dostoevsky', 'N');

