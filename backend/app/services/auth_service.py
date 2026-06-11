from flask import session
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.utils.db_errors import is_unique_violation, rollback
from app.utils.security import hash_pin, verify_pin

INVALID_CREDENTIALS = "Invalid display name or PIN"
MIN_PIN_LENGTH = 4


class AuthService:
  def _validate_pin(self, pin):
    if pin is None or len(str(pin)) < MIN_PIN_LENGTH:
      return "PIN must be at least 4 characters"
    return None

  def _validate_display_name(self, display_name):
    name = (display_name or "").strip()
    if not name:
      return None, "Display name is required"
    return name, None

  def login(self, display_name, pin):
    user = UserRepository.get_by_display_name(display_name)
    if not user or not user.active or not user.pin_hash:
      return None, INVALID_CREDENTIALS
    if not verify_pin(pin, user.pin_hash):
      return None, INVALID_CREDENTIALS

    session.clear()
    session["user_id"] = user.id
    session.permanent = True
    return user, None

  def logout(self):
    session.clear()

  def get_current_user(self):
    user_id = session.get("user_id")
    if not user_id:
      return None
    user = UserRepository.get_by_id(user_id)
    if not user or not user.active:
      session.clear()
      return None
    return user

  def create_user(self, display_name, pin, is_admin=False, active=True):
    name, error = self._validate_display_name(display_name)
    if error:
      return None, error

    pin_error = self._validate_pin(pin)
    if pin_error:
      return None, pin_error

    if UserRepository.get_by_display_name(name):
      return None, "Display name already taken"

    user = User(
      pin_hash=hash_pin(pin),
      active=active,
      is_admin=is_admin,
    )
    user.set_display_name(name)
    db.session.add(user)
    try:
      db.session.commit()
    except IntegrityError as exc:
      rollback()
      if is_unique_violation(exc):
        return None, "Display name already taken"
      raise
    return user, None

  def update_user(self, user_id, data):
    user = UserRepository.get_by_id(user_id)
    if not user:
      return None, "User not found"

    if "display_name" in data and data["display_name"]:
      name, error = self._validate_display_name(data["display_name"])
      if error:
        return None, error
      existing = UserRepository.get_by_display_name(name)
      if existing and existing.id != user_id:
        return None, "Display name already taken"
      user.set_display_name(name)

    if "pin" in data and data["pin"]:
      pin_error = self._validate_pin(data["pin"])
      if pin_error:
        return None, pin_error
      user.pin_hash = hash_pin(data["pin"])

    becoming_inactive = "active" in data and not bool(data["active"])
    losing_admin = "is_admin" in data and not bool(data["is_admin"])

    if becoming_inactive or losing_admin:
      guard_error = self._guard_last_admin(user, becoming_inactive, losing_admin)
      if guard_error:
        return None, guard_error

    if "active" in data:
      user.active = bool(data["active"])

    if "is_admin" in data:
      user.is_admin = bool(data["is_admin"])

    try:
      db.session.commit()
    except IntegrityError as exc:
      rollback()
      if is_unique_violation(exc):
        return None, "Display name already taken"
      raise
    return user, None

  @staticmethod
  def _guard_last_admin(user, becoming_inactive, losing_admin):
    if not user.is_admin:
      return None
    if not becoming_inactive and not losing_admin:
      return None

    other_admins = User.query.filter(
      User.is_admin.is_(True),
      User.active.is_(True),
      User.id != user.id,
    ).count()
    if other_admins == 0:
      return "Cannot deactivate or demote the last active admin"
    return None
