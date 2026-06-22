import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import { useAuth } from "../context/AuthContext";
import { Trophy, Target, Calendar, ChevronRight, Star } from "lucide-react";
import JackpotCard from "../components/JackpotCard";

export default function HomePage() {
  const { data: tournaments, loading, error } = useFetch(() => api.getTournaments(), []);
  const { user } = useAuth();

  return (
    <div className="bg-page-wrapper">
      <div className="bg-image bg-trophy"></div>
      <div className="bg-overlay"></div>
      <div className="content-relative home-page">
        {/* Hero Header */}
        <header className="premium-page-header premium-page-header--gold">
          <h1>GUPPY WORLD CUP 2026</h1>
          <p>Predict. Compete. Win.</p>
        </header>

      {/* Welcome Section */}
      {user && (
        <div className="welcome animate-in">
          <Star size={20} className="welcome__icon" />
          <span className="welcome__text">
            Welcome back, <strong>{user.display_name}</strong>
          </span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions animate-in animate-in-delay-1">
        <Link to="/predictions" className="card card--action">
          <div className="card--action__icon">
            <Target size={28} />
          </div>
          <span className="card--action__label">Make Predictions</span>
          <ChevronRight size={18} className="card--action__arrow" />
        </Link>
        <Link to="/leaderboard" className="card card--action">
          <div className="card--action__icon">
            <Trophy size={28} />
          </div>
          <span className="card--action__label">View Leaderboard</span>
          <ChevronRight size={18} className="card--action__arrow" />
        </Link>
      </div>

      {/* Oracle Challenge Card */}
      {tournaments && tournaments.length > 0 && (
        <JackpotCard tournamentId={tournaments[0].id} />
      )}

      {/* Tournaments Section */}
      <div className="tournaments-section">
        <h2 className="section-title animate-in animate-in-delay-2">
          <Calendar size={20} />
          Active Tournaments
        </h2>

        {loading ? (
          <div className="skeleton-list">
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
          </div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : tournaments?.length === 0 ? (
          <div className="empty-state">
            <p>No active tournaments yet.</p>
            <Link to="/admin" className="btn btn--primary">
              Go to Admin
            </Link>
          </div>
        ) : (
          tournaments?.map((tournament, index) => (
            <Link
              key={tournament.id}
              to={`/tournaments/${tournament.id}`}
              className={`card card--link tournament-card animate-in animate-in-delay-${Math.min(index + 2, 6)}`}
            >
              <div className="tournament-card__body">
                <h3>{tournament.name}</h3>
                <p className="card__meta">
                  {tournament.start_date} &mdash; {tournament.end_date}
                </p>
                <span
                  className={`badge ${tournament.status === "active" ? "badge--active" : ""}`}
                >
                  {tournament.status}
                </span>
              </div>
              <ChevronRight size={20} className="tournament-card__chevron" />
            </Link>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
