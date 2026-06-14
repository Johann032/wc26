from flask import Blueprint, jsonify, request

from app.services.auth_service import AuthService
from app.utils.auth import login_required, get_current_user_id

auth_bp = Blueprint("auth", __name__)
service = AuthService()


@auth_bp.post("/login")
def login():
  data = request.get_json(silent=True) or {}
  display_name = data.get("display_name")
  pin = data.get("pin")

  if not display_name or pin is None or str(pin) == "":
    return jsonify({"error": "Display name and PIN are required"}), 400

  user, error = service.login(display_name, pin)
  if error:
    return jsonify({"error": error}), 401

  return jsonify({"user": user.to_dict(include_admin=True)})


@auth_bp.post("/logout")
def logout():
  service.logout()
  return jsonify({"message": "Logged out"})


@auth_bp.get("/me")
@login_required
def me():
  user = service.get_current_user()
  return jsonify({"user": user.to_dict(include_admin=True)})


@auth_bp.post("/change-pin")
@login_required
def change_pin():
  data = request.get_json(silent=True) or {}
  old_pin = data.get("old_pin")
  new_pin = data.get("new_pin")
  
  user = service.get_current_user()
  if not user:
    return jsonify({"error": "Unauthorized"}), 401
    
  # If user is forced to change PIN, they don't need to provide the old one
  # but they need to provide the new one.
  ignore_old_pin = user.force_pin_change
  
  if not ignore_old_pin and not old_pin:
    return jsonify({"error": "Current PIN is required"}), 400
    
  if not new_pin:
    return jsonify({"error": "New PIN is required"}), 400
    
  updated_user, error = service.change_pin(user.id, old_pin, new_pin, ignore_old_pin=ignore_old_pin)
  if error:
    return jsonify({"error": error}), 400
    
  return jsonify({"message": "PIN updated successfully", "user": updated_user.to_dict(include_admin=True)})
