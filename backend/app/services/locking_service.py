from app.extensions import db
from app.models.prediction_question import PredictionQuestion
from app.repositories.match_repository import MatchRepository
from app.utils.time import ensure_utc, server_now
from datetime import timedelta


class LockingService:
  def sync_locks_for_match(self, match_id):
    match = MatchRepository.get_by_id(match_id)
    if not match:
      return

    kickoff = ensure_utc(match.kickoff_time)
    lock_time = kickoff - timedelta(minutes=5)
    should_lock = server_now() >= lock_time or match.status.lower() in ("live", "finished")

    questions = PredictionQuestion.query.filter_by(match_id=match_id).all()
    changed = False
    for question in questions:
      if should_lock and not question.locked:
        question.locked = True
        changed = True
      elif not should_lock and question.locked:
        question.locked = False
        changed = True

    if changed:
      db.session.commit()

  def sync_all_locks(self):
    matches = MatchRepository.get_all()
    for match in matches:
      self.sync_locks_for_match(match.id)

  def is_question_locked(self, question):
    match = MatchRepository.get_by_id(question.match_id)
    if not match:
      return True
      
    if match.status.lower() in ("live", "finished"):
      return True
      
    kickoff = ensure_utc(match.kickoff_time)
    lock_time = kickoff - timedelta(minutes=5)
    return server_now() >= lock_time

  def ensure_question_lock_state(self, question, commit=False):
    locked = self.is_question_locked(question)
    if question.locked != locked:
      question.locked = locked
      if commit:
        db.session.commit()
      else:
        db.session.flush()
    return locked
