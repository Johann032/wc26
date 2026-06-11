from flask import Blueprint, jsonify, request

from app.services.question_service import QuestionService
from app.utils.auth import admin_required, get_current_user_id, login_required
from app.repositories.user_repository import UserRepository

questions_bp = Blueprint("questions", __name__)
service = QuestionService()


def _can_include_answer():
  user_id = get_current_user_id()
  if not user_id:
    return False
  user = UserRepository.get_by_id(user_id)
  return bool(user and user.is_admin)


@questions_bp.get("/match/<int:match_id>")
@login_required
def list_questions_for_match(match_id):
  include_answer = request.args.get("include_answer") == "true" and _can_include_answer()
  questions, error = service.list_questions_for_match(match_id, include_answer)
  if error:
    return jsonify({"error": error}), 404
  return jsonify(questions)


@questions_bp.get("/<int:question_id>")
@login_required
def get_question(question_id):
  include_answer = request.args.get("include_answer") == "true" and _can_include_answer()
  question = service.get_question(question_id, include_answer)
  if not question:
    return jsonify({"error": "Question not found"}), 404
  return jsonify(question)


@questions_bp.post("")
@admin_required
def create_question():
  data = request.get_json(silent=True) or {}
  question, error = service.create_question(data)
  if error:
    status = 404 if error == "Match not found" else 400
    return jsonify({"error": error}), status
  return jsonify(question), 201


@questions_bp.put("/<int:question_id>")
@admin_required
def update_question(question_id):
  data = request.get_json(silent=True) or {}
  question, error = service.update_question(question_id, data)
  if error:
    status = 404 if error == "Question not found" else 400
    return jsonify({"error": error}), status
  return jsonify(question)


@questions_bp.delete("/<int:question_id>")
@admin_required
def delete_question(question_id):
  success, error = service.delete_question(question_id)
  if not success:
    status = 404 if error == "Question not found" else 400
    return jsonify({"error": error}), status
  return jsonify({"message": "Question deleted"})


@questions_bp.put("/<int:question_id>/result")
@admin_required
def set_result(question_id):
  data = request.get_json(silent=True) or {}
  question, error = service.set_correct_answer(question_id, data.get("correct_answer"))
  if error:
    status = 404 if error == "Question not found" else 400
    return jsonify({"error": error}), status
  return jsonify(question)
