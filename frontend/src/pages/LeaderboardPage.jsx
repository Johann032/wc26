import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import { useAuth } from "../context/AuthContext";
import TournamentSelect from "../components/TournamentSelect";
import { Trophy, Medal } from "lucide-react";

const MovementIndicator = ({ movement, verbose = false }) => {
  if (movement === null || movement === undefined) {
    return <span style={{ color: "var(--color-text-muted, gray)", fontSize: "0.9em" }}>—</span>;
  }
  if (movement > 0) {
    return (
      <span style={{ color: "var(--color-success, #22c55e)", display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
        ↑{movement} {verbose && <span style={{ fontWeight: 400, fontSize: "0.85em", color: "var(--color-text-muted, gray)" }}>since last match</span>}
      </span>
    );
  }
  if (movement < 0) {
    return (
      <span style={{ color: "var(--color-danger, #ef4444)", display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
        ↓{Math.abs(movement)} {verbose && <span style={{ fontWeight: 400, fontSize: "0.85em", color: "var(--color-text-muted, gray)" }}>since last match</span>}
      </span>
    );
  }
  return (
    <span style={{ color: "var(--color-text-muted, gray)", display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
      → {verbose && <span style={{ fontWeight: 400, fontSize: "0.85em" }}>No change</span>}
    </span>
  );
};

export default function LeaderboardPage() {
  const { user } = useAuth();
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

  const { data: leaderboard, loading, error } = useFetch(
    () =>
      activeTournamentId
        ? api.getLeaderboard(activeTournamentId)
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
        <h1>Leaderboard</h1>
        <p>No tournaments available yet.</p>
      </div>
    );
  }

  const top3 = leaderboard?.slice(0, 3) || [];
  const rankColors = {
    1: "#D4AF37",
    2: "#C0C0C0",
    3: "#CD7F32",
  };

  return (
    <div className="bg-page-wrapper">
      <div className="bg-image bg-crowd"></div>
      <div className="bg-overlay"></div>
      <div className="content-relative">
        <header className="premium-page-header">
          <h1 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <Trophy size={28} style={{ color: "var(--color-gold)" }} />
            Leaderboard
          </h1>
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

      {!loading && leaderboard?.length === 0 && (
        <div className="empty-state">No players on the leaderboard yet.</div>
      )}

      {!loading && leaderboard?.length > 0 && (
        <>
          {/* Podium - Top 3 */}
          {top3.length >= 3 && (
            <div className="podium animate-in">
              {[top3[1], top3[0], top3[2]].map((entry, idx) => {
                const place = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                return (
                  <div key={entry.user_id} className={`podium__place podium__place--${place}`}>
                    <div className={`podium__rank podium__rank--${place}`}>{place}</div>
                    <div className="podium__name">{entry.display_name}</div>
                    <div className="podium__points">{entry.total_points} pts</div>
                    <div className="podium__stats">
                      {entry.exact_predictions} exact · {entry.correct_predictions} correct
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                      <MovementIndicator movement={entry.movement} verbose={true} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Table */}
          <div className="table-wrap animate-in animate-in-delay-2">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Points</th>
                  <th>Exact</th>
                  <th>Correct</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.user_id}
                    className={entry.user_id === user?.id ? "leaderboard-row--me" : ""}
                  >
                    <td>
                      {entry.rank <= 3 ? (
                        <Medal size={16} style={{ color: rankColors[entry.rank] }} />
                      ) : (
                        entry.rank
                      )}
                    </td>
                    <td style={{ fontWeight: entry.user_id === user?.id ? 600 : 400 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          {entry.display_name}
                          {entry.user_id === user?.id && (
                            <span className="badge badge--gold" style={{ marginLeft: "0.5rem" }}>
                              You
                            </span>
                          )}
                        </div>
                        <MovementIndicator movement={entry.movement} />
                      </div>
                    </td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: entry.rank <= 3 ? "var(--color-gold)" : "inherit",
                      }}
                    >
                      {entry.total_points}
                    </td>
                    <td>{entry.exact_predictions}</td>
                    <td>{entry.correct_predictions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
