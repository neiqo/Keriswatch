const { getAllUsers } = require('../controllers/userController');
const { Admin } = require('../models/user');

// Mock the Admin model's getAllUsers method
jest.mock('../models/user', () => ({
  Admin: {
    getAllUsers: jest.fn(),
  },
}));

describe('getAllUsers', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  it('should return all users', async () => {
    const users = [
      { id: 1, username: 'user1', role: 'NormalUser' },
      { id: 2, username: 'user2', role: 'Organisation' },
    ];
    Admin.getAllUsers.mockResolvedValue(users);

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it('should handle errors and return a 500 status', async () => {
    const errorMessage = 'Database error';
    Admin.getAllUsers.mockRejectedValue(new Error(errorMessage));

    await getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error retrieving users: ' + errorMessage);
  });
});
