from datetime import datetime
from collections import Counter
from app.extensions import db
from app.models.spotlight_question import SpotlightQuestion
from app.models.spotlight_prediction import SpotlightPrediction
from app.models.user import User
from app.models.mixins import utcnow

class SpotlightService:
  @staticmethod
  def get_questions_for_tournament(tournament_id, user_id=None):
    questions = SpotlightQuestion.query.filter_by(tournament_id=tournament_id).all()
    result = []
    for q in questions:
      is_locked = q.locked or (q.lock_time and utcnow().replace(tzinfo=None) >= q.lock_time)
      q_dict = q.to_dict(include_answer=True)
      q_dict["is_locked"] = is_locked
      
      # If user is logged in, attach their prediction
      if user_id:
        prediction = SpotlightPrediction.query.filter_by(user_id=user_id, question_id=q.id).first()
        if prediction:
          q_dict["user_prediction"] = prediction.to_dict()
      
      # If locked, attach community stats
      if is_locked:
        predictions = SpotlightPrediction.query.filter_by(question_id=q.id).all()
        total_answers = 0
        counts = Counter()
        for p in predictions:
          for ans in p.answers_json:
            counts[ans] += 1
            total_answers += 1
        
        stats = []
        if total_answers > 0:
          total_users = len(predictions)
          if q.question_type == "categorical":
            cat_stats = {}
            for p in predictions:
              if isinstance(p.answers_json, dict):
                for cat, ans in p.answers_json.items():
                  if cat not in cat_stats:
                    cat_stats[cat] = Counter()
                  cat_stats[cat][ans] += 1
            
            stats = {}
            for cat, c in cat_stats.items():
              stats[cat] = []
              for ans, count in c.most_common():
                stats[cat].append({
                  "option": ans,
                  "percentage": round((count / total_users) * 100) if total_users > 0 else 0
                })
          else:
            for ans, count in counts.most_common():
              stats.append({
                "option": ans,
                "percentage": round((count / total_users) * 100) if total_users > 0 else 0
              })
        q_dict["community_stats"] = stats
        
      result.append(q_dict)
    return result

  @staticmethod
  def submit_prediction(user_id, question_id, answers_json):
    question = SpotlightQuestion.query.get(question_id)
    if not question:
      return {"error": "Question not found"}, 404
      
    if question.locked or (question.lock_time and utcnow().replace(tzinfo=None) >= question.lock_time):
      return {"error": "Question is locked"}, 403

    if question.question_type == "categorical":
      if not isinstance(answers_json, dict) or len(answers_json.keys()) != question.num_selections:
        return {"error": f"You must provide exactly {question.num_selections} answers"}, 400
    else:
      if not isinstance(answers_json, list) or len(answers_json) != question.num_selections:
        return {"error": f"You must select exactly {question.num_selections} options"}, 400

    prediction = SpotlightPrediction.query.filter_by(user_id=user_id, question_id=question_id).first()
    if prediction:
      prediction.answers_json = answers_json
      prediction.submitted_at = utcnow()
    else:
      prediction = SpotlightPrediction(
        user_id=user_id,
        question_id=question_id,
        answers_json=answers_json
      )
      db.session.add(prediction)

    db.session.commit()
    return prediction.to_dict(), 200

  @staticmethod
  def get_oracle_leaderboard(tournament_id):
    users = User.query.filter_by(active=True).all()
    
    # Get all predictions for this tournament
    predictions = (
      db.session.query(SpotlightPrediction, SpotlightQuestion)
      .join(SpotlightQuestion, SpotlightPrediction.question_id == SpotlightQuestion.id)
      .filter(SpotlightQuestion.tournament_id == tournament_id)
      .all()
    )
    
    user_points = {user.id: 0 for user in users}
    for p, q in predictions:
      if p.user_id in user_points:
        user_points[p.user_id] += (p.awarded_points or 0)
        
    entries = []
    for user in users:
      entries.append({
        "user_id": user.id,
        "display_name": user.display_name,
        "total_points": user_points[user.id]
      })
      
    entries.sort(key=lambda e: -e["total_points"])
    for index, entry in enumerate(entries):
      entry["rank"] = index + 1
      
    return entries

  @staticmethod
  def get_challenge_stats(tournament_id, user_id=None):
    total_questions = SpotlightQuestion.query.filter_by(tournament_id=tournament_id).count()
    
    completed_questions = 0
    if user_id:
      completed_questions = (
        db.session.query(SpotlightPrediction)
        .join(SpotlightQuestion, SpotlightPrediction.question_id == SpotlightQuestion.id)
        .filter(SpotlightQuestion.tournament_id == tournament_id, SpotlightPrediction.user_id == user_id)
        .count()
      )
      
    participants = (
      db.session.query(SpotlightPrediction.user_id)
      .join(SpotlightQuestion, SpotlightPrediction.question_id == SpotlightQuestion.id)
      .filter(SpotlightQuestion.tournament_id == tournament_id)
      .distinct()
      .count()
    )
    
    total_users = User.query.filter_by(active=True).count()
    
    return {
      "completed_questions": completed_questions,
      "total_questions": total_questions,
      "participants": participants,
      "total_users": total_users
    }
