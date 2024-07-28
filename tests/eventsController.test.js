const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const eventController = require('../controllers/eventsController');
const Event = require('../models/event');

const app = express();
app.use(bodyParser.json());

app.get('/events', eventController.getAllEvents);

jest.mock('../models/event');


beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.error.mockRestore();
});
  

describe('eventController', () => {
  describe('getAllEvents', () => {
    it('should return 200 and list of events', async () => {
      const mockEvents = [
        { id: 1, name: 'Event 1', description: 'Description 1' },
        { id: 2, name: 'Event 2', description: 'Description 2' }
      ];
      Event.getAllEvents.mockResolvedValue(mockEvents);

      const res = await request(app).get('/events');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockEvents);
    });

    it('should handle errors and return 500', async () => {
      Event.getAllEvents.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/events');
      expect(res.status).toBe(500);
      expect(res.text).toBe('Error retrieving events');
    });
  });
});
