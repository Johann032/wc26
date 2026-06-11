from sqlalchemy.exc import IntegrityError

from app.extensions import db


def is_unique_violation(exc):
  return isinstance(exc, IntegrityError) and "UNIQUE" in str(exc.orig).upper()

def rollback():
  db.session.rollback()
