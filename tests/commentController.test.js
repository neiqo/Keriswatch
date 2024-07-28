const { getArticleComments } = require('../controllers/commentController');
const Comment = require('../models/comment');

// Mock the Comment model's getCommentsByArticleId method
jest.mock('../models/comment');

describe('getArticleComments', () => {
    let req, res;

    beforeEach(() => {
        req = { params: { articleId: '123' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };
    });

    it('should return comments with profile pictures as base64 strings', async () => {
        const comments = [
            { id: 1, content: 'Test comment 1', profilePicture: Buffer.from('picture1') },
            { id: 2, content: 'Test comment 2', profilePicture: Buffer.from('picture2') },
        ];
        Comment.getCommentsByArticleId.mockResolvedValue(comments);

        await getArticleComments(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            { id: 1, content: 'Test comment 1', profilePicture: 'cGljdHVyZTE=' },
            { id: 2, content: 'Test comment 2', profilePicture: 'cGljdHVyZTI=' },
        ]);
    });

    it('should return an empty array if no comments are found', async () => {
        Comment.getCommentsByArticleId.mockResolvedValue([]);

        await getArticleComments(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors and return a 500 status', async () => {
        const errorMessage = 'Database error';
        Comment.getCommentsByArticleId.mockRejectedValue(new Error(errorMessage));

        await expect(getArticleComments(req, res)).rejects.toThrow(errorMessage);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error fetching comments: ' + errorMessage);
    });
});
