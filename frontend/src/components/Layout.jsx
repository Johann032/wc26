import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Target, Trophy, Shield, LogOut, User, Key, BarChart2 } from "lucide-react";
import TournamentUpdatesPopup from "./TournamentUpdatesPopup";
import "./Layout.css";

const navItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/predictions", label: "Predictions", icon: Target },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/insights", label: "Insights", icon: BarChart2 },
];

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      navigate("/login");
    }
  };

  return (
    <div className="layout">
      {/* ── Header ── */}
      <header className="layout__header">
        <div className="container layout__header-inner">
          <NavLink to="/" className="layout__brand">
            <Trophy size={20} />
            <span>Guppy WC 2026</span>
          </NavLink>

          {/* Desktop navigation */}
          <nav className="layout__nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? "layout__nav-link layout__nav-link--active"
                    : "layout__nav-link"
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
            {user?.is_admin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive
                    ? "layout__nav-link layout__nav-link--active"
                    : "layout__nav-link"
                }
              >
                <Shield size={16} />
                Admin
              </NavLink>
            )}
          </nav>

          {/* User section */}
          <div className="layout__user">
            <div className="layout__avatar">
              {getInitials(user?.display_name)}
            </div>
            <span className="layout__username">{user?.display_name}</span>
            <button
              type="button"
              className="layout__logout-btn"
              onClick={() => navigate("/change-pin")}
              aria-label="Change PIN"
              style={{ marginRight: '0.5rem' }}
            >
              <Key size={16} />
            </button>
            <button
              type="button"
              className="layout__logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* ── Mobile Top Nav (mobile only) ── */}
        <nav className="layout__nav--mobile container">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive
                  ? "layout__nav-mobile-item layout__nav-mobile-item--active"
                  : "layout__nav-mobile-item"
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          {user?.is_admin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive
                  ? "layout__nav-mobile-item layout__nav-mobile-item--active"
                  : "layout__nav-mobile-item"
              }
            >
              <Shield size={18} />
              <span>Admin</span>
            </NavLink>
          )}
        </nav>
      </header>

      {/* ── Main ── */}
      <main className="layout__main container">{children}</main>

      <footer className="layout__footer">
        <span className="layout__footer-brand">Guppy World Cup 2026</span>
        <span className="layout__footer-tagline">
          Predict. Compete. Win.
        </span>
      </footer>
      <TournamentUpdatesPopup />
    </div>
  );
}
