import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../features/authSlice.js';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [favorites, setFavorites] = useState('');

  const dispatch = useDispatch();
  const nav = useNavigate();

  // Automatically get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        error => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const submit = async e => {
    e.preventDefault();
    const payload = {
      name,
      email,
      password,
      role,
      location: { lat: Number(lat), lng: Number(lng), address: '' },
      favorites: favorites.split(',').map(s => s.trim()).filter(Boolean)
    };
    const r = await dispatch(register(payload));
    if (!r.error) nav('/');
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Register</h2>
        <form onSubmit={submit} className="grid cols-2">
          <div><input placeholder="Name" value={name} onChange={e => setName(e.target.value)} /></div>
          <div><input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /></div>
          <div>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="buyer">Buyer</option>
              <option value="farmer">Farmer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div><input placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} readOnly /></div>
          <div><input placeholder="Longitude" value={lng} onChange={e => setLng(e.target.value)} readOnly /></div>
          <div className="grid cols-1" style={{ gridColumn: '1/-1' }}>
            <input placeholder="Favorites (comma separated)" value={favorites} onChange={e => setFavorites(e.target.value)} />
          </div>
          <div><button className="btn">Create Account</button></div>
        </form>
      </div>
    </div>
  );
}
