import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api.js';

export const getWallet = createAsyncThunk('wallet/me', async ()=> {
  const { data } = await api.get('/wallet/me');
  return data;
});
export const deposit = createAsyncThunk('wallet/deposit', async (amount)=> {
  const { data } = await api.post('/wallet/deposit', { amount });
  return data;
});

const slice = createSlice({
  name:'wallet',
  initialState: { balance: 0, history: [] },
  reducers: {},
  extraReducers: b => {
    b.addCase(getWallet.fulfilled, (s,a)=>{ s.balance=a.payload.balance; s.history=a.payload.history; })
     .addCase(deposit.fulfilled, (s,a)=>{ s.balance=a.payload.balance; });
  }
});
export default slice.reducer;
