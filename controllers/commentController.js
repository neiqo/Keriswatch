const Comment = require('../models/comment');

const getArticleComments = async (req, res) => {
    const articleId = req.params.articleId;
    try {
        const comments = await Comment.getCommentsByArticleId(articleId);

        if (!comments || comments.length === 0) {
            return res.status(200).json([]);
        }

        const updatedComments = comments.map(comment => {
            if (comment.profilePicture) {
                comment.profilePicture = comment.profilePicture.toString('base64');
            }
            return comment;
        });

        res.status(200).json(updatedComments);
    } catch (error) {
        res.status(500).send('Error fetching comments: ' + error.message);
        throw error;
    }
};
const createComment =  async (req, res) => {
    const token = req.decodedUser;
    try {
        console.log("Decoded Token in createComment: ", token);
        const newComment = {
            userId: token.userId,
            articleId: req.body.articleId,
            content: req.body.content,
            parentId: req.body.parentId || null

        };
        const commentId = await Comment.createComment(newComment);
        res.status(201).json({ commentId });
    } catch (error) {
        res.status(500).send('Error creating comment: ' + error.message);
        throw error;
    }
}

const deleteComment =  async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.decodedUser.userId;
    const role = req.body.role;
    try {
        await Comment.deleteComment(commentId, userId, role);
        res.status(200).send('Comment deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting comment: ' + error.message);
    }
}

const upvoteComment =  async (req, res) => {
    console.log("Request Body: ", req.body); // Log the request body
    const commentId = req.params.commentId;
    const userId = req.decodedUser.userId;
    console.log(userId);    
    try {
        console.log("User ID in upvoteComment Controller: ", userId);
        await Comment.upvoteComment(commentId, userId);
        res.status(200).send('Comment upvoted successfully');
    } catch (error) {
        res.status(500).send('Error upvoting comment: ' + error.message);
        throw error;
    }
}

const downvoteComment =  async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.decodedUser.userId;
    try {
        await Comment.downvoteComment(commentId, userId);
        res.status(200).send('Comment downvoted successfully');
    } catch (error) {
        res.status(500).send('Error downvoting comment: ' + error.message);
        throw error;
    }
}

module.exports = { 
    getArticleComments, 
    createComment, 
    deleteComment, 
    upvoteComment, 
    downvoteComment
};
