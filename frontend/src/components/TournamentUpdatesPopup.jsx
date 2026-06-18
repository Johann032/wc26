import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Bell, AlertTriangle, Clock, Trophy, X } from "lucide-react";
import "./TournamentUpdatesPopup.css";

function formatTimeRemaining(kickoff) {
  const diff = new Date(kickoff) - new Date();
  if (diff <= 0) return "Started";
  
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (h > 48) return `${Math.floor(h/24)} days`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function TournamentUpdatesPopup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem("hasSeenTournamentUpdates")) return;

    let isMounted = true;

    async function fetchData() {
      try {
        const tournaments = await api.getTournaments();
        if (!tournaments || tournaments.length === 0) return;
        const activeTournamentId = tournaments[0].id;

        const [matches, predictions, leaderboard] = await Promise.all([
          api.getMatchesForTournament(activeTournamentId),
          api.getMyPredictions(activeTournamentId),
          api.getLeaderboard(activeTournamentId)
        ]);

        const upcomingMatches = matches.filter(m => m.status === "scheduled").sort((a, b) => new Date(a.kickoff_time) - new Date(b.kickoff_time));
        const nextMatch = upcomingMatches[0] || null;

        // Check missing predictions
        const missingMatches = [];
        for (const m of upcomingMatches) {
          const questions = await api.getQuestionsForMatch(m.id);
          if (questions.length === 0) continue; 

          const userPreds = questions.filter(q => predictions.find(p => p.question_id === q.id));
          if (userPreds.length < questions.length) {
            missingMatches.push(m);
          }
        }

        const myEntry = leaderboard.find(e => e.user_id === user.id) || null;

        if (!isMounted) return;

        // Determine if we should show the popup
        const hasMissing = missingMatches.length > 0;
        const nextMatchWithin24h = nextMatch && (new Date(nextMatch.kickoff_time) - new Date()) < 24 * 60 * 60 * 1000;

        if (hasMissing || nextMatchWithin24h) {
          setData({
            missingMatches,
            nextMatch,
            myEntry
          });
          setShow(true);
        }
      } catch (err) {
        console.error("Failed to load updates popup data", err);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!show || !data) return null;

  const handleClose = () => {
    sessionStorage.setItem("hasSeenTournamentUpdates", "true");
    setShow(false);
  };

  const handleNavigate = (path) => {
    handleClose();
    navigate(path);
  };

  const handleMakePredictions = () => {
    if (data.missingMatches.length > 0) {
      handleNavigate(`/matches/${data.missingMatches[0].id}`);
    } else {
      handleNavigate(`/predictions`);
    }
  };

  const nearestMissingMatch = data.missingMatches[0];

  return (
    <div className="updates-popup-overlay">
      <div className="updates-popup animate-in">
        <div className="updates-popup__header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0, fontSize: "1.25rem" }}>
            <Trophy size={20} style={{ color: "var(--color-gold)" }} />
            TOURNAMENT UPDATES
          </h2>
          <button className="updates-popup__close" onClick={handleClose} aria-label="Close popup">
            <X size={20} />
          </button>
        </div>
        
        <div className="updates-popup__content">
          {nearestMissingMatch && (() => {
            const msUntilLock = new Date(nearestMissingMatch.kickoff_time) - new Date();
            const hoursUntilLock = msUntilLock / (1000 * 60 * 60);
            let urgencyColor = "var(--color-gold)";
            if (hoursUntilLock < 3) {
              urgencyColor = "var(--color-error)";
            } else if (hoursUntilLock <= 12) {
              urgencyColor = "var(--color-warning)";
            }

            return (
              <>
                <div className="updates-popup__section">
                  <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: urgencyColor, marginTop: 0, marginBottom: "0.75rem", fontSize: "1rem" }}>
                    <AlertTriangle size={18} />
                    Action Required
                  </h3>
                  <p style={{ margin: "0 0 1rem", fontSize: "0.95rem" }}>
                    You have {data.missingMatches.length} match{data.missingMatches.length !== 1 ? 'es' : ''} awaiting predictions.
                  </p>
                  <div style={{ fontSize: "0.9rem", color: "var(--color-text)", marginBottom: "0.5rem" }}>Most Urgent:</div>
                  <div style={{ background: `rgba(${hoursUntilLock < 3 ? '239, 68, 68' : (hoursUntilLock <= 12 ? '245, 158, 11' : '255, 215, 0')}, 0.05)`, border: `1px solid rgba(${hoursUntilLock < 3 ? '239, 68, 68' : (hoursUntilLock <= 12 ? '245, 158, 11' : '255, 215, 0')}, 0.2)`, padding: "1rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                    <strong style={{ fontSize: "1.1rem", display: "block", marginBottom: "0.5rem" }}>{nearestMissingMatch.team1} vs {nearestMissingMatch.team2}</strong>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: urgencyColor, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
                      <AlertTriangle size={14} /> LOCKS IN {formatTimeRemaining(nearestMissingMatch.kickoff_time)}
                    </div>
                  </div>
                </div>
                <hr className="updates-popup__divider" />
              </>
            );
          })()}

          {data.nextMatch && (() => {
            const msUntilStart = new Date(data.nextMatch.kickoff_time) - new Date();
            const startsSoon = msUntilStart < 2 * 60 * 60 * 1000;
            return (
              <>
                <div className="updates-popup__section">
                  <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: 0, marginBottom: "0.75rem", fontSize: "1rem" }}>
                    {startsSoon ? <span style={{ color: "var(--color-error)" }}>🔥 Match Starts Soon</span> : <span style={{ color: "var(--color-gold)", display: "flex", alignItems: "center", gap: "0.5rem" }}><Clock size={16} /> Next Match</span>}
                  </h3>
                  <div style={{ background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                    <strong style={{ fontSize: "1.1rem", display: "block", marginBottom: "0.5rem" }}>{data.nextMatch.team1} vs {data.nextMatch.team2}</strong>
                    <div style={{ fontSize: "0.9rem" }}>
                      <span className="text-muted">Starts in: </span>
                      <strong style={{ color: "var(--color-gold)" }}>{formatTimeRemaining(data.nextMatch.kickoff_time)}</strong>
                    </div>
                  </div>
                </div>
                <hr className="updates-popup__divider" />
              </>
            );
          })()}

          {data.myEntry && (
            <>
              <div className="updates-popup__section">
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: 0, marginBottom: "0.75rem", fontSize: "1rem" }}>
                  <Trophy size={16} style={{ color: "var(--color-gold)" }} />
                  Current Rank
                </h3>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-gold)", marginBottom: "0.5rem" }}>
                    #{data.myEntry.rank}
                  </div>
                  <div style={{ fontSize: "0.95rem" }}>
                    {data.myEntry.rank === 1 ? (
                      <div style={{ color: "var(--color-gold)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                        <span style={{ fontSize: "1.5rem", textShadow: "0 0 10px rgba(255, 215, 0, 0.5)" }}>👑</span>
                        <strong style={{ letterSpacing: "1px" }}>Tournament Leader</strong>
                      </div>
                    ) : (
                      <>
                        {data.myEntry.movement > 0 && <span style={{ color: "var(--color-success)" }}>📈 You climbed {data.myEntry.movement} places since the last scored match</span>}
                        {data.myEntry.movement < 0 && <span style={{ color: "var(--color-error)" }}>📉 You dropped {Math.abs(data.myEntry.movement)} places since the last scored match</span>}
                        {data.myEntry.movement === 0 && <span className="text-muted">➜ No rank change since the last scored match</span>}
                        {data.myEntry.movement == null && <span className="text-muted">No previous rank</span>}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <hr className="updates-popup__divider" />
              
              <div className="updates-popup__section">
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: 0, marginBottom: "0.75rem", fontSize: "1rem" }}>
                  📊 Tournament Summary
                </h3>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "var(--radius-sm)", display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-text)" }}>{data.myEntry.total_points} Points</div>
                  <div style={{ fontSize: "0.95rem", color: "var(--color-text)" }}>{data.myEntry.correct_predictions} Correct Predictions</div>
                  <div style={{ fontSize: "0.95rem", color: "var(--color-text)" }}>{data.myEntry.exact_predictions} Exact Prediction{data.myEntry.exact_predictions !== 1 && 's'}</div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="updates-popup__footer">
          {data.missingMatches.length > 0 && (
            <button className="btn btn--primary" onClick={handleMakePredictions} style={{ flex: 1, justifyContent: "center" }}>
              Make Predictions
            </button>
          )}
          <button className="btn btn--secondary" onClick={() => handleNavigate("/leaderboard")} style={{ flex: 1, justifyContent: "center" }}>
            View Leaderboard
          </button>
          <button className="btn btn--secondary" onClick={handleClose} style={{ flex: 0.5, justifyContent: "center" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
