from app.extensions import db
from app.models.mixins import TimestampMixin


class Match(TimestampMixin, db.Model):
  __tablename__ = "matches"

  id = db.Column(db.Integer, primary_key=True)
  tournament_id = db.Column(
    db.Integer,
    db.ForeignKey("tournaments.id"),
    nullable=False,
    index=True,
  )
  team1 = db.Column(db.String(80), nullable=False)
  team2 = db.Column(db.String(80), nullable=False)
  kickoff_time = db.Column(db.DateTime, nullable=False)
  status = db.Column(db.String(20), nullable=False, default="scheduled")
  stage = db.Column(db.String(50), nullable=False, default="GROUP", server_default="GROUP")
  score1 = db.Column(db.Integer, nullable=True)
  score2 = db.Column(db.Integer, nullable=True)

  tournament = db.relationship("Tournament", back_populates="matches")
  questions = db.relationship(
    "PredictionQuestion",
    back_populates="match",
    lazy="dynamic",
    cascade="all, delete-orphan",
  )

  def to_dict(self):
    return {
      "id": self.id,
      "tournament_id": self.tournament_id,
      "team1": self.team1,
      "team2": self.team2,
      "kickoff_time": self.kickoff_time.isoformat() + ("Z" if self.kickoff_time.tzinfo is None else ""),
      "status": self.status,
      "stage": self.stage,
      "score1": self.score1,
      "score2": self.score2,
      "created_at": self.created_at.isoformat() if self.created_at else None,
      "updated_at": self.updated_at.isoformat() if self.updated_at else None,
    }
