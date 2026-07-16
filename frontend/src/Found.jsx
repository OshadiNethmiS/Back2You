import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import log from './images/Logo.png';
import { API_BASE, UPLOADS_BASE } from './config';


function Found() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('found');
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['All', 'Electronics', 'Documents', 'Keys', 'Clothing', 'Other'];

  // 🆕 Badge colors now reflect the item's STATUS (reported/matched/resolved)
  // instead of just always showing "Found".
  const statusColors = {
    reported: { bg: '#fee2e2', color: '#dc2626', label: 'Reported' },
    matched:  { bg: '#d1fae5', color: '#065f46', label: 'Matched' },
    resolved: { bg: '#e0e7ff', color: '#4338ca', label: 'Resolved' },
  };

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/items?type=found`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load items');
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item =>
    activeCategory === 'All' || item.category === activeCategory
  );

  return (
    <div className="home-wrapper">

      {/* ===== NAVBAR ===== */}
      <nav className="home-nav">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="home-nav-logo-box">
            <span style={{ transform: 'rotate(-10deg)', display: 'inline-block' }}>
               <div>
            <img src={log} alt="Back2You Logo" style={{ width: '30px', height: 'auto' }} />
            {/* rest of your page */}
          </div>
            </span>
          </div>
          <span style={{ fontFamily: 'Times New Roman' , fontSize: '27px', fontWeight: '700', color: 'white', letterSpacing: '-0.02em' }}>
                 Back<span style={{ color: 'gold' }}>2</span>You
               </span> 
        </Link>

        <div className="home-nav-search-wrap">
          <span className="home-nav-search-icon">
            <i className="fa-solid fa-magnifying-glass" style={{ color: "rgb(246, 245, 249)" }}></i>
          </span>
          <input
            type="text"
            placeholder="Search found items..."
            className="home-nav-search"
          />
        </div>

        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button className="home-nav-btn">Log In / Register</button>
        </Link>
      </nav>

      {/* ===== HERO ===== */}
      <div className="home-hero">
        <div className="home-hero-icon">
          <div>
            <img src={log} alt="Back2You Logo" style={{ width: '120px', height: 'auto' }} />
            {/* rest of your page */}
          </div>
        </div>
        <h1>Back2You</h1>
        <p>SLIATE Campus Lost &amp; Found. Reconnect with your belongings through a secure, trusted network.</p>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="home-content">

        <div className="home-content-header">
          <div>
            <h2>Recent Found Items</h2>
            <p>Browse the latest found items reported around campus</p>
          </div>
          <Link  style={{ textDecoration: 'none' }}>
            <button className="home-post-btn">+ Post Item</button>
          </Link>
        </div>

            {/* Tabs */}
          <div className="home-tabs">
            <Link to="/home" className="home-tab">Lost Items</Link>
            <span
                onClick={() => setActiveTab('found')}
                className={`home-tab${activeTab === 'found' ? ' active' : ''}`}>
                Found Items
              </span>
              
            </div>


        <div className="home-card-box">

          {/* Category Filters */}
          <div className="home-categories">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`home-cat-btn${activeCategory === cat ? ' active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>


          {/* States */}
          {loading && <div className="home-loading">⏳ Loading found items...</div>}
          {!loading && error && <div className="home-error">⚠️ {error}</div>}

          {/* Items Grid */}
          {!loading && !error && (
            <div className="home-items-grid">
              {filteredItems.length > 0 ? filteredItems.map(item => (
                <div
                  key={item._id}
                  onMouseEnter={() => setHoveredCard(item._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate(`/item/${item._id}`)}
                  className="home-item-card"
                  style={{
                    boxShadow: hoveredCard === item._id ? '0 8px 30px rgba(37,99,235,0.18)' : '0 1px 3px rgba(0,0,0,0.08)',
                    transform: hoveredCard === item._id ? 'translateY(-4px)' : 'translateY(0)',
                    borderColor: hoveredCard === item._id ? 'var(--secondary)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={item.image ? `${UPLOADS_BASE}/${item.image}` : 'https://via.placeholder.com/400x180?text=No+Image'}
                      alt={item.title}
                      className="home-item-img"
                    />
                    {/* 🆕 Was: <span className="found-badge">Found</span> — now shows real status */}
                    <span
                      style={{
                        position: 'absolute', top: '10px', right: '10px',
                        padding: '4px 10px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: 700,
                        backgroundColor: statusColors[item.status]?.bg,
                        color: statusColors[item.status]?.color,
                      }}
                    >
                      {statusColors[item.status]?.label}
                    </span>
                  </div>
                  <div className="home-item-body">
                    <h3>{item.title}</h3>
                    <p className="home-item-loc">
                      <i className="fa-solid fa-location-dot"></i>
                       {item.location}</p>
                    <div className="home-item-footer">
                      <span className="home-item-date">{new Date(item.date).toLocaleDateString()}</span>
                      <span className="home-item-cat">{item.category}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="home-empty">No found items yet. Post the first one!</div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Found;
