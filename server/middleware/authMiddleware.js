const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {

  try {
    // STEP 1: Check if token exists in the request header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, access denied' });
    }

    // STEP 2: Extract the token (remove "Bearer " from the front)
    const token = authHeader.split(' ')[1];
    // authHeader = "Bearer eyJhbGc..."
    // .split(' ') = ["Bearer", "eyJhbGc..."]
    // [1]         = "eyJhbGc..."

    // STEP 3: Verify the token using your JWT_SECRET
    // If token is fake, expired, or tampered → throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "abc123", iat: 1234567890, exp: 1235567890 }

    // STEP 4: Find the user from the decoded ID
    // Attach user to req so route handlers can use it
    req.user = await User.findById(decoded.id).select('-password');
    // .select('-password') means: return everything EXCEPT the password

    // STEP 5: Move on to the actual route handler
    next();

  } catch (error) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

module.exports = { protect };