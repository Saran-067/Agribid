import express from 'express';
import multer from 'multer';
import { cloudinary } from '../config/cloudinary.js';
import { auth } from '../middleware/auth.js';
import { permit } from '../middleware/roles.js';
import Auction from '../models/Auction.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { haversineKm } from '../utils/distance.js';
import { calcFee, isPerishableCategory } from '../utils/settlement.js';

// ✅ Added: get io instance
import { getIO } from '../utils/socket.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });
const router = express.Router();

router.post('/', auth, permit('farmer'), upload.array('photos', 4), async (req, res) => {
  const { title, category, quantity, startingPrice, endsAt } = req.body;
  if (!title || !category || !quantity || !startingPrice || !endsAt)
    return res.status(400).json({ message: 'Missing fields' });

  // upload images to cloudinary
  let photos = [];
  for (const f of req.files || []) {
    const up = await cloudinary.uploader.upload_stream({ folder: 'farmer-auction' }, ()=>{});
    // Workaround: convert buffer to base64 and upload with upload API (simpler):
  }
  // simpler: accept base64 strings instead of multipart when deploying on Render
  if (!req.files || req.files.length === 0) {
    const base64s = req.body.base64Photos || '[]';
    for (const b64 of base64s) {
      const { secure_url } = await cloudinary.uploader.upload(b64, { folder: 'farmer-auction' });
      photos.push(secure_url);
    }
  } else {
    // Fallback: for multer buffers, use promise wrapper
    const uploads = await Promise.all(req.files.map(f =>
      cloudinary.uploader.upload(`data:${f.mimetype};base64,${f.buffer.toString('base64')}`, { folder: 'farmer-auction' })
    ));
    photos = uploads.map(u => u.secure_url);
  }

  // perishable logic: category or 1-day expiry
  const perishable = isPerishableCategory(category) ||
    (new Date(endsAt).getTime() - Date.now() <= 24*60*60*1000);

  const farmer = await User.findById(req.user._id);
  const auction = await Auction.create({
    title, category, perishable, quantity, photos,
    location: farmer.location,
    farmer: farmer._id,
    startingPrice: Number(startingPrice),
    currentBid: Number(startingPrice),
    endsAt: new Date(endsAt)
  });

  // Notify buyers who favorited this category/title keyword
  const buyers = await User.find({ role: 'buyer', favorites: { $in: [category, title] } }).select('_id');
  const notes = buyers.map(b => ({
    user: b._id,
    title: 'New Auction',
    body: `${title} is now live in ${category}`
  }));
  if (notes.length) await Notification.insertMany(notes);

  res.json(auction);
});

// List auctions (all)
router.post('/:id/bid', auth, permit('buyer'), async (req, res) => {
  const { amount } = req.body;
  const a = await Auction.findById(req.params.id);

  if (!a || a.status !== 'OPEN') 
    return res.status(400).json({ message: 'Auction closed or invalid' });
  
  if (a.endsAt <= new Date()) 
    return res.status(400).json({ message: 'Auction already ended' });

  const bidAmount = Number(amount);
  if (bidAmount <= a.currentBid) 
    return res.status(400).json({ message: 'Bid must be higher than current bid' });

  const me = await User.findById(req.user._id);
  if (me.wallet.balance < bidAmount) 
    return res.status(400).json({ message: 'Insufficient wallet balance' });

  if (a.perishable) {
    const km = haversineKm(me.location.lat, me.location.lng, a.location.lat, a.location.lng);
    if (km > 10) return res.status(400).json({ message: 'Must be within 10 km for this auction' });
  }

  // ✅ Previous bid BEFORE adding current
  const previousBid = a.bids.filter(b => b.bidder.toString() === me._id.toString());
  const myPreviousBid = previousBid.length > 0 ? previousBid[previousBid.length - 1].amount : 0;

  // Update auction
  a.currentBid = bidAmount;
  a.currentWinner = me._id;
  a.bids.push({ bidder: me._id, amount: bidAmount });
  await a.save();

  // Real-time emit
  getIO().emit('bidUpdated', {
    auctionId: a._id.toString(),
    amount: bidAmount,
    userId: me._id.toString(),
    userName: me.name,
    myPreviousBid
  });

  res.json({ 
    currentBid: a.currentBid, 
    currentWinner: me.name,
    myPreviousBid
  });
  console.log(a.currentBid, me.name, myPreviousBid);
});




// 2. Get auction detail
router.get('/:id', async (req, res) => {
  const a = await Auction.findById(req.params.id).populate('farmer', 'name location');
  if (!a) return res.status(404).json({ message: 'Not found' });
  res.json(a);
});

// 3. List auctions
router.get('/', async (req, res) => {
  const { status } = req.query;
  const q = {};
  if (status) q.status = status.toUpperCase();
  const auctions = await Auction.find(q).sort({ createdAt: -1 }).limit(100);
  res.json(auctions);
});

