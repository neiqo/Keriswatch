-- Creating NormalUser 
INSERT INTO Users (username, password, email, role)
VALUES ('hehehe', 'hehehe', 'hehehe@gmail.com', 'NormalUser'),
('Ben', 'ben123', 'ben123@gmail.com', 'NormalUser');

INSERT INTO NormalUser (userId)
VALUES ((SELECT userId FROM Users WHERE username = 'hehehe')),
((SELECT userId FROM Users WHERE username = 'Ben'));

-- Adding a bookmarked article into the database
INSERT INTO Bookmarks (userId, articleId)
VALUES (1, 5),
(1, 6),
(1, 11);