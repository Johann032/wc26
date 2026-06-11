from app.extensions import db
from app.models.user import User


class UserRepository:
  @staticmethod
  def get_all():
    return User.query.order_by(User.display_name).all()

  @staticmethod
  def get_by_id(user_id):
    return db.session.get(User, user_id)

  @staticmethod
  def get_by_display_name(display_name):
    return User.query.filter_by(display_name_lower=display_name.strip().lower()).first()

  @staticmethod
  def count():
    return User.query.count()
