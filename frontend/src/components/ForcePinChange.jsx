import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function ForcePinChange() {
  const { refresh } = useAuth();
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      setError("PINs do not match");
      return;
    }
    if (newPin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // old_pin is ignored on the backend when force_pin_change is true
      await api.changePin("", newPin);
      await refresh();
    } catch (err) {
      setError(err.message || "Failed to change PIN");
      setLoading(false);
    }
  };

  return (
    <div className="bg-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="bg-image bg-messi"></div>
      <div className="bg-overlay"></div>
      <div className="content-relative" style={{ width: '100%', maxWidth: '400px', padding: '1rem' }}>
        <div className="card animate-in">
          <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "var(--color-primary)" }}>Update Required</h2>
          <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>An administrator has reset your PIN. Please choose a new PIN to continue.</p>
          {error && <div className="error" style={{ marginBottom: "1rem" }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>New PIN</label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                maxLength={10}
                required
                className="input-field"
                placeholder="Enter 4+ digits"
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
                placeholder="Confirm your new PIN"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
              />
            </div>
            <button type="submit" className="btn btn--primary btn--block" disabled={loading} style={{ width: '100%' }}>
              {loading ? "Updating..." : "Update PIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
