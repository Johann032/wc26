from app.extensions import db
from app.models.match import Match
from app.models.prediction import Prediction
from app.models.prediction_question import PredictionQuestion


class PredictionRepository:
  @staticmethod
  def get_by_user(user_id):
    return (
      Prediction.query.filter_by(user_id=user_id)
      .order_by(Prediction.submitted_at.desc())
      .all()
    )

  @staticmethod
  def get_by_question(question_id):
    return Prediction.query.filter_by(question_id=question_id).all()

  @staticmethod
  def get_by_user_and_question(user_id, question_id):
    return Prediction.query.filter_by(user_id=user_id, question_id=question_id).first()

  @staticmethod
  def get_by_user_and_match(user_id, match_id):
    return (
      Prediction.query
      .join(PredictionQuestion, Prediction.question_id == PredictionQuestion.id)
      .filter(Prediction.user_id == user_id, PredictionQuestion.match_id == match_id)
      .all()
    )

  @staticmethod
  def get_by_user_and_tournament(user_id, tournament_id):
    return (
      Prediction.query
      .join(PredictionQuestion, Prediction.question_id == PredictionQuestion.id)
      .join(Match, PredictionQuestion.match_id == Match.id)
      .filter(Prediction.user_id == user_id, Match.tournament_id == tournament_id)
      .all()
    )

  @staticmethod
  def get_by_id(prediction_id):
    return db.session.get(Prediction, prediction_id)

  @staticmethod
  def create(data):
    prediction = Prediction(**data)
    db.session.add(prediction)
    db.session.commit()
    return prediction

  @staticmethod
  def update(prediction, data):
    for key, value in data.items():
      setattr(prediction, key, value)
    db.session.commit()
    return prediction

  @staticmethod
  def count_for_tournament(tournament_id):
    return (
      Prediction.query
      .join(PredictionQuestion, Prediction.question_id == PredictionQuestion.id)
      .join(Match, PredictionQuestion.match_id == Match.id)
      .filter(Match.tournament_id == tournament_id)
      .count()
    )

  @staticmethod
  def count():
    return Prediction.query.count()
