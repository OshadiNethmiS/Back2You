import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import log from './images/Logo.png';

function PostItem() {
  const { id } = useParams();          // present only when editing an existing post
  const isEditMode = Boolean(id);

  const [itemType, setItemType] = useState('lost');
  const [category, setCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(isEditMode); // loading existing item data
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();
  const routerLocation = useLocation(); // to read the 'from' page passed when editing
  const [successMsg, setSuccessMsg] = useState('');

  // Brand tokens
  const navy = '#0F172A';
  const blue = '#2563EB';
  const bg = '#F8FAFC';
  const gold = '#F59E0B';
  const text = '#111827';
  const muted = '#64748B';
  const border = '#E2E8F0';
  const white = '#FFFFFF';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) setShowAuthModal(true);
  }, []);

  // If we're in edit mode, load the existing item and pre-fill the form
  useEffect(() => {
    if (!isEditMode) return;

    const fetchItem = async () => {
      setLoadingItem(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/items/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store', // avoid the browser serving a stale cached 404
        });

        // If the backend returned an HTML error page instead of JSON
        // (e.g. server not restarted, wrong route), fail with a clear message
        // instead of crashing on JSON.parse.
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error(`Server did not return JSON (status ${res.status}). Is the backend running and up to date?`);
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load item');

        setItemType(data.type || 'lost');
        setCategory(data.category || '');
        setItemName(data.title || '');
        setLocation(data.location || '');
        setDate(data.date ? data.date.slice(0, 10) : '');
        setDescription(data.description || '');
        if (data.image) {
          setImagePreview(`http://localhost:5000/uploads/${data.image}`);
        }
      } catch (err) {
        setError(err.message || 'Failed to load item');
      } finally {
        setLoadingItem(false);
      }
    };

    fetchItem();
  }, [id, isEditMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async () => {
    setError('');
    const token = localStorage.getItem('token');
    if (!token) { setShowAuthModal(true); return; }
    if (!category || !itemName || !location || !date) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', itemType);
      formData.append('category', category);
      formData.append('title', itemName);
      formData.append('location', location);
      formData.append('date', date);
      formData.append('description', description);
      if (image) formData.append('image', image);

      // Edit mode -> PUT to update the existing item. Create mode -> POST as before.
      const url = isEditMode
        ? `http://localhost:5000/api/items/${id}`
        : 'http://localhost:5000/api/items';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'post'} item`);

      // Show a success message first, then redirect after a short delay.
      // Edit mode: go back to the exact page we came from (passed via location.state).
      // Create mode: always go to the dashboard.
      if (isEditMode) {
        setSuccessMsg('✅ Changes saved successfully!');
        const redirectTo = routerLocation.state?.from || '/dashboard';
        setTimeout(() => navigate(redirectTo), 1200);
      } else {
        setSuccessMsg('✅ Item posted successfully!');
        setTimeout(() => navigate('/dashboard'), 1200);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewPostsLink = itemType === 'lost' ? '/dashboard' : '/dashboard?found=true';
  const viewPostsLabel = itemType === 'lost' ? 'View Lost Posts' : 'View Found Posts';

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '8px',
    border: `1.5px solid ${border}`,
    backgroundColor: bg,
    fontSize: '14px',
    outline: 'none',
    color: text,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    color: text,
    fontSize: '13px',
    letterSpacing: '0.01em',
  };

  // Simple loading state while fetching the item to edit
  if (loadingItem) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif' }}>
        <p style={{ color: muted, fontSize: '15px' }}>Loading item…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif' }}>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15,23,42,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: white, borderRadius: '20px',
            padding: '40px 32px', maxWidth: '380px', width: '90%',
            textAlign: 'center', boxShadow: '0 32px 64px rgba(15,23,42,0.3)',
            border: `1px solid ${border}`
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px auto'
            }}>
              <span style={{ fontSize: '26px' }}>🔒</span>
            </div>
            <h2 style={{ color: navy, margin: '0 0 10px 0', fontSize: '20px', fontWeight: '700' }}>
              Login Required
            </h2>
            <p style={{ color: muted, fontSize: '14px', marginBottom: '28px', lineHeight: '1.6' }}>
              You need to be registered and logged in to post an item on Back2You.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: `1.5px solid ${border}`, backgroundColor: white,
                  color: text, fontWeight: '600', cursor: 'pointer', fontSize: '14px'
                }}
              >Go Back</button>
              <button
                onClick={() => navigate('/register')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: 'none', backgroundColor: blue,
                  color: white, fontWeight: '700', cursor: 'pointer', fontSize: '14px'
                }}
              >Register →</button>
            </div>
            <p style={{ marginTop: '16px', fontSize: '13px', color: '#94A3B8' }}>
              Already have an account?{' '}
              <span onClick={() => navigate('/login')} style={{ color: blue, fontWeight: '700', cursor: 'pointer' }}>
                Login here
              </span>
            </p>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{
        backgroundColor: navy,
        padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px',
        boxShadow: '0 2px 12px rgba(15,23,42,0.18)'
      }}>

        {/*logo-box*/}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/*Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="home-nav-logo-box">
            <div>
                <img src={log} alt="Back2You Logo" style={{ width: '30px', height: 'auto' }} />
             </div>

        {/* logo name */}
              </div>
          </div>

           <span style={{ fontFamily: 'Times New Roman' , fontSize: '27px', fontWeight: '700', color: white, letterSpacing: '-0.02em' }}>
            Back<span style={{ color: gold }}>2</span>You
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to={viewPostsLink} style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: white,
              padding: '8px 16px', borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.15)',
              fontWeight: '600', cursor: 'pointer', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <i className="fas fa-list"></i> {viewPostsLabel}
            </button>
          </Link>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: 'transparent', color: '#94A3B8',
              padding: '8px 16px', borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              fontWeight: '500', cursor: 'pointer', fontSize: '13px'
            }}>
              ← Dashboard
            </button>
          </Link>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <div style={{
        padding: '56px 5% 48px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* decorative dot grid */}
        <div style={{
          position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)',
          opacity: 0.06, fontSize: '80px', lineHeight: 1, userSelect: 'none',
          letterSpacing: '12px', color: white
        }}>

        </div>

        <div style={{ maxWidth: '520px', margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '20px', padding: '4px 12px',
            marginBottom: '14px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isEditMode ? 'Edit Report' : 'Item Report'}
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0', lineHeight: 1.2 }}>
            {isEditMode
              ? `Edit ${itemType === 'lost' ? 'Lost' : 'Found'} Item`
              : `Report a ${itemType === 'lost' ? 'Lost' : 'Found'} Item`}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
            {isEditMode
              ? 'Update the details below and save your changes.'
              : 'Fill in the details below — the more specific, the better the chance of a match.'}
          </p>
        </div>
      </div>

      {/* FORM CARD */}
      <div style={{ maxWidth: '520px', margin: '-24px auto 48px', padding: '0 20px' }}>
        <div style={{
          backgroundColor: white, borderRadius: '16px',
          padding : '30px',
          boxShadow: '0 8px 32px rgba(15,23,42,0.10)',
          border: `1px solid ${border}`,
          overflow: 'hidden'
        }}>

          {/* Toggle strip — hidden while editing, since you can't change an existing report's type here */}
          {!isEditMode && (
            <div style={{
              display: 'flex', backgroundColor: '#f1f5f9',
              borderRadius: '30px', padding: '4px',
              marginBottom: '24px', width: 'fit-content'
            }}>
              <button
                  style={{
                  padding: '8px 20px', borderRadius: '26px', border: 'none',
                  backgroundColor: '#0f2942',
                  color: 'white',
                  fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
                }}>
                <span style={{ fontSize: '16px' }}>
                  <i className="fas fa-search"></i>
                </span> I Lost This
              </button>

                <button
                onClick={() => navigate('/post-found')}
                style={{
                  padding: '8px 20px', borderRadius: '26px', border: 'none',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
                }}
              >
                I Found This
              </button>
            </div>
          )}

          <div style={{ padding: '28px' }}>

            {/* Success message */}
            {successMsg && (
              <div style={{
                backgroundColor: '#F0FDF4', color: '#15803D',
                padding: '10px 14px', borderRadius: '8px',
                marginBottom: '20px', fontSize: '13px',
                border: '1px solid #BBF7D0',
                display: 'flex', gap: '8px', alignItems: 'center', fontWeight: '600'
              }}>
                {successMsg}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                backgroundColor: '#FEF2F2', color: '#DC2626',
                padding: '10px 14px', borderRadius: '8px',
                marginBottom: '20px', fontSize: '13px',
                border: '1px solid #FECACA',
                display: 'flex', gap: '8px', alignItems: 'center'
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Item Category */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>
                Item Category <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  ...inputStyle,
                  color: category ? text : '#94A3B8',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '36px'
                }}
              >
                <option value="">Select a category</option>
                <option value="Electronics"> Electronics</option>
                <option value="Documents"> Documents</option>
                <option value="Keys"> Keys</option>
                <option value="Clothing"> Clothing</option>
                <option value="Other"> Other</option>
              </select>
            </div>

            {/* Item Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>
                Item Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Blue Water Bottle"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Location + Date — side by side */}
            <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  Location <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Main Cafeteria"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>
                  Date <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ ...inputStyle, backgroundColor: bg }}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                placeholder="Describe the item — color, size, distinctive marks, contents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={4}
                style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
              />
              <div style={{ textAlign: 'right', color: '#94A3B8', fontSize: '12px', marginTop: '4px' }}>
                {description.length}/500
              </div>
            </div>

            {/* Image Upload */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Upload Item Photo</label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById('imageInput').click()}
                style={{
                  border: `2px dashed ${dragOver ? blue : border}`,
                  borderRadius: '10px',
                  padding: imagePreview ? '12px' : '32px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: dragOver ? '#EFF6FF' : bg,
                  transition: 'all 0.2s'
                }}
              >
                {imagePreview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={imagePreview} alt="Preview" style={{
                      maxHeight: '140px', borderRadius: '8px',
                      objectFit: 'cover', display: 'block'
                    }} />
                    <div style={{
                      position: 'absolute', top: '6px', right: '6px',
                      backgroundColor: 'rgba(0,0,0,0.5)', color: white,
                      borderRadius: '50%', width: '24px', height: '24px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', cursor: 'pointer'
                    }}
                      onClick={(e) => { e.stopPropagation(); setImage(null); setImagePreview(null); }}
                    >✕</div>
                  </div>
                ) : (
                  <>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      backgroundColor: '#EFF6FF', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px auto', fontSize: '20px'
                    }}>📤</div>
                    <p style={{ margin: '0 0 4px 0', color: text, fontSize: '14px', fontWeight: '600' }}>
                      Click or drag & drop to upload
                    </p>
                    <p style={{ margin: 0, color: muted, fontSize: '12px' }}>JPG, PNG up to 5MB</p>
                  </>
                )}
              </div>
              <input id="imageInput" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>

            {/* Auto Delete Notice */}
            {!isEditMode && (
              <div style={{
                backgroundColor: 'rgba(245,158,11,0.08)',
                border: `1px solid rgba(245,158,11,0.25)`,
                borderRadius: '10px', padding: '12px 16px', marginBottom: '24px',
                display: 'flex', gap: '10px', alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '15px', marginTop: '1px' }}>⏰</span>
                <div>
                  <p style={{ margin: '0 0 2px 0', fontWeight: '700', color: '#92400E', fontSize: '13px' }}>
                    Auto-Deletion in 14 Days
                  </p>
                  <p style={{ margin: 0, color: '#B45309', fontSize: '12px', lineHeight: '1.5' }}>
                    Posts expire automatically to keep the feed fresh and relevant.
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  flex: 1, padding: '13px', borderRadius: '8px',
                  border: `1.5px solid ${border}`, backgroundColor: white,
                  color: text, fontWeight: '600', cursor: 'pointer', fontSize: '14px',
                  transition: 'background 0.15s'
                }}
              >Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={loading || Boolean(successMsg)}
                style={{
                  flex: 2, padding: '13px', borderRadius: '8px', border: 'none',
                  background: (loading || successMsg) ? '#94A3B8' : `linear-gradient(135deg, ${blue} 0%, #1D4ED8 100%)`,
                  color: white, fontWeight: '700',
                  cursor: (loading || successMsg) ? 'not-allowed' : 'pointer', fontSize: '14px',
                  boxShadow: (loading || successMsg) ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
                  transition: 'all 0.2s', letterSpacing: '0.01em'
                }}
              >
                {successMsg
                  ? '✓ Done'
                  : loading
                    ? (isEditMode ? 'Saving…' : 'Publishing…')
                    : (isEditMode ? 'Save Changes →' : 'Publish Post →')}
              </button>
            </div>

          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '12px', marginTop: '20px' }}>
          By publishing, you agree to our community guidelines.
        </p>
      </div>

    </div>
  );
}

export default PostItem;
