import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="empty-state animate-in" style={{ paddingTop: "4rem" }}>
      <AlertTriangle size={48} style={{ color: "#D4AF37", marginBottom: "1rem" }} />
      <h1
        style={{
          background: "linear-gradient(135deg, #D4AF37, #F5E6A3)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: "2.5rem",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          marginBottom: "0.5rem",
        }}
      >
        OFFSIDE!
      </h1>
      <p style={{ marginBottom: "0.5rem" }}>The page you are looking for does not exist.</p>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        Looks like this play was called offside.
      </p>
      <Link to="/" className="btn btn--primary">
        <Home size={18} />
        Back to Home
      </Link>
    </div>
  );
}
