import express from 'express';
import { auth } from '../middleware/auth.js';
import { permit } from '../middleware/roles.js';
import User from '../models/User.js';
import Auction from '../models/Auction.js';

const router = express.Router();

router.get('/users', auth, permit('admin'), async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(200);
  res.json(users);
});

router.get('/auctions', auth, permit('admin'), async (req, res) => {
  const auctions = await Auction.find().sort({ createdAt: -1 }).limit(200);
  res.json(auctions);
});

// Admin CANNOT edit auctions (by spec) – read-only

export default router;
