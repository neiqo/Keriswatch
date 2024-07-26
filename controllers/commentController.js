const Comment = require('../models/comment');


const getArticleComments =  async (req, res) => {
    try {
        const articleId = req.params.articleId;
        const comments = await Comment.getCommentsByArticleId(articleId);
        res.json(comments);
    } catch (error) {
        res.status(500).send('Error fetching comments: ' + error.message);
    }
}

const createComment =  async (req, res) => {
    try {
        const newComment = {
            userId: req.body.userId,
            articleId: req.body.articleId,
            content: req.body.content,
            parentId: req.body.parentId || null
        };
        const commentId = await Comment.createComment(newComment);
        res.status(201).json({ commentId });
    } catch (error) {
        res.status(500).send('Error creating comment: ' + error.message);
    }
}

const deleteComment =  async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.body.userId;
        const role = req.body.role;
        await Comment.deleteComment(commentId, userId, role);
        res.status(200).send('Comment deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting comment: ' + error.message);
    }
}

const upvoteComment =  async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.body.userId;
        await Comment.upvoteComment(commentId, userId);
        res.status(200).send('Comment upvoted successfully');
    } catch (error) {
        res.status(500).send('Error upvoting comment: ' + error.message);
    }
}

const downvoteComment =  async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.body.userId;
        await Comment.downvoteComment(commentId, userId);
        res.status(200).send('Comment downvoted successfully');
    } catch (error) {
        res.status(500).send('Error downvoting comment: ' + error.message);
    }
}

module.exports = { 
    getArticleComments, 
    createComment, 
    deleteComment, 
    upvoteComment, 
    downvoteComment
};
