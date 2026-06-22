import { useState, useEffect } from "react";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import TournamentSelect from "../components/TournamentSelect";
import { Eye, CheckCircle, Lock, Users, Trophy } from "lucide-react";

export default function OraclePage() {
  const [tournamentId, setTournamentId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const { data: tournaments, loading: loadingTournaments } = useFetch(
    () => api.getTournaments(),
    [],
  );

  const activeTournamentId = tournamentId || tournaments?.[0]?.id;

  const { data: questions, loading, error, refetch } = useFetch(
    () => (activeTournamentId ? api.getSpotlightQuestions(activeTournamentId) : Promise.resolve([])),
    [activeTournamentId],
  );

  const { data: leaderboard, loading: loadingLeaderboard } = useFetch(
    () => (activeTournamentId ? api.getOracleLeaderboard(activeTournamentId) : Promise.resolve([])),
    [activeTournamentId]
  );

  useEffect(() => {
    if (questions) {
      const initialAnswers = {};
      questions.forEach((q) => {
        if (q.user_prediction) {
          initialAnswers[q.id] = q.user_prediction.answers_json;
        } else {
          initialAnswers[q.id] = q.question_type === "categorical" ? {} : [];
        }
      });
      setAnswers(initialAnswers);
    }
  }, [questions]);

  const toggleOption = (questionId, option, maxSelections, category = null) => {
    setAnswers((prev) => {
      const current = prev[questionId];
      if (category) {
        return { ...prev, [questionId]: { ...current, [category]: option } };
      } else {
        const currentArr = current || [];
        if (currentArr.includes(option)) {
          return { ...prev, [questionId]: currentArr.filter((o) => o !== option) };
        }
        if (currentArr.length >= maxSelections) {
          return prev;
        }
        return { ...prev, [questionId]: [...currentArr, option] };
      }
    });
  };

  const submitPrediction = async (questionId) => {
    const qAnswers = answers[questionId];
    const q = questions.find((x) => x.id === questionId);
    
    const isComplete = q.question_type === "categorical"
      ? Object.keys(qAnswers || {}).length === q.num_selections
      : (qAnswers || []).length === q.num_selections;

    if (!isComplete) {
      alert(`Please select exactly ${q.num_selections} options.`);
      return;
    }

    setSubmitting(questionId);
    try {
      await api.submitSpotlightPrediction(questionId, qAnswers);
      await refetch();
    } catch (err) {
      alert(err.message || "Failed to submit prediction");
    } finally {
      setSubmitting(null);
    }
  };

  if (loadingTournaments || loading) {
    return (
      <div>
        <div className="skeleton skeleton--title"></div>
        <div className="skeleton skeleton--card"></div>
        <div className="skeleton skeleton--card"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="page-header" style={{ borderBottom: "1px solid rgba(255,215,0,0.3)", paddingBottom: "1rem" }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-gold)", textTransform: "uppercase", letterSpacing: "1px" }}>
          <Eye size={28} style={{ color: "var(--color-gold)", fill: "rgba(255,215,0,0.2)" }} />
          The Oracle Challenge
        </h1>
        <p style={{ margin: "0.5rem 0 0 0", fontStyle: "italic", opacity: 0.9 }}>
          Only the truly elite can predict the future.
        </p>
        <div style={{ marginTop: "1rem" }}>
          <TournamentSelect value={activeTournamentId} onChange={(id) => setTournamentId(id)} />
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "1.5rem" }}>
        {/* Questions Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {questions?.length === 0 ? (
            <div className="empty-state">
              <p>The Oracle has not spoken yet.</p>
            </div>
          ) : (
            questions?.map((q) => {
              const selected = answers[q.id];
              const isComplete = q.question_type === "categorical"
                ? Object.keys(selected || {}).length === q.num_selections
                : (selected || []).length === q.num_selections;
              
              return (
                <div key={q.id} className="card" style={{ padding: "1.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                      <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-gold)" }}>{q.title}</h3>
                      <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
                        Select EXACTLY {q.num_selections} • {q.max_points} Points Possible
                      </p>
                    </div>
                    {q.is_locked ? (
                      <span className="badge badge--disabled" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Lock size={14} /> Locked
                      </span>
                    ) : q.user_prediction ? (
                      <span className="badge badge--active" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <CheckCircle size={14} /> Saved
                      </span>
                    ) : null}
                  </div>

                  {q.question_type === "categorical" ? (
                    <div style={{ marginBottom: "1.5rem" }}>
                      {Object.entries(q.options_json).map(([cat, opts]) => (
                        <div key={cat} style={{ marginBottom: "1rem" }}>
                          <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--color-text)", fontSize: "0.95rem" }}>{cat}</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.5rem" }}>
                            {opts.map((opt) => {
                              const isSelected = selected && selected[cat] === opt;
                              return (
                                <div
                                  key={opt}
                                  onClick={() => !q.is_locked && toggleOption(q.id, opt, q.num_selections, cat)}
                                  style={{
                                    padding: "0.75rem",
                                    border: `1px solid ${isSelected ? "var(--color-gold)" : "rgba(255,255,255,0.1)"}`,
                                    borderRadius: "var(--radius-sm)",
                                    background: isSelected ? "rgba(255,215,0,0.1)" : "transparent",
                                    cursor: q.is_locked ? "default" : "pointer",
                                    textAlign: "center",
                                    fontWeight: isSelected ? 600 : 400,
                                    transition: "all 0.2s ease"
                                  }}
                                >
                                  {opt}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.5rem", marginBottom: "1.5rem" }}>
                      {q.options_json.map((opt) => {
                        const isSelected = (selected || []).includes(opt);
                        return (
                          <div
                            key={opt}
                            onClick={() => !q.is_locked && toggleOption(q.id, opt, q.num_selections)}
                            style={{
                              padding: "0.75rem",
                              border: `1px solid ${isSelected ? "var(--color-gold)" : "rgba(255,255,255,0.1)"}`,
                              borderRadius: "var(--radius-sm)",
                              background: isSelected ? "rgba(255,215,0,0.1)" : "transparent",
                              cursor: q.is_locked ? "default" : "pointer",
                              textAlign: "center",
                              fontWeight: isSelected ? 600 : 400,
                              transition: "all 0.2s ease"
                            }}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!q.is_locked && (
                    <button
                      className="btn btn--primary"
                      disabled={!isComplete || submitting === q.id}
                      onClick={() => submitPrediction(q.id)}
                      style={{ width: "100%", background: "var(--color-gold)", color: "#000", fontWeight: 600 }}
                    >
                      {submitting === q.id ? "Saving..." : q.user_prediction ? "Update Prediction" : "Lock In Prediction"}
                    </button>
                  )}

                  {q.is_locked && q.community_stats && (
                    <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 1rem 0" }}>
                        <Users size={16} /> Community Picks
                      </h4>
                      {q.question_type === "categorical" ? (
                        Object.entries(q.community_stats).map(([cat, catStats]) => (
                          <div key={cat} style={{ marginBottom: "1rem" }}>
                            <h5 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>{cat}</h5>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              {catStats.slice(0, 3).map((stat) => (
                                <div key={stat.option} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                  <div style={{ width: "100px", fontSize: "0.9rem" }}>{stat.option}</div>
                                  <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{ width: `${stat.percentage}%`, height: "100%", background: "var(--color-gold)", borderRadius: "4px" }}></div>
                                  </div>
                                  <div style={{ width: "40px", textAlign: "right", fontSize: "0.9rem", color: "var(--color-gold)" }}>{stat.percentage}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {q.community_stats.slice(0, 5).map((stat) => (
                            <div key={stat.option} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                              <div style={{ width: "100px", fontSize: "0.9rem" }}>{stat.option}</div>
                              <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                                <div style={{ width: `${stat.percentage}%`, height: "100%", background: "var(--color-gold)", borderRadius: "4px" }}></div>
                              </div>
                              <div style={{ width: "40px", textAlign: "right", fontSize: "0.9rem", color: "var(--color-gold)" }}>{stat.percentage}%</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Oracle Standings */}
        <div className="card" style={{ padding: "1.5rem", border: "1px solid rgba(255,215,0,0.3)" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0 0 1.5rem 0", color: "var(--color-gold)" }}>
            <Trophy size={20} /> 🌟 Oracle Standings
          </h2>
          
          {loadingLeaderboard ? (
            <div className="skeleton skeleton--card"></div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <p className="text-muted">No Oracle points awarded yet.</p>
          ) : (
            <div className="leaderboard-table">
              <div className="leaderboard-table__row leaderboard-table__header">
                <div className="leaderboard-table__col">Rank</div>
                <div className="leaderboard-table__col" style={{ flex: 1 }}>Oracle</div>
                <div className="leaderboard-table__col">Points</div>
              </div>
              {leaderboard.map((entry) => {
                let badge = null;
                if (entry.rank === 1) badge = "🥇";
                else if (entry.rank === 2) badge = "🥈";
                else if (entry.rank === 3) badge = "🥉";

                return (
                  <div key={entry.user_id} className="leaderboard-table__row">
                    <div className="leaderboard-table__col" style={{ fontWeight: "bold" }}>
                      {entry.rank}
                    </div>
                    <div className="leaderboard-table__col" style={{ flex: 1, fontWeight: 500, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {entry.display_name} {badge}
                    </div>
                    <div className="leaderboard-table__col" style={{ fontWeight: "bold", color: "var(--color-gold)" }}>
                      {entry.total_points}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
