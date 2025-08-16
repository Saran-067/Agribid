import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWallet, deposit } from '../features/walletSlice.js';

export default function Wallet(){
  const dispatch=useDispatch();
  const { balance, history } = useSelector(s=>s.wallet);
  const [amt,setAmt]=useState('');
  useEffect(()=>{ dispatch(getWallet()); },[dispatch]);
  const topup = async e => {
    e.preventDefault();
    const r = await dispatch(deposit(Number(amt)));
    if(!r.error) setAmt('');
  };
  return (
    <div className="container">
      <div className="card">
        <h2>Wallet</h2>
        <div className="flex" style={{justifyContent:'space-between'}}>
          <div>Balance: <strong>₹{balance}</strong></div>
          <form onSubmit={topup} className="flex">
            <input type="number" placeholder="Amount" value={amt} onChange={e=>setAmt(e.target.value)}/>
            <button className="btn">Deposit</button>
          </form>
        </div>
        <div className="hr"></div>
        <h3>Recent Activity</h3>
        <ul>
          {history.map((h,i)=><li key={i} className="small">{new Date(h.at).toLocaleString()} – {h.type} ₹{h.amount} – {h.note||''}</li>)}
        </ul>
      </div>
    </div>
  );
}
