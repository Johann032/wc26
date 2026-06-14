from app import create_app
from app.models.match import Match
from app.services.locking_service import LockingService
from app.utils.time import server_now, ensure_utc

app = create_app()
with app.app_context():
    m = Match.query.first()
    if m:
        print(f"Status: {m.status}")
        print(f"Kickoff: {m.kickoff_time}")
        print(f"Kickoff (UTC): {ensure_utc(m.kickoff_time)}")
        print(f"Server Now: {server_now()}")
        ls = LockingService()
        class Q:
            pass
        q = Q()
        q.match_id = m.id
        print(f"Is Locked: {ls.is_question_locked(q)}")
    else:
        print("No matches found.")
