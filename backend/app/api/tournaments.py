from flask import Blueprint, jsonify, request

from app.services.tournament_service import TournamentService
from app.utils.auth import admin_required, login_required

tournaments_bp = Blueprint("tournaments", __name__)
service = TournamentService()


@tournaments_bp.get("")
@login_required
def list_tournaments():
  include_archived = request.args.get("include_archived") == "true"
  return jsonify(service.list_tournaments(include_archived))


@tournaments_bp.get("/<int:tournament_id>")
@login_required
def get_tournament(tournament_id):
  tournament = service.get_tournament(tournament_id)
  if not tournament:
    return jsonify({"error": "Tournament not found"}), 404
  return jsonify(tournament)


@tournaments_bp.post("")
@admin_required
def create_tournament():
  data = request.get_json(silent=True) or {}
  tournament, error = service.create_tournament(data)
  if error:
    return jsonify({"error": error}), 400
  return jsonify(tournament), 201


@tournaments_bp.put("/<int:tournament_id>")
@admin_required
def update_tournament(tournament_id):
  data = request.get_json(silent=True) or {}
  tournament, error = service.update_tournament(tournament_id, data)
  if error:
    status = 404 if error == "Tournament not found" else 400
    return jsonify({"error": error}), status
  return jsonify(tournament)


@tournaments_bp.post("/<int:tournament_id>/archive")
@admin_required
def archive_tournament(tournament_id):
  tournament, error = service.archive_tournament(tournament_id)
  if error:
    status = 404 if error == "Tournament not found" else 400
    return jsonify({"error": error}), status
  return jsonify(tournament)
