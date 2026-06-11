from app.repositories.match_repository import MatchRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.question_repository import QuestionRepository
from app.repositories.tournament_repository import TournamentRepository
from app.repositories.user_repository import UserRepository


class AdminService:
  def get_overview(self):
    tournaments = TournamentRepository.get_all(include_archived=True)
    return {
      "user_count": UserRepository.count(),
      "match_count": MatchRepository.count(),
      "question_count": QuestionRepository.count(),
      "prediction_count": PredictionRepository.count(),
      "tournaments": [t.to_dict() for t in tournaments],
      "users": [u.to_dict(include_admin=True) for u in UserRepository.get_all()],
    }

  def get_tournament_summary(self, tournament_id):
    tournament = TournamentRepository.get_by_id(tournament_id)
    if not tournament:
      return None

    return {
      "tournament": tournament.to_dict(),
      "match_count": MatchRepository.count_for_tournament(tournament_id),
      "question_count": QuestionRepository.count_for_tournament(tournament_id),
      "prediction_count": PredictionRepository.count_for_tournament(tournament_id),
    }
