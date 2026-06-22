import { Link } from "react-router-dom";
import { Star, Eye } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../api/client";

export default function JackpotCard({ tournamentId }) {
  const { data: stats } = useFetch(
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

      <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-text)" }}>
        <strong style={{ color: "var(--color-gold)" }}>Only 3 Special Questions</strong>
        <br />
        <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>Only One Chance.</span>
      </p>

      {stats && (
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", opacity: 0.9 }}>
          <div>
            <strong>Completed:</strong> {stats.completed_questions}/{stats.total_questions}
          </div>
          <div>
            <strong>Participants:</strong> {stats.participants}/{stats.total_users}
          </div>
        </div>
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
        Submit Jackpot Predictions
      </Link>
    </div>
  );
}
