const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// ─── GET PROFILE ─────────────────────────────────────────
// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─── UPDATE PROFILE ──────────────────────────────────────
// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, company, logo, invoicePrefix } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, company, logo, invoicePrefix },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;