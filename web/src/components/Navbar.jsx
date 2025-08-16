import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice.js';
// import '.'; // optional if you split
export default function Navbar(){
  const { user } = useSelector(s=>s.auth);
  const dispatch = useDispatch();
  const nav = useNavigate();
  return (
    <div className="nav">
      <div className="nav-inner container">
        <div className="flex">
          <NavLink to="/">🌾 Farmer Auction</NavLink>
        </div>
        <div className="flex right">
          <NavLink to="/auctions">Auctions</NavLink>
          {user?.role==='farmer' && <NavLink to="/create">Create</NavLink>}
          <NavLink to="/wallet">Wallet</NavLink>
          <NavLink to="/favorites">Favorites</NavLink>
          {user?.role==='admin' && <NavLink to="/admin">Admin</NavLink>}
          {!user ? (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          ) : (
            <a href="#" onClick={()=>{ dispatch(logout()); nav('/'); }}>Logout</a>
          )}
        </div>
      </div>
    </div>
  );
}
