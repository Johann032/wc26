from app.extensions import db
from app.models.mixins import TimestampMixin

QUESTION_TYPES = ("winner", "exact_score", "multiple_choice", "yes_no", "number")


class PredictionQuestion(TimestampMixin, db.Model):
  __tablename__ = "prediction_questions"

  id = db.Column(db.Integer, primary_key=True)
  match_id = db.Column(
    db.Integer,
    db.ForeignKey("matches.id"),
    nullable=False,
    index=True,
  )
  question_text = db.Column(db.String(255), nullable=False)
  question_type = db.Column(db.String(30), nullable=False)
  point_value = db.Column(db.Integer, nullable=False, default=1)
  options_json = db.Column(db.JSON, nullable=True)
  locked = db.Column(db.Boolean, nullable=False, default=False)
  correct_answer = db.Column(db.String(255), nullable=True)

  match = db.relationship("Match", back_populates="questions")
  predictions = db.relationship(
    "Prediction",
    back_populates="question",
    lazy="dynamic",
    cascade="all, delete-orphan",
  )

  def to_dict(self, include_answer=False):
    data = {
      "id": self.id,
      "match_id": self.match_id,
      "question_text": self.question_text,
      "question_type": self.question_type,
      "point_value": self.point_value,
      "options_json": self.options_json,
      "locked": self.locked,
      "created_at": self.created_at.isoformat() if self.created_at else None,
      "updated_at": self.updated_at.isoformat() if self.updated_at else None,
    }
    if include_answer:
      data["correct_answer"] = self.correct_answer
    return data
