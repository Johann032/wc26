from datetime import datetime

from app.repositories.match_repository import MatchRepository
from app.repositories.tournament_repository import TournamentRepository
from app.services.locking_service import LockingService
from app.utils.time import ensure_utc


class MatchService:
  def __init__(self, repository=None, locking_service=None):
    self.repository = repository or MatchRepository()
    self.locking_service = locking_service or LockingService()

  def list_matches_for_tournament(self, tournament_id):
    tournament = TournamentRepository.get_by_id(tournament_id)
    if not tournament:
      return None, "Tournament not found"
    self.locking_service.sync_all_locks()
    return [m.to_dict() for m in self.repository.get_by_tournament(tournament_id)], None

  def get_match(self, match_id):
    match = self.repository.get_by_id(match_id)
    if not match:
      return None
    self.locking_service.sync_locks_for_match(match_id)
    return match.to_dict()

  def create_match(self, data):
    tournament = TournamentRepository.get_by_id(data.get("tournament_id"))
    if not tournament:
      return None, "Tournament not found"

    team1 = (data.get("team1") or "").strip()
    team2 = (data.get("team2") or "").strip()
    if not team1 or not team2:
      return None, "Both teams are required"
    if team1.lower() == team2.lower():
      return None, "Teams must be different"

    kickoff_time = self._parse_datetime(data.get("kickoff_time"))
    if not kickoff_time:
      return None, "Valid kickoff time is required"

    status = data.get("status", "scheduled")
    if status not in ("scheduled", "live", "finished"):
      return None, "Invalid status"

    score1, score1_err = self._parse_score(data.get("score1"))
    if score1_err:
      return None, score1_err
    score2, score2_err = self._parse_score(data.get("score2"))
    if score2_err:
      return None, score2_err

    match = self.repository.create({
      "tournament_id": tournament.id,
      "team1": team1,
      "team2": team2,
      "kickoff_time": kickoff_time,
      "status": status,
      "score1": score1,
      "score2": score2,
    })
    self.locking_service.sync_locks_for_match(match.id)
    return match.to_dict(), None

  def update_match(self, match_id, data):
    match = self.repository.get_by_id(match_id)
    if not match:
      return None, "Match not found"

    updates = {}
    if "team1" in data:
      team1 = data["team1"].strip()
      if not team1:
        return None, "Team 1 is required"
      updates["team1"] = team1
    if "team2" in data:
      team2 = data["team2"].strip()
      if not team2:
        return None, "Team 2 is required"
      updates["team2"] = team2

    new_team1 = updates.get("team1", match.team1)
    new_team2 = updates.get("team2", match.team2)
    if new_team1.lower() == new_team2.lower():
      return None, "Teams must be different"

    if "kickoff_time" in data:
      kickoff = self._parse_datetime(data["kickoff_time"])
      if not kickoff:
        return None, "Valid kickoff time is required"
      updates["kickoff_time"] = kickoff
    if "status" in data:
      if data["status"] not in ("scheduled", "live", "finished"):
        return None, "Invalid status"
      updates["status"] = data["status"]
    if "score1" in data:
      score1, err = self._parse_score(data["score1"])
      if err:
        return None, err
      updates["score1"] = score1
    if "score2" in data:
      score2, err = self._parse_score(data["score2"])
      if err:
        return None, err
      updates["score2"] = score2

    match = self.repository.update(match, updates)
    self.locking_service.sync_locks_for_match(match.id)
    return match.to_dict(), None

  def delete_match(self, match_id):
    match = self.repository.get_by_id(match_id)
    if not match:
      return False, "Match not found"
    self.repository.delete(match)
    return True, None

  @staticmethod
  def _parse_score(value):
    if value is None or value == "":
      return None, None
    try:
      score = int(value)
    except (TypeError, ValueError):
      return None, "Scores must be whole numbers"
    if score < 0:
      return None, "Scores cannot be negative"
    return score, None

  @staticmethod
  def _parse_datetime(value):
    if not value:
      return None
    if isinstance(value, datetime):
      return ensure_utc(value)
    try:
      dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
      return ensure_utc(dt)
    except ValueError:
      return None
