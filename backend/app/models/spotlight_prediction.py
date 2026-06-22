from app.extensions import db
from app.models.mixins import TimestampMixin, utcnow


class SpotlightPrediction(TimestampMixin, db.Model):
  __tablename__ = "spotlight_predictions"

  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(
    db.Integer,
    db.ForeignKey("users.id"),
    nullable=False,
    index=True,
  )
  question_id = db.Column(
    db.Integer,
    db.ForeignKey("spotlight_questions.id"),
    nullable=False,
    index=True,
  )
  answers_json = db.Column(db.JSON, nullable=False)
  submitted_at = db.Column(db.DateTime, nullable=False, default=utcnow)
  awarded_points = db.Column(db.Integer, nullable=False, default=0)

  user = db.relationship("User", back_populates="spotlight_predictions")
  question = db.relationship("SpotlightQuestion", back_populates="predictions")

  __table_args__ = (
    db.UniqueConstraint("user_id", "question_id", name="uq_spotlight_user_question"),
  )

  def to_dict(self):
    return {
      "id": self.id,
      "user_id": self.user_id,
      "question_id": self.question_id,
      "answers_json": self.answers_json,
      "submitted_at": self.submitted_at.isoformat(),
      "updated_at": self.updated_at.isoformat() if self.updated_at else None,
      "awarded_points": self.awarded_points,
    }
