from sqlalchemy.exc import IntegrityError

from app.models.mixins import utcnow
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.question_repository import QuestionRepository
from app.repositories.user_repository import UserRepository
from app.services.locking_service import LockingService
from app.services.scoring_service import ScoringService
from app.services.validation_service import ValidationError, ValidationService
from app.utils.db_errors import is_unique_violation, rollback


class PredictionService:
  def __init__(
    self,
    repository=None,
    question_repository=None,
    locking_service=None,
    scoring_service=None,
  ):
    self.repository = repository or PredictionRepository()
    self.question_repository = question_repository or QuestionRepository()
    self.locking_service = locking_service or LockingService()
    self.scoring_service = scoring_service or ScoringService()

  def list_predictions_for_user(self, user_id, tournament_id=None):
    if tournament_id:
      predictions = self.repository.get_by_user_and_tournament(user_id, tournament_id)
    else:
      predictions = self.repository.get_by_user(user_id)
    return [p.to_dict() for p in predictions]

  def list_predictions_for_question(self, question_id):
    return [p.to_dict() for p in self.repository.get_by_question(question_id)]

  def list_predictions_for_match(self, user_id, match_id):
    return [p.to_dict() for p in self.repository.get_by_user_and_match(user_id, match_id)]

  def submit_or_update(self, user_id, question_id, answer):
    user = UserRepository.get_by_id(user_id)
    if not user or not user.active:
      return None, None, "Authentication required"

    question = self.question_repository.get_by_id(question_id)
    if not question:
      return None, None, "Question not found"

    if self.locking_service.ensure_question_lock_state(question):
      return None, None, "Predictions are locked because this match has already started."

    try:
      normalized = ValidationService.validate_answer(question, answer)
    except ValidationError as exc:
      return None, None, exc.message

    existing = self.repository.get_by_user_and_question(user_id, question_id)
    if existing:
      return self._save_prediction(existing, question, normalized, created=False)

    try:
      prediction = self.repository.create({
        "user_id": user_id,
        "question_id": question_id,
        "answer": normalized,
        "submitted_at": utcnow(),
        "awarded_points": 0,
      })
    except IntegrityError as exc:
      rollback()
      if is_unique_violation(exc):
        existing = self.repository.get_by_user_and_question(user_id, question_id)
        if existing:
          return self._save_prediction(existing, question, normalized, created=False)
      raise

    if question.correct_answer:
      prediction.awarded_points = self.scoring_service.calculate_points(
        question, normalized
      )
      self.repository.update(prediction, {"awarded_points": prediction.awarded_points})

    return prediction.to_dict(), True, None

  def _save_prediction(self, prediction, question, normalized, created=False):
    updates = {
      "answer": normalized,
      "updated_at": utcnow(),
    }
    if question.correct_answer:
      updates["awarded_points"] = self.scoring_service.calculate_points(
        question, normalized
      )
    prediction = self.repository.update(prediction, updates)
    return prediction.to_dict(), False, None
