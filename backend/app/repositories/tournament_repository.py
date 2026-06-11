from app.extensions import db
from app.models.tournament import Tournament


class TournamentRepository:
  @staticmethod
  def get_all(include_archived=False):
    query = Tournament.query
    if not include_archived:
      query = query.filter(Tournament.status != "archived")
    return query.order_by(Tournament.start_date.desc()).all()

  @staticmethod
  def get_by_id(tournament_id):
    return db.session.get(Tournament, tournament_id)

  @staticmethod
  def create(data):
    tournament = Tournament(**data)
    db.session.add(tournament)
    db.session.commit()
    return tournament

  @staticmethod
  def update(tournament, data):
    for key, value in data.items():
      setattr(tournament, key, value)
    db.session.commit()
    return tournament
