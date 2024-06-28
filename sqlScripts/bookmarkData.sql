-- Creating a NormalUser 
INSERT INTO Users (username, password, email, role)
VALUES ('hehehe', 'hehehe', 'hehehe@gmail.com', 'NormalUser');

INSERT INTO NormalUser (user_id)
VALUES ((SELECT id FROM Users WHERE username = 'hehehe'));

-- Check for user details
SELECT u.*, n.user_id
FROM Users u JOIN NormalUser n
ON u.id = n.user_id
WHERE u.id = 1;

-- Adding a bookmarked article into the database
INSERT INTO Bookmarks (user_id, article_id)
VALUES (1, 1);