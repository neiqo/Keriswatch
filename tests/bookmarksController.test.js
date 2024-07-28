const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const bookmarksController = require('../controllers/bookmarksController');
const Bookmark = require('../models/bookmarks');

const app = express();
app.use(bodyParser.json());

app.get('/bookmarks', bookmarksController.getAllBookmarkedArticles);

jest.mock('../models/bookmarks');


beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.error.mockRestore();
});
  

describe('bookmarksController', () => {
  describe('getAllBookmarkedArticles', () => {
    it('should return 400 if userId is missing', async () => {
      const res = await request(app).get('/bookmarks');
      expect(res.status).toBe(400);
      expect(res.text).toBe('Missing userId parameter');
    });

    it('should return 200 and list of bookmarked articles', async () => {
      const userId = 1;
      const mockBookmarks = [{ id: 1, title: 'Test Article' }];
      Bookmark.getAllBookmarkedArticles.mockResolvedValue(mockBookmarks);

      const res = await request(app).get('/bookmarks').query({ userId });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockBookmarks);
    });

    it('should handle errors and return 500', async () => {
      const userId = 1;
      Bookmark.getAllBookmarkedArticles.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/bookmarks').query({ userId });
      expect(res.status).toBe(500);
      expect(res.text).toBe('Internal Server Error');
    });
  });
});
