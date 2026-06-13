import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import { Clock, ChevronRight, ChevronLeft, MapPin } from "lucide-react";

export default function TournamentPage() {
  const { tournamentId } = useParams();

  const { data: tournament, loading: loadingTournament, error: tournamentError } = useFetch(
    () => api.getTournament(tournamentId),
    [tournamentId],
  );

  const { data: matches, loading: loadingMatches, error: matchesError } = useFetch(
    () => api.getMatchesForTournament(tournamentId),
    [tournamentId],
  );

  if (loadingTournament || loadingMatches) {
    return (
      <div className="tournament-page">
        <Link to="/" className="breadcrumb">
          <ChevronLeft size={16} /> Back to tournaments
        </Link>
        <div className="skeleton-list">
          <div className="skeleton skeleton--hero" />
          <div className="skeleton skeleton--card" />
          <div className="skeleton skeleton--card" />
          <div className="skeleton skeleton--card" />
        </div>
      </div>
    );
  }

  if (tournamentError || matchesError) {
    return (
      <div className="tournament-page">
        <Link to="/" className="breadcrumb">
          <ChevronLeft size={16} /> Back to tournaments
        </Link>
        <div className="error">{tournamentError || matchesError}</div>
      </div>
    );
  }

  return (
    <div className="bg-page-wrapper">
      <div className="bg-image bg-ronaldo"></div>
      <div className="bg-overlay"></div>
      <div className="content-relative tournament-page">
      {/* Breadcrumb */}
      <Link to="/" className="breadcrumb animate-in">
        <ChevronLeft size={16} /> Back to tournaments
      </Link>

      {/* Tournament Header */}
      <header className="premium-page-header animate-in animate-in-delay-1">
          <h1 className="tournament-header__name">{tournament.name}</h1>
          <p className="tournament-header__dates">
            {tournament.start_date} &mdash; {tournament.end_date}
          </p>
          <span
            className={`badge ${tournament.status === "active" ? "badge--active" : ""}`}
            style={{ marginTop: '0.5rem' }}
          >
            {tournament.status}
          </span>
      </header>

      {/* Matches */}
      <h2 className="section-title animate-in animate-in-delay-2">
        <Clock size={18} />
        Matches
      </h2>

      {matches?.length === 0 ? (
        <div className="empty-state animate-in animate-in-delay-3">
          No matches scheduled.
        </div>
      ) : (
        <div className="matches-list">
          {matches?.map((match, index) => (
            <Link
              key={match.id}
              to={`/matches/${match.id}`}
              className={`card card--link match-card animate-in animate-in-delay-${Math.min(index + 3, 8)}`}
            >
              <div className="match-card__teams">
                <span className="match-card__team match-card__team--left">
                  {match.team1}
                </span>
                <span className="match-card__vs">VS</span>
                <span className="match-card__team match-card__team--right">
                  {match.team2}
                </span>
              </div>

              {match.score1 != null && (
                <div className="match-card__score">
                  {match.score1} - {match.score2}
                </div>
              )}

              <div className="match-card__info">
                <span className="match-card__kickoff">
                  <Clock size={14} />
                  {new Date(match.kickoff_time).toLocaleString()}
                </span>
                <span className="badge">{match.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Footer Link */}
      <div className="page-footer-link animate-in animate-in-delay-4">
        <Link
          to={`/leaderboard?tournament=${tournamentId}`}
          className="btn btn--primary btn--block"
        >
          View Leaderboard
          <ChevronRight size={18} />
        </Link>
      </div>
      </div>
    </div>
  );
}
