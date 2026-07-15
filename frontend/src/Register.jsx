import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './checklogin';
import log from './images/Logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';

// 🆕 Validation helpers
// Phone: exactly 10 digits (e.g. 0712345678)
const isValidPhone = (value) => /^\d{10}$/.test(value.trim());

// Student ID: KUR/IT/YEAR/F-or-P/INDEX  e.g. KUR/IT/2425/F/0225
const STUDENT_ID_REGEX = /^KUR\/(IT|AC|MG|EN|THM)\/\d{4}\/[FP]\/\d{4}$/;
const isValidStudentId = (value) => STUDENT_ID_REGEX.test(value.trim());

function Register() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // 🆕 Extra profile fields collected only at registration time
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [faculty, setFaculty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // 🆕 Field-level validation errors (shown under each input)
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  
  // ---- LOGIN HANDLER ----
  const handleLogin = async () => {
    setError('');
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

  // 🆕 ---- REGISTER FORM VALIDATION ----
  const validateRegisterForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!isValidStudentId(studentId)) {
      errors.studentId = 'Format must be like KUR/IT/2425/F/0225';
    }

    if (!isValidPhone(phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!faculty) {
      errors.faculty = 'Please select your faculty';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---- REGISTER HANDLER ----
  const handleRegister = async () => {
    setError('');

    // 🆕 Run client-side validation before hitting the API
    if (!validateRegisterForm()) {
      setError('Please fix the highlighted fields before continuing.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 🆕 send the extra profile fields along with name/email/password
        body: JSON.stringify({ name, email, password, studentId, phone, faculty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
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

  // Shared input style so the new fields match the existing look
  const inputWrapStyle = { width: '100%', maxWidth: '380px', marginBottom: '16px' };
  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    color: '#334155',
    fontSize: '11px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  };
  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '12px 14px 12px 40px',
    borderRadius: '10px',
    border: hasError ? '1.5px solid #dc2626' : '1.5px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0F172A',
  });
  const iconStyle = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8' };
  // 🆕 Small red helper text under an invalid field
  const fieldErrorStyle = { color: '#dc2626', fontSize: '12px', marginTop: '6px' };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
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
          {/* Gold badge overlay */}
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

        {/* Decorative dots */}
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
          
             onClick={() => navigate('/login')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '26px',
              border: 'none',
              backgroundColor: isLogin ? '#0F172A' : 'transparent',
              color: isLogin ? '#ffffff' : '#94a3b8',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}>
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '26px',
              border: 'none',
              backgroundColor: !isLogin ? '#0F172A' : 'transparent',
              color: !isLogin ? '#ffffff' : '#94a3b8',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}>
            Register
          </button>
        </div>

        <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p style={{ color: '#94a3b8', margin: '0 0 28px 0', fontSize: '14px' }}>
          {isLogin ? 'Log in with your University Student ID' : 'Register with your SLIATE email'}
        </p>

        {/* Location state message */}
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

        {/* Error message */}
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
          }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
             {error}
          </div>
        )}

        {/* Full Name (register only) */}
        {!isLogin && (
          <div style={inputWrapStyle}>
            <label style={labelStyle}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <span style={iconStyle}>
                <i className="fa-solid fa-user"></i></span>
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle(!!fieldErrors.name)}
              />
            </div>
            {/* 🆕 */}
            {fieldErrors.name && <div style={fieldErrorStyle}>{fieldErrors.name}</div>}
          </div>
        )}

        {/* 🆕 Student ID (register only) — validated against KUR/IT/YEAR/F-or-P/INDEX */}
        {!isLogin && (
          <div style={inputWrapStyle}>
            <label style={labelStyle}>
              Student ID
            </label>
            <div style={{ position: 'relative' }}>
              <span style={iconStyle}>
                <i className="fa-solid fa-id-card"></i></span>
              <input
                type="text"
                placeholder="e.g., KUR/IT/2425/F/0225"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                style={inputStyle(!!fieldErrors.studentId)}
              />
            </div>
            {fieldErrors.studentId
              ? <div style={fieldErrorStyle}>{fieldErrors.studentId}</div>
              : <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '6px' }}>Format: KUR/IT/YEAR/F,P/INDEX (e.g. KUR/IT/2425/F/0001)</div>}
          </div>
        )}

        {/* 🆕 Phone Number (register only) — validated to be exactly 10 digits */}
        {!isLogin && (
          <div style={inputWrapStyle}>
            <label style={labelStyle}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <span style={iconStyle}>
                <i className="fa-solid fa-phone"></i></span>
              <input
                type="tel"
                placeholder="e.g., 0712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle(!!fieldErrors.phone)}
              />
            </div>
            {fieldErrors.phone && <div style={fieldErrorStyle}>{fieldErrors.phone}</div>}
          </div>
        )}

     {/* 🆕 Faculty (register only) */}
          {!isLogin && (
            <div style={inputWrapStyle}>
              <label style={labelStyle}>
                Department 
              </label>
              <div style={{ position: 'relative' }}>
                <span style={iconStyle}>
                  <i className="fa-solid fa-building-columns"></i>
                </span>
                <select
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  style={{
                    ...inputStyle(!!fieldErrors.faculty),
                    color: faculty ? '#0F172A' : '#94A3B8',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                  }}
                >
                  <option value="">Select your department</option>
                  <option value="HNDIT">HNDIT</option>
                  <option value="HNDA">HNDA</option>
                  <option value="HNDM">HNDM</option>
                  <option value="HNDTHM">HNDTHM</option>
                  <option value="HNDE">HNDE</option>
                </select>
              </div>
              {fieldErrors.faculty && <div style={fieldErrorStyle}>{fieldErrors.faculty}</div>}
            </div>
          )}
        {/* Email */}
        <div style={inputWrapStyle}>
          <label style={labelStyle}>
            University Email
          </label>
          <div style={{ position: 'relative' }}>
            <span style={iconStyle}>
              <i className="fa-solid fa-envelope"></i>
            </span>
            <input
              type="email"
              placeholder="your valid email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle(!isLogin && !!fieldErrors.email)}
              autoComplete="off"
            />
          </div>
          {!isLogin && fieldErrors.email && <div style={fieldErrorStyle}>{fieldErrors.email}</div>}
        </div>

        {/* Password */}
        <div style={{ width: '100%', maxWidth: '380px', marginBottom: '24px' }}>
          <label style={labelStyle}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <span style={iconStyle}>
               <i className="fa-solid fa-eye-slash"></i>
            </span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle(!isLogin && !!fieldErrors.password)}
              autoComplete="new-password"
            />
          </div>
          {!isLogin && fieldErrors.password && <div style={fieldErrorStyle}>{fieldErrors.password}</div>}
        </div>

        {/* Submit Button */}
        <button
          onClick={isLogin ? handleLogin : handleRegister}
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
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
          {loading ? 'Please wait...' : isLogin ? 'Secure Login' : 'Create Account'}
        </button>

        {/* Footer links */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '380px',
          marginBottom: '28px',
        }}>
          <span style={{ color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}></span>
          <span
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>
            {isLogin ? 'Register New Account' : 'Already have an account?'}
          </span>
        </div>

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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

export default Register;