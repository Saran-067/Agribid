import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api.js';

export const register = createAsyncThunk('auth/register', async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
});
export const login = createAsyncThunk('auth/login', async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data;
});
export const me = createAsyncThunk('auth/me', async () => {
  const { data } = await api.get('/users/me');
  return data;
});

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem('token'), status:'idle', error:null },
  reducers: {
    logout(state){ state.user=null; state.token=null; localStorage.removeItem('token'); }
  },
  extraReducers: b => {
    b.addCase(register.fulfilled, (s,a)=>{ s.user=a.payload.user; s.token=a.payload.token; localStorage.setItem('token', a.payload.token); })
     .addCase(login.fulfilled, (s,a)=>{ s.user=a.payload.user; s.token=a.payload.token; localStorage.setItem('token', a.payload.token); })
     .addCase(me.fulfilled, (s,a)=>{ s.user=a.payload; });
  }
});

export const { logout } = slice.actions;
export default slice.reducer;
