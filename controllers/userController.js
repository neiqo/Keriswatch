const { User, NormalUser, Admin, Organisation } = require('../models/user');

// Controller for user operations
class UserController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.loginUser(email, password);
            if (!user) {
                return res.status(401).send('Invalid credentials');
            }
            res.json(user);
        } catch (error) {
            res.status(500).send('Error logging in: ' + error.message);
        }
    }
    
    static async getUserByUsername(req, res) {
        try {
            const { username } = req.params;

            const user = await User.getUserByUsername(username);
            if (!user) {
                return res.status(404).send('User not found');
            }
            res.json(user);
        } catch (error) {
            res.status(500).send('Error retrieving user: ' + error.message);
        }
    }

    static async createNormalUser(req, res) {
        try {
            const newUser = await NormalUser.createAccount(req.body);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(400).send('Error creating user: ' + error.message);
        }
    }

    static async createOrganisation(req, res) {
        try {
            const { username, password, email, orgNumber } = req.body;
            const user = new Organisation(username, password, email, orgNumber);

            const newUser = await Organisation.createAccount(user);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(400).send('Error creating organisation: ' + error.message);
        }
    }

    static async updateNormalUser(req, res) {
        try {
            // default null if no changes made
            const { oldUsername, username = null, password = null, email = null, country = null } = req.body;
            const user = { oldUsername,username, password, email, country };

            const updatedUser = await NormalUser.updateAccountDetails(user);
            res.json(updatedUser);
        } catch (error) {
            res.status(400).send('Error updating user: ' + error.message);
        }
    }

    static async updateOrganisation(req, res) {
        try {
            const { oldUsername, username = null, password = null, email = null, orgNumber = null } = req.body;
            const user = { oldUsername,username, password, email, orgNumber };

            const updatedUser = await Organisation.updateAccountDetails(user);
            res.json(updatedUser);
        } catch (error) {
            res.status(400).send('Error updating organisation: ' + error.message);
        }
    }

    static async deleteUser(req, res) {
        try {
            const { username } = req.params;

            const result = await Admin.deleteUser(username);
            if (result) {
                res.send('User deleted successfully');
            } else {
                res.status(404).send('User not found or cannot delete admin');
            }
        } catch (error) {
            res.status(500).send('Error deleting user: ' + error.message);
        }
    }

    static async getAllUsers(req, res) {
        try {
            const users = await Admin.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).send('Error retrieving users: ' + error.message);
        }
    }
}

module.exports = UserController;
