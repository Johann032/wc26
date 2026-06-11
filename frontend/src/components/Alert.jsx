import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const iconMap = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

export default function Alert({ type = "info", message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert--${type}`}>
      <span className="alert__icon">{iconMap[type] || iconMap.info}</span>
      <span>{message}</span>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
