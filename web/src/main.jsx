import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store.js'
import './styles/global.css'
import Navbar from './components/Navbar.jsx'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AuctionCreate from './pages/AuctionCreate.jsx'
import AuctionList from './pages/AuctionList.jsx'
import AuctionDetail from './pages/AuctionDetail.jsx'
import Wallet from './pages/Wallet.jsx'
import Favorites from './pages/Favorites.jsx'
import Admin from './pages/Admin.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<App/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/auctions" element={<AuctionList/>}/>
        <Route path="/auction/:id" element={<AuctionDetail/>}/>
        <Route path="/wallet" element={<ProtectedRoute><Wallet/></ProtectedRoute>}/>
        <Route path="/favorites" element={<ProtectedRoute><Favorites/></ProtectedRoute>}/>
        <Route path="/create" element={<ProtectedRoute roles={['farmer']}><AuctionCreate/></ProtectedRoute>}/>
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin/></ProtectedRoute>}/>
        <Route path="*" element={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
  </Provider>
)
