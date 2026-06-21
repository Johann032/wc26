const API_BASE = "/api";
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (response.status === 401 && onUnauthorized && !path.startsWith("/auth/login")) {
    onUnauthorized();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  login: (display_name, pin) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ display_name, pin }),
    }),
  logout: () => request("/auth/logout", { method: "POST" }),
  getMe: () => request("/auth/me"),
  changePin: (old_pin, new_pin) =>
    request("/auth/change-pin", {
      method: "POST",
      body: JSON.stringify({ old_pin, new_pin }),
    }),

  getTournaments: (includeArchived = false) =>
    request(`/tournaments?include_archived=${includeArchived}`),
  getTournament: (id) => request(`/tournaments/${id}`),
  createTournament: (data) =>
    request("/tournaments", { method: "POST", body: JSON.stringify(data) }),
  updateTournament: (id, data) =>
    request(`/tournaments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  archiveTournament: (id) =>
    request(`/tournaments/${id}/archive`, { method: "POST" }),

  getUsers: () => request("/users"),
  createUser: (data) =>
    request("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id, data) =>
    request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  getMatchesForTournament: (tournamentId) =>
    request(`/matches/tournament/${tournamentId}`),
  getMatch: (id) => request(`/matches/${id}`),
  getMatchBreakdown: (id) => request(`/matches/${id}/breakdown`),
  createMatch: (data) =>
    request("/matches", { method: "POST", body: JSON.stringify(data) }),
  updateMatch: (id, data) =>
    request(`/matches/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteMatch: (id) => request(`/matches/${id}`, { method: "DELETE" }),

  getQuestionsForMatch: (matchId, includeAnswer = false) =>
    request(`/questions/match/${matchId}?include_answer=${includeAnswer}`),
  createQuestion: (data) =>
    request("/questions", { method: "POST", body: JSON.stringify(data) }),
  updateQuestion: (id, data) =>
    request(`/questions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteQuestion: (id) => request(`/questions/${id}`, { method: "DELETE" }),
  setQuestionResult: (id, correct_answer) =>
    request(`/questions/${id}/result`, {
      method: "PUT",
      body: JSON.stringify({ correct_answer }),
    }),

  getMyPredictions: (tournamentId) => {
    const query = tournamentId ? `?tournament_id=${tournamentId}` : "";
    return request(`/predictions/me${query}`);
  },
  getMyPredictionsForMatch: (matchId) =>
    request(`/predictions/match/${matchId}`),
  submitPrediction: (question_id, answer) =>
    request("/predictions", {
      method: "POST",
      body: JSON.stringify({ question_id, answer }),
    }),

  getLeaderboard: (tournamentId) =>
    request(`/leaderboard?tournament_id=${tournamentId}`),

  getAdminOverview: () => request("/admin/overview"),
  getTournamentSummary: (id) => request(`/admin/tournaments/${id}/summary`),
  getTournamentParticipationSummary: (id) => request(`/admin/tournaments/${id}/participation-summary`),
  getMatchParticipation: (id) => request(`/admin/matches/${id}/participation`),
  recalculateScores: (tournamentId) =>
    request("/admin/recalculate", {
      method: "POST",
      body: JSON.stringify(tournamentId ? { tournament_id: tournamentId } : {}),
    }),
};

