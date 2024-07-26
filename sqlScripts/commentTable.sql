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