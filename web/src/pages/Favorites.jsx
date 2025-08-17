import { useEffect, useState } from 'react';
import api from '../api.js';

export default function Favorites(){
  const [favorites,setFavorites]=useState('');
  const [notes,setNotes]=useState([]);
  useEffect(()=>{
    api.get('/users/me').then(r=>setFavorites((r.data.favorites||[]).join(', ')));
    api.get('/users/notifications').then(r=>setNotes(r.data));
  },[]);
  const save=async e=>{
    e.preventDefault();
    const arr = favorites.split(',').map(s=>s.trim()).filter(Boolean);
    await api.post('/users/favorites', { favorites: arr });
    alert('Saved');
  };
  return (
    <div className="container">
      <div className="card">
        <h2>Favorites & Notifications</h2>
        <form onSubmit={save}>
          <input value={favorites} onChange={e=>setFavorites(e.target.value)} placeholder="Add keywords/categories"/>
          <button className="btn">Save Favorites</button>
        </form>
        <div className="hr"></div>
        <h3>Notifications</h3>
        <ul>
          {notes.map(n=> <li key={n._id}><strong>{n.title}</strong> – {n.body} <span className="small">({new Date(n.createdAt).toLocaleString()})</span></li>)}
        </ul>
      </div>
    </div>
  );
}
