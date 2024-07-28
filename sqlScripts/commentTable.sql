-- Create Comments table
CREATE TABLE Comments (
    commentId INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    articleId INT NOT NULL,
    content TEXT NOT NULL,
    parentId INT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    CONSTRAINT FK_Comments_User FOREIGN KEY (userId) REFERENCES Users(userId),
    CONSTRAINT FK_Comments_Article FOREIGN KEY (articleId) REFERENCES Articles(articleId),
    CONSTRAINT FK_Comments_Parent FOREIGN KEY (parentId) REFERENCES Comments(commentId)
);

-- Create Upvotes table
CREATE TABLE Upvotes (
    upvoteId INT IDENTITY(1,1) PRIMARY KEY,
    commentId INT NOT NULL,
    userId INT NOT NULL,
    CONSTRAINT FK_Upvotes_Comment FOREIGN KEY (commentId) REFERENCES Comments(commentId),
    CONSTRAINT FK_Upvotes_User FOREIGN KEY (userId) REFERENCES Users(userId)
);

-- Create Downvotes table
CREATE TABLE Downvotes (
    downvoteId INT IDENTITY(1,1) PRIMARY KEY,
    commentId INT NOT NULL,
    userId INT NOT NULL,
    CONSTRAINT FK_Downvotes_Comment FOREIGN KEY (commentId) REFERENCES Comments(commentId),
    CONSTRAINT FK_Downvotes_User FOREIGN KEY (userId) REFERENCES Users(userId)
);

-- Insert Dummy Comments
INSERT INTO Comments (userId, articleId, content, parentId, createdAt, upvotes, downvotes)
VALUES 
(1, 1, 'This is a top-level comment.', NULL, '2023-07-25T12:00:00', 5, 2),
(2, 1, 'This is a reply to the top-level comment.', 1, '2023-07-25T13:00:00', 2, 0),
(3, 1, 'Admin replying to the top-level comment.', 1, '2023-07-25T14:00:00', 10, 1),
(4, 1, 'Another top-level comment.', NULL, '2023-07-25T15:00:00', 3, 1),
(1, 1, 'Replying to the second top-level comment.', 4, '2023-07-25T16:00:00', 1, 0);