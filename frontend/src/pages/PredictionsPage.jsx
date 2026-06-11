import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import TournamentSelect from "../components/TournamentSelect";
import { Target, CheckCircle, Clock, ChevronRight } from "lucide-react";

export default function PredictionsPage() {
  const [tournamentId, setTournamentId] = useState(null);

  const { data: tournaments, loading: loadingTournaments } = useFetch(
    () => api.getTournaments(),
    [],
  );

  const activeTournamentId = tournamentId || tournaments?.[0]?.id;

  const { data: predictions, loading: loadingPredictions, error } = useFetch(
    () => (activeTournamentId ? api.getMyPredictions(activeTournamentId) : Promise.resolve([])),
    [activeTournamentId],
  );

  const { data: questions, loading: loadingQuestions, error: questionsError } = useFetch(
    () =>
      activeTournamentId
        ? api.getTournament(activeTournamentId).then(async (t) => {
            const matches = await api.getMatchesForTournament(t.id);
            const allQuestions = await Promise.all(
              matches.map((m) => api.getQuestionsForMatch(m.id)),
            );
            const map = {};
            matches.forEach((m, i) => {
              allQuestions[i].forEach((q) => {
                map[q.id] = { ...q, match: m };
              });
            });
            return map;
          })
        : Promise.resolve({}),
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
        <h1>My Predictions</h1>
        <p>No tournaments available yet.</p>
      </div>
    );
  }

  const totalPoints = predictions?.reduce((sum, p) => sum + (p.awarded_points || 0), 0) || 0;

  return (
    <div>
      <header className="page-header">
        <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Target size={24} style={{ color: "var(--color-gold)" }} />
          My Predictions
        </h1>
        <div style={{ marginTop: "0.75rem" }}>
          <TournamentSelect value={activeTournamentId} onChange={(id) => setTournamentId(id)} />
        </div>
      </header>

      {(loadingPredictions || loadingQuestions) && (
        <div>
          <div className="skeleton skeleton--card"></div>
          <div className="skeleton skeleton--card"></div>
          <div className="skeleton skeleton--card"></div>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {questionsError && <div className="error">{questionsError}</div>}

      {!loadingPredictions && !loadingQuestions && predictions?.length > 0 && (
        <>
          {/* Stats Summary */}
          <div className="stats-grid animate-in">
            <div className="card stat-card">
              <div className="stat-label">Predictions</div>
              <p className="stat-value">{predictions.length}</p>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Points Earned</div>
              <p className="stat-value">{totalPoints}</p>
            </div>
          </div>

          {/* Prediction Cards */}
          {predictions.map((prediction, i) => {
            const q = questions?.[prediction.question_id];
            return (
              <div
                key={prediction.id}
                className={`card animate-in animate-in-delay-${Math.min(i + 1, 4)}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {q?.match ? (
                      <Link
                        to={`/matches/${q.match.id}`}
                        style={{ fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.375rem" }}
                      >
                        {q.match.team1} vs {q.match.team2}
                        <ChevronRight size={14} />
                      </Link>
                    ) : (
                      <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                        Match #{q?.match_id || "?"}
                      </span>
                    )}
                    <p className="card__meta" style={{ margin: "0.25rem 0 0" }}>
                      {q?.question_text || `Question #${prediction.question_id}`}
                    </p>
                  </div>
                  {prediction.awarded_points > 0 ? (
                    <span className="badge badge--active" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle size={12} />
                      +{prediction.awarded_points} pts
                    </span>
                  ) : (
                    <span className="badge">Pending</span>
                  )}
                </div>
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.5rem 0.75rem",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.85rem",
                  }}
                >
                  <span>
                    Your answer: <strong style={{ color: "var(--color-text)" }}>{prediction.answer}</strong>
                  </span>
                  <span className="text-muted" style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem" }}>
                    <Clock size={12} />
                    {new Date(prediction.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </>
      )}

      {!loadingPredictions && !loadingQuestions && predictions?.length === 0 && (
        <div className="empty-state">
          <Target size={48} style={{ color: "var(--color-gold)", marginBottom: "1rem" }} />
          <h2>No predictions yet</h2>
          <p>
            <Link to={`/tournaments/${activeTournamentId}`}>Browse matches</Link> and start predicting!
          </p>
        </div>
      )}
    </div>
  );
}
