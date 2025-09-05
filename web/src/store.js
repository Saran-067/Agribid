import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice.js';
import auctionReducer from './features/auctionSlice.js';
import walletReducer from './features/walletSlice.js';
import notificationReducer from './features/notificationSlice.js';
// import chatSliceReducer   from './features/chatMessageSlice.js'
// import ChatMessage from '../../app/models/ChatMessage.js';
// import chatReducer from './features/chatSlice.js'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    auctions: auctionReducer,
    wallet: walletReducer,
    notifications: notificationReducer
    // chat: chatReducer
  }
});
