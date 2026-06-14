import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useFetch } from "../hooks/useFetch";
import Alert from "../components/Alert";
import {
  BarChart3, Trophy, Users, Swords, HelpCircle, CheckSquare,
  Plus, Trash2, Save, Archive, RefreshCw, UserPlus, UserCheck, UserX, Key,
} from "lucide-react";

const QUESTION_TYPES = ["winner", "exact_score", "multiple_choice", "yes_no", "number"];

function toDatetimeLocal(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseKickoff(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function MatchEditor({ match, onSave, onDelete }) {
  const [form, setForm] = useState({
    team1: match.team1,
    team2: match.team2,
    kickoff_time: toDatetimeLocal(match.kickoff_time),
    status: match.status,
    score1: match.score1 ?? "",
    score2: match.score2 ?? "",
  });

  useEffect(() => {
    setForm({
      team1: match.team1,
      team2: match.team2,
      kickoff_time: toDatetimeLocal(match.kickoff_time),
      status: match.status,
      score1: match.score1 ?? "",
      score2: match.score2 ?? "",
    });
  }, [match.id, match.updated_at]);

  return (
    <div className="card form">
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Swords size={16} style={{ color: "var(--color-gold)" }} />
        {match.team1} vs {match.team2}
      </h3>
      <div className="form-row">
        <label className="form-label">
          Team 1
          <input className="input" value={form.team1} onChange={(e) => setForm({ ...form, team1: e.target.value })} />
        </label>
        <label className="form-label">
          Team 2
          <input className="input" value={form.team2} onChange={(e) => setForm({ ...form, team2: e.target.value })} />
        </label>
      </div>
      <label className="form-label">
        Kickoff
        <input type="datetime-local" className="input" value={form.kickoff_time} onChange={(e) => setForm({ ...form, kickoff_time: e.target.value })} />
      </label>
      <label className="form-label">
        Status
        <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="scheduled">scheduled</option>
          <option value="live">live</option>
          <option value="finished">finished</option>
        </select>
      </label>
      <div className="form-row">
        <label className="form-label">
          Score 1
          <input className="input" placeholder="Score 1" value={form.score1} onChange={(e) => setForm({ ...form, score1: e.target.value })} />
        </label>
        <label className="form-label">
          Score 2
          <input className="input" placeholder="Score 2" value={form.score2} onChange={(e) => setForm({ ...form, score2: e.target.value })} />
        </label>
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn--primary" onClick={() => onSave({ id: match.id, ...form })}>
          <Save size={16} /> Save
        </button>
        <button type="button" className="btn btn--danger" onClick={() => onDelete(match.id)}>
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}

function emptyTournamentForm() {
  return { name: "", start_date: "", end_date: "", status: "upcoming" };
}

function emptyUserForm() {
  return { display_name: "", pin: "", active: true, is_admin: false };
}

function emptyMatchForm(tournamentId) {
  return {
    tournament_id: tournamentId || "",
    team1: "",
    team2: "",
    kickoff_time: "",
    status: "scheduled",
    score1: "",
    score2: "",
  };
}

function emptyQuestionForm(matchId) {
  return {
    match_id: matchId || "",
    question_text: "",
    question_type: "winner",
    point_value: 1,
    choices: "",
  };
}

export default function AdminDashboardPage() {
  const { data: overview, loading, error, refetch } = useFetch(() => api.getAdminOverview(), []);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [activeSection, setActiveSection] = useState("overview");

  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [tournamentForm, setTournamentForm] = useState(emptyTournamentForm());
  const [userForm, setUserForm] = useState(emptyUserForm());
  const [matchForm, setMatchForm] = useState(emptyMatchForm());
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm());
  const [resultAnswers, setResultAnswers] = useState({});

  const { data: matches, loading: loadingMatches, refetch: refetchMatches } = useFetch(
    () => (selectedTournament ? api.getMatchesForTournament(selectedTournament) : Promise.resolve([])),
    [selectedTournament],
  );

  const { data: questions, loading: loadingQuestions, refetch: refetchQuestions } = useFetch(
    () => (selectedMatch ? api.getQuestionsForMatch(selectedMatch, true) : Promise.resolve([])),
    [selectedMatch],
  );

  const activeTournaments = overview?.tournaments?.filter((t) => t.status !== "archived") || [];

  const handleTournamentChange = (tournamentId) => {
    setSelectedTournament(tournamentId || null);
    setSelectedMatch(null);
    setMatchForm(emptyMatchForm(tournamentId));
    setQuestionForm(emptyQuestionForm());
    setResultAnswers({});
  };

  const notify = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    try {
      await api.createTournament(tournamentForm);
      setTournamentForm(emptyTournamentForm());
      notify("Tournament created");
      refetch();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleArchiveTournament = async (id) => {
    try {
      await api.archiveTournament(id);
      notify("Tournament archived");
      refetch();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(userForm);
      setUserForm(emptyUserForm());
      notify("User created");
      refetch();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    const kickoff = parseKickoff(matchForm.kickoff_time);
    if (!kickoff) {
      notify("Valid kickoff time is required", "error");
      return;
    }
    try {
      const payload = {
        ...matchForm,
        tournament_id: Number(matchForm.tournament_id),
        kickoff_time: kickoff,
        score1: matchForm.score1 === "" ? null : Number(matchForm.score1),
        score2: matchForm.score2 === "" ? null : Number(matchForm.score2),
      };
      await api.createMatch(payload);
      setMatchForm(emptyMatchForm(selectedTournament));
      notify("Match created");
      refetchMatches();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleUpdateMatch = async (match) => {
    const kickoff = parseKickoff(match.kickoff_time);
    if (!kickoff) {
      notify("Valid kickoff time is required", "error");
      return;
    }
    try {
      await api.updateMatch(match.id, {
        team1: match.team1,
        team2: match.team2,
        kickoff_time: kickoff,
        status: match.status,
        score1: match.score1 === "" || match.score1 == null ? null : Number(match.score1),
        score2: match.score2 === "" || match.score2 == null ? null : Number(match.score2),
      });
      notify("Match updated");
      refetchMatches();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleDeleteMatch = async (id) => {
    if (!confirm("Delete this match and all its questions?")) return;
    try {
      await api.deleteMatch(id);
      notify("Match deleted");
      refetchMatches();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    const choices = questionForm.choices.split(",").map((c) => c.trim()).filter(Boolean);
    if (["winner", "multiple_choice"].includes(questionForm.question_type) && choices.length === 0) {
      notify("At least one choice is required for this question type", "error");
      return;
    }
    try {
      const payload = {
        match_id: Number(questionForm.match_id),
        question_text: questionForm.question_text,
        question_type: questionForm.question_type,
        point_value: 1,
      };
      if (["winner", "multiple_choice"].includes(questionForm.question_type)) {
        payload.options_json = { choices };
      }
      await api.createQuestion(payload);
      setQuestionForm(emptyQuestionForm(selectedMatch));
      notify("Question created");
      refetchQuestions();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm("Delete this question?")) return;
    try {
      await api.deleteQuestion(id);
      notify("Question deleted");
      refetchQuestions();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleSetResult = async (e, questionId) => {
    e.preventDefault();
    const answer = resultAnswers[questionId];
    if (!answer?.trim()) {
      notify("Correct answer is required", "error");
      return;
    }
    try {
      await api.setQuestionResult(questionId, answer);
      setResultAnswers((prev) => ({ ...prev, [questionId]: "" }));
      notify("Result saved and scores recalculated");
      refetchQuestions();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleRecalculate = async () => {
    try {
      const result = await api.recalculateScores(selectedTournament);
      notify(`Recalculated ${result.updated} prediction(s)`);
    } catch (err) {
      notify(err.message, "error");
    }
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  const sections = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "tournaments", label: "Tournaments", icon: Trophy },
    { id: "users", label: "Users", icon: Users },
    { id: "matches", label: "Matches", icon: Swords },
    { id: "questions", label: "Questions", icon: HelpCircle },
    { id: "results", label: "Results", icon: CheckSquare },
  ];

  return (
    <div className="bg-page-wrapper">
      <div className="bg-image bg-tunnel"></div>
      <div className="bg-overlay"></div>
      <div className="content-relative admin-dashboard">
      <header className="page-header">
        <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BarChart3 size={24} style={{ color: "var(--color-gold)" }} />
          Admin Dashboard
        </h1>
      </header>

      <Alert type={messageType} message={message} onClose={() => setMessage(null)} />

      <nav className="admin-tabs">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              className={`admin-tab ${activeSection === s.id ? "admin-tab--active" : ""}`}
              onClick={() => setActiveSection(s.id)}
              style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
            >
              <Icon size={16} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </nav>

      {/* OVERVIEW */}
      {activeSection === "overview" && (
        <div className="animate-in">
          <div className="stats-grid">
            <div className="card stat-card">
              <div className="stat-label">Users</div>
              <p className="stat-value">{overview.user_count}</p>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Matches</div>
              <p className="stat-value">{overview.match_count}</p>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Questions</div>
              <p className="stat-value">{overview.question_count}</p>
            </div>
            <div className="card stat-card">
              <div className="stat-label">Predictions</div>
              <p className="stat-value">{overview.prediction_count}</p>
            </div>
          </div>
          <h2 className="section-title">
            <Trophy size={18} /> Tournaments
          </h2>
          {overview.tournaments?.map((t) => (
            <div key={t.id} className="card">
              <h3>{t.name}</h3>
              <span className={`badge ${t.status === "active" ? "badge--active" : ""}`}>{t.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* TOURNAMENTS */}
      {activeSection === "tournaments" && (
        <div className="animate-in">
          <form className="card form" onSubmit={handleCreateTournament}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Plus size={16} /> Create Tournament
            </h3>
            <label className="form-label">Name<input className="input" value={tournamentForm.name} onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })} required /></label>
            <div className="form-row">
              <label className="form-label">Start<input type="date" className="input" value={tournamentForm.start_date} onChange={(e) => setTournamentForm({ ...tournamentForm, start_date: e.target.value })} required /></label>
              <label className="form-label">End<input type="date" className="input" value={tournamentForm.end_date} onChange={(e) => setTournamentForm({ ...tournamentForm, end_date: e.target.value })} required /></label>
            </div>
            <label className="form-label">Status
              <select className="input" value={tournamentForm.status} onChange={(e) => setTournamentForm({ ...tournamentForm, status: e.target.value })}>
                <option value="upcoming">upcoming</option>
                <option value="active">active</option>
                <option value="completed">completed</option>
              </select>
            </label>
            <button type="submit" className="btn btn--primary"><Plus size={16} /> Create</button>
          </form>
          {overview.tournaments?.map((t) => (
            <div key={t.id} className="card admin-list-item">
              <div>
                <strong>{t.name}</strong>{" "}
                <span className={`badge ${t.status === "active" ? "badge--active" : ""}`}>{t.status}</span>
              </div>
              {t.status !== "archived" && (
                <button type="button" className="btn btn--small" onClick={() => handleArchiveTournament(t.id)}>
                  <Archive size={14} /> Archive
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* USERS */}
      {activeSection === "users" && (
        <div className="animate-in">
          <form className="card form" onSubmit={handleCreateUser}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <UserPlus size={16} /> Create User
            </h3>
            <label className="form-label">
              Display Name
              <input className="input" value={userForm.display_name} onChange={(e) => setUserForm({ ...userForm, display_name: e.target.value })} required />
            </label>
            <label className="form-label">
              PIN
              <input type="password" className="input" value={userForm.pin} onChange={(e) => setUserForm({ ...userForm, pin: e.target.value })} required />
            </label>
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={userForm.is_admin} onChange={(e) => setUserForm({ ...userForm, is_admin: e.target.checked })} />
              Admin
            </label>
            <button type="submit" className="btn btn--primary"><UserPlus size={16} /> Create</button>
          </form>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Admin</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {overview.users?.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.display_name}</td>
                    <td>{u.is_admin ? <span className="badge badge--gold">Admin</span> : "No"}</td>
                    <td>
                      {u.active ? (
                        <span className="badge badge--active">Active</span>
                      ) : (
                        <span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "var(--color-error)" }}>Inactive</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--small btn--primary"
                        style={{ marginRight: '0.5rem' }}
                        onClick={async () => {
                          const newPin = window.prompt(`Enter new temporary PIN for ${u.display_name}:`);
                          if (!newPin) return;
                          if (newPin.length < 4) {
                            alert("PIN must be at least 4 digits");
                            return;
                          }
                          try {
                            await api.updateUser(u.id, { pin: newPin });
                            notify(`PIN reset for ${u.display_name}`);
                          } catch (err) {
                            notify(err.message, "error");
                          }
                        }}
                      >
                        <Key size={14} /> Reset PIN
                      </button>
                      <button
                        type="button"
                        className={`btn btn--small ${u.active ? "btn--danger" : "btn--primary"}`}
                        onClick={async () => {
                          const action = u.active ? "disable" : "enable";
                          const confirmed = window.confirm(
                            `Are you sure you want to ${action} ${u.display_name}?`
                          );
                          if (!confirmed) return;
                          try {
                            await api.updateUser(u.id, { active: !u.active });
                            notify(
                              u.active
                                ? `${u.display_name} disabled`
                                : `${u.display_name} enabled`
                            );
                            refetch();
                          } catch (err) {
                            notify(err.message, "error");
                          }
                        }}
                      >
                        {u.active ? <><UserX size={14} /> Disable</> : <><UserCheck size={14} /> Enable</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MATCHES */}
      {activeSection === "matches" && (
        <div className="animate-in">
          <label className="form-label">Tournament
            <select className="input" value={selectedTournament || ""} onChange={(e) => handleTournamentChange(Number(e.target.value) || null)}>
              <option value="">Select...</option>
              {activeTournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          {selectedTournament && (
            <>
              <form className="card form" onSubmit={handleCreateMatch}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Plus size={16} /> Create Match
                </h3>
                <div className="form-row">
                  <label className="form-label">Team 1<input className="input" value={matchForm.team1} onChange={(e) => setMatchForm({ ...matchForm, team1: e.target.value })} required /></label>
                  <label className="form-label">Team 2<input className="input" value={matchForm.team2} onChange={(e) => setMatchForm({ ...matchForm, team2: e.target.value })} required /></label>
                </div>
                <label className="form-label">Kickoff (local time)<input type="datetime-local" className="input" value={matchForm.kickoff_time} onChange={(e) => setMatchForm({ ...matchForm, kickoff_time: e.target.value })} required /></label>
                <button type="submit" className="btn btn--primary"><Plus size={16} /> Create</button>
              </form>
              {loadingMatches && <p className="loading-inline">Loading matches...</p>}
              {!loadingMatches && matches?.length === 0 && <p className="empty-state">No matches yet.</p>}
              {matches?.map((m) => (
                <MatchEditor
                  key={`${m.id}-${m.updated_at}`}
                  match={m}
                  onSave={handleUpdateMatch}
                  onDelete={handleDeleteMatch}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* QUESTIONS */}
      {activeSection === "questions" && (
        <div className="animate-in">
          <label className="form-label">Tournament
            <select className="input" value={selectedTournament || ""} onChange={(e) => handleTournamentChange(Number(e.target.value) || null)}>
              <option value="">Select...</option>
              {activeTournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          {selectedTournament && (
            <label className="form-label">Match
              <select className="input" value={selectedMatch || ""} onChange={(e) => { setSelectedMatch(Number(e.target.value)); setQuestionForm(emptyQuestionForm(Number(e.target.value))); }}>
                <option value="">Select...</option>
                {matches?.map((m) => <option key={m.id} value={m.id}>{m.team1} vs {m.team2}</option>)}
              </select>
            </label>
          )}
          {selectedMatch && (
            <>
              <form className="card form" onSubmit={handleCreateQuestion}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Plus size={16} /> Create Question
                </h3>
                <label className="form-label">Text<input className="input" value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} required /></label>
                <label className="form-label">Type
                  <select className="input" value={questionForm.question_type} onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}>
                    {QUESTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                {["winner", "multiple_choice"].includes(questionForm.question_type) && (
                  <label className="form-label">Choices (comma-separated)<input className="input" value={questionForm.choices} onChange={(e) => setQuestionForm({ ...questionForm, choices: e.target.value })} /></label>
                )}
                <button type="submit" className="btn btn--primary"><Plus size={16} /> Create</button>
              </form>
              {loadingQuestions && <p className="loading-inline">Loading questions...</p>}
              {!loadingQuestions && questions?.length === 0 && <p className="empty-state">No questions yet.</p>}
              {questions?.map((q) => (
                <div key={q.id} className="card admin-list-item">
                  <div>
                    <strong>{q.question_text}</strong>{" "}
                    <span className="text-muted">({q.question_type}, {q.point_value}pts)</span>
                    {q.locked && <span className="badge badge--warning" style={{ marginLeft: "0.5rem" }}>Locked</span>}
                  </div>
                  {!q.locked && (
                    <button type="button" className="btn btn--danger btn--small" onClick={() => handleDeleteQuestion(q.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* RESULTS */}
      {activeSection === "results" && (
        <div className="animate-in">
          <label className="form-label">Tournament
            <select className="input" value={selectedTournament || ""} onChange={(e) => handleTournamentChange(Number(e.target.value) || null)}>
              <option value="">Select...</option>
              {activeTournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          {selectedTournament && (
            <label className="form-label">Match
              <select className="input" value={selectedMatch || ""} onChange={(e) => setSelectedMatch(Number(e.target.value) || null)}>
                <option value="">Select...</option>
                {matches?.map((m) => <option key={m.id} value={m.id}>{m.team1} vs {m.team2}</option>)}
              </select>
            </label>
          )}
          {loadingQuestions && selectedMatch && <p className="loading-inline">Loading questions...</p>}
          {selectedMatch && questions?.map((q) => (
            <div key={q.id} className="card">
              <h3>{q.question_text}</h3>
              <p className="card__meta">
                Current result:{" "}
                {q.correct_answer ? (
                  <strong style={{ color: "var(--color-success)" }}>{q.correct_answer}</strong>
                ) : (
                  <span className="text-muted">Not set</span>
                )}
              </p>
              <form className="form" onSubmit={(e) => handleSetResult(e, q.id)}>
                <input
                  className="input"
                  placeholder="Correct answer"
                  value={resultAnswers[q.id] ?? ""}
                  onChange={(e) => setResultAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                />
                <button type="submit" className="btn btn--primary">
                  <CheckSquare size={16} /> Save Result
                </button>
              </form>
            </div>
          ))}
          {selectedTournament && (
            <button type="button" className="btn btn--primary" onClick={handleRecalculate} style={{ marginTop: "1rem" }}>
              <RefreshCw size={16} /> Recalculate Scores
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
