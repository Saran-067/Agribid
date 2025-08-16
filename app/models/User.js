import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const WalletSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 }, // in currency units
  history: [{
    type: { type: String, enum: ['DEPOSIT','WITHDRAW','FEE','EARN','REFUND'], required: true },
    amount: { type: Number, required: true },
    note: String,
    at: { type: Date, default: Date.now }
  }]
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, index: true, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer','buyer','admin'], default: 'buyer' },
  // location for distance calculations
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String
  },
  favorites: [String], // keywords/categories user likes
  wallet: { type: WalletSchema, default: () => ({}) }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if(!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function(pw) {
  return bcrypt.compare(pw, this.password);
};

export default mongoose.model('User', UserSchema);