// 4. Close expired auctions
router.post('/close/:id', async (req, res) => {
  try {
    const a = await Auction.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Auction not found' });
    if (a.status !== 'OPEN') return res.status(400).json({ message: 'Auction already closed' });

    a.status = 'CLOSED';
    let winnerName = null;
    const amount = a.currentBid;

    if (a.currentWinner) {
      const winner = await User.findById(a.currentWinner);
      winnerName = winner.name;
      const farmer = await User.findById(a.farmer);
      const admin = await User.findOne({ role: 'admin' });

      const advance = amount * 0.5;
      const finalAmount = amount * 0.5;

      if (winner.wallet.balance >= advance) {
        // Deduct 50% from winner
        winner.wallet.balance -= advance;
        winner.wallet.history.push({
          type: 'WITHDRAW',
          amount: advance,
          note: `50% advance for auction ${a._id}`
        });

        // Calculate platform fee
        const { fee, netToFarmer } = calcFee(
          advance,
          Number(process.env.PLATFORM_FEE_PERCENT || 1)
        );

        // Add fee to admin
        if (admin) {
          admin.wallet.balance += fee;
          admin.wallet.history.push({
            type: 'FEE',
            amount: fee,
            note: `50% fee from auction ${a._id}`
          });
        }

        // Add 50% to farmer
        farmer.wallet.balance += netToFarmer;
        farmer.wallet.history.push({
          type: 'EARN',
          amount: netToFarmer,
          note: `50% advance proceeds from auction ${a._id}`
        });

        // Store delivery status
        a.deliveryStatus = {
          farmerConfirmed: false,
          buyerConfirmed: false,
          finalPaymentDone: false,
          advanceAmount: advance,
          finalAmount: finalAmount
        };

        await Promise.all([winner.save(), farmer.save(), admin?.save(), a.save()]);
      } else {
        await Notification.create({
          user: a.currentWinner,
          title: 'Payment Failed',
          body: `Insufficient balance to pay for auction ${a.title}`
        });
      }
    } else {
      await a.save();
    }

    getIO().emit('auction:settled', {
      auctionId: a._id.toString(),
      winner: winnerName,
      amount: a.currentBid
    });

    res.json({ winner: winnerName, amount: a.currentBid, status: 'CLOSED' });
  } catch (err) {
    console.error('Error closing auction:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Confirm Delivery → release final 50%
 */
// Confirm delivery route
router.post('/:id/confirm-delivery',auth, async (req, res) => {
  const userId = req.user._id; // from JWT auth middleware  
  console.log('Confirm delivery by user:', req.user.role);
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('currentWinner')
      .populate('farmer');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    const userId = req.id; // from JWT auth middleware

    // Farmer confirms
    if (auction.farmer._id.equals(userId)) {
      auction.deliveryStatus.farmerConfirmed = true;
    }
    // Buyer confirms
    if (auction.currentWinner._id.equals(userId)) {
      auction.deliveryStatus.buyerConfirmed = true;
    }

    // If both confirmed and final not yet paid
    if (
      auction.deliveryStatus.farmerConfirmed &&
      auction.deliveryStatus.buyerConfirmed &&
      !auction.deliveryStatus.finalPaymentDone
    ) {
      const winner = await User.findById(auction.currentWinner._id);
      const farmer = await User.findById(auction.farmer._id);
      const admin = await User.findOne({ role: 'admin' });

      const finalAmount = auction.deliveryStatus.finalAmount;

      console.log('Processing final payment of', finalAmount, 'from', winner.name);
      if (winner.wallet.balance >= finalAmount) {
        // Deduct final 50% from buyer
        winner.wallet.balance -= finalAmount;
        winner.wallet.history.push({
          type: 'WITHDRAW',
          amount: finalAmount,
          note: `Final 50% payment for auction ${auction._id}`
        });

        // Calculate fee on final part
        const { fee, netToFarmer } = calcFee(
          finalAmount,
          Number(process.env.PLATFORM_FEE_PERCENT || 1)
        );
       console.log('Platform fee:', fee, 'Net to farmer:', netToFarmer);
        if (admin) {
          admin.wallet.balance += fee;
          admin.wallet.history.push({
            type: 'FEE',
            amount: fee,
            note: `Final fee from auction ${auction._id}`
          });
        }

        farmer.wallet.balance += netToFarmer;
        farmer.wallet.history.push({
          type: 'EARN',
          amount: netToFarmer,
          note: `Final proceeds from auction ${auction._id}`
        });

        auction.deliveryStatus.finalPaymentDone = true;

        await Promise.all([winner.save(), farmer.save(), admin?.save()]);
      }
    }

    await auction.save();
    res.json({
      message: 'Delivery confirmation updated',
      deliveryStatus: auction.deliveryStatus
    });
  } catch (err) {
    console.error('Error confirming delivery:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



export default router;
