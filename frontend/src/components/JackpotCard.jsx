import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../api/client";

export default function JackpotCard({ tournamentId }) {
  const { data: stats, error } = useFetch(
    () => (tournamentId ? api.getJackpotStats(tournamentId) : Promise.resolve(null)),
    [tournamentId]
  );

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)",
        border: "1px solid rgba(255, 215, 0, 0.3)",
        borderRadius: "var(--radius-md)",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        position: "relative",
        overflow: "hidden",
      }}
      className="animate-in"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Trophy size={24} fill="var(--color-gold)" color="#000" />
        <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--color-gold)", textTransform: "uppercase", letterSpacing: "1px" }}>
          🏆 WORLD CUP JACKPOT
        </h2>
      </div>
      
      <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-text)", opacity: 0.9, fontStyle: "italic" }}>
        45 BONUS POINTS AVAILABLE
      </p>

      {error ? (
        <div style={{ fontSize: "0.85rem", color: "var(--color-error)", fontStyle: "italic", padding: "0.5rem", background: "rgba(255,0,0,0.1)", borderRadius: "var(--radius-sm)" }}>
          Temporarily unavailable.
        </div>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-text)" }}>
            <strong style={{ color: "var(--color-gold)" }}>Only 3 Special Questions</strong>
            <br />
            <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>Only One Chance.</span>
          </p>

          {stats && (
            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", opacity: 0.9 }}>
              <div>
                <strong>Completed:</strong> {stats?.completed_questions || 0}/{stats?.total_questions || 0}
              </div>
              <div>
                <strong>Participants:</strong> {stats?.participants || 0}/{stats?.total_users || 0}
              </div>
            </div>
          )}
        </>
      )}

      <Link
        to={tournamentId ? `/tournaments/${tournamentId}/jackpot` : "/jackpot"}
        className="btn btn--primary"
        style={{
          marginTop: "0.5rem",
          background: "var(--color-gold)",
          color: "#000",
          border: "none",
          fontWeight: 600,
          textAlign: "center"
        }}
      >
        View Jackpot Challenge
      </Link>
    </div>
  );
}
