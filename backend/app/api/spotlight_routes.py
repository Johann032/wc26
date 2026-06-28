from flask import Blueprint, request, jsonify
from app.utils.auth import login_required, get_current_user_id, admin_required
from app.services.spotlight_service import SpotlightService

spotlight_bp = Blueprint("spotlight", __name__, url_prefix="/spotlight")

@spotlight_bp.route("/tournament/<int:tournament_id>", methods=["GET"])
def get_spotlight_questions(tournament_id):
  # Get user_id if logged in
  user_id = get_current_user_id()
  questions = SpotlightService.get_questions_for_tournament(tournament_id, user_id)
  return jsonify(questions), 200

@spotlight_bp.route("/prediction", methods=["POST"])
@login_required
def submit_prediction():
  data = request.get_json()
  if not data or "question_id" not in data or "answers_json" not in data:
    return jsonify({"error": "Missing required fields"}), 400
    
  user_id = get_current_user_id()
  result, status = SpotlightService.submit_prediction(
    user_id,
    data["question_id"],
    data["answers_json"]
  )
  
  return jsonify(result), status

@spotlight_bp.route("/leaderboard/<int:tournament_id>", methods=["GET"])
def get_jackpot_standings(tournament_id):
  entries = SpotlightService.get_jackpot_standings(tournament_id)
  return jsonify(entries), 200

@spotlight_bp.route("/stats/<int:tournament_id>", methods=["GET"])
def get_challenge_stats(tournament_id):
  user_id = get_current_user_id()
  stats = SpotlightService.get_challenge_stats(tournament_id, user_id)
  return jsonify(stats), 200

# Admin Routes
@spotlight_bp.route("/admin/questions", methods=["POST"])
@admin_required
def admin_create_question():
  data = request.get_json()
  if not data:
    return jsonify({"error": "Invalid data"}), 400
  result = SpotlightService.create_question(data)
  return jsonify(result), 201

@spotlight_bp.route("/admin/questions/<int:question_id>", methods=["PUT"])
@admin_required
def admin_update_question(question_id):
  data = request.get_json()
  result, status = SpotlightService.update_question(question_id, data)
  return jsonify(result), status

@spotlight_bp.route("/admin/questions/<int:question_id>", methods=["DELETE"])
@admin_required
def admin_delete_question(question_id):
  result, status = SpotlightService.delete_question(question_id)
  return jsonify(result), status

@spotlight_bp.route("/admin/questions/<int:question_id>/result", methods=["POST"])
@admin_required
def admin_set_question_result(question_id):
  data = request.get_json()
  if not data or "correct_answers_json" not in data:
    return jsonify({"error": "Missing correct_answers_json"}), 400
  result, status = SpotlightService.set_question_result(question_id, data["correct_answers_json"])
  return jsonify(result), status
