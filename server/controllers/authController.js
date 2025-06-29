const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Optionally, omit password in response
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ user: userObj, message: 'Registration successful.' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};