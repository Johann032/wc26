from app.extensions import db
from app.models.match import Match


class MatchRepository:
  @staticmethod
  def get_all():
    return Match.query.order_by(Match.kickoff_time).all()

  @staticmethod
  def get_by_tournament(tournament_id):
    return (
      Match.query.filter_by(tournament_id=tournament_id)
      .order_by(Match.kickoff_time)
      .all()
    )

  @staticmethod
  def get_by_id(match_id):
    return db.session.get(Match, match_id)

  @staticmethod
  def create(data):
    match = Match(**data)
    db.session.add(match)
    db.session.commit()
    return match

  @staticmethod
  def update(match, data):
    for key, value in data.items():
      setattr(match, key, value)
    db.session.commit()
    return match

  @staticmethod
  def delete(match):
    db.session.delete(match)
    db.session.commit()

  @staticmethod
  def count_for_tournament(tournament_id):
    return Match.query.filter_by(tournament_id=tournament_id).count()

  @staticmethod
  def count():
    return Match.query.count()
