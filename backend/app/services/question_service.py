from app.models.prediction_question import QUESTION_TYPES
from app.repositories.match_repository import MatchRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.question_repository import QuestionRepository
from app.services.locking_service import LockingService
from app.services.scoring_service import ScoringService
from app.services.validation_service import ValidationError, ValidationService


class QuestionService:
  def __init__(self, repository=None, locking_service=None, scoring_service=None):
    self.repository = repository or QuestionRepository()
    self.locking_service = locking_service or LockingService()
    self.scoring_service = scoring_service or ScoringService()

  def list_questions_for_match(self, match_id, include_answer=False):
    match = MatchRepository.get_by_id(match_id)
    if not match:
      return None, "Match not found"
    self.locking_service.sync_locks_for_match(match_id)
    return [
      q.to_dict(include_answer=include_answer)
      for q in self.repository.get_by_match(match_id)
    ], None

  def get_question(self, question_id, include_answer=False):
    question = self.repository.get_by_id(question_id)
    if not question:
      return None
    self.locking_service.ensure_question_lock_state(question)
    return question.to_dict(include_answer=include_answer)

  def create_question(self, data):
    match = MatchRepository.get_by_id(data.get("match_id"))
    if not match:
      return None, "Match not found"

    question_text = (data.get("question_text") or "").strip()
    question_type = data.get("question_type")
    if not question_text:
      return None, "Question text is required"
    if question_type not in QUESTION_TYPES:
      return None, f"Invalid question type. Must be one of: {', '.join(QUESTION_TYPES)}"

    try:
      point_value = int(data.get("point_value", 1))
    except (TypeError, ValueError):
      return None, "Point value must be an integer"
    if point_value < 1:
      return None, "Point value must be at least 1"

    options_json = data.get("options_json")
    choices_error = ValidationService.validate_choices_for_type(question_type, options_json)
    if choices_error:
      return None, choices_error

    question = self.repository.create({
      "match_id": match.id,
      "question_text": question_text,
      "question_type": question_type,
      "point_value": point_value,
      "options_json": options_json,
      "locked": False,
    })
    self.locking_service.ensure_question_lock_state(question)
    return question.to_dict(), None

  def update_question(self, question_id, data):
    question = self.repository.get_by_id(question_id)
    if not question:
      return None, "Question not found"

    if self.locking_service.ensure_question_lock_state(question):
      return None, "Cannot edit a locked question"

    updates = {}
    if "question_text" in data and data["question_text"]:
      updates["question_text"] = data["question_text"].strip()
    if "question_type" in data:
      if data["question_type"] not in QUESTION_TYPES:
        return None, "Invalid question type"
      if data["question_type"] != question.question_type:
        if PredictionRepository.get_by_question(question_id):
          return None, "Cannot change question type after predictions exist"
      updates["question_type"] = data["question_type"]
    if "point_value" in data:
      try:
        point_value = int(data["point_value"])
      except (TypeError, ValueError):
        return None, "Point value must be an integer"
      if point_value < 1:
        return None, "Point value must be at least 1"
      updates["point_value"] = point_value
    if "options_json" in data:
      updates["options_json"] = data["options_json"]

    qtype = updates.get("question_type", question.question_type)
    options = updates.get("options_json", question.options_json)
    choices_error = ValidationService.validate_choices_for_type(qtype, options)
    if choices_error:
      return None, choices_error

    question = self.repository.update(question, updates)

    if "point_value" in updates and question.correct_answer:
      match = MatchRepository.get_by_id(question.match_id)
      if match:
        self.scoring_service.recalculate_for_tournament(match.tournament_id)

    return question.to_dict(), None

  def delete_question(self, question_id):
    question = self.repository.get_by_id(question_id)
    if not question:
      return False, "Question not found"
    if self.locking_service.ensure_question_lock_state(question):
      return False, "Cannot delete a locked question"
    self.repository.delete(question)
    return True, None

  def set_correct_answer(self, question_id, answer):
    question = self.repository.get_by_id(question_id)
    if not question:
      return None, "Question not found"

    try:
      normalized = ValidationService.validate_correct_answer(question, answer)
    except ValidationError as exc:
      return None, exc.message

    question = self.repository.update(question, {"correct_answer": normalized})
    match = MatchRepository.get_by_id(question.match_id)
    if match:
      self.scoring_service.recalculate_for_tournament(match.tournament_id)
    return question.to_dict(include_answer=True), None
