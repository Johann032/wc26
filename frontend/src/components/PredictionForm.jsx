import { useEffect, useState, useRef } from "react";
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
        <select 
          value={answer} 
          onChange={(e) => {
            const val = e.target.value;
            setAnswer(val);
            if (val) savePrediction(val);
          }} 
          className="input"
        >
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
            onClick={() => {
              setAnswer("Yes");
              savePrediction("Yes");
            }}
          >
            Yes
          </button>
          <button
            type="button"
            className={`prediction-toggle__btn ${answer === "No" ? "prediction-toggle__btn--active" : ""}`}
            onClick={() => {
              setAnswer("No");
              savePrediction("No");
            }}
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
          onChange={(e) => {
            setAnswer(e.target.value);
            setError(null);
            setSuccess(false);
          }}
          onBlur={() => {
            if (answer && answer !== existingAnswer) savePrediction(answer);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && answer) savePrediction(answer);
          }}
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
          onChange={(e) => {
            setAnswer(e.target.value);
            setError(null);
            setSuccess(false);
          }}
          onBlur={() => {
            if (answer && answer !== existingAnswer) savePrediction(answer);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && answer) savePrediction(answer);
          }}
        />
      );
    }

    return (
      <input
        type="text"
        className="input"
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          setError(null);
          setSuccess(false);
        }}
        onBlur={() => {
          if (answer && answer !== existingAnswer) savePrediction(answer);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && answer) savePrediction(answer);
        }}
      />
    );
  };

  const validateClient = (val) => {
    if (!val) return "Answer is required";
    if (question.question_type === "exact_score" && !/^\d+\s*[-:]\s*\d+$/.test(val.trim())) {
      return "Exact score must be in format e.g. 2-1";
    }
    if (question.question_type === "number" && !/^\d+$/.test(val.trim())) {
      return "Answer must be a whole number";
    }
    return null;
  };

  const savingRef = useRef(false);
  const pendingAnswerRef = useRef(null);

  const savePrediction = async (valToSave) => {
    if (savingRef.current) {
      pendingAnswerRef.current = valToSave;
      return;
    }
    
    savingRef.current = true;
    setSaving(true);

    const clientError = validateClient(valToSave);
    if (clientError) {
      setError(clientError);
      setSaving(false);
      savingRef.current = false;
      return;
    }
    
    setError(null);
    setSuccess(false);
    try {
      await api.submitPrediction(question.id, valToSave);
      setSuccess(true);
      onSaved?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      if (pendingAnswerRef.current !== null) {
        const nextVal = pendingAnswerRef.current;
        pendingAnswerRef.current = null;
        savingRef.current = false;
        savePrediction(nextVal);
      } else {
        savingRef.current = false;
        setSaving(false);
      }
    }
  };

  return (
    <div className="prediction-form">
      {renderInput()}
      <div style={{ display: "flex", alignItems: "center", minHeight: "24px", marginTop: "0.5rem" }}>
        {saving && (
          <span className="text-muted" style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.85rem" }}>
            Saving...
          </span>
        )}
        {error && !saving && (
          <span className="form-error" style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.85rem", margin: 0 }}>
            <XCircle size={14} /> {error}
          </span>
        )}
        {success && !saving && (
          <span className="form-success" style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.85rem", margin: 0 }}>
            <CheckCircle size={14} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
