const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path'); // Import the path module
require('dotenv').config(); // Load environment variables from a .env file
const { User, NormalUser, Admin, Organisation } = require('../models/user');
const Token = require('../models/token');

const upload = require('../middlewares/multerConfig');

const registerUser = async (req, res) => {
  const user = { ...req.body };
  const profilePicture = req.files ? req.files.profilePicture : null;

  let profilePicturePath = null;

  try {
    // Validation code for user registration
    if (!['NormalUser', 'Organisation'].includes(user.role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Validate username uniqueness
    const existingUser = await User.getUserByUsername(user.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hashing password
    // to ensure that the same password entered by different users will not have the same hash
    // 10 means a cost factor of 10, 2^10 times of iterations to hash the passwords
    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(user.password, salt);

    // hash it to store in database when creating account
    user.password = hashedPassword;

    // Register the new user in the database
    if (user.role === 'NormalUser') {
        await NormalUser.createAccount(user);
    }
    else if (user.role === 'Organisation') {
        await Organisation.createAccount(user);
    }

    console.log(user.username);

    const userRecord = await User.getUserByUsername(user.username);
    if (!userRecord) {
        return res.status(500).json({ message: "Failed to retrieve user after creation" });
    }
    const userId = userRecord.userId;
    let uploadProfileSuccess = false;

    if (profilePicture) {

        const fileExtension = path.extname(profilePicture.name); // extract file extension
        profilePicturePath = `${userId}${fileExtension}`;
    

        uploadProfileSuccess = (User.uploadProfilePicture(userId, profilePicturePath)).success;
      }
        
    if (uploadProfileSuccess) { 
        const uploadPath = path.join(__dirname, 'images/profile-pictures', profilePicturePath);
        console.log(uploadPath);
        profilePicture.mv(uploadPath, err => {
            if (err) return res.status(500).send(err);
        });
    }

    const payload = {
        userId: userId,
        role: user.role,
        username: user.username,
    };

    // if (newUser['success'] === false) { 
    //     return res.status(400).json({ message: newUser['message'] });
    // }    

    // Generate JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "3600s"});
  
    return res.status(201).json({
      message: 'User registered successfully',
      token: token // Include the token in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const userLogin = async (req,res) => {
  const {email, password} = req.body;

  try {
    // check if user is in the database based on unique email
    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({message: "User not found!"});
    }

    // check if password used to login matches the password in the database
    //  - the login password is hashed using bcrypt's algorithm and checks if the
    //    login password that is hashed matches exactly to the hashed password in the database
    const isMatchedPass = await bcrypt.compare(password, user.password);
    if (!isMatchedPass){
      return res.status(401).json({message: "Wrong password!"});
    }

    // generate JWT(JSON Web Token) token
    // user information that is pulled from the database
    const payload = {
      userId: user.userId,
      role: user.role,
      username: user.username,
    };
    
    // JWT token that expires after 1 hour that signed by the secret key
    // new one is generated everytime a user logs in
    // server will verify the signature/token using the secret key
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "3600s"});

    // Decode the token to get the expiration time
    const decodedToken = jwt.decode(token);
    const expiresAt = new Date(decodedToken.exp * 1000); // Convert from seconds to milliseconds
    
    console.log(`Token: ${token}`);
    console.log(`Expires At: ${expiresAt}`);

    // store the token in the database
    await Token.storeToken(user.userId, token, expiresAt);
    
    return res.status(200).json({ token }); // returns the JWT token to be used for future authentication
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" }) 
  }
}

const userLogout = async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.decode(token);
        await Token.deleteToken(decoded.userId);
        res.status(200).send('User logged out successfully');
    } catch (error) {
        res.status(500).send('Error logging out user: ' + error.message);
    }

}

const getUserByUsername =  async (req, res) => {
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

const updateNormalUser =  async (req, res) => {
    try {
        // default null if no changes made
        const { oldUsername, username = null, password = null, email = null, country = null } = req.body;
        const user = { oldUsername, username, password, email, country };

        // if username does not exist, throw error
        let oldUserDetails = null;

        console.log(user.oldUsername);

        if ((oldUserDetails = await this.getUserByUsername(user.oldUsername)) == null) {
            res.status(404).send('User does not exist');
            throw new Error('User does not exist');
        }

        console.log(oldUserDetails);

        oldUserDetails['country'] = (await this.getNormalUserByUsername(user.oldUsername)).country;  // get country of user

        const updatedUser = await NormalUser.updateAccountDetails(user, oldUserDetails);

        const payload = {
            userId: updatedUser.userId,
            role: oldUserDetails.role,
            username: updatedUser.username,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3600s" });

        // Send status 200 OK with JSON response
        res.status(200).json(token);
    } catch (error) {
        res.status(400).send('Error updating user: ' + error.message);
    }
}

const updateOrganisation =  async (req, res) => {
    try {
        const { oldUsername, username = null, password = null, email = null, orgNumber = null } = req.body;
        const user = { oldUsername,username, password, email, orgNumber };

        // if username does not exist, throw error
        let oldUserDetails = null;

        console.log(user.oldUsername);

        // if username does not exist, throw error
        if ((oldUserDetails = await this.getOrganisationByUsername(user.oldUsername)) == null) {
            throw new Error('Organisation does not exist');
        }

        console.log(oldUserDetails);
        
        oldUserDetails['orgNumber'] = (await this.getOrganisationByUsername(user.oldUsername)).orgNumber; // get country of user

        const updatedUser = await Organisation.updateAccountDetails(user, oldUserDetails);

        const payload = {
            userId: updatedUser.userId,
            role: oldUserDetails.role,
            username: updatedUser.username,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3600s" });

        // Send status 200 OK with JSON response
        res.status(200).json(token);
    } catch (error) {
        res.status(400).send('Error updating organisation: ' + error.message);
    }
}

const deleteUser =  async (req, res) => {
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

const getAllUsers =  async (req, res) => {
    try {
        const users = await Admin.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send('Error retrieving users: ' + error.message);
    }
}

module.exports = {
    registerUser,
    userLogin,
    userLogout,
    getUserByUsername,
    updateNormalUser,
    updateOrganisation,
    deleteUser,
    getAllUsers
};
