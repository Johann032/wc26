"""Comprehensive audit test suite."""

from datetime import datetime, timezone, timedelta

from app import create_app
from app.extensions import db
from app.models.match import Match
from app.models.user import User


def login(c, name, pin):
  return c.post("/api/auth/login", json={"display_name": name, "pin": pin})


def test(name, cond):
  status = "PASS" if cond else "FAIL"
  print(f"{status}: {name}")
  if not cond:
    raise SystemExit(1)


app = create_app()

with app.app_context():
  c = app.test_client()

  r = login(c, "Dad", "1234")
  test("Login works", r.status_code == 200)

  r = c.get("/api/auth/me")
  test("Session persists", r.status_code == 200)

  r = login(c, "Mom", "9999")
  test("Invalid PIN", r.status_code == 401)

  mom = User.query.filter_by(display_name="Mom").first()
  mom.active = False
  db.session.commit()
  r = login(c, "Mom", "5678")
  test("Inactive user blocked", r.status_code == 401)
  mom.active = True
  db.session.commit()

  login(c, "Dad", "1234")

  r = c.post("/api/users", json={"display_name": "dad", "pin": "9999"})
  test("Duplicate name blocked", r.status_code == 400)

  login(c, "Alex", "9012")
  r = c.get("/api/questions/match/1?include_answer=true")
  q = r.get_json()[0]
  test("Non-admin cannot see answers", "correct_answer" not in q)
  login(c, "Dad", "1234")

  r = c.post("/api/predictions", json={"question_id": 2, "answer": "2:1"})
  test("Submit exact score", r.status_code == 200)
  test("Canonical score stored", r.get_json()["answer"] == "2-1")

  r = c.post("/api/predictions", json={"question_id": 2, "answer": "3-0"})
  test("Update returns 200", r.status_code == 200)

  match = db.session.get(Match, 1)
  match.kickoff_time = datetime.now(timezone.utc) - timedelta(hours=1)
  db.session.commit()

  r = c.get("/api/questions/match/1")
  test("Questions locked after kickoff", all(q["locked"] for q in r.get_json()))

  r = c.post("/api/predictions", json={"question_id": 1, "answer": "Germany"})
  test("Locked returns 423", r.status_code == 423)

  login(c, "Dad", "1234")
  r = c.put("/api/questions/1/result", json={"correct_answer": "Brazil"})
  test("Set result", r.status_code == 200)

  r = c.post("/api/admin/recalculate", json={"tournament_id": 1})
  test("Recalculate works", r.status_code == 200)

  r2 = c.post("/api/admin/recalculate", json={"tournament_id": 1})
  test("Recalculate idempotent", r2.get_json()["updated"] == 0)

  r = c.get("/api/leaderboard?tournament_id=1")
  lb = r.get_json()
  test("Leaderboard has stats", "exact_predictions" in lb[0])

  r = c.get("/api/matches/tournament/9999")
  test("Invalid tournament 404", r.status_code == 404)

  r = c.post("/api/matches", json={
    "tournament_id": 1,
    "team1": "A",
    "team2": "A",
    "kickoff_time": "2026-12-01T12:00:00+00:00",
  })
  test("Same teams rejected", r.status_code == 400)

  r = c.post("/api/auth/login", json={})
  test("Login missing fields 400", r.status_code == 400)

  print("ALL TESTS PASSED")
