from datetime import date

from app.repositories.tournament_repository import TournamentRepository


class TournamentService:
  def __init__(self, repository=None):
    self.repository = repository or TournamentRepository()

  def list_tournaments(self, include_archived=False):
    return [t.to_dict() for t in self.repository.get_all(include_archived)]

  def get_tournament(self, tournament_id):
    tournament = self.repository.get_by_id(tournament_id)
    if not tournament:
      return None
    return tournament.to_dict()

  def create_tournament(self, data):
    name = (data.get("name") or "").strip()
    if not name:
      return None, "Name is required"

    start_date = self._parse_date(data.get("start_date"))
    end_date = self._parse_date(data.get("end_date"))
    if not start_date or not end_date:
      return None, "Start and end dates are required"
    if end_date < start_date:
      return None, "End date must be on or after start date"

    status = data.get("status", "upcoming")
    if status not in ("upcoming", "active", "completed", "archived"):
      return None, "Invalid status"

    tournament = self.repository.create({
      "name": name,
      "start_date": start_date,
      "end_date": end_date,
      "status": status,
    })
    return tournament.to_dict(), None

  def update_tournament(self, tournament_id, data):
    tournament = self.repository.get_by_id(tournament_id)
    if not tournament:
      return None, "Tournament not found"

    updates = {}
    if "name" in data and data["name"]:
      updates["name"] = data["name"].strip()

    if "start_date" in data:
      start_date = self._parse_date(data["start_date"])
      if not start_date:
        return None, "Invalid start date"
      updates["start_date"] = start_date

    if "end_date" in data:
      end_date = self._parse_date(data["end_date"])
      if not end_date:
        return None, "Invalid end date"
      updates["end_date"] = end_date

    if "status" in data:
      if data["status"] not in ("upcoming", "active", "completed", "archived"):
        return None, "Invalid status"
      updates["status"] = data["status"]

    final_start = updates.get("start_date", tournament.start_date)
    final_end = updates.get("end_date", tournament.end_date)
    if final_end < final_start:
      return None, "End date must be on or after start date"

    tournament = self.repository.update(tournament, updates)
    return tournament.to_dict(), None

  def archive_tournament(self, tournament_id):
    return self.update_tournament(tournament_id, {"status": "archived"})

  @staticmethod
  def _parse_date(value):
    if not value:
      return None
    if isinstance(value, date):
      return value
    try:
      return date.fromisoformat(str(value))
    except ValueError:
      return None
