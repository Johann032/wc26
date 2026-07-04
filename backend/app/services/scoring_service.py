import re

from app.extensions import db
from app.models.match import Match
from app.models.prediction import Prediction
from app.models.prediction_question import PredictionQuestion
from app.repositories.tournament_repository import TournamentRepository


class ScoringService:
  def calculate_points(self, question, answer):
    if not question.correct_answer:
      return 0

    correct = question.correct_answer.strip()
    user_answer = (answer or "").strip()
    
    if not user_answer:
      return 0

    stage = question.match.stage if question.match else "GROUP"
    if stage in ("R32", "R16", "QF", "SF", "THIRD_PLACE", "FINAL"):
      correct_points = 3
      wrong_points = -2
    else:
      correct_points = 3
      wrong_points = 0

    if question.question_type == "exact_score":
      user_norm = self._safe_normalize_score(user_answer)
      correct_norm = self._safe_normalize_score(correct)
      if user_norm is None or correct_norm is None:
        return wrong_points
      return correct_points if user_norm == correct_norm else wrong_points

    if question.question_type == "number":
      try:
        return correct_points if int(user_answer) == int(correct) else wrong_points
      except ValueError:
        return wrong_points

    if question.question_type == "yes_no":
      return correct_points if self._normalize_yes_no(user_answer) == self._normalize_yes_no(correct) else wrong_points

    return correct_points if user_answer.lower() == correct.lower() else wrong_points

  def recalculate_for_tournament(self, tournament_id):
    tournament = TournamentRepository.get_by_id(tournament_id)
    if not tournament:
      return {"error": "Tournament not found"}

    questions = (
      PredictionQuestion.query
      .join(Match, PredictionQuestion.match_id == Match.id)
      .filter(Match.tournament_id == tournament_id)
      .all()
    )

    updated = 0
    for question in questions:
      if not question.correct_answer:
        predictions = Prediction.query.filter_by(question_id=question.id).all()
        for prediction in predictions:
          if prediction.awarded_points != 0:
            prediction.awarded_points = 0
            updated += 1
        continue

      predictions = Prediction.query.filter_by(question_id=question.id).all()
      for prediction in predictions:
        points = self.calculate_points(question, prediction.answer)
        if prediction.awarded_points != points:
          prediction.awarded_points = points
          updated += 1

    db.session.commit()
    return {"updated": updated, "tournament_id": tournament_id}

  def recalculate_all(self):
    tournaments = TournamentRepository.get_all(include_archived=True)
    total = 0
    for tournament in tournaments:
      result = self.recalculate_for_tournament(tournament.id)
      total += result.get("updated", 0)
    return {"updated": total}

  @staticmethod
  def _safe_normalize_score(value):
    try:
      parts = re.split(r"[-:]", value.strip())
      if len(parts) < 2:
        return None
      return f"{int(parts[0].strip())}-{int(parts[1].strip())}"
    except (ValueError, IndexError):
      return None

  @staticmethod
  def _normalize_yes_no(value):
    v = value.strip().lower()
    if v in ("yes", "y"):
      return "yes"
    if v in ("no", "n"):
      return "no"
    return v.lower()
