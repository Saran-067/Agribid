import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema({
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  at: { type: Date, default: Date.now }
}, { _id: false });

const AuctionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'vegetable', 'fruit', 'grain'
  perishable: { type: Boolean, default: false }, // vegetables/fruits or expiring within a day
  quantity: { type: String, required: true }, // e.g., "50 kg"
  photos: [String], // cloudinary URLs
  // location equals farmer land location
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String
  },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startingPrice: { type: Number, required: true },
  currentBid: { type: Number, default: 0 },
  currentWinner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bids: [BidSchema],
  status: { type: String, enum: ['OPEN','CLOSED'], default: 'OPEN' },
  endsAt: { type: Date, required: true },

  // 🔹 New delivery tracking field
  deliveryStatus: {
    farmerConfirmed: { type: Boolean, default: false },
    buyerConfirmed: { type: Boolean, default: false },
    finalPaymentDone: { type: Boolean, default: false },
    advanceAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 }
  }

}, { timestamps: true });

export default mongoose.model('Auction', AuctionSchema);
