from app.extensions import db
from app.models.mixins import TimestampMixin


class SpotlightQuestion(TimestampMixin, db.Model):
  __tablename__ = "spotlight_questions"

  id = db.Column(db.Integer, primary_key=True)
  tournament_id = db.Column(
    db.Integer,
    db.ForeignKey("tournaments.id"),
    nullable=False,
    index=True,
  )
  title = db.Column(db.String(255), nullable=False)
  question_type = db.Column(db.String(50), nullable=False) # e.g., "multi_select", "single_select"
  num_selections = db.Column(db.Integer, nullable=False, default=1)
  options_json = db.Column(db.JSON, nullable=False)
  max_points = db.Column(db.Integer, nullable=False)
  locked = db.Column(db.Boolean, nullable=False, default=False)
  lock_time = db.Column(db.DateTime, nullable=False)
  correct_answers_json = db.Column(db.JSON, nullable=True)

  tournament = db.relationship("Tournament", back_populates="spotlight_questions")
  predictions = db.relationship(
    "SpotlightPrediction",
    back_populates="question",
    lazy="dynamic",
    cascade="all, delete-orphan",
  )

  def to_dict(self, include_answer=False):
    data = {
      "id": self.id,
      "tournament_id": self.tournament_id,
      "title": self.title,
      "question_type": self.question_type,
      "num_selections": self.num_selections,
      "options_json": self.options_json,
      "max_points": self.max_points,
      "locked": self.locked,
      "lock_time": self.lock_time.isoformat() if self.lock_time else None,
      "created_at": self.created_at.isoformat() if self.created_at else None,
      "updated_at": self.updated_at.isoformat() if self.updated_at else None,
    }
    if include_answer:
      data["correct_answers_json"] = self.correct_answers_json
    return data
