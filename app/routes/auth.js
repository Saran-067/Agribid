import express from 'express';
import jwt from 'jsonwebtoken';
import geoip from 'geoip-lite';
import User from '../models/User.js';

const router = express.Router();

const sign = (u) =>
  jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, location, favorites } = req.body;
  //  console.log("Registering user:", req.body);
    let lat = location?.lat;
    let lng = location?.lng;
     if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) return res.status(400).json({ message: 'Admin already exists' });
    }

    // If location not provided, try from IP
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      const ip =
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.connection.remoteAddress ||
        '';
      const geo = geoip.lookup(ip);
      if (geo) {
        lat = geo.ll[0];
        lng = geo.ll[1];
      }
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res
        .status(400)
        .json({ message: 'Unable to determine location' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      location: { lat, lng },
      favorites: favorites || [],
    });

    const token = sign(user);
    res.json({ token, user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // console.log(user);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
   
    // console.error('Error logging in:', req.body);
    const ok = await user.comparePassword(password);
    if (!ok)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = sign(user);
    res.json({ token, user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
