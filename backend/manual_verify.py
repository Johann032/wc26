import json
from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()
with app.app_context():
    c = app.test_client()

    # Login as Admin (Dad)
    r = c.post("/api/auth/login", json={"display_name": "Dad", "pin": "1234"})
    assert r.status_code == 200, "Admin login failed"

    # 1. Create a new scheduled match
    r = c.post("/api/matches", json={
        "tournament_id": 1,
        "team1": "USA",
        "team2": "Mexico",
        "kickoff_time": "2030-01-01T12:00:00Z"
    })
    assert r.status_code == 201, "Failed to create match"
    match_id = r.get_json()["id"]

    # 3. As an admin: Create, Edit, Delete question
    r = c.post("/api/questions", json={
        "match_id": match_id,
        "question_text": "Who will win?",
        "question_type": "winner",
        "point_value": 3,
        "options_json": {"choices": ["USA", "Mexico", "Draw"]}
    })
    assert r.status_code == 201, "Admin failed to create question"
    question_id = r.get_json()["id"]

    r = c.put(f"/api/questions/{question_id}", json={
        "question_text": "Who wins?",
        "point_value": 5
    })
    assert r.status_code == 200, "Admin failed to edit question"

    r = c.delete(f"/api/questions/{question_id}")
    assert r.status_code == 200, "Admin failed to delete question"

    # Re-create a question so participants can answer
    r = c.post("/api/questions", json={
        "match_id": match_id,
        "question_text": "Will there be a red card?",
        "question_type": "yes_no",
        "point_value": 2
    })
    question_id = r.get_json()["id"]

    # Login as Participant (Mom)
    r = c.post("/api/auth/login", json={"display_name": "Mom", "pin": "5678"})
    assert r.status_code == 200, "Participant login failed"

    # 2. As a participant: Submit a prediction
    r = c.post("/api/predictions", json={
        "question_id": question_id,
        "answer": "Yes"
    })
    assert r.status_code in (200, 201), f"Participant failed to submit prediction: {r.status_code}"

    # Edit the prediction
    r = c.post("/api/predictions", json={
        "question_id": question_id,
        "answer": "No"
    })
    assert r.status_code in (200, 201), "Participant failed to edit prediction"

    # 4. & 5. Verify match API payload for 'Z'
    r = c.get(f"/api/matches/{match_id}")
    match_data = r.get_json()
    assert match_data["kickoff_time"].endswith("Z"), f"Kickoff time missing Z: {match_data['kickoff_time']}"

    print("ALL MANUAL VERIFICATIONS PASSED")
