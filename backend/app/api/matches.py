from flask import Blueprint, jsonify, request

from app.services.match_service import MatchService
from app.utils.auth import admin_required, login_required

matches_bp = Blueprint("matches", __name__)
service = MatchService()


@matches_bp.get("/tournament/<int:tournament_id>")
@login_required
def list_matches_for_tournament(tournament_id):
  matches, error = service.list_matches_for_tournament(tournament_id)
  if error:
    return jsonify({"error": error}), 404
  return jsonify(matches)


@matches_bp.get("/<int:match_id>")
@login_required
def get_match(match_id):
  match = service.get_match(match_id)
  if not match:
    return jsonify({"error": "Match not found"}), 404
  return jsonify(match)


@matches_bp.post("")
@admin_required
def create_match():
  data = request.get_json(silent=True) or {}
  match, error = service.create_match(data)
  if error:
    status = 404 if error == "Tournament not found" else 400
    return jsonify({"error": error}), status
  return jsonify(match), 201


@matches_bp.put("/<int:match_id>")
@admin_required
def update_match(match_id):
  data = request.get_json(silent=True) or {}
  match, error = service.update_match(match_id, data)
  if error:
    status = 404 if error == "Match not found" else 400
    return jsonify({"error": error}), status
  return jsonify(match)


@matches_bp.delete("/<int:match_id>")
@admin_required
def delete_match(match_id):
  success, error = service.delete_match(match_id)
  if not success:
    status = 404 if error == "Match not found" else 400
    return jsonify({"error": error}), status
  return jsonify({"message": "Match deleted"})

@matches_bp.get("/<int:match_id>/breakdown")
@login_required
def get_match_breakdown(match_id):
  from app.services.match_breakdown_service import MatchBreakdownService
  breakdown_service = MatchBreakdownService()
  breakdown, error = breakdown_service.get_breakdown(match_id)
  if error:
    status = 403 if "only available for finished" in error else 404
    return jsonify({"error": error}), status
  return jsonify(breakdown)
