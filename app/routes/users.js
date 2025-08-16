import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// me
router.get('/me', auth, async (req, res) => {
  const u = await User.findById(req.user._id).select('-password');
  res.json(u);
});

// update favorites
router.post('/favorites', auth, async (req, res) => {
  const { favorites } = req.body;
  const u = await User.findById(req.user._id);
  u.favorites = Array.isArray(favorites) ? favorites.slice(0, 20) : [];
  await u.save();
  res.json({ favorites: u.favorites });
});

// notifications
router.get('/notifications', auth, async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = 20;
  const notes = await (await import('../models/Notification.js')).default
    .find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page-1)*limit).limit(limit);
  res.json(notes);
});

export default router;
