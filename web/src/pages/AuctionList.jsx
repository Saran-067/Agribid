import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuctions, bidAuction } from '../features/auctionSlice.js';
import AuctionCard from '../components/AuctionCard.jsx';
import { getWallet } from '../features/walletSlice.js';

export default function AuctionList(){
  const [status,setStatus]=useState('OPEN');
  const dispatch = useDispatch();
  const { items } = useSelector(s=>s.auctions);
  const { balance } = useSelector(s=>s.wallet);
  const { user } = useSelector(s=>s.auth);

  useEffect(()=>{ dispatch(fetchAuctions(status)); if(user) dispatch(getWallet()); },[status, dispatch, user]);

  return (
    <div className="container">
      <div className="flex" style={{justifyContent:'space-between'}}>
        <h2>Auctions</h2>
        <div className="flex">
          <select value={status} onChange={e=>setStatus(e.target.value)}>
            <option>OPEN</option><option>CLOSED</option>
          </select>
        </div>
      </div>
      <div className="grid cols-3">
        {items.map(a=>(
          <AuctionCard key={a._id} a={a} onBid={
            user?.role==='buyer' ? (
              <form onSubmit={(e)=>{ e.preventDefault(); const amt = Number(e.target.amount.value); dispatch(bidAuction({ id:a._id, amount: amt })); }}>
                <input name="amount" type="number" placeholder="Your bid"/>
                <div className="small">Your balance: ₹{balance}</div>
                <button className="btn">Bid</button>
              </form>
            ) : null
          }/>
        ))}
      </div>
    </div>
  );
}
