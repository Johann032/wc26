import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import TournamentPage from "./pages/TournamentPage";
import MatchDetailsPage from "./pages/MatchDetailsPage";
import PredictionsPage from "./pages/PredictionsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ChangePinPage from "./pages/ChangePinPage";
import NotFoundPage from "./pages/NotFoundPage";
import InsightsPage from "./pages/InsightsPage";
import MatchBreakdownPage from "./pages/MatchBreakdownPage";
import JackpotPage from "./pages/JackpotPage";

const introComponents = import.meta.glob("./components/IntroReveal.jsx", { eager: true });
const IntroReveal = introComponents["./components/IntroReveal.jsx"]?.default;

const MAINTENANCE_MODE = true;

export default function App() {
  if (MAINTENANCE_MODE) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "20px", textAlign: "center", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ color: "var(--color-gold, #ffd700)", marginBottom: "1rem", fontSize: "2rem", textTransform: "uppercase", letterSpacing: "2px" }}>Maintenance Break</h1>
        <p style={{ color: "var(--color-text-muted, #a0aec0)", maxWidth: "400px", lineHeight: "1.6" }}>
          We are upgrading the servers for the Jackpot Challenge. We'll be right back!
        </p>
      </div>
    );
  }

  return (
    <>
      {IntroReveal && <IntroReveal />}
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tournaments/:tournamentId" element={<TournamentPage />} />
                <Route path="/matches/:matchId" element={<MatchDetailsPage />} />
                <Route path="/predictions" element={<PredictionsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/insights/match/:matchId" element={<MatchBreakdownPage />} />
                <Route path="/tournaments/:id/jackpot" element={<JackpotPage />} />
                <Route path="/jackpot" element={<JackpotPage />} />
                <Route path="/change-pin" element={<ChangePinPage />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  );
}
