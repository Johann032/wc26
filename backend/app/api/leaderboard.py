from flask import Blueprint, jsonify, request

from app.services.leaderboard_service import LeaderboardService
from app.utils.auth import login_required

leaderboard_bp = Blueprint("leaderboard", __name__)
service = LeaderboardService()


@leaderboard_bp.get("")
@login_required
def get_leaderboard():
  tournament_id = request.args.get("tournament_id", type=int)
  leaderboard, error = service.get_leaderboard(tournament_id)
  if error:
    status = 404 if error == "Tournament not found" else 400
    return jsonify({"error": error}), status
  return jsonify(leaderboard)
