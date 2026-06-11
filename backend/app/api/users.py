from flask import Blueprint, jsonify, request

from app.services.user_service import UserService
from app.utils.auth import admin_required, get_current_user_id, login_required

users_bp = Blueprint("users", __name__)
service = UserService()


@users_bp.get("")
@admin_required
def list_users():
  return jsonify(service.list_users(include_admin=True))


@users_bp.get("/<int:user_id>")
@login_required
def get_user(user_id):
  current_id = get_current_user_id()
  current = service.get_user(current_id, include_admin=True)
  if not current:
    return jsonify({"error": "Authentication required"}), 401

  if user_id != current_id and not current.get("is_admin"):
    return jsonify({"error": "Forbidden"}), 403

  user = service.get_user(user_id, include_admin=current.get("is_admin", False))
  if not user:
    return jsonify({"error": "User not found"}), 404
  return jsonify(user)


@users_bp.post("")
@admin_required
def create_user():
  data = request.get_json(silent=True) or {}
  user, error = service.create_user(data)
  if error:
    return jsonify({"error": error}), 400
  return jsonify(user), 201


@users_bp.put("/<int:user_id>")
@admin_required
def update_user(user_id):
  data = request.get_json(silent=True) or {}
  user, error = service.update_user(user_id, data)
  if error:
    status = 404 if error == "User not found" else 400
    return jsonify({"error": error}), status
  return jsonify(user)
