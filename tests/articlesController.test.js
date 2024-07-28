const articlesController = require('../controllers/articlesController');
const Article = require('../models/articles');
const httpMocks = require('node-mocks-http');
jest.mock('../models/articles');

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.error.mockRestore();
});
  
describe('articlesController.getAllArticles', () => {
  it('should return all articles with status 200', async () => {
    const mockArticles = [
      {
        articleID: 1,
        Author: 'John Smith',
        Publisher: 'Philippine Daily',
        Country: 'Philippines',
        Sector: 'Manufacture',
        Title: 'Advancements in Philippine Manufacturing Technology',
        Body: 'The Philippine manufacturing sector is currently experiencing...',
        publishDateTime: '2023-05-10T09:00:00.000Z',
        Tags: 'technology, innovation',
        imageFileNames: ['1.jpg', '2.jpg', '3.jpg'],
      },
      {
        articleID: 2,
        Author: 'Jane Doe',
        Publisher: 'Business Times PH',
        Country: 'Philippines',
        Sector: 'Services',
        Title: 'Growth Trends in Philippine Services Sector',
        Body: 'The services sector in the Philippines has been experiencing...',
        publishDateTime: '2023-05-12T10:30:00.000Z',
        Tags: 'business, finance',
        imageFileNames: ['1.jpg', '2.jpg', '3.jpg'],
      },
    ];

    Article.getAllArticles.mockResolvedValue(mockArticles);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await articlesController.getAllArticles(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(mockArticles);
  });

  it('should handle errors and return status 500', async () => {
    const errorMessage = 'Error retrieving Articles';
    Article.getAllArticles.mockRejectedValue(new Error(errorMessage));

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = jest.fn();

    await articlesController.getAllArticles(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res._getData()).toBe(errorMessage);
  });
});
