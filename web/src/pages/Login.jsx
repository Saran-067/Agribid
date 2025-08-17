import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/authSlice.js';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const dispatch = useDispatch(); const nav = useNavigate();
  const submit = async e => {
    e.preventDefault();
    const r = await dispatch(login({ email, password }));
    if(!r.error) nav('/');
  };
  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={submit}>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
          <button className="btn">Login</button>
        </form>
      </div>
    </div>
  )
}
