import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import log from './images/Logo.png';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState('');

  // Comment feature states
  const [comments, setComments] = useState([]);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestComment, setGuestComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState('');
  const [commentError, setCommentError] = useState('');

  const navy = '#0F172A';
  const gold = '#F59E0B';
  const white = '#FFFFFF';
  const bg = '#F8FAFC';
  const border = '#E2E8F0';
  const muted = '#64748B';

  useEffect(() => {
    const fetchItemAndComments = async () => {
      try {
        setLoading(true);
        // Fetch Item
        const itemRes = await fetch(`http://localhost:5000/api/items/${id}`);
        const itemData = await itemRes.json();
        if (!itemRes.ok) throw new Error(itemData.message || 'Failed to load item');
        setItem(itemData);

        // Fetch Comments
        const commentsRes = await fetch(`http://localhost:5000/api/items/${id}/comments`);
        const commentsData = await commentsRes.json();
        if (commentsRes.ok) {
          setComments(commentsData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItemAndComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentSubmitting(true);
    setCommentError('');
    setCommentSuccess('');

    try {
      const res = await fetch(`http://localhost:5000/api/items/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: guestEmail,
          phone: guestPhone,
          content: guestComment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit comment');

      setCommentSuccess('Comment submitted successfully!');
      setGuestEmail('');
      setGuestPhone('');
      setGuestComment('');

      // Refresh comments list
      const commentsRes = await fetch(`http://localhost:5000/api/items/${id}/comments`);
      const commentsData = await commentsRes.json();
      if (commentsRes.ok) {
        setComments(commentsData);
      }
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const buildMailtoLink = () => {
    const subject = encodeURIComponent(`Item Claim Notification: ${item?.title || 'Item'}`);
    const body = encodeURIComponent(
`I wish to claim the following item on Back2You:

Title: ${item?.title || 'N/A'}
Type: ${item?.type || 'N/A'}
Category: ${item?.category || 'N/A'}
Location: ${item?.location || 'N/A'}
Date Reported: ${item?.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
Posted By: ${item?.postedBy?.name || 'Unknown'}
Description: ${item?.description || 'N/A'}
Item ID: ${id}

Please review and verify this claim.`
    );
    return `mailto:oshadhinethmi7@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleNotifyClick = () => {
    window.location.href = buildMailtoLink();
    setShowModal(true);
  };

  const handleClaim = async () => {
    setClaiming(true);
    setClaimError('');
    try {
      const res = await fetch('http://localhost:5000/api/claims', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId: id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit claim');
      setClaimed(true);
      setShowModal(false);
    } catch (err) {
      setClaimError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
      <div style={{ color: muted, fontSize: '15px' }}>⏳ Loading...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
      <div style={{ color: '#dc2626', fontSize: '15px' }}>⚠️ {error}</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, fontFamily: '"Inter", "Segoe UI", sans-serif' }}>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: white, borderRadius: '16px', padding: '28px 24px',
            width: '360px', border: `1px solid ${border}`,
            boxShadow: '0 24px 48px rgba(15,23,42,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '16px', fontWeight: '700', color: navy }}>Submit Claim</span>
              <span onClick={() => setShowModal(false)} style={{ cursor: 'pointer', color: muted, fontSize: '20px' }}>×</span>
            </div>
            <div style={{ backgroundColor: bg, borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: navy }}>{item?.title}</div>
              <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>{item?.category} · {item?.location}</div>
            </div>
            <p style={{ fontSize: '13px', color: muted, lineHeight: '1.6', marginBottom: '16px' }}>
              By submitting this claim, you confirm this item belongs to you.  
              The admin will review your request and contact you for verification.
            </p>
            {claimError && (
              <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
                ⚠️ {claimError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1.5px solid ${border}`, backgroundColor: white, color: navy, fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
              >Cancel</button>
              <button
                onClick={handleClaim}
                disabled={claiming}
                style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: claiming ? muted : navy, color: white, fontWeight: '700', cursor: claiming ? 'not-allowed' : 'pointer', fontSize: '14px' }}
              >{claiming ? 'Submitting...' : 'Confirm Claim'}</button>
            </div>
          </div>
        </div>
      )}

      <nav style={{ backgroundColor: navy, padding: '0 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', boxShadow: '0 2px 12px rgba(15,23,42,0.18)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={log} alt="Back2You Logo" style={{ width: '30px', height: 'auto' }} />
          <span style={{ fontFamily: 'Times New Roman', fontSize: '27px', fontWeight: '700', color: white }}>
            Back<span style={{ color: gold }}>2</span>You
          </span>
        </Link>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ backgroundColor: 'transparent', color: '#94A3B8', padding: '8px 16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '500', cursor: 'pointer', fontSize: '13px' }}
        >← Dashboard</button>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: '32px' }}>

        {/* Left Column: Image and Comments History */}
        <div>
          <div style={{ backgroundColor: white, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${border}`, position: 'relative', marginBottom: '24px' }}>
            <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '700', color: navy }}>
              Reported
            </div>
            <img
              src={item?.image ? `http://localhost:5000/uploads/${item.image}` : 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={item?.title}
              style={{ width: '100%', height: '480px', objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* Public Comments Section */}
          <div style={{ backgroundColor: white, borderRadius: '16px', padding: '24px', border: `1px solid ${border}` }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: navy, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-regular fa-comments"></i> Comments & Requests ({comments.length})
            </h3>
            {comments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {comments.map((comment) => (
                  <div key={comment._id} style={{ borderBottom: `1px solid ${border}`, paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: navy }}>{comment.email}</span>
                      <span style={{ fontSize: '11px', color: muted }}>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    {comment.phone && (
                      <div style={{ fontSize: '12px', color: muted, marginBottom: '6px' }}>
                        <i className="fa-solid fa-phone" style={{ fontSize: '10px' }}></i> Phone: {comment.phone}
                      </div>
                    )}
                    <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: muted, margin: 0, textAlign: 'center', padding: '20px 0' }}>No comments or requests yet. Be the first to leave a comment!</p>
            )}
          </div>
        </div>

        {/* Right Column: Details & Claim or Comment form */}
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
              {item?.type?.charAt(0).toUpperCase() + item?.type?.slice(1)}
            </span>
            <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
              {item?.category}
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '800', color: navy, margin: '0 0 20px 0' }}>{item?.title}</h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: muted }}>
              <span>
                <i className="fa-solid fa-location-dot"></i>
              </span> {item?.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: muted }}>
              <span>
                <i className="fa-solid fa-calendar-days"></i>
              </span>
              {new Date(item?.date).toLocaleDateString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: muted }}>
              <span>
                <i className="fa-solid fa-user"></i>
              </span>
              Posted by {item?.postedBy?.name || 'Unknown'}
            </div>
          </div>

          {item?.description && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: navy, marginBottom: '8px' }}>Description</div>
              <p style={{ fontSize: '14px', color: muted, lineHeight: '1.7', margin: 0 }}>{item.description}</p>
            </div>
          )}

          {/* Action Box: Logged in Claim or Guest Comment Form */}
          {!token ? (
            <div style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  <i className="fa-regular fa-comment-dots" style={{ color: white }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: navy }}>Leave a Comment / Inquiry</div>
                  <div style={{ fontSize: '12px', color: muted }}>Not registered? Leave a request below.</div>
                </div>
              </div>
              <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: navy, display: 'block', marginBottom: '4px' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${border}`, fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: navy, display: 'block', marginBottom: '4px' }}>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${border}`, fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: navy, display: 'block', marginBottom: '4px' }}>Comment / Details *</label>
                  <textarea
                    required
                    rows="3"
                    value={guestComment}
                    onChange={(e) => setGuestComment(e.target.value)}
                    placeholder="Provide details about the item..."
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${border}`, fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }}
                  ></textarea>
                </div>
                {commentSuccess && (
                  <div style={{ backgroundColor: '#ECFDF5', color: '#059669', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                    ✓ {commentSuccess}
                  </div>
                )}
                {commentError && (
                  <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                    ⚠ {commentError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: navy, color: white, fontWeight: '700', fontSize: '14px', cursor: commentSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {commentSubmitting ? 'Submitting...' : 'Submit Comment / Request'}
                </button>
              </form>
            </div>
          ) : claimed ? (
            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                <i className="fa-solid fa-check" style={{ color: 'rgb(99, 230, 190)' }}></i>
              </div>
              <div style={{ fontWeight: '700', color: '#166534', fontSize: '15px' }}>Claim submitted!</div>
              <div style={{ color: '#16a34a', fontSize: '13px', marginTop: '4px' }}>Admin and the owner have been notified.</div>
            </div>
          ) : (
            <div style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  <i className="fa-regular fa-handshake" style={{ color: white }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: navy }}>Is this yours?</div>
                  <div style={{ fontSize: '12px', color: muted }}>Let us know and we'll connect you securely.</div>
                </div>
              </div>
              <button
                onClick={handleNotifyClick}
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: navy, color: white, fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
              >Notify Admin &amp; Owner to Claim</button>
              <div style={{ fontSize: '11px', color: muted, textAlign: 'center', marginTop: '10px' }}>
                <i className="fa-solid fa-shield"></i>
                 Personal details are hidden until the Admin verifies your claim.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;