import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './checklogin';
import { Mail, Lock, Eye, EyeOff, HelpCircle, ArrowRight } from 'lucide-react';
import adminPreview from './images/admin_preview.jpg';
import './AdminLogin.css';
import log from './images/Logo.png';
import { API_BASE } from './config';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('adminName', data.user.name);
      setUser(data.user);
      
      const redirectTo = location.state?.from || '/admin';
      navigate(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-root">
      {/* Left Panel */}
      <div className="al-left-panel">
        <div className="al-logo-container">

            
          </div>
         {/*Logo */}
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div className="home-nav-logo-box">
                   
                     <div>
                         <img src={log} alt="Back2You Logo" style={{ width: '30px', height: 'auto' }} />
                         {/* rest of your page */}
                       </div>
                   </div>
                   <span style={{ fontFamily: 'Times New Roman' , fontSize: '27px', fontWeight: '700', color: 'white', letterSpacing: '-0.02em' }}>
                          Back<span style={{ color: 'gold' }}>2</span>You
                        </span> 
                 </div>
        </div>

        <div className="al-illustration-container">
          <img src={adminPreview} alt="Campus community lost & found overview illustration" className="al-preview-img" />
          
          {/* Floating UI Chips */}
          <div className="al-chip al-chip-matches">
            <span className="al-chip-dot blue"></span>
            <span>Matches</span>
          </div>
          <div className="al-chip al-chip-notifications">
            <span className="al-chip-dot red"></span>
            <span>Notifications</span>
          </div>
          <div className="al-chip al-chip-overview">
            <span className="al-chip-dot green"></span>
            <span>Dashboard Overview</span>
          </div>
        </div>

        <div className="al-left-text-container">
          <h2 className="al-left-heading">University Admin Hub</h2>
          <p className="al-left-subtext">
            Streamline the connection between lost valuables and their owners across the entire campus ecosystem.
          </p>
        </div>
   

      {/* Right Panel */}
      <div className="al-right-panel">
        <div className="al-form-container">
          <div className="al-form-header">
            <h1 className="al-right-heading">Welcome Back</h1>
            <p className="al-right-subtext">Please enter your administrative credentials to continue.</p>
          </div>

          {error && <div className="al-error-box">{error}</div>}

          <form onSubmit={handleLogin} className="al-form">
            <div className="al-input-group">
              <label htmlFor="email">Admin Email</label>
              <div className="al-input-wrapper">
                <Mail className="al-input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="al-input-group">
              <div className="al-password-label-row">
                <label htmlFor="password">Password</label>
                <a href="#forgot" className="al-forgot-link" onClick={(e) => { e.preventDefault(); alert("Please contact IT Support to reset password."); }}>
                  Forgot password?
                </a>
              </div>
              <div className="al-input-wrapper">
                <Lock className="al-input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="al-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="al-checkbox-row">
              <label className="al-checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="al-checkmark"></span>
                <span className="al-checkbox-label">Remember this device for 30 days</span>
              </label>
            </div>

            <button type="submit" className="al-submit-btn" disabled={loading}>
              <span>{loading ? 'Authenticating...' : 'Secure Login'}</span>
              <ArrowRight size={18} className="al-btn-arrow" />
            </button>
          </form>

          <div className="al-divider"></div>

          <div className="al-footer">
            <div className="al-trouble-row">
              <HelpCircle size={16} className="al-help-icon" />
              <span>Having trouble logging in? <a href="#support" className="al-support-link" onClick={(e) => { e.preventDefault(); alert("Contact IT Support at support@university.edu"); }}>Contact IT Support</a></span>
            </div>
            <div className="al-footer-links">
              <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              <span className="al-footer-bullet">•</span>
              <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
              <span className="al-footer-bullet">•</span>
              <span className="al-copyright">© 2024 University Admin Portal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
