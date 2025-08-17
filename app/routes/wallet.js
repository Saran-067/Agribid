import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Simple deposit endpoint (mock top-up)
router.post('/deposit', auth, async (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  const user = await User.findById(req.user._id);
  user.wallet.balance += amount;
  user.wallet.history.push({ type: 'DEPOSIT', amount, note: 'Manual top-up' });
  await user.save();
  res.json({ balance: user.wallet.balance });
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ balance: user.wallet.balance, history: user.wallet.history.slice(-50) });
});

export default router;
