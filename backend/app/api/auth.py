from flask import Blueprint, jsonify, request

from app.services.auth_service import AuthService
from app.utils.auth import login_required

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
