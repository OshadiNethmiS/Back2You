import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import log from './images/Logo.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./AdminDashboard.css";

// Setup API Axios instance pointing to backend
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const TABS = [
  { key: "overview", label: "Dashboard", icon: "fa-solid fa-chart-line" },
  { key: "users", label: "Users", icon: "fa-solid fa-users" },
  { key: "lost-posts", label: "Lost Posts", icon: "fa-solid fa-clipboard-question" },
  { key: "found-posts", label: "Found Posts", icon: "fa-solid fa-circle-check" },
  { key: "matches", label: "Matches", icon: "fa-solid fa-puzzle-piece" },
  { key: "claims", label: "Claims", icon: "fa-solid fa-hand-holding-hand" },
  { key: "reports", label: "Reports", icon: "fa-solid fa-chart-pie" },
  { key: "notifications", label: "Notifications", icon: "fa-solid fa-bell" },
  { key: "settings", label: "Settings", icon: "fa-solid fa-gear" },
];

export default function AdminDashboard() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [adminUser, setAdminUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [searchGlobal, setSearchGlobal] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Login credentials states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Authenticate Admin on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAdminStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminStatus = async () => {
    try {
      const res = await API.get("/auth/profile");
      const user = res.data.user;
      if (user && (user.role === "admin" || user.role === "superadmin")) {
        setIsAdminLoggedIn(true);
        setAdminUser(user);
        fetchNotifications();
      } else {
        handleLogout();
      }
    } catch (err) {
      handleLogout();
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError("");
    if (!loginEmail || !loginPassword) {
      setLoginError("Please fill in all fields.");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      const token = res.data.token;
      // Temporarily store token to verify admin profile
      localStorage.setItem("token", token);

      const profileRes = await axios.get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = profileRes.data.user;
      if (user && (user.role === "admin" || user.role === "superadmin")) {
        setAdminUser(user);
        setIsAdminLoggedIn(true);
        setLoginPassword("");
        setLoginEmail("");
        fetchNotifications();
      } else {
        localStorage.removeItem("token");
        setLoginError("Access Denied: You do not have administrator permissions.");
      }
    } catch (err) {
      localStorage.removeItem("token");
      setLoginError(err.response?.data?.message || "Invalid credentials. Try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setActiveTab("overview");
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/admin/notifications");
      setNotifications(res.data || []);
      setUnreadNotifCount(res.data?.filter((n) => !n.read).length || 0);
    } catch (err) {
      console.error("Failed to fetch admin notifications");
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await API.patch("/admin/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // Render Login Screen if not logged in
  if (!isAdminLoggedIn) {
    return (
      <div className="admin-login-container">
        <Styles />
        <div className="login-split-left">
          <div className="login-logo-header">
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                               <div className="home-nav-logo-box">
                               
                                 <div>
                                     <img src={log} alt="Back2You Logo" style={{ width: '30px', height: 'auto' }} />
                                     {/* rest of your page */}
                                   </div>
                               </div>
            </div>
              <span style={{ fontFamily: 'Times New Roman' , fontSize: '27px', fontWeight: '700', color: 'white', letterSpacing: '-0.02em' }}>
                          Back<span style={{ color: 'gold' }}>2</span>You
                        </span> 
          </div>

          <div className="preview-card-outer">
            <div className="preview-card-inner">
              <video width="120%" height="100%" autoPlay muted loop playsInline style={{ display: "block", objectFit: "cover" ,alignItems: "center", justifyContent: "center"}}>
              <source src="/video/Admin_login.mp4" type="video/mp4" />
            </video>
              
            </div>
          </div>

          <h2 className="admin-left-title">University Admin Hub</h2>
          <p className="admin-left-sub">
            Streamline the connection between lost valuables and their owners across the entire campus ecosystem.
          </p>
        </div>

        <div className="login-split-right">
          <div className="login-form-wrap">
            <h1 className="right-panel-heading">Welcome Back</h1>
            <p className="right-panel-sub">Please enter your administrative credentials to continue.</p>

            {loginError && (
              <div className="login-error-alert">
                <i className="fa-solid fa-triangle-exclamation"></i> {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <label className="input-label">Admin Email</label>
                <div className="input-with-icon">
                  <i className="fa-regular fa-envelope input-icon"></i>
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label className="input-label">Password</label>
                  <a href="#forgot" className="forgot-pwd-link" onClick={(e) => { e.preventDefault(); alert("Please contact IT Support to reset password."); }}>
                    Forgot password?
                  </a>
                </div>
                <div className="input-with-icon">
                  <i className="fa-solid fa-lock input-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <i
                    className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} eye-toggle`}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>
              </div>

              <div className="remember-row">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember this device for 30 days</label>
              </div>

              <button type="submit" className="login-btn-primary" disabled={loginLoading}>
                {loginLoading ? "Verifying..." : "Secure Login"}{" "}
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </form>

            <div className="login-divider"></div>

            <p className="support-text">
              <i className="fa-solid fa-circle-info"></i> Having trouble logging in?{" "}
              <a href="#support" onClick={(e) => { e.preventDefault(); alert("IT Support contact: support@university.edu | Ext. 4400"); }}>
                Contact IT Support
              </a>
            </p>

            <div className="login-footer-links">
              <span>Privacy Policy</span> • <span>Terms of Service</span>
              <p className="copyright-text">© 2024 University Admin Portal</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Logged In Layout
  return (
    <div className="admin-app-root">
      <Styles />

      {/* LEFT SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className="sidebar-top">
          {/* Logo */}
          <div className="sidebar-logo-row">
            <img src={log} alt="Back2You Logo" className="sidebar-logo-img" />
            <span className="sidebar-logo-name">
              Back<span style={{ color: "gold" }}>2</span>You
            </span>
          </div>

          <span className="sidebar-subtitle">University Admin Hub</span>
        </div>

        <nav className="sidebar-nav">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`nav-btn ${isActive ? "nav-btn-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={`${tab.icon} nav-icon`}></i>
                <span className="nav-label">{tab.label}</span>
                {tab.key === "notifications" && unreadNotifCount > 0 && (
                  <span className="sidebar-badge">{unreadNotifCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin User Info Block at bottom */}
        <div className="sidebar-footer">
          <div className="admin-avatar-circle">
            {adminUser?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="admin-details">
            <span className="admin-name">{adminUser?.name || "Admin User"}</span>
            <span className="admin-role">{adminUser?.role?.toUpperCase() || "SUPER ADMINISTRATOR"}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Log Out">
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="admin-main-container">
        {/* TOP BAR */}
        <header className="admin-topbar">
          <div className="topbar-left">
            {/* Hamburger — collapses/expands the sidebar */}
            <button
              className="hamburger-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label="Toggle sidebar"
            >
              <i className="fa-solid fa-bars"></i>
            </button>

            <div className="topbar-search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Search item posts, IDs, or student names..."
                value={searchGlobal}
                onChange={(e) => setSearchGlobal(e.target.value)}
              />
            </div>
          </div>

          <div className="topbar-right">
            <div className="notif-bell-wrap" onClick={() => setActiveTab("notifications")}>
              <i className="fa-regular fa-bell bell-icon"></i>
              {unreadNotifCount > 0 && <span className="bell-dot"></span>}
            </div>
            <div className="profile-circle" onClick={() => setActiveTab("settings")}>
              {adminUser?.name?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* CONTENT PANELS */}
        <main className="admin-content-area">
          {activeTab === "overview" && <OverviewTab globalSearch={searchGlobal} setActiveTab={setActiveTab} />}
          {activeTab === "users" && <UsersTab globalSearch={searchGlobal} />}
          {activeTab === "lost-posts" && <PostsTab type="lost" globalSearch={searchGlobal} />}
          {activeTab === "found-posts" && <PostsTab type="found" globalSearch={searchGlobal} />}
          {activeTab === "matches" && <MatchesTab />}
          {activeTab === "claims" && <ClaimsTab />}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "notifications" && (
            <NotificationsTab
              notifications={notifications}
              fetchNotifications={fetchNotifications}
              markAllNotificationsRead={markAllNotificationsRead}
            />
          )}
          {activeTab === "settings" && <SettingsTab adminUser={adminUser} checkAdminStatus={checkAdminStatus} />}
        </main>
      </div>
    </div>
  );
}

// ── OVERVIEW TAB ──
function OverviewTab({ globalSearch, setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [unclaimedHighValue, setUnclaimedHighValue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const statsRes = await API.get("/admin/stats");
      const activityRes = await API.get("/admin/recent-activity");
      const unclaimedRes = await API.get("/admin/unclaimed-high-value");

      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
      setUnclaimedHighValue(unclaimedRes.data);
    } catch (err) {
      console.error("Failed to load dashboard overview data", err);
    } finally {
      setLoading(false);
    }
  };

  // Opens a clean, print-friendly HTML report in a new tab (same pattern as
  // the Lost/Found "Print Report" button) instead of calling window.print()
  // directly on the SPA — that would print the sidebar/cards/shadows as-is
  // and look like a broken screenshot instead of a proper report.
  const exportOverviewReport = () => {
    const escapeHTML = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (ch) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      }[ch]));

    const generatedOn = new Date().toLocaleString();

    const statsRows = cards.map((c) => `
      <tr>
        <td>${escapeHTML(c.label)}</td>
        <td>${escapeHTML(c.val)}</td>
      </tr>
    `).join("");

    const activityRows = recentActivity.length > 0
      ? recentActivity.map((act) => `
        <tr>
          <td>${escapeHTML(act.title)}</td>
          <td>${escapeHTML(act.description)}</td>
          <td>${escapeHTML(formatTimeAgo(act.createdAt))}</td>
        </tr>
      `).join("")
      : `<tr><td colspan="3" style="text-align:center;color:#94A3B8;">No recent activity.</td></tr>`;

    const unclaimedRows = unclaimedHighValue.length > 0
      ? unclaimedHighValue.map((item) => `
        <tr>
          <td>${escapeHTML(item.title)}</td>
          <td>${escapeHTML(item.category)}</td>
          <td>${escapeHTML(item.date)}</td>
          <td>${escapeHTML(item.location)}</td>
        </tr>
      `).join("")
      : `<tr><td colspan="4" style="text-align:center;color:#94A3B8;">No unclaimed items reported.</td></tr>`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Back2You — Overview Dashboard Report</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1E293B;
            padding: 32px;
            margin: 0;
          }
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #2563EB;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .report-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .report-logo {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            object-fit: cover;
          }
          .report-brand {
            font-family: 'Times New Roman', serif;
            font-size: 22px;
            font-weight: 700;
            color: #0F172A;
          }
          .report-brand span { color: #D4AF37; }
          .report-header h1 {
            margin: 2px 0 0 0;
            font-size: 18px;
            color: #0F172A;
          }
          .report-meta {
            text-align: right;
            font-size: 12px;
            color: #64748B;
          }
          h2.section-title {
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #2563EB;
            margin: 28px 0 10px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th {
            background-color: #0F172A;
            color: #fff;
            text-align: left;
            padding: 8px 10px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            font-size: 10px;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #E2E8F0;
            vertical-align: top;
          }
          tr:nth-child(even) td {
            background-color: #F8FAFC;
          }
          .report-footer {
            margin-top: 32px;
            font-size: 11px;
            color: #94A3B8;
            text-align: center;
          }
          @media print {
            body { padding: 12px; }
            .report-header { break-after: avoid; }
            tr { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="report-header-left">
            <img src="${log}" alt="Back2You Logo" class="report-logo" />
            <div>
              <div class="report-brand">Back<span>2</span>You</div>
              <h1>Overview Dashboard Report</h1>
            </div>
          </div>
          <div class="report-meta">Generated on<br/>${generatedOn}</div>
        </div>

        <h2 class="section-title">Key Statistics</h2>
        <table>
          <thead><tr><th>Metric</th><th>Value</th></tr></thead>
          <tbody>${statsRows}</tbody>
        </table>

        <h2 class="section-title">Recent Activity</h2>
        <table>
          <thead><tr><th>Title</th><th>Description</th><th>Time</th></tr></thead>
          <tbody>${activityRows}</tbody>
        </table>

        <h2 class="section-title">Unclaimed High Value Items</h2>
        <table>
          <thead><tr><th>Item</th><th>Category</th><th>Found Date</th><th>Location</th></tr></thead>
          <tbody>${unclaimedRows}</tbody>
        </table>

        <div class="report-footer">Back2You University Admin Hub — Confidential Report</div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to export this report.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content/styles to render before triggering print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  if (loading) return <div className="loading-state">Loading Admin Dashboard overview...</div>;

  const cards = [
    { label: "TOTAL STUDENTS", val: stats?.totalStudents ?? 0, spark: stats?.sparklines?.totalStudents, icon: "fa-users", color: "#3B82F6", bg: "#EFF6FF" },
    { label: "TOTAL LOST", val: stats?.totalLost ?? 0, spark: stats?.sparklines?.totalLost, icon: "fa-circle-question", color: "#EF4444", bg: "#FEF2F2" },
    { label: "TOTAL FOUND", val: stats?.totalFound ?? 0, spark: stats?.sparklines?.totalFound, icon: "fa-circle-check", color: "#10B981", bg: "#ECFDF5" },
    { label: "PENDING CLAIMS", val: stats?.pendingClaims ?? 0, spark: stats?.sparklines?.pendingClaims, icon: "fa-hand-holding-hand", color: "#EC4899", bg: "#FDF2F8" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview Dashboard</h1>
          <p className="page-sub">Snapshot of student interactions and Lost & Found statistics.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={exportOverviewReport}>
            <i className="fa-solid fa-file-export"></i> Export Data
          </button>
          <button className="btn-primary" onClick={() => setActiveTab("lost-posts")}>
            <i className="fa-solid fa-plus"></i> Register Item
          </button>
        </div>
      </div>

      {/* Grid of 6 Stats Cards */}
      <div className="stats-grid">
        {cards.map((c, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-card-top">
              <div className="stat-icon-box" style={{ backgroundColor: c.bg, color: c.color }}>
                <i className={`fa-solid ${c.icon}`}></i>
              </div>
              {c.spark && c.spark[c.spark.length - 1] > c.spark[0] ? (
                <span className="stat-badge badge-up">+{Math.round(((c.spark[c.spark.length - 1] - c.spark[0]) / (c.spark[0] || 1)) * 100)}%</span>
              ) : c.spark && c.spark[c.spark.length - 1] < c.spark[0] ? (
                <span className="stat-badge badge-down">-{Math.round(((c.spark[0] - c.spark[c.spark.length - 1]) / (c.spark[0] || 1)) * 100)}%</span>
              ) : (
                <span className="stat-badge badge-neutral">Static</span>
              )}
            </div>
            <div className="stat-number">{c.val}</div>
            <div className="stat-label">{c.label}</div>

            {/* Sparkline mini bar chart */}
            {c.spark && (
              <div className="sparkline-bar-wrap">
                {c.spark.map((val, idx) => {
                  const max = Math.max(1, ...c.spark);
                  const pct = Math.round((val / max) * 100);
                  const isLast = idx === c.spark.length - 1;
                  return (
                    <div
                      key={idx}
                      className="sparkline-bar"
                      style={{
                        height: `${Math.max(15, pct)}%`,
                        backgroundColor: isLast ? c.color : "#D1D5DB",
                      }}
                      title={`Day ${idx + 1}: ${val}`}
                    ></div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two Column Layout Below */}
      <div className="dashboard-columns">
        {/* Recent Activity */}
        <div className="card-box flex-2">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <span className="card-link" onClick={() => setActiveTab("reports")}>View All</span>
          </div>
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((act) => (
                <div className="activity-item" key={act._id}>
                  <div className={`activity-icon-bullet bullet-${act.statusType}`}>
                    <i className="fa-solid fa-circle"></i>
                  </div>
                  <div className="activity-details">
                    <span className="activity-title">{act.title}</span>
                    <p className="activity-desc">{act.description}</p>
                  </div>
                  <span className="activity-time">{formatTimeAgo(act.createdAt)}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No recent activities.</div>
            )}
          </div>
        </div>

        {/* Unclaimed High Value Items */}
        <div className="card-box flex-3">
          <div className="card-header">
            <h3 className="card-title">Unclaimed Found Items</h3>
            <span className="badge-priority">HIGH PRIORITY</span>
          </div>
          <div className="table-wrapper">
            <table className="hub-table">
              <thead>
                <tr>
                  <th>Item Detail</th>
                  <th>Found Date</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {unclaimedHighValue.length > 0 ? (
                  unclaimedHighValue.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="item-cell">
                          <img
                            src={item.image ? `http://localhost:5000/uploads/${item.image}` : "https://via.placeholder.com/40"}
                            alt={item.title}
                            className="item-thumbnail"
                          />
                          <div>
                            <span className="item-title">{item.title}</span>
                            <span className="item-category">{item.category}</span>
                          </div>
                        </div>
                      </td>
                      <td>{item.date}</td>
                      <td>
                        <i className="fa-solid fa-location-dot font-gray"></i> {item.location}
                      </td>
                      <td>
                        <button className="btn-action-review" onClick={() => setActiveTab("found-posts")}>Review</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-table-cell">No unclaimed items reported.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── USERS TAB ──
function UsersTab({ globalSearch }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const querySearch = search || globalSearch || "";
      const res = await API.get(`/admin/users?search=${querySearch}`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, globalSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserStatus = async (user) => {
    const isSuspended = user.status === "suspended";
    const endpoint = isSuspended ? "activate" : "suspend";
    if (!window.confirm(`Are you sure you want to ${isSuspended ? "Re-activate" : "Suspend"} ${user.name}?`)) return;

    try {
      await API.patch(`/admin/users/${user._id}/${endpoint}`);
      fetchUsers();
    } catch (err) {
      alert("Failed to update user status.");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user? This action is irreversible.")) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="card-box">
      <div className="card-header">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="page-sub">{users.length} registered campus profiles</p>
        </div>
        <div className="topbar-search filter-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading user records...</div>
      ) : (
        <div className="table-wrapper">
          <table className="hub-table">
            <thead>
              <tr>
                <th>Student Submitter</th>
                <th>Email</th>
                <th>Joined Date</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => {
                  const isSuspended = user.status === "suspended";
                  const nameInitials = user.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "S";
                  return (
                    <tr key={user._id}>
                      <td>
                        <div className="student-profile-cell">
                          <div className="avatar-initials" style={{ backgroundColor: stringToColor(user.name || "St") }}>
                            {nameInitials}
                          </div>
                          <div>
                            <span className="item-title">{user.name}</span>
                            <span className="item-category">ID: {user.studentId || "N/A"}</span>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`pill-role role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`pill-status status-${isSuspended ? "pending" : "approved"}`}>
                          {isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-icon" title="View details" onClick={() => setSelectedUser(user)}>
                            <i className="fa-regular fa-eye"></i>
                          </button>
                          <button
                            className="btn-icon"
                            title={isSuspended ? "Activate User" : "Suspend User"}
                            onClick={() => toggleUserStatus(user)}
                          >
                            <i className={`fa-solid ${isSuspended ? "fa-user-check font-green" : "fa-user-slash font-amber"}`}></i>
                          </button>
                          <button className="btn-icon" title="Delete User" onClick={() => deleteUser(user._id)}>
                            <i className="fa-regular fa-trash-can font-red"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="empty-table-cell">No users matching search filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

function UserModal({ user, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header student-modal-header">
                    <img src={log} alt="Back2You Logo" style={{ width: '50px', height: 'auto', padding: '-10px'   }} />
                    {/* rest of your page */}

          <span style={{ fontFamily: 'Times New Roman' , fontSize: '20px', fontWeight: '700', color: '#ffffff ', letterSpacing: '-0.02em' }}>
                 Back<span style={{ color: 'gold' }}>2</span>You
               </span> 

          <h3>Student Profile</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="profile-header-area">
            <div className="large-avatar">
              {user.name?.[0]?.toUpperCase() || "S"}
            </div>
            <h4>{user.name}</h4>
            <p>{user.email}</p>
          </div>
          <div className="profile-grid">
            <div className="profile-grid-item">
              <span className="lbl">Student ID</span>
              <span className="val">{user.studentId || "Not Registered"}</span>
            </div>
            <div className="profile-grid-item">
              <span className="lbl">Phone Number</span>
              <span className="val">{user.phone || "Not Registered"}</span>
            </div>
            <div className="profile-grid-item">
              <span className="lbl">Faculty</span>
              <span className="val">{user.faculty || "Not Registered"}</span>
            </div>
            <div className="profile-grid-item">
              <span className="lbl">Account Status</span>
              <span className="val">{user.status || "active"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── POSTS TAB (LOST & FOUND) ──
function PostsTab({ type, globalSearch }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterDate, setFilterDate] = useState("Last 30 Days");
  const [search, setSearch] = useState("");
  const [manualEntryOpen, setManualEntryOpen] = useState(false);

  // Manual Post form
  const [postTitle, setPostTitle] = useState("");
  const [postCategory] = useState("Electronics");
  const [postLocation, setPostLocation] = useState("");
  const [postDate, setPostDate] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const [postType, setPostType] = useState(type); // lets admin override lost/found in the modal

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const querySearch = search || globalSearch || "";
      const res = await API.get("/admin/posts", {
        params: {
          type,
          status: filterStatus,
          category: filterCategory,
          dateFilter: filterDate,
          search: querySearch,
        },
      });
      setPosts(res.data);
      setCurrentPage(1); // reset to first page
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [type, filterStatus, filterCategory, filterDate, search, globalSearch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const approvePost = async (postId) => {
    try {
      await API.patch(`/admin/posts/${postId}/status`, { status: "approved" });
      fetchPosts();
    } catch (err) {
      alert("Failed to approve post.");
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Permanently delete this item post?")) return;
    try {
      await API.delete(`/admin/posts/${postId}`);
      fetchPosts();
    } catch (err) {
      alert("Failed to delete post.");
    }
  };

  // Opens a clean, print-friendly HTML report in a new tab and triggers the
  // browser print dialog. We build a standalone document instead of calling
  // window.print() on the SPA itself — printing the dashboard directly picks
  // up the sidebar, cards, shadows etc. and comes out looking like a broken
  // screenshot instead of a proper report.
  const printPostsReport = () => {
    if (posts.length === 0) {
      alert("No posts to print.");
      return;
    }

    const escapeHTML = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (ch) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      }[ch]));

    const reportTitle = `${type === "lost" ? "Lost" : "Found"} Post Report`;
    const generatedOn = new Date().toLocaleString();

    const tableRows = posts.map((post, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHTML(post.title)}</td>
        <td>${escapeHTML(post.category)}</td>
        <td>${escapeHTML(post.location)}</td>
        <td>${escapeHTML(post.date)}</td>
        <td>${escapeHTML(post.status)}</td>
        <td>${escapeHTML(post.postedBy?.name || "Anonymous")}</td>
        <td>${escapeHTML(post.postedBy?.studentId || "N/A")}</td>
        <td>${escapeHTML(post.description || "-")}</td>
      </tr>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${reportTitle}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1E293B;
            padding: 32px;
            margin: 0;
          }
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 3px solid #2563EB;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .report-header h1 {
            margin: 0 0 4px 0;
            font-size: 24px;
            color: #0F172A;
          }
          .report-header p {
            margin: 0;
            font-size: 13px;
            color: #64748B;
          }
          .report-meta {
            text-align: right;
            font-size: 12px;
            color: #64748B;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th {
            background-color: #0F172A;
            color: #fff;
            text-align: left;
            padding: 8px 10px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            font-size: 10px;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #E2E8F0;
            vertical-align: top;
          }
          tr:nth-child(even) td {
            background-color: #F8FAFC;
          }
          .report-footer {
            margin-top: 24px;
            font-size: 11px;
            color: #94A3B8;
            text-align: center;
          }
          @media print {
            body { padding: 12px; }
            .report-header { break-after: avoid; }
            tr { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div>
            <h1>
            <span style=" fontFamily: 'Times New Roman'; fontSize: 27px; fontWeight: 700; color: #0F172A ; letterSpacing: -0.02em;">
                Back<span style="color:gold;">2</span>You
               </span> 
             — ${reportTitle}</h1>
            <p>University Admin Hub · Total Records: ${posts.length}</p>
          </div>
          <div class="report-meta">Generated on<br/>${generatedOn}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Category</th>
              <th>Location</th>
              <th>Date</th>
              <th>Status</th>
              <th>Student</th>
              <th>Student ID</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="report-footer">Back2You University Admin Hub — Confidential Report</div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print this report.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content/styles to render before triggering print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

 const submitManualEntry = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("type", postType);
      formData.append("title", postTitle);
      formData.append("category", postCategory);
      formData.append("location", postLocation);
      formData.append("date", postDate);
      formData.append("description", postDesc);
      formData.append("studentEmail", studentEmail);
      if (postImage) {
        formData.append("image", postImage);
      }

      await API.post("/admin/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setManualEntryOpen(false);
      // Reset form
      setPostTitle("");
      setPostLocation("");
      setPostDate("");
      setPostDesc("");
      setStudentEmail("");
      setPostImage(null);
      setPostImagePreview(null);
      setPostType(type);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit manual entry.");
    }
  };

  // Pagination calculations
  const totalEntries = posts.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEntries = posts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalEntries / itemsPerPage);


  const awaitingCount = posts.filter((p) => p.status === "reported").length;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>Administration</span> &gt; <span className="active">Post Management</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">{type === "lost" ? "Lost" : "Found"} Post Management</h1>
          <p className="page-sub">Audit and coordinate student reported items and catalog entries.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={printPostsReport}>
            <i className="fa-solid fa-print"></i> Print Report
          </button>
          <button className="btn-gold" onClick={() => { setPostType(type); setManualEntryOpen(true); }}>
            + Manual Entry
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="filter-row">
        <div className="pill-tabs">
          <button
            className={`pill-tab ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Posts
          </button>
          <button
            className={`pill-tab ${filterStatus === "pending" ? "active" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
          <button
            className={`pill-tab ${filterStatus === "approved" ? "active" : ""}`}
            onClick={() => setFilterStatus("approved")}
          >
            Approved
          </button>
        </div>

        <div className="filter-selects">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="All Categories">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Documents">Documents</option>
            <option value="Keys">Keys</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>

          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="All Time">All Time</option>
          </select>

          <div className="topbar-search filter-search mini">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="info-badge-awaiting">
          <i className="fa-solid fa-clock-rotate-left"></i> AWAITING VERIFICATION — {awaitingCount} Items
        </div>
      </div>

      {/* Posts Table */}
      <div className="card-box">
        {loading ? (
          <div className="loading-state">Loading post database...</div>
        ) : (
          <div className="table-wrapper">
            <table className="hub-table">
              <thead>
                <tr>
                  <th>Item Preview</th>
                  <th>Post Title</th>
                  <th>Category</th>
                  <th>Student Submitter</th>
                  <th>Date Reported</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  currentEntries.map((post) => {
                    const initials = post.postedBy?.name
                      ? post.postedBy.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
                      : "S";
                    const isPending = post.status === "reported";
                    return (
                      <tr key={post._id}>
                        <td>
                          <img
                            src={post.image ? `http://localhost:5000/uploads/${post.image}` : "https://via.placeholder.com/50"}
                            alt={post.title}
                            className="item-thumbnail large"
                          />
                        </td>
                        <td>
                          <div>
                            <span className="item-title">{post.title}</span>
                            <span className="item-category font-gray">
                              <i className="fa-solid fa-location-dot"></i> {post.location}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="pill-category">{post.category}</span>
                        </td>
                        <td>
                          <div className="student-profile-cell">
                            <div className="avatar-initials" style={{ backgroundColor: stringToColor(post.postedBy?.name || "St") }}>
                              {initials}
                            </div>
                            <div>
                              <span className="item-title">{post.postedBy?.name || "Anonymous Student"}</span>
                              <span className="item-category font-gray">ID: {post.postedBy?.studentId || "N/A"}</span>
                            </div>
                          </div>
                        </td>
                        <td>{post.date}</td>
                        <td>
                          <span className={`pill-status status-${isPending ? "pending" : "approved"}`}>
                            {isPending ? "Pending" : "Approved"}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            {isPending && (
                              <button className="btn-icon approve" title="Approve Post" onClick={() => approvePost(post._id)}>
                                <i className="fa-solid fa-check font-green"></i>
                              </button>
                            )}
                            <button className="btn-icon font-red" title="Delete Post" onClick={() => deletePost(post._id)}>
                              <i className="fa-regular fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-table-cell">No items reported matching this query.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        <div className="table-footer-pagination">
          <span className="showing-entries-label">
            Showing {totalEntries > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, totalEntries)} of {totalEntries} entries
          </span>
          <div className="pagination-controls">
            <button
              className="page-control-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <i className="fa-solid fa-chevron-left"></i> Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`page-num-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-control-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {manualEntryOpen && (
        <div className="modal-overlay" onClick={() => setManualEntryOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>+ Manual Post Entry ({type.toUpperCase()})</h3>
              <button className="btn-close" onClick={() => setManualEntryOpen(false)}>✕</button>
            </div>
              <form onSubmit={submitManualEntry} className="modal-body">
              {/* 🆕 Lost / Found choose */}
              <div className="form-group-modal">
                <label>Post Type</label>
                <div className="pill-tabs" style={{ width: "fit-content" }}>
                  <button
                    type="button"
                    className={`pill-tab ${postType === "lost" ? "active" : ""}`}
                    onClick={() => setPostType("lost")}
                  >
                    Lost
                  </button>
                  <button
                    type="button"
                    className={`pill-tab ${postType === "found" ? "active" : ""}`}
                    onClick={() => setPostType("found")}
                  >
                    Found
                  </button>
                </div>
              </div>

              <div className="form-group-modal">
                <label>Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. Blue Dell Laptop"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  required
                />
              </div>

             {/* 🆕 Image upload */}
              <div className="form-group-modal">
                <label>Item Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setPostImage(file);
                    setPostImagePreview(file ? URL.createObjectURL(file) : null);
                  }}
                />
                {postImagePreview && (
                  <img
                    src={postImagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "160px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      marginTop: "10px",
                      border: "1.5px solid var(--border-color)",
                    }}
                  />
                )}
              </div>

              <div className="form-group-modal">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g. IT Department Laboratory"
                  value={postLocation}
                  onChange={(e) => setPostLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-modal">
                <label>Date</label>
                <input
                  type="date"
                  value={postDate}
                  onChange={(e) => setPostDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-modal">
                <label>Reporter Student Email (Optional)</label>
                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />
              </div>

              <div className="form-group-modal">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Additional details..."
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary" onClick={() => setManualEntryOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MATCHES TAB ──
function MatchesTab() {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchesData();
  }, []);

  const fetchMatchesData = async () => {
    try {
      setLoading(true);
      const lostRes = await API.get("/admin/posts?type=lost");
      const foundRes = await API.get("/admin/posts?type=found");
      setLostItems(lostRes.data || []);
      setFoundItems(foundRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const makeManualMatch = async (lostId, foundId) => {
    if (!window.confirm("Match these two items together? Both items will be updated to 'matched' status.")) return;
    try {
      await API.patch(`/admin/posts/${lostId}/status`, { status: "matched" });
      await API.patch(`/admin/posts/${foundId}/status`, { status: "matched" });
      alert("Items successfully matched!");
      fetchMatchesData();
    } catch (err) {
      alert("Failed to manual match items.");
    }
  };

  // Automatic matches grouping: lost items group by category and compare found items in same category
  const getPotentialMatches = () => {
    const list = [];
    lostItems.filter(l => l.status === "reported").forEach((lost) => {
      // Find found items in the same category that are not resolved yet
      const founds = foundItems.filter((f) => f.category === lost.category && f.status === "reported");
      if (founds.length > 0) {
        list.push({ lost, founds });
      }
    });
    return list;
  };

  const potentialMatches = getPotentialMatches();

  return (
    <div className="card-box">
      <div className="card-header">
        <div>
          <h2 className="page-title">Automatic Match Resolver</h2>
          <p className="page-sub">Intelligent suggestions matching lost reports to found database inventory</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Comparing data records...</div>
      ) : potentialMatches.length > 0 ? (
        <div className="matches-feed">
          {potentialMatches.map(({ lost, founds }) => (
            <div className="match-card-block" key={lost._id}>
              {/* Lost Item Column */}
              <div className="match-column-side bg-red-fade">
                <span className="side-type-label color-red">LOST POST</span>
                <div className="item-match-desc">
                  <strong>{lost.title}</strong>
                  <p><i className="fa-solid fa-location-dot"></i> {lost.location}</p>
                  <p><i className="fa-solid fa-calendar"></i> Reported: {lost.date}</p>
                  <span className="pill-category">{lost.category}</span>
                </div>
              </div>

              <div className="match-connector-arrows">
                <i className="fa-solid fa-circle-nodes"></i>
                <span>Potential Matches</span>
              </div>

              {/* Found Item Alternatives Column */}
              <div className="match-column-side alternatives-side">
                {founds.map((found) => (
                  <div className="found-alternative-row" key={found._id}>
                    <div className="found-alt-details">
                      <strong>{found.title}</strong>
                      <p><i className="fa-solid fa-location-dot"></i> {found.location}</p>
                      <p><i className="fa-solid fa-calendar"></i> Cataloged: {found.date}</p>
                    </div>
                    <button
                      className="btn-action-match"
                      onClick={() => makeManualMatch(lost._id, found._id)}
                    >
                      Match & Link
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-card">
          <i className="fa-solid fa-circle-check font-green"></i>
          <h4>No potential matches to resolve.</h4>
          <p>All reported items have either been matched or there are no overlapping categories.</p>
        </div>
      )}
    </div>
  );
}

// ── CLAIMS TAB ──
function ClaimsTab() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/claims");
      setClaims(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleClaimDecision = async (claimId, action) => {
    // action: 'approved' or 'rejected'
    if (!window.confirm(`Are you sure you want to mark this claim as ${action.toUpperCase()}?`)) return;
    try {
      await API.patch(`/admin/claims/${claimId}`, { status: action });
      fetchClaims();
      setSelectedClaim(null);
    } catch (err) {
      alert("Failed to save claim decision.");
    }
  };

  return (
    <div className="card-box">
      <div className="card-header">
        <div>
          <h2 className="page-title">Claim Applications</h2>
          <p className="page-sub">Review claims made by students on lost & found campus items.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading claim logs...</div>
      ) : (
        <div className="table-wrapper">
          <table className="hub-table">
            <thead>
              <tr>
                <th>Item Claimed</th>
                <th>Original Poster</th>
                <th>Claimant (Reacted)</th>
                <th>Application Date</th>
                <th>Status</th>
                <th>Decision Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.length > 0 ? (
                claims.map((claim) => {
                  const item = claim.itemId || {};
                  const poster = item.postedBy || {};
                  const claimant = claim.claimedBy || {};
                  const isPending = claim.status === "pending";
                  const isLostItem = item.type === "lost";
                  // Role labels flip depending on whether the original post was a
                  // "Lost" report (poster = owner) or a "Found" report (poster = finder)
                  const posterRoleLabel = isLostItem ? "Owner (Lost It)" : "Finder (Found It)";
                  const claimantRoleLabel = isLostItem ? "Claims They Found It" : "Claims Ownership";

                  return (
                    <tr
                      key={claim._id}
                      className="claim-row-clickable"
                      onClick={() => setSelectedClaim(claim)}
                    >
                      <td>
                        <div className="item-cell">
                          <img
                            src={item.image ? `http://localhost:5000/uploads/${item.image}` : "https://via.placeholder.com/40"}
                            alt={item.title}
                            className="item-thumbnail"
                          />
                          <div>
                            <span className="item-title">{item.title || "Deleted Item"}</span>
                            <span className="item-category font-gray">
                              {item.category} · <span className={isLostItem ? "font-red" : "font-green"}>{isLostItem ? "Lost Post" : "Found Post"}</span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className="mini-role-tag">{posterRoleLabel}</span>
                          <span className="item-title" style={{ marginTop: "4px" }}>{poster.name || "N/A"}</span>
                          <span className="item-category font-gray">ID: {poster.studentId || "N/A"} | Phone: {poster.phone || "N/A"}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className="mini-role-tag">{claimantRoleLabel}</span>
                          <span className="item-title" style={{ marginTop: "4px" }}>{claimant.name || "N/A"}</span>
                          <span className="item-category font-gray">ID: {claimant.studentId || "N/A"} | Phone: {claimant.phone || "N/A"}</span>
                        </div>
                      </td>
                      <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`pill-status status-${claim.status}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {isPending ? (
                          <div className="decision-actions">
                            <button
                              className="btn-decision approve"
                              onClick={() => handleClaimDecision(claim._id, "approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-decision reject"
                              onClick={() => handleClaimDecision(claim._id, "rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="font-gray">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="empty-table-cell">No claims reported yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onDecision={handleClaimDecision}
        />
      )}
    </div>
  );
}

// ── CLAIM FULL DETAIL MODAL ──
function ClaimDetailModal({ claim, onClose, onDecision }) {
  const item = claim.itemId || {};
  const poster = item.postedBy || {};
  const claimant = claim.claimedBy || {};
  const isPending = claim.status === "pending";
  const isLostItem = item.type === "lost";
  const posterRoleLabel = isLostItem ? "Owner (Reported Lost)" : "Finder (Reported Found)";
  const claimantRoleLabel = isLostItem ? "Claims They Found It" : "Claims Ownership";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Claim Full Details</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Item Summary */}
          <div className="claim-detail-item-row">
            <img
              src={item.image ? `http://localhost:5000/uploads/${item.image}` : "https://via.placeholder.com/70"}
              alt={item.title}
              className="claim-detail-img"
            />
            <div>
              <h4 style={{ margin: "0 0 4px 0" }}>{item.title || "Deleted Item"}</h4>
              <span className="pill-category">{item.category}</span>{" "}
              <span className={`pill-status ${isLostItem ? "status-rejected" : "status-approved"}`}>
                {isLostItem ? "Lost Post" : "Found Post"}
              </span>
              <p className="font-gray" style={{ fontSize: "13px", margin: "8px 0 0 0" }}>
                <i className="fa-solid fa-location-dot"></i> {item.location || "N/A"} &nbsp;|&nbsp;
                <i className="fa-solid fa-calendar"></i> {item.date || "N/A"}
              </p>
              {item.description && (
                <p className="font-gray" style={{ fontSize: "13px", margin: "6px 0 0 0" }}>
                  {item.description}
                </p>
              )}
            </div>
          </div>

          <div className="settings-divider"></div>

          {/* Poster & Claimant Side by side */}
          <div className="profile-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="profile-grid-item">
              <span className="lbl">{posterRoleLabel}</span>
              <span className="val">{poster.name || "N/A"}</span>
              <span className="val font-gray" style={{ fontWeight: 500 }}>{poster.email || ""}</span>
              <span className="val font-gray" style={{ fontWeight: 500 }}>ID: {poster.studentId || "N/A"}</span>
              <span className="val font-gray" style={{ fontWeight: 500 }}>Phone: {poster.phone || "N/A"}</span>
              <span className="val font-gray" style={{ fontWeight: 500 }}>Faculty: {poster.faculty || "N/A"}</span>
            </div>
            <div className="profile-grid-item">
              <span className="lbl">{claimantRoleLabel}</span>
              <span className="val">{claimant.name || "N/A"}</span>
              <span className="val font-gray" style={{ fontWeight: 500 }}>{claimant.email || ""}</span>
              <span className="val font-gray" style={{ fontWeight: 500 }}>ID: {claimant.studentId || "N/A"}</span>
              <span className="val font-gray" style={{ fontWeight: 500 }}>Phone: {claimant.phone || "N/A"}</span>
              <span className="val font-gray" style={{ fontWeight: 500 }}>Faculty: {claimant.faculty || "N/A"}</span>
            </div>
          </div>

          <div className="settings-divider"></div>

          <div className="profile-grid-item">
            <span className="lbl">Application Date</span>
            <span className="val">{new Date(claim.createdAt).toLocaleString()}</span>
          </div>
          <div className="profile-grid-item">
            <span className="lbl">Current Status</span>
            <span className={`pill-status status-${claim.status}`} style={{ width: "fit-content" }}>{claim.status}</span>
          </div>

          {isPending && (
            <div className="modal-footer-actions">
              <button className="btn-decision reject" onClick={() => onDecision(claim._id, "rejected")}>
                Reject
              </button>
              <button className="btn-decision approve" onClick={() => onDecision(claim._id, "approved")}>
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── REPORTS & ANALYTICS TAB ──
function ReportsTab() {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period] = useState("Week");

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/reports?period=${period}`);
      setReportsData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Compiling analytics report...</div>;

  const weeklyTrends = reportsData?.weeklyTrends || [];
  const categoriesBreakdown = reportsData?.categoriesBreakdown || [];
  const resolutionRates = reportsData?.resolutionRates || [];
  const auditLogs = reportsData?.auditLogs || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Strategic Reports</h1>
          <p className="page-sub">Real-time performance metrics and historical data audit.</p>
        </div>
        <div className="header-actions-reports">
          
          
        </div>
      </div>

      {/* Two Column Graphs */}
      <div className="dashboard-columns">
        {/* Weekly Activity Trends Bar Chart */}
        <div className="card-box flex-3">
          <div className="card-header">
            <h3 className="card-title">Weekly Activity Trends</h3>
            <div className="chart-legend">
              <span className="legend-dot dot-lost"></span> Lost Items
              <span className="legend-dot dot-found"></span> Found Items
            </div>
          </div>
          {/* Custom SVG Bar Chart */}
          <div className="svg-chart-container">
            <svg viewBox="0 0 500 220" className="chart-svg">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#F1F5F9" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#F1F5F9" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#F1F5F9" />
              <line x1="40" y1="180" x2="480" y2="180" stroke="#E2E8F0" strokeWidth="2" />

              {/* Y Axis Labels */}
              <text x="15" y="25" fill="#94A3B8" fontSize="10">20</text>
              <text x="15" y="65" fill="#94A3B8" fontSize="10">15</text>
              <text x="15" y="105" fill="#94A3B8" fontSize="10">10</text>
              <text x="15" y="145" fill="#94A3B8" fontSize="10">5</text>
              <text x="15" y="185" fill="#94A3B8" fontSize="10">0</text>

              {/* Bars rendering */}
              {weeklyTrends.map((t, idx) => {
                const step = 60;
                const startX = 50 + idx * step;
                // Scale factor: max height 160px for val 20 (8px per unit)
                const scale = 8;
                const lostHeight = Math.min(160, t.lost * scale);
                const foundHeight = Math.min(160, t.found * scale);

                return (
                  <g key={idx}>
                    {/* Lost Bar (Blue) */}
                    <rect
                      x={startX}
                      y={180 - lostHeight}
                      width="16"
                      height={lostHeight}
                      fill="#2563EB"
                      rx="2"
                    />
                    {/* Found Bar (Light Blue) */}
                    <rect
                      x={startX + 20}
                      y={180 - foundHeight}
                      width="16"
                      height={foundHeight}
                      fill="#93C5FD"
                      rx="2"
                    />
                    {/* Day label */}
                    <text x={startX + 18} y="200" fill="#64748B" fontSize="10" textAnchor="middle">
                      {t.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Item Categories Donut Chart */}
        <div className="card-box flex-2">
          <div className="card-header">
            <h3 className="card-title">Item Categories</h3>
          </div>
          <div className="donut-chart-wrap">
            {/* Custom SVG Donut */}
            <div className="donut-svg-container">
              <svg viewBox="0 0 160 160" width="140" height="140">
                <circle cx="80" cy="80" r="50" fill="transparent" stroke="#F1F5F9" strokeWidth="15" />
                {(() => {
                  let totalOffset = 0;
                  const colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280"];
                  const total = categoriesBreakdown.reduce((sum, item) => sum + item.count, 0) || 1;
                  
                  return categoriesBreakdown.map((item, idx) => {
                    const percentage = (item.count / total) * 100;
                    const strokeDash = `${percentage} ${100 - percentage}`;
                    const strokeOffset = 100 - totalOffset;
                    totalOffset += percentage;
                    const color = colors[idx % colors.length];

                    return (
                      <circle
                        key={idx}
                        cx="80"
                        cy="80"
                        r="50"
                        fill="transparent"
                        stroke={color}
                        strokeWidth="15"
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        transform="rotate(-90 80 80)"
                        pathLength="100"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="donut-center-label">
                <span className="lbl-num">{reportsData?.totalItems || 0}</span>
                <span className="lbl-txt">TOTAL ITEMS</span>
              </div>
            </div>

            {/* Legend with percentages */}
            <div className="categories-donut-legend">
              {categoriesBreakdown.map((c, idx) => {
                const colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6B7280"];
                const color = colors[idx % colors.length];
                return (
                  <div className="legend-row-item" key={idx}>
                    <div className="lbl-wrap">
                      <span className="dot" style={{ backgroundColor: color }}></span>
                      <span className="text">{c.category}</span>
                    </div>
                    <span className="percentage">{c.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Success Resolution Rate Line Chart */}
      <div className="card-box" style={{ marginTop: "24px" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Success Resolution Rate</h3>
            <p className="font-gray" style={{ fontSize: "12px", margin: "4px 0" }}>
              Percentage of recovered/resolved items against total reported reports.
            </p>
          </div>
          <span className="stat-badge badge-up">+12.5% Vs last month</span>
        </div>
        <div className="svg-line-chart-wrap">
          <svg viewBox="0 0 800 200" className="line-chart-svg">
            {/* Grid background */}
            <line x1="50" y1="20" x2="750" y2="20" stroke="#F1F5F9" />
            <line x1="50" y1="60" x2="750" y2="60" stroke="#F1F5F9" />
            <line x1="50" y1="100" x2="750" y2="100" stroke="#F1F5F9" />
            <line x1="50" y1="140" x2="750" y2="140" stroke="#F1F5F9" />
            <line x1="50" y1="180" x2="750" y2="180" stroke="#E2E8F0" strokeWidth="2" />

            {/* Y axis labels */}
            <text x="15" y="25" fill="#94A3B8" fontSize="10">100%</text>
            <text x="15" y="65" fill="#94A3B8" fontSize="10">75%</text>
            <text x="15" y="105" fill="#94A3B8" fontSize="10">50%</text>
            <text x="15" y="145" fill="#94A3B8" fontSize="10">25%</text>
            <text x="15" y="185" fill="#94A3B8" fontSize="10">0%</text>

            {/* Line Path */}
            {(() => {
              const step = 150;
              const points = resolutionRates.map((r, idx) => {
                const x = 70 + idx * step;
                // Height maps 160px maximum representing 100% (so 1.6px per 1%)
                const y = 180 - r.rate * 1.6;
                return { x, y, label: r.week, rate: r.rate };
              });

              const pathD = points.reduce((acc, p, idx) => {
                return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
              }, "");

              const areaD = points.length > 0
                ? `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`
                : "";

              return (
                <g>
                  {/* Fill area */}
                  {areaD && <path d={areaD} fill="url(#blue-gradient)" opacity="0.15" />}
                  {/* Draw main line */}
                  {pathD && <path d={pathD} fill="none" stroke="#2563EB" strokeWidth="3" />}
                  
                  {/* Draw circles */}
                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle cx={p.x} cy={p.y} r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                      <text x={p.x} y={p.y - 12} fill="#1E293B" fontSize="10" fontWeight="700" textAnchor="middle">
                        {p.rate}%
                      </text>
                      <text x={p.x} y="200" fill="#64748B" fontSize="10" textAnchor="middle">
                        {p.label}
                      </text>
                    </g>
                  ))}

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Detailed Audit Log */}
      <div className="card-box" style={{ marginTop: "24px" }}>
        <div className="card-header">
          <h3 className="card-title">Detailed Audit Log</h3>
          <select className="table-audit-filter">
            <option>All Actions</option>
          </select>
        </div>
        <div className="table-wrapper">
          <table className="hub-table">
            <thead>
              <tr>
                <th>Admin Action</th>
                <th>Details</th>
                <th>Performed By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <span className="audit-action-pill">{log.action}</span>
                    </td>
                    <td>{log.details}</td>
                    <td>{log.performedBy?.name || "System Admin"} ({log.performedBy?.email})</td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-table-cell">No administrative audit logs available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── NOTIFICATIONS TAB ──
function NotificationsTab({ notifications, fetchNotifications, markAllNotificationsRead }) {

  const markRead = async (id) => {
    try {
      await API.patch(`/admin/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "new_post":
        return { icon: "fa-clipboard-list", color: "#3B82F6" };
      case "new_user":
        return { icon: "fa-user-plus", color: "#10B981" };
      case "new_claim":
        return { icon: "fa-hand-holding-hand", color: "#EC4899" };
      case "new_report":
        return { icon: "fa-circle-exclamation", color: "#EF4444" };
      case "match":
        return { icon: "fa-puzzle-piece", color: "#8B5CF6" };
      default:
        return { icon: "fa-bell", color: "#6B7280" };
    }
  };

  return (
    <div className="card-box">
      <div className="card-header">
        <div>
          <h2 className="page-title">Administrative System Notifications</h2>
          <p className="page-sub">Real-time alerts generated across the Back2You system.</p>
        </div>
        <button className="btn-secondary" onClick={markAllNotificationsRead}>
          Mark all as read
        </button>
      </div>

      <div className="notif-feed-list">
        {notifications.length > 0 ? (
          notifications.map((n) => {
            const config = getNotifIcon(n.type);
            return (
              <div className={`notif-card-item ${n.read ? "read" : "unread"}`} key={n._id}>
                <div className="notif-item-left">
                  <div className="notif-bullet-box" style={{ color: config.color }}>
                    <i className={`fa-solid ${config.icon}`}></i>
                  </div>
                  <div>
                    <p className="notif-message-text">{n.message}</p>
                    <span className="notif-date-stamp">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                {!n.read && (
                  <button className="btn-mark-read" onClick={() => markRead(n._id)}>
                    Mark Read
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-state">No notifications. System is operating normally.</div>
        )}
      </div>
    </div>
  );
}

// ── SETTINGS TAB ──
function SettingsTab({ adminUser, checkAdminStatus }) {
  const [name, setName] = useState(adminUser?.name || "");
  const [email, setEmail] = useState(adminUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const updateProfile = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await API.patch("/auth/profile", { name, email });
      setMsg("Profile details updated successfully!");
      checkAdminStatus();
    } catch (error) {
      setErr("Failed to update profile details.");
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await API.put("/auth/update-password", { currentPassword, newPassword });
      setMsg("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to update password.");
    }
  };

  return (
    <div className="dashboard-columns">
      {/* Profile settings */}
      <div className="card-box" style={{ flex: 1, maxWidth: "600px" }}>
        <h2 className="page-title">Admin Account Settings</h2>
        <p className="page-sub">Configure your administrative credentials and details.</p>

        {msg && <div className="setting-alert-success">{msg}</div>}
        {err && <div className="setting-alert-danger">{err}</div>}

        <form onSubmit={updateProfile} className="settings-form">
          <div className="form-group-modal">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group-modal">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>
            Save Profile Changes
          </button>
        </form>

        <div className="settings-divider"></div>

        <form onSubmit={updatePassword} className="settings-form">
          <h4>Change Security Password</h4>
          <div className="form-group-modal">
            <label>Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group-modal">
            <label>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

// ── HELPER UTILS ──
function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  // e.g. "10:33 AM" -> "10:33am"
  const clockTime = date
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .replace(" ", "")
    .toLowerCase();

  // Today's items just show the clock time; older items also show the date
  if (isToday) return clockTime;
  return `${date.toLocaleDateString()}, ${clockTime}`;
}

// ── INTERNAL CSS STYLES ──
function Styles() {
  return (
    <style>{`
      /* Color Palette variables */
      :root {
        --navy-dark: #0F172A;
        --navy-sidebar: #090924;
        --primary-blue: #2563EB;
        --primary-blue-hover: #1D4ED8;
        --bg-main: #F8FAFC;
        --border-color: #E2E8F0;
        --text-dark: #1E293B;
        --text-muted: #64748B;
        --pill-orange: #F59E0B;
        --pill-green: #10B981;
      }

      /* Reset & Global */
      * {
        box-sizing: border-box;
      }

      /* ── LOGIN SPLIT SCREEN VIEW ── */
      .admin-login-container {
        display: flex;
        min-height: 100vh;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        background-color: #FFFFFF;
      }

      .login-split-left {
        width: 45%;
        background-color: #090924;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 48px;
        color: #FFFFFF;
        position: relative;
        border-top-right-radius: 24px;
        border-bottom-right-radius: 24px;
      }

      .login-logo-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        width: 100%;
      }

      .logo-icon-blue {
        background-color: var(--primary-blue);
        color: #FFFFFF;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .logo-wordmark {
        font-weight: 800;
        font-size: 24px;
        letter-spacing: -0.5px;
      }

      .preview-card-outer {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
        width: 100%;
        margin: 40px 0;
      }

      .preview-card-inner {
        width: 100%;
        max-width: 380px;
        aspect-ratio: 4/3;
        border-radius: 20px;
        position: relative;
        overflow: visible;
        margin: 0 auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      }

      .preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 20px;
      }

      .floating-chip {
        position: absolute;
        background-color: #FFFFFF;
        color: var(--navy-dark);
        padding: 8px 14px;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 700;
        box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 6px;
        animation: float 4s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }

      .chip-1 { top: 20px; left: -20px; animation-delay: 0s; }
      .chip-2 { bottom: 30px; right: -20px; animation-delay: 1s; }
      .chip-3 { top: 60%; left: -10px; animation-delay: 2s; }

      .admin-left-title {
        font-size: 32px;
        font-weight: 800;
        margin: 0 0 12px 0;
      }

      .admin-left-sub {
        font-size: 15px;
        color: #94A3B8;
        line-height: 1.6;
        margin: 0;
      }

      .login-split-right {
        width: 55%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #FFFFFF;
        padding: 48px;
      }

      .login-form-wrap {
        width: 100%;
        max-width: 440px;
      }

      .right-panel-heading {
        font-size: 32px;
        font-weight: 800;
        color: var(--navy-dark);
        margin: 0 0 8px 0;
      }

      .right-panel-sub {
        font-size: 15px;
        color: var(--text-muted);
        margin: 0 0 32px 0;
      }

      .login-error-alert {
        background-color: #FEF2F2;
        border: 1px solid #FCA5A5;
        color: #EF4444;
        padding: 12px 16px;
        border-radius: 12px;
        margin-bottom: 24px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .input-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-dark);
      }

      .forgot-pwd-link {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-blue);
        text-decoration: none;
      }

      .input-with-icon {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-icon {
        position: absolute;
        left: 16px;
        color: var(--text-muted);
        font-size: 16px;
      }

      .input-with-icon input {
        width: 100%;
        padding: 14px 16px 14px 44px;
        border-radius: 12px;
        border: 1.5px solid var(--border-color);
        font-size: 15px;
        color: var(--text-dark);
        outline: none;
        transition: border-color 0.2s;
      }

      .input-with-icon input:focus {
        border-color: var(--primary-blue);
      }

      .eye-toggle {
        position: absolute;
        right: 16px;
        color: var(--text-muted);
        cursor: pointer;
      }

      .remember-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: var(--text-dark);
      }

      .remember-row input {
        width: 16px;
        height: 16px;
        accent-color: var(--primary-blue);
      }

      .login-btn-primary {
        background-color: var(--primary-blue);
        color: #FFFFFF;
        border: none;
        border-radius: 30px;
        padding: 14px;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: background-color 0.2s;
      }

      .login-btn-primary:hover {
        background-color: var(--primary-blue-hover);
      }

      .login-divider {
        height: 1px;
        background-color: var(--border-color);
        margin: 32px 0;
      }

      .support-text {
        font-size: 14px;
        color: var(--text-muted);
        text-align: center;
        margin: 0 0 32px 0;
      }

      .support-text a {
        color: var(--primary-blue);
        font-weight: 600;
        text-decoration: none;
      }

      .login-footer-links {
        font-size: 12px;
        color: var(--text-muted);
        text-align: center;
      }

      .copyright-text {
        margin: 8px 0 0 0;
      }

      /* ── ADMIN MAIN APP LAYOUT ── */
      .admin-app-root {
        display: flex;
        min-height: 100vh;
        background-color: var(--bg-main);
        color: var(--text-dark);
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }

      /* Sidebar navigation styled to navy specifications */
      .admin-sidebar {
        width: 330px;
        background-color: var(--navy-sidebar);
        color: #FFFFFF;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        height: 100vh;
        position: sticky;
        top: 0;
        padding: 32px 24px;
        transition: width 0.2s ease, padding 0.2s ease;
      }

      /* 👇 Collapsed state (toggled by the hamburger button) */
      .admin-sidebar.sidebar-collapsed {
        width: 110px;
        padding: 32px 10px;
        align-items: center;
      }

      .sidebar-collapsed .sidebar-logo-row {
        flex-direction: column;
        gap: 6px;
      }

      .sidebar-collapsed .sidebar-logo-name {
        font-size: 13px;
        white-space: normal;
        text-align: center;
        line-height: 1.1;
      }

      .sidebar-collapsed .sidebar-subtitle,
      .sidebar-collapsed .nav-label,
      .sidebar-collapsed .sidebar-badge,
      .sidebar-collapsed .admin-details,
      .sidebar-collapsed .logout-btn {
        display: none;
      }

      .sidebar-collapsed .sidebar-footer {
        border-top: none;
        padding-top: 0;
      }

      .sidebar-collapsed .nav-btn {
        justify-content: center;
        padding: 12px;
      }

      .sidebar-top {
        margin-bottom: 32px;
      }

      .sidebar-logo-row {
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.2s ease;
      }

      .sidebar-logo-img {
        width: 30px;
        height: auto;
        flex-shrink: 0;
      }

      .sidebar-logo-name {
        font-family: 'Times New Roman';
        font-size: 27px;
        font-weight: 700;
        color: #FFFFFF;
        letter-spacing: -0.02em;
        white-space: nowrap;
        transition: font-size 0.2s ease;
      }

      .logo-box {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* 👇 Actual logo image (replaces the old icon-font logo) */
      .logo-icon-img {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .logo-icon {
        background-color: var(--primary-blue);
        color: #FFFFFF;
        padding: 8px;
        border-radius: 8px;
        font-size: 18px;
      }

      .logo-text {
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }

      .sidebar-subtitle {
        font-size: 11px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        display: block;
        margin-top: 6px;
        padding-left: 36px;
      }

      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }

      .nav-btn {
        background: transparent;
        border: none;
        color: #94A3B8;
        padding: 12px 16px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;
        width: 100%;
      }

      .nav-btn:hover {
        background-color: rgba(255,255,255,0.05);
        color: #FFFFFF;
      }

      .nav-btn-active {
        background-color: var(--primary-blue);
        color: #FFFFFF;
      }

      .nav-btn-active:hover {
        background-color: var(--primary-blue);
      }

      .nav-icon {
        font-size: 18px;
        width: 24px;
        text-align: center;
      }

      .sidebar-badge {
        margin-left: auto;
        background-color: #EF4444;
        color: #FFFFFF;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 99px;
      }

      .sidebar-footer {
        border-top: 1.5px solid rgba(255,255,255,0.08);
        padding-top: 24px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .admin-avatar-circle {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background-color: var(--primary-blue);
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 18px;
      }

      .admin-details {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
      }

      .admin-name {
        font-weight: 700;
        font-size: 14px;
        color: #FFFFFF;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .admin-role {
        font-size: 10px;
        font-weight: 700;
        color: #94A3B8;
        letter-spacing: 0.05em;
      }

      .logout-btn {
        background: transparent;
        border: none;
        color: #94A3B8;
        cursor: pointer;
        font-size: 18px;
        padding: 8px;
        border-radius: 8px;
        transition: background-color 0.2s, color 0.2s;
      }

      .logout-btn:hover {
        background-color: rgba(255,255,255,0.05);
        color: #EF4444;
      }

      /* Main container structure */
      .admin-main-container {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
      }

      .admin-topbar {
        background-color: #090924;
        height: 80px;
        border-bottom: 1.5px solid rgba(255,255,255,0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 40px;
        position: sticky;
        top: 0;
        z-index: 10;
      }

      /* 👇 Wrapper for hamburger + search, replaces the old lone search block */
      .topbar-left {
        display: flex;
        align-items: center;
      }

      /* 👇 Hamburger toggle button */
      .hamburger-btn {
        background: transparent;
        border: 1.5px solid rgba(255,255,255,0.15);
        width: 40px;
        height: 40px;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFFFFF;
        margin-right: 16px;
        flex-shrink: 0;
        transition: background-color 0.2s, border-color 0.2s;
      }

      .hamburger-btn:hover {
        background-color: rgba(255,255,255,0.08);
        border-color: #FFFFFF;
      }

      /* 👇 Updated search bar styling (rounded, subtle border, focus ring) */
      .topbar-search {
        background-color: #F8FAFC;
        border: 1.5px solid var(--border-color);
        border-radius: 9999px;
        padding: 10px 20px;
        width: 380px;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all 0.2s;
      }

      .topbar-search:focus-within {
        border-color: var(--primary-blue);
        background-color: #FFFFFF;
        box-shadow: 0 0 0 4px rgba(37,99,235,0.08);
      }

      .topbar-search i {
        color: var(--text-muted);
        font-size: 16px;
      }

      .topbar-search input {
        border: none;
        background: transparent;
        outline: none;
        font-size: 14px;
        color: var(--text-dark);
        width: 100%;
      }

      /* 👇 Dark variant applied only to the topbar's own search box, so
         search boxes inside Users/Posts tab filter rows stay light */
      .admin-topbar .topbar-search {
        background-color: rgba(255,255,255,0.06);
        border-color: rgba(255,255,255,0.15);
      }

      .admin-topbar .topbar-search:focus-within {
        background-color: rgba(255,255,255,0.1);
        border-color: var(--primary-blue);
        box-shadow: 0 0 0 4px rgba(37,99,235,0.15);
      }

      .admin-topbar .topbar-search i {
        color: rgba(255,255,255,0.55);
      }

      .admin-topbar .topbar-search input {
        color: #FFFFFF;
      }

      .admin-topbar .topbar-search input::placeholder {
        color: rgba(255,255,255,0.4);
      }

      .topbar-right {
        display: flex;
        align-items: center;
        gap: 24px;
      }

      .notif-bell-wrap {
        position: relative;
        cursor: pointer;
        padding: 8px;
      }

      .bell-icon {
        font-size: 22px;
        color: #FFFFFF;
      }

      .bell-dot {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 8px;
        height: 8px;
        background-color: #EF4444;
        border-radius: 50%;
        border: 1.5px solid #FFFFFF;
      }

      .profile-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--primary-blue);
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        cursor: pointer;
      }

      .admin-content-area {
        padding: 40px;
        flex: 1;
        overflow-y: auto;
      }

      /* ── DASHBOARD BLOCKS & CARDS ── */
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
      }

      .page-title {
        font-size: 28px;
        font-weight: 800;
        color: var(--navy-dark);
        margin: 0 0 6px 0;
      }

      .page-sub {
        font-size: 15px;
        color: var(--text-muted);
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }

      .btn-primary {
        background-color: gold ;
        color: #111111;
        border: none;
        border-radius: 30px;
        padding: 10px 22px;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.2s;
      }

      .btn-primary:hover {
        background-color: var(--primary-blue-hover);
      }

      .btn-secondary {
        background-color: #FFFFFF;
        color: var(--text-dark);
        border: 1.5px solid var(--border-color);
        border-radius: 30px;
        padding: 10px 22px;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: border-color 0.2s;
      }

      .btn-secondary:hover {
        border-color: var(--text-dark);
      }

      /* Stats cards styled precisely to cards specification */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        margin-bottom: 32px;
      }

      .stat-card {
        background-color: #FFFFFF;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
        border: 1.5px solid var(--border-color);
      }

      .stat-card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .stat-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .stat-badge {
        font-size: 12px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 30px;
      }

      .badge-up { background-color: #ECFDF5; color: #10B981; }
      .badge-down { background-color: #FEF2F2; color: #EF4444; }
      .badge-neutral { background-color: #F3F4F6; color: #64748B; }

      .stat-number {
        font-size: 36px;
        font-weight: 800;
        color: var(--navy-dark);
        line-height: 1.1;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .sparkline-bar-wrap {
        display: flex;
        align-items: flex-end;
        gap: 4px;
        height: 32px;
        margin-top: 16px;
      }

      .sparkline-bar {
        flex: 1;
        border-radius: 2px;
        min-height: 2px;
      }

      /* 2-column layout */
      .dashboard-columns {
        display: flex;
        gap: 24px;
      }

      .flex-2 { flex: 2; }
      .flex-3 { flex: 3; }

      .card-box {
        background-color: #FFFFFF;
        border-radius: 16px;
        border: 1.5px solid var(--border-color);
        padding: 32px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .card-title {
        font-size: 18px;
        font-weight: 800;
        color: var(--navy-dark);
        margin: 0;
      }

      .card-link {
        font-size: 14px;
        font-weight: 700;
        color: var(--primary-blue);
        cursor: pointer;
      }

      .badge-priority {
        background-color: #FEF2F2;
        color: #EF4444;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 30px;
        letter-spacing: 0.05em;
      }

      /* Activity Feed items */
      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .activity-item {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding-bottom: 16px;
        border-bottom: 1.5px solid #F1F5F9;
      }

      .activity-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .activity-icon-bullet {
        font-size: 10px;
        margin-top: 4px;
      }

      .bullet-success { color: #10B981; }
      .bullet-danger { color: #EF4444; }
      .bullet-warning { color: #F59E0B; }
      .bullet-info { color: #3B82F6; }

      .activity-details {
        flex: 1;
      }

      .activity-title {
        font-weight: 700;
        font-size: 14px;
        color: var(--text-dark);
        display: block;
        margin-bottom: 2px;
      }

      .activity-desc {
        font-size: 13px;
        color: var(--text-muted);
        margin: 0;
      }

      .activity-time {
        font-size: 12px;
        color: var(--text-muted);
        white-space: nowrap;
      }

      /* ── TABLES SPECIFICATIONS ── */
      .table-wrapper {
        overflow-x: auto;
        margin: 0 -32px;
        padding: 0 32px;
      }

      .hub-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }

      .hub-table th {
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 16px 12px;
        border-bottom: 1.5px solid var(--border-color);
      }

      .hub-table td {
        padding: 18px 12px;
        border-bottom: 1.5px solid #F1F5F9;
        font-size: 14px;
        vertical-align: middle;
      }

      .hub-table tr:last-child td {
        border-bottom: none;
      }

      .item-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .item-thumbnail {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid var(--border-color);
      }

      .item-thumbnail.large {
        width: 48px;
        height: 48px;
      }

      .item-title {
        font-weight: 700;
        color: var(--text-dark);
        display: block;
      }

      .item-category {
        font-size: 12px;
        color: var(--text-muted);
        display: block;
        margin-top: 2px;
      }

      .font-gray {
        color: var(--text-muted);
      }

      .font-red { color: #EF4444; }
      .font-green { color: #10B981; }
      .font-amber { color: #F59E0B; }

      .btn-action-review {
        background-color: transparent;
        border: 1.5px solid var(--primary-blue);
        color: var(--primary-blue);
        padding: 6px 16px;
        border-radius: 30px;
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-action-review:hover {
        background-color: var(--primary-blue);
        color: #FFFFFF;
      }

      .empty-table-cell {
        text-align: center;
        padding: 40px !important;
        color: var(--text-muted);
      }

      /* ── POST MANAGEMENT & FILTERS ── */
      .breadcrumb {
        font-size: 13px;
        color: var(--text-muted);
        margin-bottom: 12px;
      }

      .breadcrumb .active {
        color: var(--text-dark);
        font-weight: 600;
      }

      .filter-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        gap: 16px;
        flex-wrap: wrap;
      }

      .pill-tabs {
        background-color: #E2E8F0;
        padding: 4px;
        border-radius: 30px;
        display: flex;
        gap: 2px;
      }

      .pill-tab {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-weight: 700;
        font-size: 13px;
        padding: 8px 18px;
        border-radius: 30px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pill-tab.active {
        background-color: #FFFFFF;
        color: var(--navy-dark);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }

      .filter-selects {
        display: flex;
        gap: 12px;
        align-items: center;
        flex: 1;
        justify-content: flex-end;
      }

      .filter-selects select {
        border: 1.5px solid var(--border-color);
        border-radius: 30px;
        padding: 8px 16px;
        font-size: 13px;
        color: var(--text-dark);
        background-color: #FFFFFF;
        outline: none;
      }

      .topbar-search.filter-search {
        width: 260px;
      }

      .topbar-search.filter-search.mini {
        padding: 6px 12px;
        width: 200px;
      }

      .info-badge-awaiting {
        background-color: #EFF6FF;
        color: var(--primary-blue);
        font-size: 12px;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: 30px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .student-profile-cell {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .avatar-initials {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFFFFF;
        font-weight: 700;
        font-size: 12px;
      }

      /* Status Pill badges to specifications */
      .pill-status {
        font-size: 12px;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 99px;
        text-transform: capitalize;
        display: inline-block;
      }

      .status-pending { background-color: #FEF3C7; color: var(--pill-orange); }
      .status-reported { background-color: #FEF3C7; color: var(--pill-orange); }
      .status-approved { background-color: #D1FAE5; color: var(--pill-green); }
      .status-resolved { background-color: #EFF6FF; color: var(--primary-blue); }
      .status-matched { background-color: #F5F3FF; color: #8B5CF6; }
      .status-rejected { background-color: #FEF2F2; color: #EF4444; }

      .pill-role {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 30px;
        text-transform: uppercase;
        background-color: #F1F5F9;
        color: var(--text-muted);
      }

      .pill-role.role-superadmin {
        background-color: #FDF2F8;
        color: #EC4899;
      }

      .pill-role.role-admin {
        background-color: #EFF6FF;
        color: var(--primary-blue);
      }

      .pill-category {
        background-color: #F1F5F9;
        color: var(--text-dark);
        font-weight: 600;
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 30px;
        display: inline-block;
      }

      .table-actions {
        display: flex;
        gap: 8px;
      }

      .btn-icon {
        background: transparent;
        border: 1.5px solid var(--border-color);
        color: var(--text-muted);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .btn-icon:hover {
        border-color: var(--text-dark);
        color: var(--text-dark);
      }

      .btn-icon.approve:hover {
        background-color: #ECFDF5;
        border-color: #10B981;
      }

      /* Pagination controls */
      .table-footer-pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1.5px solid var(--border-color);
      }

      .showing-entries-label {
        font-size: 13px;
        color: var(--text-muted);
      }

      .pagination-controls {
        display: flex;
        gap: 6px;
      }

      .page-control-btn {
        background-color: #FFFFFF;
        border: 1.5px solid var(--border-color);
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .page-control-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .page-num-btn {
        background-color: #FFFFFF;
        border: 1.5px solid var(--border-color);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .page-num-btn.active {
        background-color: var(--primary-blue);
        color: #FFFFFF;
        border-color: var(--primary-blue);
      }

      /* Modal Popups styling */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(15,23,42,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 20px;
      }

      .modal-content {
        background-color: #FFFFFF;
        border-radius: 20px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
        display: flex;
        flex-direction: column;
        max-height: 90vh;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 1.5px solid var(--border-color);
      }

      .modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 800;
        color: #090924;
      }
        .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 1.5px solid var(--border-color);
      }

      .modal-header.student-modal-header {
        background-color: #090924;
        border-radius: 20px 20px 0 0;
        border-bottom: none;
      }

      .student-modal-header h3 {
        color: #FFFFFF;
      }

      .student-modal-header .btn-close {
        color: #FFFFFF;
      }

      .btn-close {
        background: transparent;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: var(--text-muted);
      }

      .modal-body {
        padding: 24px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .profile-header-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 16px;
      }

      .large-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: var(--primary-blue);
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 800;
        margin-bottom: 12px;
      }

      .profile-header-area h4 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 800;
      }

      .profile-header-area p {
        margin: 0;
        font-size: 14px;
        color: var(--text-muted);
      }

      .profile-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .profile-grid-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .profile-grid-item .lbl {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .profile-grid-item .val {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-dark);
      }

      .form-group-modal {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-group-modal label {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-dark);
      }

      .form-group-modal input, .form-group-modal select, .form-group-modal textarea {
        padding: 10px 14px;
        border-radius: 10px;
        border: 1.5px solid var(--border-color);
        font-size: 14px;
        outline: none;
        width: 100%;
      }

      .modal-footer-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 12px;
      }

      /* ── AUTO MATCH BLOCKS ── */
      .matches-feed {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .match-card-block {
        display: flex;
        border: 1.5px solid var(--border-color);
        border-radius: 16px;
        overflow: hidden;
      }

      .match-column-side {
        flex: 2;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .match-column-side.alternatives-side {
        flex: 3;
        padding: 0;
        border-left: 1.5px solid var(--border-color);
      }

      .bg-red-fade {
        background-color: #FEF2F2;
      }

      .side-type-label {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
        margin-bottom: 8px;
        display: block;
      }

      .color-red { color: #EF4444; }

      .item-match-desc strong {
        font-size: 16px;
        font-weight: 800;
        color: var(--navy-dark);
        display: block;
        margin-bottom: 6px;
      }

      .item-match-desc p {
        margin: 4px 0;
        font-size: 13px;
        color: var(--text-muted);
      }

      .match-connector-arrows {
        width: 100px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #F8FAFC;
        border-left: 1.5px solid var(--border-color);
        font-size: 20px;
        color: var(--text-muted);
        text-align: center;
        padding: 10px;
      }

      .match-connector-arrows span {
        font-size: 10px;
        font-weight: 700;
        color: var(--text-muted);
        margin-top: 4px;
      }

      .found-alternative-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 24px;
        border-bottom: 1.5px solid var(--border-color);
      }

      .found-alternative-row:last-child {
        border-bottom: none;
      }

      .found-alt-details strong {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-dark);
        display: block;
        margin-bottom: 4px;
      }

      .found-alt-details p {
        margin: 2px 0;
        font-size: 12px;
        color: var(--text-muted);
      }

      .btn-action-match {
        background-color: var(--primary-blue);
        color: #FFFFFF;
        border: none;
        padding: 8px 16px;
        border-radius: 30px;
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .btn-action-match:hover {
        background-color: var(--primary-blue-hover);
      }

      .empty-state-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 60px 40px;
      }

      .empty-state-card i {
        font-size: 40px;
        margin-bottom: 16px;
      }

      .empty-state-card h4 {
        margin: 0 0 6px 0;
        font-size: 18px;
        font-weight: 800;
      }

      .empty-state-card p {
        margin: 0;
        font-size: 14px;
        color: var(--text-muted);
      }

      /* ── CLAIMS DECISION ACTIONS ── */
      .decision-actions {
        display: flex;
        gap: 8px;
      }

      .claim-row-clickable {
        cursor: pointer;
        transition: background-color 0.15s;
      }

      .claim-row-clickable:hover {
        background-color: #F8FAFC;
      }

      .mini-role-tag {
        display: inline-block;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--primary-blue);
        background-color: #EFF6FF;
        padding: 2px 8px;
        border-radius: 30px;
        margin-bottom: 4px;
      }

      .claim-detail-item-row {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }

      .claim-detail-img {
        width: 70px;
        height: 70px;
        object-fit: cover;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        flex-shrink: 0;
      }

      .btn-decision {
        border: none;
        padding: 6px 12px;
        border-radius: 30px;
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
      }

      .btn-decision.approve {
        background-color: #D1FAE5;
        color: #065F46;
      }

      .btn-decision.reject {
        background-color: #FEF2F2;
        color: #991B1B;
      }

      /* ── REPORTS & CHARTS DESIGN ── */
      .header-actions-reports {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .segmented-control {
        background-color: #E2E8F0;
        padding: 4px;
        border-radius: 30px;
        display: flex;
      }

      .segmented-control button {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-weight: 700;
        font-size: 13px;
        padding: 8px 16px;
        border-radius: 30px;
        cursor: pointer;
      }

      .segmented-control button.active {
        background-color: #FFFFFF;
        color: var(--navy-dark);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }

      .chart-legend {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 13px;
        color: var(--text-muted);
      }

      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }

      .legend-dot.dot-lost { background-color: var(--primary-blue); }
      .legend-dot.dot-found { background-color: #93C5FD; }

      .svg-chart-container {
        padding-top: 10px;
      }

      .chart-svg {
        width: 100%;
        max-height: 220px;
      }

      /* Donut Chart structures */
      .donut-chart-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
      }

      .donut-svg-container {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .donut-center-label {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .donut-center-label .lbl-num {
        font-size: 24px;
        font-weight: 800;
        color: var(--navy-dark);
      }

      .donut-center-label .lbl-txt {
        font-size: 8px;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.05em;
        margin-top: 2px;
      }

      .categories-donut-legend {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .legend-row-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
      }

      .legend-row-item .lbl-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .legend-row-item .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .legend-row-item .text {
        font-weight: 600;
        color: var(--text-dark);
      }

      .legend-row-item .percentage {
        font-weight: 700;
        color: var(--text-muted);
      }

      /* Line chart SVG wrapper */
      .svg-line-chart-wrap {
        margin-top: 16px;
      }

      .line-chart-svg {
        width: 100%;
        max-height: 200px;
      }

      .audit-action-pill {
        background-color: #F1F5F9;
        color: var(--text-dark);
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 30px;
        letter-spacing: 0.05em;
      }

      .table-audit-filter {
        border: 1.5px solid var(--border-color);
        border-radius: 30px;
        padding: 6px 16px;
        font-size: 13px;
        background-color: #FFFFFF;
      }

      /* ── ADMINISTRATIVE SYSTEM NOTIFICATIONS ── */
      .notif-feed-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .notif-card-item {
        border-radius: 16px;
        border: 1.5px solid var(--border-color);
        padding: 20px 24px;
        background-color: #FFFFFF;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }

      .notif-card-item.unread {
        border-left: 4px solid var(--primary-blue);
        background-color: #EFF6FF;
      }

      .notif-item-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .notif-bullet-box {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #FFFFFF;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        border: 1px solid var(--border-color);
      }

      .notif-message-text {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-dark);
        margin: 0 0 4px 0;
      }

      .notif-date-stamp {
        font-size: 12px;
        color: var(--text-muted);
      }

      .btn-mark-read {
        background-color: #FFFFFF;
        border: 1.5px solid var(--border-color);
        color: var(--text-dark);
        padding: 6px 14px;
        border-radius: 30px;
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-mark-read:hover {
        background-color: var(--navy-dark);
        color: #FFFFFF;
        border-color: var(--navy-dark);
      }

      /* ── ADMIN PROFILE & UTILITIES SETTINGS ── */
      .settings-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 32px;
      }

      .settings-form h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 800;
        color: var(--navy-dark);
      }

      .settings-divider {
        height: 1px;
        background-color: var(--border-color);
        margin: 28px 0;
      }

      .setting-alert-success {
        background-color: #D1FAE5;
        color: #065F46;
        padding: 12px 16px;
        border-radius: 10px;
        margin-bottom: 20px;
        font-size: 14px;
        font-weight: 600;
      }

      .setting-alert-danger {
        background-color: #FEF2F2;
        color: #991B1B;
        padding: 12px 16px;
        border-radius: 10px;
        margin-bottom: 20px;
        font-size: 14px;
        font-weight: 600;
      }

      .loading-state {
        text-align: center;
        padding: 80px 20px;
        color: var(--text-muted);
        font-size: 15px;
        font-weight: 500;
      }

      .empty-state {
        text-align: center;
        padding: 32px;
        color: var(--text-muted);
        font-size: 14px;
      }

      /* Responsive adaptation */
      @media (max-width: 1024px) {
        .admin-sidebar {
          width: 110px;
          padding: 24px 10px;
          align-items: center;
        }

        .sidebar-subtitle, .nav-label, .sidebar-badge, .admin-details, .logout-btn {
          display: none;
        }

        .sidebar-footer {
          border-top: none;
          padding-top: 0;
        }

        .admin-sidebar .sidebar-logo-row {
          flex-direction: column;
          gap: 6px;
        }

        .admin-sidebar .sidebar-logo-name {
          font-size: 13px;
          white-space: normal;
          text-align: center;
        }

        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .dashboard-columns {
          flex-direction: column;
        }

        .admin-login-container {
          flex-direction: column;
        }

        .login-split-left {
          width: 100%;
          border-radius: 0;
          padding: 32px;
        }

        .login-split-right {
          width: 100%;
          padding: 32px;
        }
      }

      @media (max-width: 640px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }
        .admin-topbar {
          padding: 0 20px;
        }
        .topbar-search {
          width: 200px;
        }
      }
    `}</style>
  );
}