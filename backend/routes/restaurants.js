const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { auth, isOwner } = require('../middleware/auth');

// Get all restaurants (public)
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single restaurant
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email');
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create restaurant (Owner only)
router.post('/', auth, isOwner, async (req, res) => {
  try {
    const existingRestaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (existingRestaurant) {
      return res.status(400).json({ message: 'You already have a restaurant' });
    }

    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user._id
    });

    await User.findByIdAndUpdate(req.user._id, { restaurant: restaurant._id });

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update restaurant (Owner only)
router.put('/:id', auth, isOwner, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete restaurant (Owner only)
router.delete('/:id', auth, isOwner, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Restaurant.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user._id, { restaurant: null });

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;