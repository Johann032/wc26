from flask import Blueprint, jsonify, request

from app.services.admin_service import AdminService
from app.services.scoring_service import ScoringService
from app.utils.auth import admin_required

admin_bp = Blueprint("admin", __name__)
admin_service = AdminService()
scoring_service = ScoringService()


@admin_bp.get("/overview")
@admin_required
def admin_overview():
  return jsonify(admin_service.get_overview())


@admin_bp.get("/tournaments/<int:tournament_id>/summary")
@admin_required
def tournament_summary(tournament_id):
  summary = admin_service.get_tournament_summary(tournament_id)
  if not summary:
    return jsonify({"error": "Tournament not found"}), 404
  return jsonify(summary)


@admin_bp.post("/recalculate")
@admin_required
def recalculate_scores():
  data = request.get_json(silent=True) or {}
  tournament_id = data.get("tournament_id")

  if tournament_id:
    result = scoring_service.recalculate_for_tournament(tournament_id)
    if result.get("error"):
      return jsonify({"error": result["error"]}), 404
    return jsonify(result)

  return jsonify(scoring_service.recalculate_all())

@admin_bp.get("/matches/<int:match_id>/participation")
@admin_required
def get_match_participation(match_id):
  participation = admin_service.get_match_participation(match_id)
  if not participation:
    return jsonify({"error": "Failed to calculate participation"}), 500
  return jsonify(participation)

@admin_bp.get("/tournaments/<int:tournament_id>/participation-summary")
@admin_required
def get_tournament_participation_summary(tournament_id):
  summary = admin_service.get_tournament_participation_summary(tournament_id)
  return jsonify(summary)
