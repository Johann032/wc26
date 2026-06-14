import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function ChangePinPage() {
  const { refresh } = useAuth();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      setError("New PINs do not match");
      return;
    }
    if (newPin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.changePin(currentPin, newPin);
      setSuccess("PIN successfully updated.");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      await refresh();
    } catch (err) {
      setError(err.message || "Failed to change PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-relative" style={{ maxWidth: '500px', margin: '0 auto', paddingTop: '2rem' }}>
      <h2 className="section-title">Change PIN</h2>
      <div className="card animate-in">
        {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}
        {success && <div style={{ color: 'var(--color-gold)', marginBottom: "1rem", fontWeight: 600 }}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Current PIN</label>
            <input
              type="password"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              required
              className="input-field"
              placeholder="Enter current PIN"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>New PIN</label>
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              maxLength={10}
              required
              className="input-field"
              placeholder="Enter new 4+ digit PIN"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm New PIN</label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              maxLength={10}
              required
              className="input-field"
              placeholder="Confirm new PIN"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Updating..." : "Change PIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
