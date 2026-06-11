import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import { Trophy, User, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="loading">Loading...</div>;

  const from = location.state?.from;
  if (user) {
    const target = from
      ? `${from.pathname}${from.search || ""}${from.hash || ""}`
      : "/";
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(displayName.trim(), pin);
      const target = from
        ? `${from.pathname}${from.search || ""}${from.hash || ""}`
        : "/";
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand animate-in">
        <Trophy size={48} strokeWidth={1.5} style={{ color: '#D4AF37' }} />
        <h1 className="login-brand__title">GUPPY WORLD CUP 2026</h1>
        <p className="login-brand__tagline">PREDICT. COMPETE. WIN.</p>
      </div>

      <div className="login-card card card--glass animate-in">
        <h2>Sign In</h2>
        <p className="login-card__subtitle">Enter your display name and PIN to continue</p>

        <Alert type="error" message={error} onClose={() => setError(null)} />

        <form onSubmit={handleSubmit} className="form">
          <label className="form-label">
            Display Name
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="input input--with-icon"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </label>

          <label className="form-label">
            PIN
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="input input--with-icon"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </label>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
