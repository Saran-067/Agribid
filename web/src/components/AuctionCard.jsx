import { useEffect, useState } from 'react';
import socket from '../socket.js';
import '../styles/components.css';

export default function AuctionCard({ a, onBid, myUserId }) {
  const img = a.photos?.[0] || 'https://via.placeholder.com/140x120?text=No+Image';
  const [auctionState, setAuctionState] = useState(a);
  const [timeLeft, setTimeLeft] = useState('');
  const [myPreviousBid, setMyPreviousBid] = useState(0);

  // Timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(auctionState.endsAt);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auctionState.endsAt]);

  // Track user's previous bid
  useEffect(() => {
    if (auctionState.bids?.length) {
      const myBids = auctionState.bids.filter(b => b.bidder === myUserId);
      setMyPreviousBid(myBids.length ? myBids[myBids.length - 1].amount : 0);
    }
  }, [auctionState.bids, myUserId]);

  // Socket listener for real-time updates
  useEffect(() => {
    const handleBidUpdate = (data) => {
      if (data.auctionId === auctionState._id) {
        setAuctionState(prev => ({
          ...prev,
          currentBid: data.amount,
          currentWinner: data.userName,
          bids: [...(prev.bids || []), { bidder: data.userId, amount: data.amount }]
        }));

        if (data.userId === myUserId) setMyPreviousBid(data.amount);
      }
    };

    const handleAuctionClosed = (data) => {
      if (data.auctionId === auctionState._id) {
        setAuctionState(prev => ({
          ...prev,
          status: 'CLOSED',
          currentWinner: data.winner || prev.currentWinner,
          currentBid: data.amount || prev.currentBid
        }));
      }
    };

    socket.on('bidUpdated', handleBidUpdate);
    socket.on('auction:settled', handleAuctionClosed);
    return () => {
      socket.off('bidUpdated', handleBidUpdate);
      socket.off('auction:settled', handleAuctionClosed);
    };
  }, [auctionState._id, myUserId]);

  return (
    <div className="card auction">
      <img src={img} alt={a.title} />
      <div className="meta">
        <div className="flex" style={{ justifyContent: 'space-between' }}>
          <h3>{auctionState.title}</h3>
          <span className="badge">{auctionState.category} {auctionState.perishable ? '• Perishable' : ''}</span>
        </div>
        <div className="small">Qty: {auctionState.quantity}</div>
        <div className="small">Ends in: {timeLeft}</div>
        <div className="small">Your Previous Bid: ₹ {myPreviousBid}</div>
        <div className="small">Winner: {auctionState.currentWinner || 'No bids yet'}</div>

        {/* Show bid option only if auction is OPEN */}
        {auctionState.status === 'OPEN' && onBid && (
          <div className="flex" style={{ justifyContent: 'space-between', marginTop: 8 }}>
            <div className="price">Current Bid: ₹ {auctionState.currentBid}</div>
            {onBid}
          </div>
        )}

        {/* Show auction ended info */}
        {auctionState.status !== 'OPEN' && (
          <div className="small" style={{ marginTop: 8, color: 'green' }}>
            Auction Ended ✅<br/>
            Winner: {auctionState.currentWinner || 'No winner'}<br/>
            Winning Amount: ₹{auctionState.currentBid || 0}
          </div>
        )}
      </div>
    </div>
  );
}
