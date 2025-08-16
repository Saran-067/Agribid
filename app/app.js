import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { configCloudinary } from './config/cloudinary.js';
import authRoutes from './routes/auth.js';
import auctionsRoutes from './routes/auction.js';
import walletRoutes from './routes/wallet.js';
import usersRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import { notFound, errorHandler } from './middleware/error.js';
import User from './models/User.js';
import Auction from './models/Auction.js';
import bcrypt from 'bcryptjs';
import { initIO, getIO } from './utils/socket.js';
import { calcFee } from './utils/settlement.js';

const app = express();
const httpServer = createServer(app);

// Socket.io
const io = initIO(httpServer);

// Middleware
app.use(express.json({ limit: '10mb' }));
// app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Cloudinary
configCloudinary();

// Routes
app.get('/', (_, res) => res.send('Farmer Auction API running'));
app.use('/api/auth', authRoutes);

// Inject io into auction routes
app.use('/api/auctions', (req, res, next) => {
  req.io = io;
  next();
}, auctionsRoutes);

app.use('/api/wallet', walletRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);

// Auction auto-close scheduler: runs every minute
setInterval(async () => {
  try {
    const now = new Date();
    const expiredAuctions = await Auction.find({ status: 'OPEN', endsAt: { $lte: now } });
    if(!expiredAuctions.length){ console.log('No expired auctions to close'); return; }
    else{
      console.log(`Closing ${expiredAuctions.length} expired auctions`);
    }
    for (const auction of expiredAuctions) {
      auction.status = 'CLOSED';
      let winnerName = null;
      const amount = auction.currentBid;

      if (auction.currentWinner) {
        const winner = await User.findById(auction.currentWinner);
        winnerName = winner.name;
        const farmer = await User.findById(auction.farmer);
        const admin = await User.findOne({ role: 'admin' });

        if (winner.wallet.balance >= amount) {
          winner.wallet.balance -= amount;
          winner.wallet.history.push({ type: 'WITHDRAW', amount, note: `Payment for auction ${auction._id}` });

          const { fee, netToFarmer } = calcFee(amount, Number(process.env.PLATFORM_FEE_PERCENT || 1));

          if (admin) {
            admin.wallet.balance += fee;
            admin.wallet.history.push({ type: 'FEE', amount: fee, note: `Fee from auction ${auction._id}` });
          }

          farmer.wallet.balance += netToFarmer;
          farmer.wallet.history.push({ type: 'EARN', amount: netToFarmer, note: `Winning proceeds from auction ${auction._id}` });

          await Promise.all([winner.save(), farmer.save(), admin?.save()]);
        } else {
          // Notify insufficient balance
          await Notification.create({
            user: auction.currentWinner,
            title: 'Payment Failed',
            body: `Insufficient balance to pay for auction ${auction.title}`
          });
        }
      }

      await auction.save();

      // Emit socket update
      io.emit('auction:settled', {
        auctionId: auction._id.toString(),
        winner: winnerName,
        amount: auction.currentBid
      });

      console.log(`Closed auction ${auction._id}, winner: ${winnerName || 'No bids'}`);
    }
  } catch (err) {
    console.error('Error auto-closing auctions:', err);
  }
}, 5 * 60 * 1000); // every 5 minutes

// Error handlers
app.use(notFound);
app.use(errorHandler);







// Start server
const port = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI).then(async () => {
  
  httpServer.listen(port, () => console.log(`🚀 Server running on port ${port}`));
});
