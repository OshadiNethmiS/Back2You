import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Back2YouLandingPage from './Back2YouLandingPage';
import Home from './Home';
import Found from './Found';
import Register from './Register';
import Dashboard from './Dashboard';
import PostItem from './PostItem';
import PostFound from './PostFound';

import AdminDashboard from './AdminDashboard';
import { AuthProvider } from './checklogin';
import Login from './Login';
import ItemDetail from './ItemDetail';
import UserAcc from './UseAcc';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Back2YouLandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/found" element={<Found />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/post-item" element={<PostItem />} />
          <Route path="/post-item/:id" element={<PostItem />} />
          <Route path="/edit-item/:id" element={<PostItem />} />
          <Route path="/post-found" element={<PostFound />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/UserAcc" element={<UserAcc />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
