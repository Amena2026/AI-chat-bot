// when a user logs in they get a token
// this token is stored in the request header
// auth.js makes sure only requests with valid tokens (ie only verified, logged in users) are allowed to go through

const { auth } = require('../config/firebase-admin');

const verifyToken = async (req, res, next) => {
  try {
    
    // parse the request header so that we can get the token, store the token in a variable
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    // if no token is provided, ie user is not logged in then throw a 401 error
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // auth.verfiyIdToken tells firebase to check these things 
    // 1. is the token valid
    // 2. is it expired 
    // 3. which user does it belong to
    const decodedToken = await auth.verifyIdToken(token);

    // if its valid, its going to get the user atttached to that user and save it to the req object so that 
    // the controller can use it. else it will throw and error
    req.user = decodedToken; 
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyToken };