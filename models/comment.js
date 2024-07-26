const sql = require('mssql');
const dbConfig = require('../dbConfig');

class Comment {
    static async getCommentsByArticleId(articleId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `SELECT * FROM Comments WHERE articleId = @ArticleId ORDER BY createdAt ASC`;
    
            const request = connection.request();
            request.input('ArticleId', sql.Int, articleId); // specify data type to avoid system misinterpretation
    
            const result = await request.query(sqlQuery);            
            connection.close();

            // no comments found
            if (result.recordset.length === 0) {
                return null;
            }

            return result.recordset;
        } catch (error) {
            console.error('Error getting comments by article ID: ', error);
            connection.close();
            throw error;
        }
    }

    static async createComment(comment) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);
            const sqlQuery = `INSERT INTO Comments (userId, articleId, content, parentId) 
                              VALUES (@UserId, @ArticleId, @Content, @ParentId);
                              SELECT SCOPE_IDENTITY() AS commentId;`;
    
            const request = connection.request();
            request.input('ArticleId', sql.Int, articleId); // specify data type to avoid system misinterpretation
            request.input('UserId', sql.Int, comment.userId);
            request.input('ArticleId', sql.Int, comment.articleId);
            request.input('Content', sql.Text, comment.content);
            request.input('ParentId', sql.Int, comment.parentId);

            const result = await request.query(sqlQuery);            
            connection.close();

            return result.recordset[0].commentId;
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    }

    static async deleteComment(commentId, userId, role) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);

            let sqlQuery = `DELETE FROM Comments WHERE commentId = @CommentId AND userId = @UserId`;
            if (role === 'Admin') {
                sqlQuery = `DELETE FROM Comments WHERE commentId = @CommentId`;
            }

            const request = connection.request();
            request.input('CommentId', sql.Int, commentId)
            request.input('UserId', sql.Int, userId); // specify data type to avoid system misinterpretation
    
            const result = await request.query(sqlQuery);            
            connection.close();
            
            return result.rowsAffected > 0;

        } catch (error) {
            console.error('Error deleting comment:', error);
            connection.close();
            throw error;
        }
    }

    static async upvoteComment(commentId, userId) {
        let connection;
        try {
            
            connection = await sql.connect(dbConfig);

            let sqlQuery = `INSERT INTO Upvotes (commentId, userId) VALUES (@CommentId, @UserId);
                            UPDATE Comments SET upvotes = upvotes + 1 WHERE commentId = @CommentId;`;

            const request = connection.request();
            request.input('CommentId', sql.Int, commentId);
            request.input('UserId', sql.Int, userId) // specify data type to avoid system misinterpretation
    
            const result = await request.query(sqlQuery);            
            connection.close();

            return result.rowsAffected > 0;
            
        } catch (error) {
            console.error('Error upvoting comment:', error);
            connection.close();
            throw error;
        }
    }

    static async downvoteComment(commentId, userId) {
        let connection;
        try {
            connection = await sql.connect(dbConfig);

            let sqlQuery = `INSERT INTO Downvotes (commentId, userId) VALUES (@CommentId, @UserId);
                            UPDATE Comments SET downvotes = downvotes + 1 WHERE commentId = @CommentId;`;

            const request = connection.request();
            request.input('CommentId', sql.Int, commentId);
            request.input('UserId', sql.Int, userId) // specify data type to avoid system misinterpretation
    
            const result = await request.query(sqlQuery);            
            connection.close();

            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Error downvoting comment:', error);
            connection.close();
            throw error;
        }
    }
}

module.exports = Comment;
