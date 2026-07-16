import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import log from './images/Logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_BASE, UPLOADS_BASE } from './config';


function Dashboard() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('lost');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');  

  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'Student';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const categories = ['All', 'Electronics', 'Documents', 'Keys', 'Clothing', 'Other'];

  // ✅ useEffect — always top, before any early return
  useEffect(() => {
    if (!token) return;

    const fetchItems = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/items?type=${activeTab}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
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
  }, [activeTab, token]);

  // ✅ early return — after all hooks
  useEffect(() => {
    if (!token) {
      navigate('/register');
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  const filteredItems = items.filter(item => {
  const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
  const itemDate = new Date(item.date).toLocaleDateString();
  const matchesSearch =
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    itemDate.includes(searchQuery);
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>

      {/* ===== NAVBAR ===== */}
      <nav style={{
             backgroundColor: '#090924',
             padding: '10 5%',
             display: 'flex', alignItems: 'center', justifyContent: 'space-between',
             boxShadow: '0 2px 12px rgba(15,23,42,0.18)',
             position: 'fixed',
             top: '0',
             left:'0' ,
             width: '100%',
             height: '70px',
             zindex: '1000',
             paddingTop: '25px'
           }}>
     
             {/*logo-box*/}
             <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' ,}}>
               
             {/*Logo */}
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                             <div className="home-nav-logo-box">           
                 <div>
                     <img src={log} alt="Back2You Logo" style={{ width: '30px', height: 'auto' }} />
                  </div>
     
             {/* logo name */}
                   </div>
               </div>
                <span style={{ fontFamily: 'Times New Roman' , fontSize: '27px', fontWeight: '700', color: 'white', letterSpacing: '-0.02em' }}>
                 Back<span style={{ color: 'gold' }}>2</span>You
               </span> 
             </Link>

        <div style={{ position: 'relative', width: '40%' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: "rgb(246, 245, 249)" }}></i>
          </span>
              <div className="home-nav-search-wrap">
            <span className="home-nav-search-icon">
              
            </span>

            <input
              type="text"
              placeholder="Search lost or found items..."
              className="home-nav-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'white', fontSize: '20px', cursor: 'pointer' }}>
            <i className="fa-regular fa-bell fa-xl"  style={{ color: 'rgb(255, 212, 59)' }}></i>
          </span>
          
          <Link to="/UserAcc" style={{ textDecoration: 'none' }}>
            <button style={{ backgroundColor: '#111827', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <i className="fa-solid fa-user-gear fa-2xl" style={{ color: 'rgb(255, 212, 59)' }}></i>
            </button>
          </Link>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <div style={{
        backgroundImage: 'linear-gradient(rgba(15, 41, 66, 0.85), rgba(15, 41, 66, 0.85)), url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop")',
        backgroundSize: 'cover', backgroundPosition: 'center',
        padding: '50px 5%', color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>

        
        <div>
          <p style={{ color: '#bfa15f', fontWeight: '600', fontSize: '13px', letterSpacing: '2px', paddingTop: '30px', margin: '0 0 10px 0' }}>SLIATE CAMPUS</p>
          <h1 style={{ fontSize: '36px', fontWeight: '700', margin: '0 0 8px 0' }}>
            {getGreeting()}, {userName}...
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px' }}>
            Let's help reunite someone with their belongings today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/post-item" style={{ textDecoration: 'none' }}>
            <button style={{ backgroundColor: '#dc2626', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
              <i className="fa-solid fa-file-lines"></i>
               Report a Lost Item
            </button>
          </Link>
          <Link to="/post-found" style={{ textDecoration: 'none' }}>
            <button style={{ backgroundColor: '#16a34a', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
              <i className="fa-solid fa-circle-check"></i>
               I Found an Item
            </button>
          </Link>
        </div>
      </div>

      {/* ===== CONTENT SECTION ===== */}

      
      <div style={{ padding: '30px 5%' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '24px', marginBottom: '24px' }}>

          {/* Category Filters */}
          <div className="home-categories" style={{ marginBottom: '20px' }}>
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

          {/* Tabs */}
                    <div className="home-tabs">
                      <span
                        onClick={() => setActiveTab('lost')}
                        className={`home-tab${activeTab === 'lost' ? ' active' : ''}`}>
                       Recently Lost
                      </span>

              <span
                onClick={() => setActiveTab('found')}
                className={`home-tab${activeTab === 'found' ? ' active' : ''}`}>
               Recently Found
              </span>
             
          </div>

          {/* Loading / Error states */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
              <i className="fa-solid fa-hourglass"></i>
              Loading items...
            </div>
          )}

          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#dc2626', fontSize: '14px' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              {error}
            </div>
          )}

          {/* Item Cards Grid */}
          {!loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {filteredItems.length > 0 ? filteredItems.map(item => (
                <div
                    onClick={() => navigate(`/item/${item._id}`)}                  key={item._id}
                  onMouseEnter={() => setHoveredCard(item._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden',
                    boxShadow: hoveredCard === item._id ? '0 8px 30px rgba(15,41,66,0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transform: hoveredCard === item._id ? 'translateY(-4px)' : 'translateY(0)',
                    transition: 'all 0.25s ease',
                    border: hoveredCard === item._id ? '1.5px solid #0f2942' : '1.5px solid transparent'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={item.image ? `${UPLOADS_BASE}/${item.image}` : 'https://via.placeholder.com/400x180?text=No+Image'}
                      alt={item.title}
                      style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                    />
                    <span style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: statusColors[item.status]?.bg, color: statusColors[item.status]?.color }}>
                      {statusColors[item.status]?.label}
                    </span>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#0f2942', fontSize: '16px', fontWeight: '700' }}>{item.title}</h3>
                    <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '13px' }}>
                    <i className="fa-solid fa-location-dot"></i>
                     {item.location}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                     <i className="fa-solid fa-calendar-days"></i>
                    {new Date(item.date).toLocaleDateString()}
                    </span>
                    <span style={{ color: '#bfa15f', fontSize: '13px', fontWeight: '600' }}>{item.category}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1 / -1', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', fontSize: '14px' }}>
                  No {activeTab} items yet. Post the first one!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;