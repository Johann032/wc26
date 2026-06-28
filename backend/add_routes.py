import sys

file_path = r'c:\Users\JOHANN\Documents\wc26\backend\app\api\spotlight_routes.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add admin_required import if missing
if 'from app.utils.auth import admin_required' not in content:
    content = content.replace('from app.utils.auth import login_required, get_current_user_id', 'from app.utils.auth import login_required, get_current_user_id, admin_required')

new_routes = """
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
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content + new_routes)

print('Added admin routes')
