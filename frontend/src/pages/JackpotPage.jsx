import { Link } from "react-router-dom";
import { Trophy, Hammer } from "lucide-react";

export default function JackpotPage() {
  return (
    <div className="page-container jackpot-page" style={{ background: "#000", minHeight: "100vh", padding: "2rem 1rem", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "800px", width: "100%", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", margin: "0 0 0.5rem 0", color: "var(--color-gold)", fontSize: "2.5rem", textTransform: "uppercase", letterSpacing: "2px", textShadow: "0 0 20px rgba(255,215,0,0.3)" }}>
            <Trophy size={40} /> WORLD CUP JACKPOT
          </h1>
          <p style={{ margin: 0, color: "rgba(255,215,0,0.8)", fontSize: "1.2rem", fontWeight: 600, letterSpacing: "1px" }}>
            45 BONUS POINTS AVAILABLE
          </p>
        </div>

        {/* Main Card */}
        <div className="card" style={{ 
          background: "linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(15,15,15,0.95) 100%)",
          border: "1px solid rgba(255,215,0,0.3)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.05)",
          padding: "3rem 2rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Subtle Glow Effect */}
          <div style={{ position: "absolute", top: "-50px", left: "50%", transform: "translateX(-50%)", width: "150px", height: "150px", background: "var(--color-gold)", filter: "blur(100px)", opacity: 0.15, pointerEvents: "none" }}></div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <div style={{ background: "rgba(255,215,0,0.1)", padding: "1rem", borderRadius: "50%", border: "1px solid rgba(255,215,0,0.2)" }}>
              <Hammer size={48} color="var(--color-gold)" />
            </div>
          </div>

          <h2 style={{ fontSize: "2rem", color: "var(--color-gold)", margin: "0 0 1.5rem 0", letterSpacing: "1px" }}>
            🚧 UNDER CONSTRUCTION
          </h2>
          
          <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "rgba(255,255,255,0.9)", margin: "0 0 1rem 0" }}>
            The World Cup Jackpot challenge will be unlocked after the completion of the Round of 32.
          </p>
          
          <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "rgba(255,255,255,0.7)", margin: "0 0 2.5rem 0" }}>
            The feature is currently being prepared and tested.
          </p>

          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-md)", padding: "2rem", textAlign: "left", display: "inline-block", maxWidth: "400px", width: "100%", margin: "0 auto 2.5rem auto" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "var(--color-gold)", fontSize: "1.2rem", borderBottom: "1px solid rgba(255,215,0,0.2)", paddingBottom: "0.5rem" }}>Coming Soon:</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ padding: "0.5rem 0", display: "flex", alignItems: "center", gap: "0.75rem", color: "rgba(255,255,255,0.8)" }}>
                <span style={{ color: "var(--color-gold)" }}>•</span> High-value tournament predictions
              </li>
              <li style={{ padding: "0.5rem 0", display: "flex", alignItems: "center", gap: "0.75rem", color: "rgba(255,255,255,0.8)" }}>
                <span style={{ color: "var(--color-gold)" }}>•</span> Special bonus points
              </li>
              <li style={{ padding: "0.5rem 0", display: "flex", alignItems: "center", gap: "0.75rem", color: "rgba(255,255,255,0.8)" }}>
                <span style={{ color: "var(--color-gold)" }}>•</span> Exclusive leaderboard
              </li>
              <li style={{ padding: "0.5rem 0", display: "flex", alignItems: "center", gap: "0.75rem", color: "rgba(255,255,255,0.8)" }}>
                <span style={{ color: "var(--color-gold)" }}>•</span> Long-term World Cup challenges
              </li>
            </ul>
          </div>

          <div style={{ padding: "1rem", background: "rgba(255,215,0,0.05)", borderLeft: "3px solid var(--color-gold)", borderRadius: "0 4px 4px 0", textAlign: "left", marginBottom: "2rem" }}>
            <strong style={{ color: "var(--color-gold)", display: "block", marginBottom: "0.25rem" }}>Expected Launch:</strong>
            <span style={{ color: "rgba(255,255,255,0.9)" }}>After the Round of 32 concludes.</span>
          </div>

          <Link to="/" className="btn" style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            padding: "0.75rem 2rem", 
            background: "transparent", 
            color: "var(--color-gold)", 
            border: "1px solid var(--color-gold)",
            textDecoration: "none",
            fontWeight: 600,
            transition: "all 0.2s ease"
          }}>
            ← Back to Tournament
          </Link>
        </div>
      </div>
    </div>
  );
}
