import { useEffect } from "react";
import { useFetch } from "../hooks/useFetch";
import { api } from "../api/client";
import { Trophy } from "lucide-react";

export default function TournamentSelect({ value, onChange }) {
  const { data: tournaments, loading, error } = useFetch(() => api.getTournaments(), []);

  const validIds = tournaments?.map((t) => t.id) || [];
  const resolvedValue = validIds.includes(value) ? value : validIds[0] || "";

  useEffect(() => {
    if (!loading && tournaments?.length && value && !validIds.includes(value) && resolvedValue) {
      onChange(resolvedValue);
    }
  }, [loading, tournaments, value, validIds, resolvedValue, onChange]);

  if (loading) return <p className="loading-inline">Loading tournaments...</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!tournaments?.length) return <p className="empty-state">No tournaments available.</p>;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Trophy size={18} style={{ color: "var(--color-gold)", flexShrink: 0 }} />
      <select
        className="input"
        value={resolvedValue}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {tournaments.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    </div>
  );
}
