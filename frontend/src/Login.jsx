import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './checklogin';
import log from './images/Logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user.name);
      setUser(data.user);
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#F8FAFC',
    }}>

      {/* ===== LEFT PANEL ===== */}
      <div style={{
        width: '45%',
        backgroundColor: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 36px',
      }}>
        {/* Image */}
        <div style={{
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '32px',
          position: 'relative',
        }}>
          <img
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop"
            alt="Campus community"
            style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block', filter: 'brightness(0.8)' }}
          />
          <div style={{
            position: 'absolute',
            bottom: '14px',
            left: '14px',
            backgroundColor: '#F59E0B',
            color: '#0F172A',
            fontSize: '11px',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '6px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            SLIATE Network
          </div>
        </div>

        <h2 style={{
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: '700',
          textAlign: 'center',
          margin: '0 0 12px 0',
          lineHeight: '1.4',
        }}>
          Reconnect with What Matters
        </h2>
        <p style={{
          color: '#94a3b8',
          textAlign: 'center',
          maxWidth: '280px',
          lineHeight: '1.65',
          fontSize: '13px',
          margin: '0 0 28px 0',
        }}>
          Back2You helps SLIATE students reunite with their lost belongings through a secure, trusted campus network.
        </p>

        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#334155' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#334155' }} />
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div style={{
        width: '60%',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '35px 32px',
      }}>

        {/* WHITE CARD */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '60px 90px',
          width: '100%',
          maxWidth: '650px',
          boxShadow: '0 4px 24px rgba(15,23,42,0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>

                  {/* Logo */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' , paddingBottom: '40px' }}>
                            <div className="home-nav-logo-box">
                            
                              <div>
                                  <img src={log} alt="Back2You Logo" style={{ width: '30px', height: 'auto' }} />
                                  {/* rest of your page */}
                                </div>
                            </div>
                  <div style={{
                    fontFamily: 'Georgia',
                    fontSize: '25px',
                    fontWeight:'bold',
                    color:'#0F172A',
                    letterSpacing: '-0.3px',
                    paddingBottom: '10px',
                }} >   
                    <span style={{ fontFamily: 'Times New Roman' , fontSize: '27px', fontWeight: '700', color: '#0F172A ', letterSpacing: '-0.02em' }}>
                           Back<span style={{ color: 'gold' }}>2</span>You
                         </span> 
                  </div>
                  </div>

          {/* Login / Register Toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            borderRadius: '30px',
            padding: '4px',
            marginBottom: '30px',
            width: '100%',
            maxWidth: '380px',
          }}>
            <button
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '26px',
                border: 'none',
                backgroundColor: '#0F172A',
                color: '#ffffff',
                fontWeight: '600',
                cursor: 'default',
                fontSize: '14px',
              }}
            >
              Login
            </button>
            <Link to="/register" style={{ flex: 1, textDecoration: 'none' }}>
              <button style={{
                width: '100%',
                padding: '10px',
                borderRadius: '26px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
              }}>
                Register
              </button>
            </Link>
          </div>

          <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#94a3b8', margin: '0 0 28px 0', fontSize: '14px' }}>
            Log in with your University Student ID
          </p>

          {/* Location state warning */}
          {location.state?.message && (
            <div style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '10px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              width: '100%',
              maxWidth: '380px',
              border: '1px solid #fcd34d',
            }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
             {location.state.message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '10px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              width: '100%',
              maxWidth: '380px',
              border: '1px solid #fecaca',
            }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
             {error}
            </div>
          )}

          {/* Email */}
          <div style={{ width: '100%', maxWidth: '380px', marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              color: '#334155',
              fontSize: '11px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              University Email
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8'
              }}>
               <i className="fa-regular fa-envelope"></i>
              </span>
              <input
                type="email"
                placeholder="your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                 autoComplete="off"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '10px',
                  border: '1.5px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ width: '100%', maxWidth: '380px', marginBottom: '8px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              color: '#334155',
              fontSize: '11px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8'
              }}>
                <i className="fa-solid fa-eye-slash"></i>
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '10px',
                  border: '1.5px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          {/* Forgot password */}
          <div style={{ width: '100%', maxWidth: '380px', textAlign: 'right', marginBottom: '24px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>
              Forgot Password?
            </span>
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              maxWidth: '380px',
              padding: '13px',
              backgroundColor: loading ? '#64748b' : '#F59E0B',
              color: loading ? 'white' : '#0F172A',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? 'Signing in...' : ' Secure Login'}
          </button>

          {/* Register link */}
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 28px 0' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#0F172A', fontWeight: '700', textDecoration: 'none' }}>
              Register here
            </Link>
          </p>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: '380px',
            marginBottom: '20px',
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
            <span style={{ margin: '0 12px', color: '#cbd5e1', fontSize: '11px' }}>trusted & secure</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: <i className="fa-solid fa-check-double"></i>, label: 'Verified Campus' },
              { icon: <i className="fa-solid fa-shield"></i>, label: 'Encrypted' },
              { icon: <i className="fa-solid fa-user-graduate"></i>, label: 'Students Only' },
            ].map((badge) => (
              <div key={badge.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#F1F5F9',
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '12px',
                color: '#64748b',
              }}>
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>

        </div>{/* end white card */}
      </div>
    </div>
  );
}

export default Login;
