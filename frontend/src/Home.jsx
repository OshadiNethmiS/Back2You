import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './checklogin';
import './Home.css';
import log from './images/Logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_BASE, UPLOADS_BASE } from './config';

function Home() {
  const [activeTab, setActiveTab] = useState('lost');
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();
  

  const handlePostItem = () => {
    if (user) {
      navigate('/post-item');
    } else {
      navigate('/register', { state: { message: 'Please register first to post an item.' } });
    }
  };

  const categories = ['All', 'Electronics', 'Documents', 'Keys', 'Clothing', 'Other'];

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/items?type=${activeTab}`);
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
  }, [activeTab]);

  const filteredItems = items.filter(item => {
  const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
  const matchesSearch = 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.date.includes(searchQuery);
  return matchesCategory && matchesSearch;
});

  // 🆕 Badge colors now reflect the item's STATUS (reported/matched/resolved)
  // instead of its TYPE (lost/found).
  const statusColors = {
    reported: { bg: '#fee2e2', color: '#dc2626', label: 'Reported' },
    matched:  { bg: '#d1fae5', color: '#065f46', label: 'Matched' },
    resolved: { bg: '#e0e7ff', color: '#4338ca', label: 'Resolved' },
  };

  return (
    <div className="home-wrapper">

      {/* ===== NAVBAR ===== */}
      <nav className="home-nav">

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

       <div className="home-nav-search-wrap">
        <span className="home-nav-search-icon">
          <i className="fa-solid fa-magnifying-glass" style={{ color: "rgb(246, 245, 249)" }}></i>
        </span>
          <input
              type="text"
              placeholder="Search lost or found items..."
              className="home-nav-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

          <Link to="/login" style={{ textDecoration: 'none' }}>
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
       <h1 style={{ fontFamily: 'Times New Roman' , fontSize: '50px', fontWeight: '700', color: 'white', letterSpacing: '-0.02em' }}>
                 Back<span style={{ color: 'gold' }}>2</span>You
       </h1> 
        <p>SLIATE Campus Lost &amp; Found. Reconnect with your belongings through a secure, trusted network.</p>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="home-content">

        <div className="home-content-header">
          <div>
            <h2>Recent Lost Items</h2>
            <p>Browse the latest items reported around campus</p>
          </div>
          <button className="home-post-btn" onClick={handlePostItem}>+ Post Item</button>
        </div>

        {/* Tabs */}
          <div className="home-tabs">
            <span
              onClick={() => setActiveTab('lost')}
              className={`home-tab${activeTab === 'lost' ? ' active' : ''}`}>
              Lost Items
            </span>
            <Link to="/found" className="home-tab">Found Items</Link>
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


          {/* Back button
          <Link to="/Back2YouLandingPage" className="home-back-btn">← Back</Link> */}

          {/* States */}
          {loading && <div className="home-loading">
            <i className="fa-solid fa-hourglass-end"></i>
             Loading items...</div>}
          {!loading && error && <div className="home-error">
          <i className="fa-solid fa-triangle-exclamation"></i>  
          {error}</div>}

          {/* Items grid */}
          {!loading && !error && (
            <div className="home-items-grid">
              {filteredItems.length > 0 ? filteredItems.map(item => (
                <div key={item._id} className="home-item-card" onClick={() => navigate(`/item/${item._id}`)} style={{ cursor: 'pointer' }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={item.image ? `${UPLOADS_BASE}/${item.image}` : 'https://via.placeholder.com/400x180?text=No+Image'}
                      alt={item.title}
                      className="home-item-img"
                    />
                    <span
                      className="home-item-badge"
                      style={{ backgroundColor: statusColors[item.status]?.bg, color: statusColors[item.status]?.color }}
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
                <div className="home-empty">
                  No {activeTab} items found. Be the first to post!
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Home;