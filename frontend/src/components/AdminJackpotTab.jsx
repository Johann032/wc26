import { useState } from "react";
import { Plus, Trash2, Save, CheckSquare } from "lucide-react";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";

function emptyQuestionForm(tournamentId) {
  return {
    tournament_id: tournamentId || "",
    title: "",
    description: "",
    question_type: "multiple_choice",
    num_selections: 1,
    max_points: 0,
    lock_time: "",
    options_json: "",
  };
}

export default function AdminJackpotTab({ activeTournaments, notify }) {
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm());
  const [resultAnswers, setResultAnswers] = useState({});

  const { data: questions, loading, refetch } = useFetch(
    () => (selectedTournament ? api.getSpotlightQuestions(selectedTournament) : Promise.resolve([])),
    [selectedTournament]
  );

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      let parsedOptions = {};
      if (questionForm.options_json) {
        try {
          parsedOptions = JSON.parse(questionForm.options_json);
        } catch (e) {
          notify("Invalid JSON in Options field", "error");
          return;
        }
      }

      const payload = {
        tournament_id: Number(questionForm.tournament_id),
        title: questionForm.title,
        description: questionForm.description,
        question_type: questionForm.question_type,
        num_selections: Number(questionForm.num_selections),
        max_points: Number(questionForm.max_points),
        lock_time: questionForm.lock_time ? new Date(questionForm.lock_time).toISOString() : null,
        options_json: parsedOptions,
      };

      await api.createSpotlightQuestion(payload);
      setQuestionForm(emptyQuestionForm(selectedTournament));
      notify("Jackpot Question Created!");
      refetch();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleUpdateQuestion = async (question, changes) => {
    try {
      if (changes.lock_time) {
        changes.lock_time = new Date(changes.lock_time).toISOString();
      }
      await api.updateSpotlightQuestion(question.id, changes);
      notify("Question Updated!");
      refetch();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm("Are you sure you want to delete this Jackpot Question?")) return;
    try {
      await api.deleteSpotlightQuestion(id);
      notify("Question Deleted!");
      refetch();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleSetResult = async (e, questionId, questionType) => {
    e.preventDefault();
    const rawAnswer = resultAnswers[questionId];
    if (!rawAnswer?.trim()) {
      notify("Correct answer JSON is required", "error");
      return;
    }
    
    let parsedAnswer;
    try {
      parsedAnswer = JSON.parse(rawAnswer);
    } catch (e) {
      notify("Correct answer must be valid JSON", "error");
      return;
    }

    if (questionType === "categorical" && typeof parsedAnswer !== "object") {
      notify("Categorical answers must be a JSON object", "error");
      return;
    }
    if (questionType !== "categorical" && !Array.isArray(parsedAnswer)) {
      notify("Multiple choice answers must be a JSON array", "error");
      return;
    }

    try {
      const res = await api.setSpotlightQuestionResult(questionId, parsedAnswer);
      setResultAnswers((prev) => ({ ...prev, [questionId]: "" }));
      notify(`Results saved! Recalculated ${res.predictions_updated} predictions.`);
      refetch();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleGenerateEliteEight = async () => {
    try {
      const matches = await api.getMatchesForTournament(selectedTournament);
      const r16Matches = matches.filter(m => m.stage === "R16");
      
      if (r16Matches.length === 0) {
        notify("No Round of 16 matches found in this tournament.", "error");
        return;
      }
      
      const teams = new Set();
      let earliestKickoff = null;
      
      r16Matches.forEach(m => {
        if (m.team1) teams.add(m.team1);
        if (m.team2) teams.add(m.team2);
        
        const kickoff = new Date(m.kickoff_time);
        if (!earliestKickoff || kickoff < earliestKickoff) {
          earliestKickoff = kickoff;
        }
      });
      
      if (earliestKickoff) {
        earliestKickoff.setMinutes(earliestKickoff.getMinutes() - 1); // 1 minute before
      }
      
      const teamArray = Array.from(teams).sort();
      
      const scoringRules = {
        "8": 15,
        "7": 12,
        "6": 10,
        "5": 7,
        "4": 5,
        "3": 3,
        "2": 1,
        "1": 0,
        "0": 0
      };
      
      setQuestionForm({
        ...questionForm,
        title: "🏆 ELITE EIGHT",
        description: "Predict the EIGHT teams that will qualify for the Quarter Finals.\n\nThink carefully — every correct prediction brings you closer to the Jackpot!",
        question_type: "multiple_choice",
        num_selections: 8,
        max_points: 15,
        lock_time: earliestKickoff ? earliestKickoff.toISOString().slice(0, 16) : "",
        options_json: JSON.stringify({ choices: teamArray, scoring: scoringRules }, null, 2)
      });
      
      notify("Elite Eight configuration generated! Review and click Create.");
    } catch (err) {
      notify("Failed to generate Elite Eight: " + err.message, "error");
    }
  };

  const handleGenerateSemiFinals = async () => {
    try {
      const matches = await api.getMatchesForTournament(selectedTournament);
      const sfMatches = matches.filter(m => m.stage === "SF");
      
      if (sfMatches.length === 0) {
        notify("No Semi Final matches found in this tournament.", "error");
        return;
      }
      
      const teams = new Set();
      let earliestKickoff = null;
      
      sfMatches.forEach(m => {
        if (m.team1) teams.add(m.team1);
        if (m.team2) teams.add(m.team2);
        
        const kickoff = new Date(m.kickoff_time);
        if (!earliestKickoff || kickoff < earliestKickoff) {
          earliestKickoff = kickoff;
        }
      });
      
      if (earliestKickoff) {
        earliestKickoff.setMinutes(earliestKickoff.getMinutes() - 1);
      }
      
      const teamArray = Array.from(teams).sort();
      
      const scoringRules = {
        "2": 15,
        "1": 5,
        "0": 0
      };
      
      setQuestionForm({
        ...questionForm,
        title: "🏆 THE FINALISTS",
        description: "Predict the TWO teams that will reach the FIFA World Cup Final.",
        question_type: "multiple_choice",
        num_selections: 2,
        max_points: 15,
        lock_time: earliestKickoff ? earliestKickoff.toISOString().slice(0, 16) : "",
        options_json: JSON.stringify({ choices: teamArray, scoring: scoringRules }, null, 2)
      });
      
      notify("Semi Final Jackpot configuration generated! Review and click Create.");
    } catch (err) {
      notify("Failed to generate Semi Final Jackpot: " + err.message, "error");
    }
  };

  const handleGenerateFinalFour = async () => {
    try {
      const matches = await api.getMatchesForTournament(selectedTournament);
      const qfMatches = matches.filter(m => m.stage === "QF");
      
      if (qfMatches.length === 0) {
        notify("No Quarter Final matches found in this tournament.", "error");
        return;
      }
      
      const teams = new Set();
      let earliestKickoff = null;
      
      qfMatches.forEach(m => {
        if (m.team1) teams.add(m.team1);
        if (m.team2) teams.add(m.team2);
        
        const kickoff = new Date(m.kickoff_time);
        if (!earliestKickoff || kickoff < earliestKickoff) {
          earliestKickoff = kickoff;
        }
      });
      
      if (earliestKickoff) {
        earliestKickoff.setMinutes(earliestKickoff.getMinutes() - 1);
      }
      
      const teamArray = Array.from(teams).sort();
      
      const scoringRules = {
        "4": 15,
        "3": 10,
        "2": 5,
        "1": 2,
        "0": 0
      };
      
      setQuestionForm({
        ...questionForm,
        title: "🔥 FINAL FOUR",
        description: "Predict the FOUR teams that will qualify for the Semi Finals.",
        question_type: "multiple_choice",
        num_selections: 4,
        max_points: 15,
        lock_time: earliestKickoff ? earliestKickoff.toISOString().slice(0, 16) : "",
        options_json: JSON.stringify({ choices: teamArray, scoring: scoringRules }, null, 2)
      });
      
      notify("Final Four configuration generated! Review and click Create.");
    } catch (err) {
      notify("Failed to generate Final Four: " + err.message, "error");
    }
  };

  const handleGenerateChampion = async () => {
    try {
      const matches = await api.getMatchesForTournament(selectedTournament);
      const qfMatches = matches.filter(m => m.stage === "QF");
      
      if (qfMatches.length === 0) {
        notify("No Quarter Final matches found in this tournament.", "error");
        return;
      }
      
      const teams = new Set();
      let earliestKickoff = null;
      
      qfMatches.forEach(m => {
        if (m.team1) teams.add(m.team1);
        if (m.team2) teams.add(m.team2);
        
        const kickoff = new Date(m.kickoff_time);
        if (!earliestKickoff || kickoff < earliestKickoff) {
          earliestKickoff = kickoff;
        }
      });
      
      if (earliestKickoff) {
        earliestKickoff.setMinutes(earliestKickoff.getMinutes() - 1);
      }
      
      const teamArray = Array.from(teams).sort();
      
      const scoringRules = {
        "1": 15,
        "0": 0
      };
      
      setQuestionForm({
        ...questionForm,
        title: "🏆 WORLD CHAMPION",
        description: "Predict the ONE team that will win the FIFA World Cup Final.",
        question_type: "multiple_choice",
        num_selections: 1,
        max_points: 15,
        lock_time: earliestKickoff ? earliestKickoff.toISOString().slice(0, 16) : "",
        options_json: JSON.stringify({ choices: teamArray, scoring: scoringRules }, null, 2)
      });
      
      notify("World Champion configuration generated! Review and click Create.");
    } catch (err) {
      notify("Failed to generate World Champion: " + err.message, "error");
    }
  };


  return (
    <div className="animate-in">
      <div style={{ marginBottom: "2rem" }}>
        <h2 className="section-title">🏆 Jackpot Management</h2>
        <p className="text-muted" style={{ marginBottom: "1rem" }}>
          Create and manage tournament-wide side challenges.
        </p>

        <label className="form-label" style={{ maxWidth: "300px" }}>
          Tournament
          <select 
            className="input" 
            value={selectedTournament || ""} 
            onChange={(e) => {
              const val = Number(e.target.value) || null;
              setSelectedTournament(val);
              setQuestionForm(emptyQuestionForm(val));
            }}
          >
            <option value="">Select...</option>
            {activeTournaments.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
      </div>

      {selectedTournament && (
        <>
          <form className="card form" onSubmit={handleCreateQuestion}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                <Plus size={16} /> Create Jackpot Question
              </h3>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button type="button" className="btn btn--outline" onClick={handleGenerateEliteEight} style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>
                  Generate R16 Elite Eight
                </button>
                <button type="button" className="btn btn--outline" onClick={handleGenerateFinalFour} style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>
                  Generate QF Final Four
                </button>
                <button type="button" className="btn btn--outline" onClick={handleGenerateChampion} style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>
                  Generate Champion (from QF)
                </button>
                <button type="button" className="btn btn--outline" onClick={handleGenerateSemiFinals} style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}>
                  Generate Semi Final Jackpot
                </button>
              </div>
            </div>
            <div className="form-row">
              <label className="form-label" style={{ flex: 2 }}>
                Title
                <input className="input" value={questionForm.title} onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })} required />
              </label>
              <label className="form-label">
                Type
                <select className="input" value={questionForm.question_type} onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}>
                  <option value="multiple_choice">Multi-Select List</option>
                  <option value="categorical">Categorical (Awards)</option>
                </select>
              </label>
            </div>
            
            <label className="form-label">
              Description (Optional)
              <textarea className="input" rows={2} value={questionForm.description} onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })} />
            </label>

            <div className="form-row">
              <label className="form-label">
                Exact Selections Required
                <input type="number" className="input" min={1} value={questionForm.num_selections} onChange={(e) => setQuestionForm({ ...questionForm, num_selections: e.target.value })} required />
              </label>
              <label className="form-label">
                Max Points Possible
                <input type="number" className="input" min={0} value={questionForm.max_points} onChange={(e) => setQuestionForm({ ...questionForm, max_points: e.target.value })} required />
              </label>
              <label className="form-label">
                Lock Time (Local)
                <input type="datetime-local" className="input" value={questionForm.lock_time} onChange={(e) => setQuestionForm({ ...questionForm, lock_time: e.target.value })} required />
              </label>
            </div>

            <label className="form-label">
              Options & Scoring Logic (JSON)
              <textarea 
                className="input" 
                rows={8} 
                placeholder='{"choices": ["A", "B"], "scoring": {"2": 15, "1": 5, "0": 0}}'
                value={questionForm.options_json} 
                onChange={(e) => setQuestionForm({ ...questionForm, options_json: e.target.value })} 
                required 
              />
            </label>

            <button type="submit" className="btn btn--primary"><Plus size={16} /> Create</button>
          </form>

          {loading && <p className="loading-inline">Loading questions...</p>}
          {!loading && questions?.length === 0 && <p className="empty-state">No jackpot questions yet.</p>}
          
          {questions?.map((q) => (
            <div key={q.id} className="card" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-gold)" }}>{q.title}</h3>
                  <p className="text-muted" style={{ margin: 0 }}>
                    {q.question_type} | Select: {q.num_selections} | Points: {q.max_points}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", fontSize: "0.9rem" }}>
                    <input 
                      type="checkbox" 
                      checked={q.is_locked} 
                      onChange={(e) => handleUpdateQuestion(q, { locked: e.target.checked })} 
                    />
                    Locked
                  </label>
                  <button type="button" className="btn btn--danger btn--small" onClick={() => handleDeleteQuestion(q.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              <div style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-sm)", marginBottom: "1rem" }}>
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>Jackpot Results & Scoring Trigger</h4>
                <p className="text-muted" style={{ fontSize: "0.85rem", margin: "0 0 1rem 0" }}>
                  Current Answer: {q.correct_answers_json ? JSON.stringify(q.correct_answers_json) : "Not Set"}
                </p>
                
                <form className="form-row" onSubmit={(e) => handleSetResult(e, q.id, q.question_type)} style={{ alignItems: "flex-end" }}>
                  <label className="form-label" style={{ flex: 1, margin: 0 }}>
                    Enter Correct Answers (Valid JSON array/object)
                    <input
                      className="input"
                      placeholder={q.question_type === "categorical" ? '{"Golden Boot": "Mbappe"}' : '["Argentina", "France"]'}
                      value={resultAnswers[q.id] ?? ""}
                      onChange={(e) => setResultAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    />
                  </label>
                  <button type="submit" className="btn btn--primary" style={{ whiteSpace: "nowrap" }}>
                    <CheckSquare size={16} /> Calculate Scores
                  </button>
                </form>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
