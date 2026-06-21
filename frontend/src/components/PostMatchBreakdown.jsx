import React from "react";
import "./PostMatchBreakdown.css";

function PostMatchBreakdown({ match, breakdown, myPerformance }) {
  if (!breakdown || !match) return null;

  const { community, match_masters, biggest_movers, match_facts } = breakdown;

  const totalMatchPoints = myPerformance
    ? myPerformance.reduce((sum, p) => sum + (p.awarded_points || 0), 0)
    : 0;

  return (
    <div className="post-match-breakdown">
      <div className="pmb-header">
        <h2>🏆 MATCH BREAKDOWN</h2>
        <div className="pmb-match-title">
          {match.team1} {match.score1 !== null ? match.score1 : "?"} - {match.score2 !== null ? match.score2 : "?"} {match.team2}
        </div>
      </div>

      <section className="pmb-section">
        <h3>📊 Community Predictions</h3>
        {community?.map((q) => (
          <div key={q.question_id} className="pmb-question-stats">
            <div className="pmb-q-title">{q.question_text}</div>
            <div className="pmb-bars">
              {Object.entries(q.percentages || {})
                .sort(([, p1], [, p2]) => p2 - p1)
                .map(([answer, pct]) => (
                  <div key={answer} className="pmb-bar-row">
                    <div className="pmb-bar-label">{answer}</div>
                    <div className="pmb-bar-track">
                      <div className="pmb-bar-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="pmb-bar-pct">{pct}%</div>
                  </div>
                ))}
            </div>
            <div className="pmb-q-meta">
              <span className="pmb-q-participants">Participants: {q.total_participants}</span>
              <span className="pmb-q-correct">Correct Answer: <strong>{q.correct_answer}</strong></span>
            </div>
          </div>
        ))}
      </section>

      <section className="pmb-section">
        <h3>🏆 Match Masters</h3>
        <p className="pmb-subtitle">Players who earned the most points on this match.</p>
        <div className="pmb-leaders-list">
          {match_masters?.map((leader, idx) => {
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div key={leader.user_id} className="pmb-leader-card">
                <div className="pmb-leader-header">
                  <span className="pmb-leader-medal">{medals[idx] || `#${idx + 1}`}</span>
                  <span className="pmb-leader-name">{leader.display_name}</span>
                  <span className="pmb-leader-points">+{leader.points} Pts</span>
                </div>
                <div className="pmb-leader-preds">
                  {community?.map((q) => {
                    const p = leader.predictions?.find(pred => pred.question_id === q.question_id);
                    const isCorrect = p && p.awarded_points > 0;
                    return (
                      <div key={q.question_id} className={`pmb-leader-pred ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <span className="pmb-icon">{isCorrect ? '✓' : '✗'}</span>
                        <span className="pmb-text">
                          {q.question_type === 'winner' ? 'Winner' : 
                           q.question_type === 'exact_score' ? 'Exact Score' : 'Prop'}: {p ? p.answer : "N/A"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pmb-section">
        <h3>📈 Biggest Movers</h3>
        <div className="pmb-movers-list">
          {biggest_movers?.map(mover => (
            <div key={mover.user_id} className="pmb-mover-row">
              <span className="pmb-mover-name">{mover.display_name}</span>
              <span className={`pmb-mover-movement ${mover.movement > 0 ? 'up' : mover.movement < 0 ? 'down' : ''}`}>
                {mover.movement > 0 ? `↑${mover.movement}` : mover.movement < 0 ? `↓${Math.abs(mover.movement)}` : '-'}
              </span>
            </div>
          ))}
          {(!biggest_movers || biggest_movers.length === 0) && <div className="pmb-no-movers">No significant movement.</div>}
        </div>
      </section>

      <section className="pmb-section pmb-personal">
        <h3>🎯 Your Performance</h3>
        <div className="pmb-personal-total">+{totalMatchPoints} Points</div>
        <div className="pmb-personal-preds">
          {community?.map((q) => {
            const p = myPerformance?.find(pred => pred.question_id === q.question_id);
            const isCorrect = p && p.awarded_points > 0;
            return (
              <div key={q.question_id} className={`pmb-personal-pred ${isCorrect ? 'correct' : 'incorrect'}`}>
                <span className="pmb-icon">{isCorrect ? '✓' : '✗'}</span>
                <span className="pmb-text">
                  {q.question_type === 'winner' ? 'Winner' : 
                   q.question_type === 'exact_score' ? 'Exact Score' : q.question_text}: {p ? p.answer : "N/A"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pmb-section pmb-facts">
        <h3>🔥 Match Facts</h3>
        <div className="pmb-facts-grid">
          <div className="pmb-fact-card">
            <span className="pmb-fact-label">Most Popular Pick:</span>
            <span className="pmb-fact-value">{match_facts?.most_popular_pick}</span>
          </div>
          <div className="pmb-fact-card">
            <span className="pmb-fact-label">Biggest Upset:</span>
            <span className="pmb-fact-value">{match_facts?.biggest_upset}</span>
          </div>
          <div className="pmb-fact-card">
            <span className="pmb-fact-label">Perfect Predictions:</span>
            <span className="pmb-fact-value">{match_facts?.perfect_predictions} Players</span>
          </div>
          <div className="pmb-fact-card">
            <span className="pmb-fact-label">Participants:</span>
            <span className="pmb-fact-value">{match_facts?.total_participants}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PostMatchBreakdown;
