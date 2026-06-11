"""Seed the database with sample tournament data."""

import os
from datetime import date, datetime, timezone

from app import create_app
from app.extensions import db
from app.models import Tournament, User, Match, PredictionQuestion, Prediction
from app.utils.security import hash_pin


def seed():
  app = create_app()

  with app.app_context():
    instance_dir = os.path.join(os.path.dirname(__file__), "instance")
    os.makedirs(instance_dir, exist_ok=True)

    db.drop_all()
    db.create_all()

    tournaments = [
      Tournament(
        name="Family World Cup 2026",
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
        status="active",
      ),
      Tournament(
        name="Euro 2028",
        start_date=date(2028, 6, 8),
        end_date=date(2028, 7, 8),
        status="upcoming",
      ),
      Tournament(
        name="World Cup 2030",
        start_date=date(2030, 6, 10),
        end_date=date(2030, 7, 20),
        status="upcoming",
      ),
    ]
    db.session.add_all(tournaments)
    db.session.flush()

    users_data = [
      ("Dad", "1234", True),
      ("Mom", "5678", False),
      ("Alex", "9012", False),
      ("Sam", "3456", False),
    ]
    users = []
    for name, pin, is_admin in users_data:
      user = User(
        pin_hash=hash_pin(pin),
        active=True,
        is_admin=is_admin,
      )
      user.set_display_name(name)
      users.append(user)
    db.session.add_all(users)
    db.session.flush()

    wc2026 = tournaments[0]
    matches = [
      Match(
        tournament_id=wc2026.id,
        team1="Brazil",
        team2="Germany",
        kickoff_time=datetime(2026, 6, 15, 18, 0, tzinfo=timezone.utc),
        status="scheduled",
      ),
      Match(
        tournament_id=wc2026.id,
        team1="Argentina",
        team2="France",
        kickoff_time=datetime(2026, 6, 20, 20, 0, tzinfo=timezone.utc),
        status="scheduled",
      ),
      Match(
        tournament_id=wc2026.id,
        team1="Spain",
        team2="England",
        kickoff_time=datetime(2026, 6, 25, 16, 0, tzinfo=timezone.utc),
        status="scheduled",
      ),
    ]
    db.session.add_all(matches)
    db.session.flush()

    questions = [
      PredictionQuestion(
        match_id=matches[0].id,
        question_text="Who will win?",
        question_type="winner",
        point_value=3,
        options_json={"choices": ["Brazil", "Germany", "Draw"]},
      ),
      PredictionQuestion(
        match_id=matches[0].id,
        question_text="What will the exact score be?",
        question_type="exact_score",
        point_value=5,
      ),
      PredictionQuestion(
        match_id=matches[0].id,
        question_text="Will there be a penalty?",
        question_type="yes_no",
        point_value=2,
      ),
      PredictionQuestion(
        match_id=matches[1].id,
        question_text="Who will win?",
        question_type="winner",
        point_value=3,
        options_json={"choices": ["Argentina", "France", "Draw"]},
      ),
      PredictionQuestion(
        match_id=matches[1].id,
        question_text="How many goals will be scored?",
        question_type="number",
        point_value=2,
      ),
      PredictionQuestion(
        match_id=matches[2].id,
        question_text="First team to score?",
        question_type="multiple_choice",
        point_value=2,
        options_json={"choices": ["Spain", "England", "No goals"]},
      ),
    ]
    db.session.add_all(questions)
    db.session.flush()

    predictions = [
      Prediction(user_id=users[0].id, question_id=questions[0].id, answer="Brazil"),
      Prediction(user_id=users[0].id, question_id=questions[1].id, answer="2-1"),
      Prediction(user_id=users[1].id, question_id=questions[0].id, answer="Germany"),
      Prediction(user_id=users[2].id, question_id=questions[0].id, answer="Draw"),
      Prediction(user_id=users[3].id, question_id=questions[3].id, answer="Argentina"),
    ]
    db.session.add_all(predictions)
    db.session.commit()

    print("Database seeded successfully.")
    print(f"  Tournaments: {len(tournaments)}")
    print(f"  Users: {len(users)} (Dad is admin, PIN: 1234)")
    print(f"  Matches: {len(matches)}")
    print(f"  Questions: {len(questions)}")
    print(f"  Predictions: {len(predictions)}")


if __name__ == "__main__":
  seed()
