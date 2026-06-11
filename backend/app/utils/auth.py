from functools import wraps

from flask import jsonify, session

from app.repositories.user_repository import UserRepository


def get_current_user_id():
  return session.get("user_id")


def login_required(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    user_id = get_current_user_id()
    if not user_id:
      return jsonify({"error": "Authentication required"}), 401
    user = UserRepository.get_by_id(user_id)
    if not user or not user.active:
      session.clear()
      return jsonify({"error": "Authentication required"}), 401
    return f(*args, **kwargs)
  return decorated


def admin_required(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    user_id = get_current_user_id()
    if not user_id:
      return jsonify({"error": "Authentication required"}), 401
    user = UserRepository.get_by_id(user_id)
    if not user or not user.active:
      session.clear()
      return jsonify({"error": "Authentication required"}), 401
    if not user.is_admin:
      return jsonify({"error": "Admin access required"}), 403
    return f(*args, **kwargs)
  return decorated
