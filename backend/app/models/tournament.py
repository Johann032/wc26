from app.extensions import db
from app.models.mixins import TimestampMixin


class Tournament(TimestampMixin, db.Model):
  __tablename__ = "tournaments"

  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(120), nullable=False)
  start_date = db.Column(db.Date, nullable=False)
  end_date = db.Column(db.Date, nullable=False)
  status = db.Column(db.String(20), nullable=False, default="upcoming")

  matches = db.relationship("Match", back_populates="tournament", lazy="dynamic")
  spotlight_questions = db.relationship("SpotlightQuestion", back_populates="tournament", lazy="dynamic")

  def to_dict(self):
    return {
      "id": self.id,
      "name": self.name,
      "start_date": self.start_date.isoformat(),
      "end_date": self.end_date.isoformat(),
      "status": self.status,
      "created_at": self.created_at.isoformat() if self.created_at else None,
      "updated_at": self.updated_at.isoformat() if self.updated_at else None,
    }
