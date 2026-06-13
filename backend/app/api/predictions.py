from flask import Blueprint, jsonify, request

from app.services.prediction_service import PredictionService
from app.utils.auth import admin_required, get_current_user_id, login_required

predictions_bp = Blueprint("predictions", __name__)
service = PredictionService()


@predictions_bp.get("/me")
@login_required
def my_predictions():
  tournament_id = request.args.get("tournament_id", type=int)
  user_id = get_current_user_id()
  return jsonify(service.list_predictions_for_user(user_id, tournament_id))


@predictions_bp.get("/match/<int:match_id>")
@login_required
def my_predictions_for_match(match_id):
  user_id = get_current_user_id()
  return jsonify(service.list_predictions_for_match(user_id, match_id))


@predictions_bp.get("/user/<int:user_id>")
@admin_required
def list_predictions_for_user(user_id):
  tournament_id = request.args.get("tournament_id", type=int)
  return jsonify(service.list_predictions_for_user(user_id, tournament_id))


@predictions_bp.get("/question/<int:question_id>")
@admin_required
def list_predictions_for_question(question_id):
  return jsonify(service.list_predictions_for_question(question_id))


@predictions_bp.post("")
@login_required
def submit_prediction():
  data = request.get_json(silent=True) or {}
  user_id = get_current_user_id()
  question_id = data.get("question_id")
  answer = data.get("answer")

  if not question_id:
    return jsonify({"error": "question_id is required"}), 400

  prediction, created, error = service.submit_or_update(user_id, question_id, answer)
  if error:
    if error == "Question not found":
      return jsonify({"error": error}), 404
    if error == "Predictions are locked because this match has already started." or "locked" in error.lower():
      return jsonify({"error": error}), 423
    if error == "Authentication required":
      return jsonify({"error": error}), 401
    return jsonify({"error": error}), 400

  return jsonify(prediction), 201 if created else 200
