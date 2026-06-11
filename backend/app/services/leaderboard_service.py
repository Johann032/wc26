from app.repositories.leaderboard_repository import LeaderboardRepository
from app.repositories.tournament_repository import TournamentRepository


class LeaderboardService:
  def __init__(self, repository=None):
    self.repository = repository or LeaderboardRepository()

  def get_leaderboard(self, tournament_id):
    if not tournament_id:
      return None, "Tournament ID is required"

    tournament = TournamentRepository.get_by_id(tournament_id)
    if not tournament:
      return None, "Tournament not found"

    return self.repository.get_leaderboard(tournament_id), None
