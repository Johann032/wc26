from app.extensions import db
from app.models.spotlight_question import SpotlightQuestion
from app.models.spotlight_prediction import SpotlightPrediction
from app.repositories.tournament_repository import TournamentRepository

class SpotlightScoringService:
  def calculate_points(self, question, answers_json):
    if not question.correct_answers_json:
      return 0
    
    if question.question_type == "categorical":
      if not answers_json or not isinstance(answers_json, dict) or not isinstance(question.correct_answers_json, dict):
        return 0
      
      correct_count = 0
      for cat, correct_val in question.correct_answers_json.items():
        user_val = answers_json.get(cat, "")
        if user_val.strip().lower() == correct_val.strip().lower():
          correct_count += 1
          
      if question.num_selections == 3:
        if correct_count == 3: return 15
        elif correct_count == 2: return 8
        elif correct_count == 1: return 3
        else: return 0
      return 0

    if not answers_json or not isinstance(answers_json, list) or not isinstance(question.correct_answers_json, list):
      return 0

    correct_set = set(ans.strip().lower() for ans in question.correct_answers_json)
    user_set = set(ans.strip().lower() for ans in answers_json)

    correct_count = len(correct_set.intersection(user_set))

    # Apply specific scoring rules
    if question.num_selections == 1:
      return 15 if correct_count == 1 else 0
    elif question.num_selections == 2:
      if correct_count == 2: return 15
      elif correct_count == 1: return 5
      else: return 0
    elif question.num_selections == 4:
      if correct_count == 4: return 15
      elif correct_count == 3: return 10
      elif correct_count == 2: return 5
      elif correct_count == 1: return 2
      else: return 0
      
    return 0

  def recalculate_for_tournament(self, tournament_id):
    tournament = TournamentRepository.get_by_id(tournament_id)
    if not tournament:
      return {"error": "Tournament not found"}

    questions = SpotlightQuestion.query.filter_by(tournament_id=tournament_id).all()
    updated = 0

    for question in questions:
      predictions = SpotlightPrediction.query.filter_by(question_id=question.id).all()
      for prediction in predictions:
        points = self.calculate_points(question, prediction.answers_json)
        if prediction.awarded_points != points:
          prediction.awarded_points = points
          updated += 1

    db.session.commit()
    return {"updated": updated, "tournament_id": tournament_id}
