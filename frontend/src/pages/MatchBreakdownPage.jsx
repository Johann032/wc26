import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import PostMatchBreakdown from "../components/PostMatchBreakdown";
import { ChevronLeft } from "lucide-react";

export default function MatchBreakdownPage() {
  const { matchId } = useParams();

  const { data: match, loading: loadingMatch, error: matchError } = useFetch(
    () => api.getMatch(matchId),
    [matchId],
  );

  const { data: myPredictions, loading: loadingPredictions, error: predictionsError } = useFetch(
    () => api.getMyPredictionsForMatch(matchId),
    [matchId],
  );

  const { data: breakdown, loading: loadingBreakdown, error: breakdownError } = useFetch(
    () => match?.status === "finished" ? api.getMatchBreakdown(matchId) : Promise.resolve(null),
    [matchId, match?.status]
  );

  if (loadingMatch || loadingPredictions || (match?.status === "finished" && loadingBreakdown)) {
    return (
      <div>
        <div className="skeleton skeleton--title" style={{ width: "40%" }}></div>
        <div className="skeleton skeleton--card"></div>
        <div className="skeleton skeleton--card"></div>
      </div>
    );
  }

  if (matchError || predictionsError) {
    return <div className="error">{matchError || predictionsError}</div>;
  }

  return (
    <div className="bg-page-wrapper">
      <div className="bg-image bg-messi"></div>
      <div className="bg-overlay"></div>
      <div className="content-relative">
        <Link to={`/insights?tournament=${match?.tournament_id}`} className="breadcrumb">
          <ChevronLeft size={16} /> Back to Insights
        </Link>

        {match?.status !== "finished" ? (
          <div className="card animate-in" style={{ textAlign: "center", padding: "3rem" }}>
            <h2>⏳ Match Not Finished</h2>
            <p className="text-muted" style={{ marginTop: "1rem" }}>
              Breakdown and analytics are only available after the match has concluded and all results are finalized.
            </p>
          </div>
        ) : breakdownError ? (
          <div className="error">{breakdownError}</div>
        ) : (
          <PostMatchBreakdown
            match={match}
            breakdown={breakdown}
            myPerformance={myPredictions}
          />
        )}
      </div>
    </div>
  );
}
