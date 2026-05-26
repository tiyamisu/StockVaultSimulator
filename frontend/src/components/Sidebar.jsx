// ============================================================
// Sidebar.jsx — Navigation Sidebar Component
// ============================================================

import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/stockSimulator";
import {
  LayoutDashboard, TrendingUp, Briefcase, Receipt,
  Star, MessageSquareText, LogOut, Activity
} from "lucide-react";
import "./Sidebar.css";

// Navigation items configuration
const NAV_ITEMS = [
  { label: "Dashboard",    path: "/dashboard",    icon: LayoutDashboard },
  { label: "Market",       path: "/market",       icon: TrendingUp      },
  { label: "Portfolio",    path: "/portfolio",    icon: Briefcase       },
  { label: "Transactions", path: "/transactions", icon: Receipt         },
  { label: "Watchlist",    path: "/watchlist",    icon: Star            },
  { label: "TradeBot AI",  path: "/tradebot",     icon: MessageSquareText },
];

export default function Sidebar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { state, dispatch } = useApp();
  const { user, walletBalance, portfolio } = state;

  // Get user's initials for avatar
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "DU";

  function handleLogout() {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  }

  return (
    <aside className="sidebar">
      {/* ── Brand ─────────────────────────────────────────── */}
      <div className="sidebar-brand">
        <div className="sidebar-logo"><TrendingUp size={20} color="var(--text-inverse)" /></div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">StockVault</span>
          <span className="sidebar-brand-tag">Pro Simulator</span>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="sidebar-nav">
        {/* Market status indicator */}
        <div className="market-status">
          <div className="status-dot" />
          <span className="status-text">Market Open</span>
          <Activity size={12} style={{ marginLeft: "auto", color: "var(--green)" }} />
        </div>

        <div style={{ height: 8 }} />

        <span className="sidebar-section-label">Main</span>

        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              className={`nav-link${isActive ? " active" : ""}`}
              onClick={() => navigate(path)}
            >
              <span className="nav-icon">
                <Icon size={18} />
              </span>
              {label}
              {/* Watchlist badge */}
              {path === "/watchlist" && state.watchlist.length > 0 && (
                <span className="nav-badge">{state.watchlist.length}</span>
              )}
              {/* Portfolio badge */}
              {path === "/portfolio" && portfolio.length > 0 && (
                <span className="nav-badge">{portfolio.length}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Footer: User Profile ─────────────────────────── */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{user?.username || "Demo User"}</div>
            <div className="user-balance">{formatCurrency(walletBalance)}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
