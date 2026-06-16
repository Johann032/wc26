from app.repositories.match_repository import MatchRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.tournament_repository import TournamentRepository
from app.repositories.user_repository import UserRepository
from app.repositories.question_repository import QuestionRepository
from app.extensions import db
from app.models.user import User
from app.models.prediction import Prediction
from app.models.prediction_question import PredictionQuestion
from app.models.match import Match
from sqlalchemy import func


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

  def get_match_participation(self, match_id):
    total_active_users = User.query.filter_by(active=True).count()
    
    submitted_users = db.session.query(User).join(
        Prediction, Prediction.user_id == User.id
    ).join(
        PredictionQuestion, PredictionQuestion.id == Prediction.question_id
    ).filter(
        PredictionQuestion.match_id == match_id,
        User.active == True
    ).distinct().all()
    
    submitted_user_ids = [u.id for u in submitted_users]
    
    pending_users = User.query.filter(
        User.active == True,
        ~User.id.in_(submitted_user_ids) if submitted_user_ids else True
    ).all()
    
    return {
        "total_active_users": total_active_users,
        "submitted_count": len(submitted_users),
        "pending_count": len(pending_users),
        "submitted_users": [{"id": u.id, "display_name": u.display_name} for u in submitted_users],
        "pending_users": [{"id": u.id, "display_name": u.display_name} for u in pending_users],
    }

  def get_tournament_participation_summary(self, tournament_id):
    matches = Match.query.filter_by(tournament_id=tournament_id).all()
    if not matches:
        return []

    total_active_users = User.query.filter_by(active=True).count()

    submitted_counts = db.session.query(
        PredictionQuestion.match_id,
        func.count(func.distinct(Prediction.user_id)).label('submitted_count')
    ).join(
        Prediction, Prediction.question_id == PredictionQuestion.id
    ).join(
        User, User.id == Prediction.user_id
    ).filter(
        PredictionQuestion.match_id.in_([m.id for m in matches]),
        User.active == True
    ).group_by(PredictionQuestion.match_id).all()

    counts_map = {row.match_id: row.submitted_count for row in submitted_counts}

    results = []
    for m in matches:
        sub_count = counts_map.get(m.id, 0)
        pending_count = total_active_users - sub_count
        pct = round((sub_count / total_active_users * 100) if total_active_users > 0 else 0)
        results.append({
            "match_id": m.id,
            "match_name": f"{m.team1} vs {m.team2}",
            "total_active_users": total_active_users,
            "submitted_count": sub_count,
            "pending_count": pending_count,
            "submission_percentage": pct
        })

    return results
