import { Link } from 'react-router-dom';
export default function App(){
  return (
    <div className="container">
      <div className="grid cols-2">
        <div className="card">
          <h2>Welcome to 🌾 Farmer Auction</h2>
          <p>Bid on fresh produce and grains. Perishables enforce a 10 km radius for pickup to keep it fresh and fair.</p>
          <div className="hr"></div>
          <Link className="btn" to="/auctions">Browse Auctions</Link>
        </div>
        <div className="card">
          <h3>How it works</h3>
          <ul>
            <li>Top-up your wallet, then bid.</li>
            <li>Perishables: must be within 10 km of the farm.</li>
            <li>Grains & non-perishables: bid freely.</li>
            <li>1% fee goes to platform from winner payment.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
