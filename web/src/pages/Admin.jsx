import { useEffect, useState } from 'react';
import api from '../api';

export default function Admin(){
  const [users,setUsers]=useState([]); const [auctions,setAuctions]=useState([]);
  useEffect(()=>{
    api.get('/admin/users').then(r=>setUsers(r.data));
    api.get('/admin/auctions').then(r=>setAuctions(r.data));
  },[]);
  return (
    <div className="container">
      <div className="grid cols-2">
        <div className="card">
          <h2>Users (read-only)</h2>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Wallet</th></tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u._id}>
                  <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>₹{u.wallet?.balance||0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>Auctions (read-only)</h2>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead><tr><th>Title</th><th>Cat</th><th>Status</th><th>Ends</th><th>Current Bid</th></tr></thead>
            <tbody>
              {auctions.map(a=>(
                <tr key={a._id}>
                  <td>{a.title}</td><td>{a.category}</td><td>{a.status}</td><td>{new Date(a.endsAt).toLocaleString()}</td><td>₹{a.currentBid}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="hr"></div>
          <button className="btn" onClick={()=>api.post('/auctions/close-expired').then(()=>alert('Settlement run'))}>Run Settlement</button>
        </div>
      </div>
    </div>
  );
}
