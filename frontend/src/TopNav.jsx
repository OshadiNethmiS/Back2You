import { useState } from "react";
import log from './images/Logo.png';

// ══════════════════════════════════════════════════════════
// TOP NAVIGATION — logo + name + search bar only.
// No bell, no login/logout button — just these three elements.
// ══════════════════════════════════════════════════════════

export default function TopNav() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <Styles />
      <nav className="topnav-bar">
        <div className="topnav-logo">
          <img src={log} alt="Back2You Logo" className="topnav-logo-img" />
          <span className="topnav-logo-text">
            Back<span className="topnav-logo-accent">2</span>You
          </span>
        </div>

        <div className="topnav-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search lost or found items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </nav>
    </>
  );
}

function Styles() {
  return (
    <style>{`
      .topnav-bar {
        background-color: #0B0F19;
        height: 72px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 clamp(20px, 5vw, 60px);
        gap: 24px;
      }

      .topnav-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }

      .topnav-logo-img {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        object-fit: cover;
      }

      .topnav-logo-text {
        font-family: Georgia, 'Times New Roman', serif;
        font-weight: 700;
        font-size: 22px;
        color: #FFFFFF;
        letter-spacing: 0.01em;
      }

      .topnav-logo-accent {
        color: #F59E0B;
      }

      .topnav-search {
        background-color: rgba(255, 255, 255, 0.08);
        border: 1.5px solid rgba(255, 255, 255, 0.12);
        border-radius: 9999px;
        padding: 10px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        max-width: 480px;
        transition: all 0.2s;
      }

      .topnav-search:focus-within {
        border-color: #3B82F6;
        background-color: rgba(255, 255, 255, 0.12);
      }

      .topnav-search i {
        color: rgba(255, 255, 255, 0.5);
        font-size: 14px;
      }

      .topnav-search input {
        background: transparent;
        border: none;
        outline: none;
        color: #FFFFFF;
        font-size: 14px;
        width: 100%;
      }

      .topnav-search input::placeholder {
        color: rgba(255, 255, 255, 0.45);
      }

      @media (max-width: 640px) {
        .topnav-logo-text {
          font-size: 18px;
        }
        .topnav-search {
          max-width: 220px;
        }
      }
    `}</style>
  );
}
