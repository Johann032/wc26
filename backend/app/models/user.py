from app.extensions import db
from app.models.mixins import TimestampMixin, utcnow


class User(TimestampMixin, db.Model):
  __tablename__ = "users"

  id = db.Column(db.Integer, primary_key=True)
  display_name = db.Column(db.String(80), nullable=False)
  display_name_lower = db.Column(db.String(80), nullable=False, unique=True, index=True)
  pin_hash = db.Column(db.String(255), nullable=False)
  active = db.Column(db.Boolean, nullable=False, default=True)
  is_admin = db.Column(db.Boolean, nullable=False, default=False)
  force_pin_change = db.Column(db.Boolean, nullable=False, default=False)

  predictions = db.relationship("Prediction", back_populates="user", lazy="dynamic")
  spotlight_predictions = db.relationship("SpotlightPrediction", back_populates="user", lazy="dynamic")

  def set_display_name(self, name):
    self.display_name = name.strip()
    self.display_name_lower = self.display_name.lower()

  def to_dict(self, include_admin=False):
    data = {
      "id": self.id,
      "display_name": self.display_name,
      "active": self.active,
      "force_pin_change": self.force_pin_change,
      "created_at": self.created_at.isoformat() if self.created_at else None,
      "updated_at": self.updated_at.isoformat() if self.updated_at else None,
    }
    if include_admin:
      data["is_admin"] = self.is_admin
    return data
