IF OBJECT_ID('dbo.Bookmarks', 'U') IS NOT NULL
    DROP TABLE dbo.Bookmarks;

CREATE TABLE Bookmarks (
    id INT PRIMARY KEY IDENTITY,
    userId INT NOT NULL,
    articleId INT NOT NULL,
    bookmarkDateTime DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (articleId) REFERENCES Articles(articleId),
    UNIQUE(userId, articleId)
);

CREATE INDEX idx_user_id ON Bookmarks (userId);
CREATE INDEX idx_article_id ON Bookmarks (articleId);
CREATE INDEX idx_bookmarkDateTime ON Bookmarks (bookmarkDateTime);
