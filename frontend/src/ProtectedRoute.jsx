import { useNavigate } from 'react-router-dom';
import { useAuth } from './checklogin';

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      // ✅ position: fixed වෙනුවට සම්පූර්ණ page එකක් render කරනවා
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '16px', padding: '32px',
          maxWidth: '380px', width: '90%', textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ color: '#0f2942', marginBottom: '8px' }}>Login Required</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            You need to be registered and logged in to post an item.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/')}
              style={{ flex: 1, padding: '12px', borderRadius: '10px',
                border: '1.5px solid #e2e8f0', backgroundColor: 'white',
                color: '#334155', fontWeight: '600', cursor: 'pointer' }}
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ flex: 1, padding: '12px', borderRadius: '10px',
                border: 'none', backgroundColor: '#0f2942',
                color: 'white', fontWeight: '700', cursor: 'pointer' }}
            >
              Register →
            </button>
          </div>
          <p style={{ marginTop: '16px', fontSize: '13px', color: '#94a3b8' }}>
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: '#0f2942', fontWeight: '700', cursor: 'pointer' }}
            >
              Login here
            </span>
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;