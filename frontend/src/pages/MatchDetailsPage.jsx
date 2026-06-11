import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import PredictionForm from "../components/PredictionForm";
import { ChevronLeft, Clock, Target } from "lucide-react";

function Countdown({ kickoffTime }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(kickoffTime) - new Date();
      if (diff <= 0) {
        setTimeLeft("Match started");
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      if (days > 0) setTimeLeft(`${days}d ${hours}h ${mins}m`);
      else setTimeLeft(`${hours}h ${mins}m ${secs}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [kickoffTime]);

  if (!timeLeft) return null;

  return (
    <div
      style={{
        textAlign: "center",
        fontSize: "1.1rem",
        fontWeight: 600,
        color: "var(--color-gold)",
        padding: "0.75rem",
        background: "var(--color-gold-dim)",
        borderRadius: "var(--radius)",
        margin: "0.75rem 0",
        letterSpacing: "0.05em",
      }}
    >
      {timeLeft}
    </div>
  );
}

export default function MatchDetailsPage() {
  const { matchId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: match, loading: loadingMatch, error: matchError } = useFetch(
    () => api.getMatch(matchId),
    [matchId, refreshKey],
  );

  const { data: questions, loading: loadingQuestions, error: questionsError } = useFetch(
    () => api.getQuestionsForMatch(matchId),
    [matchId, refreshKey],
  );

  const { data: myPredictions, loading: loadingPredictions, error: predictionsError } = useFetch(
    () => api.getMyPredictionsForMatch(matchId),
    [matchId, refreshKey],
  );

  const predictionMap = {};
  myPredictions?.forEach((p) => {
    predictionMap[p.question_id] = p.answer;
  });

  const handleSaved = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  if (loadingMatch || loadingQuestions || loadingPredictions) {
    return (
      <div>
        <div className="skeleton skeleton--title" style={{ width: "40%" }}></div>
        <div className="skeleton skeleton--card"></div>
        <div className="skeleton skeleton--card"></div>
      </div>
    );
  }

  if (matchError || questionsError || predictionsError) {
    return <div className="error">{matchError || questionsError || predictionsError}</div>;
  }

  const showCountdown =
    match.status === "scheduled" && new Date(match.kickoff_time) > new Date();

  return (
    <div>
      <Link to={`/tournaments/${match.tournament_id}`} className="breadcrumb">
        <ChevronLeft size={16} /> Back to tournament
      </Link>

      <div className="card animate-in" style={{ textAlign: "center" }}>
        <div className="match-card__teams">
          <span className="match-card__team match-card__team--left">{match.team1}</span>
          <span className="match-card__vs">VS</span>
          <span className="match-card__team match-card__team--right">{match.team2}</span>
        </div>

        {match.score1 != null && (
          <div className="match-card__score">
            {match.score1} - {match.score2}
          </div>
        )}

        <div className="match-card__info" style={{ justifyContent: "center" }}>
          <Clock size={14} />
          <span>{new Date(match.kickoff_time).toLocaleString()}</span>
          <span
            className={`badge ${
              match.status === "live"
                ? "badge--live"
                : match.status === "finished"
                ? "badge--gold"
                : ""
            }`}
          >
            {match.status}
          </span>
        </div>

        {showCountdown && <Countdown kickoffTime={match.kickoff_time} />}
      </div>

      <h2 className="section-title">
        <Target size={18} />
        Predictions
      </h2>

      {questions?.length === 0 ? (
        <div className="empty-state">No questions for this match yet.</div>
      ) : (
        questions?.map((question, i) => (
          <div
            key={question.id}
            className={`card animate-in animate-in-delay-${Math.min(i + 1, 4)}`}
          >
            <h3>{question.question_text}</h3>
            <p className="card__meta">
              {question.question_type} · {question.point_value} pts
              {question.locked && (
                <span className="badge badge--warning" style={{ marginLeft: "0.5rem" }}>
                  Locked
                </span>
              )}
            </p>
            <PredictionForm
              question={question}
              existingAnswer={predictionMap[question.id]}
              onSaved={handleSaved}
            />
          </div>
        ))
      )}
    </div>
  );
}
