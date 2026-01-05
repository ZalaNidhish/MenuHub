const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { auth, isAdmin } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .populate('restaurant')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (Admin only)
router.put('/users/:id/role', auth, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'owner', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard statistics (Admin only)
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalRestaurants = await Restaurant.countDocuments();
    const totalMenuItems = await MenuItem.countDocuments();
    const activeRestaurants = await Restaurant.countDocuments({ isActive: true });

    res.json({
      totalUsers,
      totalOwners,
      totalRestaurants,
      totalMenuItems,
      activeRestaurants
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all restaurants (Admin only)
router.get('/restaurants', auth, isAdmin, async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.restaurant) {
      await Restaurant.findByIdAndDelete(user.restaurant);
      await MenuItem.deleteMany({ restaurant: user.restaurant });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;