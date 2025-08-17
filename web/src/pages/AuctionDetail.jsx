// import { useEffect, useState, useCallback } from 'react';
// import { useParams } from 'react-router-dom';
// import api from '../api.js';
// import socket from '../socket.js';

// export default function AuctionDetail() {
//   const { id } = useParams();
//   const [auction, setAuction] = useState(null);
//   const [timeLeft, setTimeLeft] = useState('');
//   const [myPreviousBid, setMyPreviousBid] = useState(0);

//   const fetchAuction = useCallback(async () => {
//     const r = await api.get(`/auctions/${id}`);
//     setAuction(r.data);

//     // optional: fetch my previous bid
//     const prevBid = r.data.bids?.filter(b => b.bidder === 'myUserId'); // replace 'myUserId' with actual
//     setMyPreviousBid(prevBid.length ? prevBid[prevBid.length-1].amount : 0);
//   }, [id]);

//   // Countdown timer
//   useEffect(() => {
//     if (!auction) return;
//     const interval = setInterval(() => {
//       const now = new Date();
//       const end = new Date(auction.endsAt);
//       const diff = end - now;
//       if (diff <= 0) {
//         setTimeLeft('Ended');
//         clearInterval(interval);
//       } else {
//         const h = Math.floor(diff / (1000*60*60));
//         const m = Math.floor((diff % (1000*60*60)) / (1000*60));
//         const s = Math.floor((diff % (1000*60)) / 1000);
//         setTimeLeft(`${h}h ${m}m ${s}s`);
//       }
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [auction]);

//   // Socket listeners
//   useEffect(() => {
//     fetchAuction();

//     const handleBidUpdate = (data) => {
//       if (data.auctionId === id) {
//         setAuction(prev => prev ? {
//           ...prev,
//           currentBid: data.amount,
//           currentWinner: data.userName
//         } : prev);

//         // Update my previous bid if the current bid is mine
//         if (data.userId === 'myUserId') setMyPreviousBid(prev => prev || 0); // replace 'myUserId'
//       }
//     };

//     socket.on('bidUpdated', handleBidUpdate);
//     return () => socket.off('bidUpdated', handleBidUpdate);
//   }, [id, fetchAuction]);

//   if (!auction) return <div>Loading...</div>;

//   return (
//     <div className="auction-container">
//       <div className="auction-card">
//         <h2>{auction.title}</h2>
//         <div style={{ display: 'flex', gap: 5 }}>
//           {(auction.photos || []).map((p, i) => (
//             <img key={i} src={p} alt="" style={{ width: 180, height: 140, objectFit: 'cover' }}/>
//           ))}
//         </div>

//         <div>
//           <div>Category: {auction.category} {auction.perishable && '(Perishable)'}</div>
//           <div>Quantity: {auction.quantity}</div>
//           <div>Current Bid: ₹{auction.currentBid}</div>
//           <div>Winner: {auction.currentWinner || 'No bids yet'}</div>
//           <div>My Previous Bid: ₹{myPreviousBid}</div>
//           <div>Ends in: {timeLeft}</div>
//           <div>Status: {auction.status}</div>
//         </div>

//         {auction.status === 'CLOSED' && (
//           <div style={{ marginTop: 10, color: 'green' }}>
//             Auction Ended ✅<br/>
//             Winner: {auction.currentWinner || 'No winner'}<br/>
//             Winning Amount: ₹{auction.currentBid || 0}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api.js';
import socket from '../socket.js';

export default function AuctionDetail() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  const fetchAuction = useCallback(async () => {
    const r = await api.get(`/auctions/${id}`);
    setAuction(r.data);
  }, [id]);

  useEffect(() => {
    if (!auction) return;
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(auction.endsAt);
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft('Ended');
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  useEffect(() => {
    fetchAuction();

    const handleBidUpdate = (data) => {
      if (data.auctionId === id) {
        setAuction(prev => prev ? {
          ...prev,
          currentBid: data.amount,
          currentWinner: data.userName,
          myPreviousBid: data.myPreviousBid
        } : prev);
      }
    };

    const handleAuctionSettled = (data) => {
      if (data.auctionId === id) {
        setAuction(prev => prev ? {
          ...prev,
          status: 'CLOSED',
          currentBid: data.amount,
          currentWinner: data.winner
        } : prev);
      }
    };

    socket.on('bidUpdated', handleBidUpdate);
    socket.on('auction:settled', handleAuctionSettled);

    return () => {
      socket.off('bidUpdated', handleBidUpdate);
      socket.off('auction:settled', handleAuctionSettled);
    };
  }, [id, fetchAuction]);

  if (!auction) return <div>Loading...</div>;

  return (
    <div className="auction-container">
      <div className="auction-card">
        <h2>{auction.title}</h2>
        <div style={{ display: 'flex', gap: 5 }}>
          {(auction.photos || []).map((p, i) => (
            <img key={i} src={p} alt="" style={{ width: 180, height: 140, objectFit: 'cover' }}/>
          ))}
        </div>

        <div>
          <div>Category: {auction.category} {auction.perishable && '(Perishable)'}</div>
          <div>Quantity: {auction.quantity}</div>
          <div>Current Bid: ₹{auction.currentBid}</div>
          <div>Winner: {auction.currentWinner || 'No bids yet'}</div>
          <div>My Previous Bid: ₹{auction.myPreviousBid || 0}</div>
          <div>Ends in: {timeLeft}</div>
          <div>Status: {auction.status}</div>
        </div>

        {auction.status === 'CLOSED' && (
          <div style={{ marginTop: 10, color: 'green' }}>
            Auction Ended ✅<br/>
            Winner: {auction.currentWinner || 'No winner'}<br/>
            Winning Amount: ₹{auction.currentBid || 0}
          </div>
        )}
      </div>
    </div>
  );
}
