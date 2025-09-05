import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api.js';

// Fetch auctions by status
export const fetchAuctions = createAsyncThunk('auctions/list', async (status) => {
  const { data } = await api.get('/auctions', { params: { status } });
  return data;
});

// Create new auction
export const createAuction = createAsyncThunk('auctions/create', async (form) => {
  const fd = { ...form, base64Photos: form.base64Photos };
  const { data } = await api.post('/auctions', fd);
  return data;
});

// Place bid
export const bidAuction = createAsyncThunk('auctions/bid', async ({ id, amount }) => {
  const { data } = await api.post(`/auctions/${id}/bid`, { amount });
  return { 
    id, 
    currentBid: data.currentBid, 
    currentWinner: data.currentWinner, 
    myPreviousBid: data.myPreviousBid 
  };
});

// Confirm Delivery (buyer + farmer)
export const confirmDelivery = createAsyncThunk('auctions/confirmDelivery', async (id) => {
  const { data } = await api.post(`/auctions/${id}/confirm-delivery`);
  return { id, deliveryStatus: data.deliveryStatus };
});

const slice = createSlice({
  name: 'auctions',
  initialState: { items: [], selected: null },
  reducers: {
    setSelected(state, action) {
      state.selected = action.payload;
    },
    // Update bid from socket
    updateBid(state, action) {
      const idx = state.items.findIndex(i => i._id === action.payload.auctionId);
      if (idx >= 0) {
        state.items[idx].currentBid = action.payload.amount;
        state.items[idx].currentWinner = action.payload.userName;
        state.items[idx].myPreviousBid = action.payload.myPreviousBid || 0;
      }
      if (state.selected?._id === action.payload.auctionId) {
        state.selected.currentBid = action.payload.amount;
        state.selected.currentWinner = action.payload.userName;
        state.selected.myPreviousBid = action.payload.myPreviousBid || 0;
      }
    },
    // Handle auction settled
    settleAuction(state, action) {
      const idx = state.items.findIndex(i => i._id === action.payload.auctionId);
      if (idx >= 0) {
        state.items[idx].status = 'CLOSED';
        state.items[idx].currentWinner = action.payload.winner;
        state.items[idx].currentBid = action.payload.amount;
      }
      if (state.selected?._id === action.payload.auctionId) {
        state.selected.status = 'CLOSED';
        state.selected.currentWinner = action.payload.winner;
        state.selected.currentBid = action.payload.amount;
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAuctions.fulfilled, (state, action) => { 
        state.items = action.payload; 
      })
      .addCase(createAuction.fulfilled, (state, action) => { 
        state.items.unshift(action.payload); 
      })
      .addCase(bidAuction.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i._id === action.payload.id);
        if (idx >= 0) {
          state.items[idx].currentBid = action.payload.currentBid;
          state.items[idx].currentWinner = action.payload.currentWinner;
          state.items[idx].myPreviousBid = action.payload.myPreviousBid;
        }
        if (state.selected?._id === action.payload.id) {
          state.selected.currentBid = action.payload.currentBid;
          state.selected.currentWinner = action.payload.currentWinner;
          state.selected.myPreviousBid = action.payload.myPreviousBid;
        }
      })
      // ✅ handle delivery confirmation
      .addCase(confirmDelivery.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i._id === action.payload.id);
        if (idx >= 0) {
          state.items[idx].deliveryStatus = action.payload.deliveryStatus;
        }
        if (state.selected?._id === action.payload.id) {
          state.selected.deliveryStatus = action.payload.deliveryStatus;
        }
      });
  }
});

export const { setSelected, updateBid, settleAuction } = slice.actions;
export default slice.reducer;
