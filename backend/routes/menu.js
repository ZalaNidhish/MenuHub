const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { auth, isOwner } = require('../middleware/auth');

// Get menu items for a restaurant (public)
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurant: req.params.restaurantId,
      isActive: true
    }).sort({ category: 1, name: 1 });
    
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get today's available menu for a restaurant (public)
router.get('/restaurant/:restaurantId/today', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurant: req.params.restaurantId,
      isActive: true,
      isAvailableToday: true
    }).sort({ category: 1, name: 1 });
    
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create menu item (Owner only)
router.post('/', auth, isOwner, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const menuItem = await MenuItem.create({
      ...req.body,
      restaurant: restaurant._id
    });

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update menu item (Owner only)
router.put('/:id', auth, isOwner, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (menuItem.restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedMenuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle today's availability (Owner only)
router.put('/:id/toggle-today', auth, isOwner, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (menuItem.restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    menuItem.isAvailableToday = !menuItem.isAvailableToday;
    await menuItem.save();

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete menu item (Owner only)
router.delete('/:id', auth, isOwner, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (menuItem.restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;