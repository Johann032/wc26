import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import TournamentSelect from "../components/TournamentSelect";
import { BarChart2, ChevronRight } from "lucide-react";

export default function InsightsPage() {
  const [searchParams] = useSearchParams();
  const initialTournament = searchParams.get("tournament");
  const [tournamentId, setTournamentId] = useState(
    initialTournament ? Number(initialTournament) : null,
  );

  const { data: tournaments, loading: loadingTournaments } = useFetch(
    () => api.getTournaments(),
    [],
  );
  const activeTournamentId = tournamentId || tournaments?.[0]?.id;

  const { data: matches, loading, error } = useFetch(
    () =>
      activeTournamentId
        ? api.getMatchesForTournament(activeTournamentId)
        : Promise.resolve([]),
    [activeTournamentId],
  );

  if (loadingTournaments) {
    return (
      <div>
        <div className="skeleton skeleton--title"></div>
        <div className="skeleton skeleton--card"></div>
        <div className="skeleton skeleton--card"></div>
      </div>
    );
  }

  if (!tournaments?.length) {
    return (
      <div className="empty-state">
        <h1>Insights</h1>
        <p>No tournaments available yet.</p>
      </div>
    );
  }

  const finishedMatches = matches?.filter(m => m.status === "finished") || [];

  return (
    <div className="bg-page-wrapper">
      <div className="bg-image bg-messi"></div>
      <div className="bg-overlay"></div>
      <div className="content-relative">
        <header className="premium-page-header">
          <h1 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <BarChart2 size={28} style={{ color: "var(--color-gold)" }} />
            Insights
          </h1>
          <p style={{ color: "#aaa", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            Explore post-match breakdowns and analytics for completed matches.
          </p>
          <div style={{ marginTop: "1rem", maxWidth: "300px", margin: "1rem auto 0" }}>
            <TournamentSelect
              value={activeTournamentId}
              onChange={(id) => setTournamentId(id)}
            />
          </div>
        </header>

        {loading && (
          <div>
            <div className="skeleton skeleton--card"></div>
            <div className="skeleton skeleton--card"></div>
          </div>
        )}
        {error && <div className="error">{error}</div>}

        {!loading && finishedMatches.length === 0 && (
          <div className="empty-state">
            No matches have finished yet in this tournament. Check back later!
          </div>
        )}

        {!loading && finishedMatches.length > 0 && (
          <div className="matches-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
            {finishedMatches.map((match) => (
              <div key={match.id} className="card animate-in" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--color-gold)' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {match.team1} {match.score1} - {match.score2} {match.team2}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge--gold">Finished</span>
                    <span>{new Date(match.kickoff_time).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link to={`/insights/match/${match.id}`} className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  View Breakdown
                  <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
