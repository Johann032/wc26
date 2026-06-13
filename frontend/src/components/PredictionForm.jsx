import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Lock, CheckCircle, XCircle, Send } from "lucide-react";

export default function PredictionForm({ question, existingAnswer, onSaved, isLocked }) {
  const [answer, setAnswer] = useState(existingAnswer || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setAnswer(existingAnswer || "");
    setError(null);
    setSuccess(false);
  }, [existingAnswer, question.id]);

  if (isLocked) {
    return (
      <div className="prediction-form__locked">
        <Lock size={16} style={{ flexShrink: 0 }} />
        <span>Locked</span>
        <span style={{ marginLeft: "auto", fontWeight: 600, color: "var(--color-text)" }}>
          {existingAnswer || "No answer"}
        </span>
      </div>
    );
  }

  const renderInput = () => {
    const type = question.question_type;
    const choices = question.options_json?.choices || [];

    if (type === "winner" || type === "multiple_choice") {
      return (
        <select value={answer} onChange={(e) => setAnswer(e.target.value)} className="input">
          <option value="">Select...</option>
          {choices.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      );
    }

    if (type === "yes_no") {
      return (
        <div className="prediction-toggle">
          <button
            type="button"
            className={`prediction-toggle__btn ${answer === "Yes" ? "prediction-toggle__btn--active" : ""}`}
            onClick={() => setAnswer("Yes")}
          >
            Yes
          </button>
          <button
            type="button"
            className={`prediction-toggle__btn ${answer === "No" ? "prediction-toggle__btn--active" : ""}`}
            onClick={() => setAnswer("No")}
          >
            No
          </button>
        </div>
      );
    }

    if (type === "exact_score") {
      return (
        <input
          type="text"
          className="input"
          placeholder="e.g. 2-1"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      );
    }

    if (type === "number") {
      return (
        <input
          type="number"
          min="0"
          step="1"
          className="input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      );
    }

    return (
      <input
        type="text"
        className="input"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
    );
  };

  const validateClient = () => {
    if (!answer) return "Answer is required";
    if (question.question_type === "exact_score" && !/^\d+\s*[-:]\s*\d+$/.test(answer.trim())) {
      return "Exact score must be in format e.g. 2-1";
    }
    if (question.question_type === "number" && !/^\d+$/.test(answer.trim())) {
      return "Answer must be a whole number";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientError = validateClient();
    if (clientError) {
      setError(clientError);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.submitPrediction(question.id, answer);
      setSuccess(true);
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="prediction-form" onSubmit={handleSubmit}>
      {renderInput()}
      <button type="submit" className="btn btn--primary" disabled={saving || !answer}>
        <Send size={16} />
        {saving ? "Saving..." : existingAnswer ? "Update" : "Submit"}
      </button>
      {error && (
        <p className="form-error" style={{ display: "flex", alignItems: "center", gap: "0.375rem", width: "100%" }}>
          <XCircle size={14} /> {error}
        </p>
      )}
      {success && (
        <p className="form-success" style={{ display: "flex", alignItems: "center", gap: "0.375rem", width: "100%" }}>
          <CheckCircle size={14} /> Saved!
        </p>
      )}
    </form>
  );
}
