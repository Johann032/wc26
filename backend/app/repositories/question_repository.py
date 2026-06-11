from app.extensions import db
from app.models.match import Match
from app.models.prediction_question import PredictionQuestion


class QuestionRepository:
  @staticmethod
  def get_by_match(match_id):
    return PredictionQuestion.query.filter_by(match_id=match_id).all()

  @staticmethod
  def get_by_id(question_id):
    return db.session.get(PredictionQuestion, question_id)

  @staticmethod
  def create(data):
    question = PredictionQuestion(**data)
    db.session.add(question)
    db.session.commit()
    return question

  @staticmethod
  def update(question, data):
    for key, value in data.items():
      setattr(question, key, value)
    db.session.commit()
    return question

  @staticmethod
  def delete(question):
    db.session.delete(question)
    db.session.commit()

  @staticmethod
  def count_for_tournament(tournament_id):
    return (
      PredictionQuestion.query
      .join(Match, PredictionQuestion.match_id == Match.id)
      .filter(Match.tournament_id == tournament_id)
      .count()
    )

  @staticmethod
  def count():
    return PredictionQuestion.query.count()
