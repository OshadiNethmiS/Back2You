import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import log from './images/Logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_BASE, UPLOADS_BASE } from './config';

/* =========================================================
   BACK2YOU — colors matched to the screenshot / theme
   ========================================================= */
const C = {
  navy: '#0f172a',      // header + headings
  navyText: '#15304a',
  red: '#dc2626',        // buttons / CTA accents
  redSoft: '#fee2e2',
  green: '#16a34a',
  greenSoft: '#d1fae5',
  blueSoft: '#dbeafe',
  gray: '#64748b',
  lightGray: '#94a3b8',
  border: '#e2e8f0',
  bg: '#f8fafc',
  blue: '#2563eb',
  gold: '#F59E0B', // 🆕 accent gold, matches Register page branding
};

// Badge style for the "Lost" / "Found" TYPE column
const TYPE_STYLE = {
  lost: { bg: C.redSoft, color: C.red, icon: 'fa-solid fa-magnifying-glass', label: 'Lost' },
  found: { bg: C.blueSoft, color: C.blue, icon: 'fa-solid fa-circle-check', label: 'Found' },
};

// Badge style for the STATUS column — add more keys here if your
// backend uses additional status values.
const STATUS_STYLE = {
  reported: { bg: C.redSoft, color: C.red, icon: '⚠' },
  matched: { bg: C.greenSoft, color: '#065f46', icon: '🔗' },
  resolved: { bg: '#e0e7ff', color: '#4338ca', icon: '✓' },
  pending: { bg: '#fef3c7', color: '#92400e', icon: '⏳' },
};
const DEFAULT_STATUS_STYLE = { bg: '#f1f5f9', color: C.gray, icon: '•' };

// ⚠️ ADJUST THESE TO MATCH YOUR BACKEND ROUTES ⚠️
const MY_POSTS_ENDPOINT = `${API_BASE}/items/my`; // GET: items belonging to the logged-in user
const UPDATE_STATUS_ENDPOINT = (id) => `${API_BASE}/items/${id}/status`;
const DELETE_ITEM_ENDPOINT = (id) => `${API_BASE}/items/${id}`; // DELETE

// 🆕 Profile + security endpoints — adjust the paths to match your backend.
// PROFILE_ENDPOINT: GET returns the logged-in user's profile, PATCH updates it.
const PROFILE_ENDPOINT = `${API_BASE}/auth/profile`;
// UPDATE_PASSWORD_ENDPOINT: PUT changes the logged-in user's password.
const UPDATE_PASSWORD_ENDPOINT = `${API_BASE}/auth/update-password`;

