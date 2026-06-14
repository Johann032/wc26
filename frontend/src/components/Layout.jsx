import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Target, Trophy, Shield, LogOut, User, Key } from "lucide-react";
import "./Layout.css";

const navItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/predictions", label: "Predictions", icon: Target },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
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
      </header>

      {/* ── Main ── */}
      <main className="layout__main container">{children}</main>

      {/* ── Footer (desktop only) ── */}
      <footer className="layout__footer">
        <span className="layout__footer-brand">Guppy World Cup 2026</span>
        <span className="layout__footer-tagline">
          Predict. Compete. Win.
        </span>
      </footer>

      {/* ── Bottom Nav (mobile only) ── */}
      <nav className="layout__bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              isActive
                ? "layout__bottom-nav-item layout__bottom-nav-item--active"
                : "layout__bottom-nav-item"
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        {user?.is_admin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive
                ? "layout__bottom-nav-item layout__bottom-nav-item--active"
                : "layout__bottom-nav-item"
            }
          >
            <Shield size={20} />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
}
