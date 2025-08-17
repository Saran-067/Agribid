import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api.js';

export const fetchNotifications = createAsyncThunk('notifications/list', async (page=1) => {
  const { data } = await api.get('/users/notifications', { params: { page }});
  return data;
});

const slice = createSlice({
  name: 'notifications',
  initialState: { items: [] },
  reducers: {},
  extraReducers: b => { b.addCase(fetchNotifications.fulfilled, (s,a)=>{ s.items = a.payload; }); }
});
export default slice.reducer;

