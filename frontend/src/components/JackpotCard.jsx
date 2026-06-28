import { Link } from "react-router-dom";
import { Trophy, Hammer } from "lucide-react";

export default function JackpotCard({ tournamentId }) {
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
          WORLD CUP JACKPOT
        </h2>
      </div>
      
      <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-text)", opacity: 0.9, fontStyle: "italic" }}>
        45 BONUS POINTS AVAILABLE
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", background: "rgba(0,0,0,0.4)", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <Hammer size={16} color="var(--color-gold)" />
        <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.9)" }}>Currently under construction until Round of 32.</span>
      </div>

      <Link
        to={tournamentId ? `/tournaments/${tournamentId}/jackpot` : "/jackpot"}
        className="btn btn--primary"
        style={{
          marginTop: "0.5rem",
          background: "transparent",
          color: "var(--color-gold)",
          border: "1px solid var(--color-gold)",
          fontWeight: 600,
          textAlign: "center"
        }}
      >
        View Details
      </Link>
    </div>
  );
}
