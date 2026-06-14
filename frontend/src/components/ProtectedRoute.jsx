import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ForcePinChange from "./ForcePinChange";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.force_pin_change) {
    return <ForcePinChange />;
  }

  return children;
}