function UserAcc() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Student';

  const [tab, setTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    name: userName,
    email: '',
    phone: '',
    faculty: '',
    studentId: '',
  });

  // 🆕 profile load / save state
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ---------- Load the logged-in user's profile from the database ----------
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(PROFILE_ENDPOINT, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to load profile');
        const user = data.user || data; // support either { user: {...} } or a plain user object
        setForm({
          name: user.name || userName,
          email: user.email || '',
          phone: user.phone || '',
          faculty: user.faculty || '',
          studentId: user.studentId || '',
        });
      } catch (err) {
        console.error(err);
        setSaveError('Could not load your profile from the server.');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Recent Activity / My Posts (from database) ----------
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState('');
  const [postFilter, setPostFilter] = useState('All'); // All | Lost | Found

  useEffect(() => {
    const fetchPosts = async () => {
      setPostsLoading(true);
      setPostsError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(MY_POSTS_ENDPOINT, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load your posts');
        // Support either { items: [...] } or a plain array response shape
        setPosts(Array.isArray(data) ? data : data.items || []);
      } catch (err) {
        setPostsError(err.message || 'Could not load your posts');
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((p) => {
    if (postFilter === 'All') return true;
    return (p.type || '').toLowerCase() === postFilter.toLowerCase();
  });

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(DELETE_ITEM_ENDPOINT(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete post');
      }
      setPosts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete post');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const prevPosts = posts;
    // Optimistic update — change it on screen immediately
    setPosts((prev) => prev.map((p) => ((p._id || p.id) === id ? { ...p, status: newStatus } : p)));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(UPDATE_STATUS_ENDPOINT(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
      setPosts(prevPosts); // rollback on failure
    }
  };

  const handleEditPost = (id) => {
    // Adjust this route to wherever your edit-post page lives.
    // We pass `from` explicitly so PostItem.jsx can reliably send the
    // user back here after saving, instead of relying on browser history.
    navigate(`/post-item/${id}`, { state: { from: '/UserAcc' } });
  };

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  // 🆕 Saves the edited profile details to the database instead of only local state.
  const handleSave = async () => {
    setSaveError('');
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(PROFILE_ENDPOINT, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          faculty: form.faculty,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to save profile');

      // Keep the header avatar / greeting in sync with the new name
      localStorage.setItem('userName', form.name);

      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setSaveError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // 🆕 ---------- Security tab: change password ----------
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handlePasswordFieldChange = (field) => (e) =>
    setPasswordForm((p) => ({ ...p, [field]: e.target.value }));

  const handleUpdatePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      setPasswordError('Please fill in all three fields.');
      return;
    }
    if (passwordForm.next.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(UPDATE_PASSWORD_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to update password');

      setPasswordForm({ current: '', next: '', confirm: '' });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 2500);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: '"Segoe UI", Roboto, sans-serif' }}>

      {/* ================= HEADER (matches Dashboard) ================= */}
      <div style={{ backgroundColor: C.navy }}>

        {/* Top bar */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
          paddingLeft: '5%',
          paddingRight: '5%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '70px',
          backgroundColor: '#090924',
          boxShadow: '0 2px 12px rgba(15,23,42,0.18)'
        }}>
          {/* Logo — round icon + wordmark, click to go back to Dashboard */}
          <div
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '10px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={log} alt="Back2You Logo" style={{ width: '30px', height: 'auto' }} />
            </div>
            <span style={{ fontFamily: 'Times New Roman', fontSize: '27px', fontWeight: '700', color: 'white', letterSpacing: '-0.02em' }}>
              Back<span style={{ color: 'gold' }}>2</span>You
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '420px', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ color: "rgb(246, 245, 249)" }}></i>
              </span>
              <input
                type="text"
                name="uacc-item-search"
                placeholder="Search lost or found items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#e2e8f0', width: '100%' }}
              />
            </div>
          </div>

          {/* 🆕 Bell icon first */}
          <div style={{ position: 'relative', paddingRight: '25px', color: 'white', fontSize: '18px', cursor: 'pointer' }}>
            <i className="fa-regular fa-bell fa-xl" style={{ color: "rgb(255, 212, 59)" }}></i>
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: C.red }} />
          </div>

          {/* 🆕 Logout button - redesigned */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              padding: '9px 20px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.35)';
            }}
          >
            <i className="fa-solid fa-power-off"></i>
            Logout
          </button>

          {/* 🆕 Logout Confirmation Modal */}
          {showLogoutConfirm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '32px',
                width: '90%',
                maxWidth: '360px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <i className="fa-solid fa-power-off" style={{ color: '#dc2626', fontSize: '22px' }}></i>
                </div>

                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                  Log out?
                </h3>
                <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b' }}>
                  Are you sure you want to log out of your account?
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      backgroundColor: 'white',
                      color: '#334155',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { localStorage.clear(); navigate('/register'); }}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Page title band — 🆕 now with a background image (distinct from the Register page photo) */}
        <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            paddingBottom: '40px',
            backgroundImage: 'linear-gradient(180deg, rgba(15,23,42,0.75), rgba(15,23,42,0.92)), url("https://images.pexels.com/photos/7973039/pexels-photo-7973039.jpeg?auto=compress&cs=tinysrgb&w=1600")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '250px',
            color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }} />
          <div style={{ position: 'relative', padding: '20px 5% 40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px' }}>
            <div>
              <p style={{ color: '#bfa15f', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', paddingTop: '70px', margin: '0 0 10px' }}>MY ACCOUNT</p>
              <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 800, margin: '0 0 8px' }}>Account Settings</h1>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>Manage your profile, contact details, and account security.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {saved && (
                <span style={{ backgroundColor: C.greenSoft, color: '#065f46', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
                  ✓ Saved
                </span>
              )}
              <Link to="/dashboard" style={{ textDecoration: 'none', color: '#93c5fd', fontSize: '14px', fontWeight: 600 }}>
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STAT CARDS (mirrors "TOTAL POSTS" card) ================= */}
      <div style={{ padding: '4px 5% 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '20px 24px', width: '220px', maxWidth: '100%' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: C.redSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', fontSize: '16px' }}>
              <i className="fa-solid fa-cube"></i>
            </div>
            <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: C.gray }}>TOTAL POSTS</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: C.navyText }}>{postsLoading ? '—' : posts.length}</p>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div style={{ padding: '24px 5% 60px' }}>

        {/* ---- 1) MY POSTS / RECENT ACTIVITY CARD (now shown first) ---- */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px', borderBottom: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: C.navyText }}>My Posts</h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: C.gray }}>{filteredPosts.length} items</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '6px', backgroundColor: '#eef2ff', padding: '4px', borderRadius: '20px' }}>
                {['All', 'Lost', 'Found'].map((f) => (
                  <span
                    key={f}
                    onClick={() => setPostFilter(f)}
                    style={{
                      padding: '7px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      backgroundColor: postFilter === f ? C.navy : 'transparent',
                      color: postFilter === f ? 'white' : C.gray,
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              <Link to="/post-item" style={{ textDecoration: 'none' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: C.blue, color: 'white', padding: '10px 18px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                  + New Post
                </button>
              </Link>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr>
                  {['ITEM', 'TYPE', 'DATE', 'LOCATION', 'STATUS', 'ACTIONS'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 28px', fontSize: '11px', fontWeight: 700, color: C.gray, letterSpacing: '1px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {postsLoading && (
                  <tr>
                    <td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: C.gray, fontSize: '14px' }}>Loading your posts...</td>
                  </tr>
                )}

                {!postsLoading && postsError && (
                  <tr>
                    <td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: C.red, fontSize: '14px' }}>{postsError}</td>
                  </tr>
                )}

                {!postsLoading && !postsError && filteredPosts.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: C.gray, fontSize: '14px' }}>No posts yet. Click "+ New Post" to report an item.</td>
                  </tr>
                )}

                {!postsLoading && !postsError && filteredPosts.map((post) => {
                  const id = post._id || post.id;
                  const typeKey = (post.type || 'lost').toLowerCase();
                  const t = TYPE_STYLE[typeKey] || TYPE_STYLE.lost;
                  const s = STATUS_STYLE[(post.status || '').toLowerCase()] || DEFAULT_STATUS_STYLE;
                  return (
                    <tr key={id} style={{ borderBottom: `1px solid ${C.border}` }}>

                      <td style={{ padding: '16px 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {post.image ? (
                              <img
                                src={`${UPLOADS_BASE}/${post.image}`}
                                alt={post.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  // File missing on disk (404) — fall back to the placeholder icon
                                  // instead of showing a broken image / spamming the console.
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<span style="font-size:18px"><i class="fa-solid fa-box" style="color: rgb(15, 23, 42)"></i></span>';
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: '18px' }}>
                                <i className="fa-solid fa-box" style={{ color: "rgb(15, 23, 42)" }}></i>
                              </span>
                            )}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, color: C.navyText, fontSize: '14px' }}>{post.title}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.lightGray }}>{post.category}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 28px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: t.bg, color: t.color, padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                          <i className={t.icon}></i> {t.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 28px', fontSize: '14px', color: C.navyText }}>{post.date}</td>
                      <td style={{ padding: '16px 28px', fontSize: '14px', color: C.navyText }}>
                        <i className="fa-solid fa-location-dot"></i> {post.location}
                      </td>
                      <td style={{ padding: '16px 28px' }}>
                        <select
                          value={post.status || 'reported'}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                          style={{
                            backgroundColor: s.bg, color: s.color, padding: '5px 10px',
                            borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                            border: 'none', cursor: 'pointer', outline: 'none',
                          }}
                        >
                          <option value="reported">⚠ Reported</option>
                          <option value="matched">🔗 Matched</option>
                          <option value="resolved">✓ Resolved</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px 28px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEditPost(id)}
                            title="Edit"
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#eff6ff', color: C.blue, cursor: 'pointer', fontSize: '14px' }}
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeletePost(id)}
                            title="Delete"
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: C.red, cursor: 'pointer', fontSize: '14px' }}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---- 2) PROFILE DETAILS CARD (now shown second) ---- */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', marginTop: '24px' }}>

          {/* Panel header with tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '24px 28px', borderBottom: `1px solid ${C.border}` }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: C.navyText }}>Profile Details</h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: C.gray }}>{form.studentId} · {form.faculty}</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '20px' }}>
              {['profile', 'security'].map((id) => (
                <span
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    padding: '8px 18px', borderRadius: '16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
                    backgroundColor: tab === id ? C.navy : 'transparent',
                    color: tab === id ? 'white' : C.gray,
                  }}
                >
                  {id}
                </span>
              ))}
            </div>

            {tab === 'profile' && (
              isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ backgroundColor: saving ? '#93c5fd' : C.blue, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'Saving...' : '✓ Save Changes'}
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} style={{ backgroundColor: '#eff6ff', color: C.blue, border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                  ✎ Edit Profile
                </button>
              )
            )}
          </div>

          {/* Panel body */}
          <div style={{ padding: '28px' }}>
            {tab === 'profile' && (
              <>
                {saveError && (
                  <div style={{ backgroundColor: C.redSoft, color: C.red, padding: '10px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '18px' }}>
                    {saveError}
                  </div>
                )}
                {profileLoading ? (
                  <p style={{ color: C.gray, fontSize: '14px' }}>Loading profile...</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="uacc-fields">
                    <Field label="Full Name" value={form.name} disabled={!isEditing} onChange={handleChange('name')} />
                    <Field label="Student ID" value={form.studentId} disabled onChange={() => {}} />
                    <Field label="Email Address" value={form.email} disabled={!isEditing} onChange={handleChange('email')} />
                    <Field label="Phone Number" value={form.phone} disabled={!isEditing} onChange={handleChange('phone')} />
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                        Department
                      </label>
                      <select
                        value={form.faculty}
                        onChange={handleChange('faculty')}
                        disabled={!isEditing}
                        style={{
                          backgroundColor: !isEditing ? '#f8fafc' : 'white',
                          color: '#0f2942',
                          padding: '11px 14px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 500,
                          border: `1px solid ${!isEditing ? '#e2e8f0' : '#2563eb'}`,
                          cursor: isEditing ? 'pointer' : 'not-allowed',
                          outline: 'none',
                          boxSizing: 'border-box',
                          width: '100%',
                        }}
                      >
                        <option value="">Select your faculty</option>
                        <option value="HNDIT">HNDIT</option>
                        <option value="HNDA">HNDA</option>
                        <option value="HNDM">HNDM</option>
                        <option value="HNDTHM">HNDTHM</option>
                        <option value="HNDE">HNDE</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '420px' }}>
                {passwordError && (
                  <div style={{ backgroundColor: C.redSoft, color: C.red, padding: '10px 16px', borderRadius: '8px', fontSize: '13px' }}>
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div style={{ backgroundColor: C.greenSoft, color: '#065f46', padding: '10px 16px', borderRadius: '8px', fontSize: '13px' }}>
                    ✓ Password updated successfully
                  </div>
                )}
                <Field
                  label="Current Password"
                  type="password"
                  value={passwordForm.current}
                  onChange={handlePasswordFieldChange('current')}
                  placeholder="••••••••"
                />
                <Field
                  label="New Password"
                  type="password"
                  value={passwordForm.next}
                  onChange={handlePasswordFieldChange('next')}
                  placeholder="••••••••"
                />
                <Field
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={handlePasswordFieldChange('confirm')}
                  placeholder="••••••••"
                />
                <button
                  onClick={handleUpdatePassword}
                  disabled={passwordSaving}
                  style={{ backgroundColor: passwordSaving ? '#334155' : C.navy, color: 'white', border: 'none', padding: '12px 0', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: passwordSaving ? 'not-allowed' : 'pointer' }}
                >
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .uacc-fields { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   Reusable field
   ========================================================= */
function Field({ label, value, onChange, disabled, type = 'text', placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
          border: `1px solid ${disabled ? '#e2e8f0' : '#2563eb'}`,
          backgroundColor: disabled ? '#f8fafc' : 'white',
          color: '#0f2942', outline: 'none', boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
    </div>
  );
}

export default UserAcc;
