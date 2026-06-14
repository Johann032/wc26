"""Lightweight SQLite schema migration — adds missing columns without dropping data."""

import logging

from sqlalchemy import inspect, text

from app.extensions import db
from app.utils.security import hash_pin

logger = logging.getLogger(__name__)

MIGRATIONS = [
  ("users", "pin_hash", "VARCHAR(255)"),
  ("users", "display_name_lower", "VARCHAR(80)"),
  ("users", "is_admin", "BOOLEAN DEFAULT FALSE"),
  ("users", "force_pin_change", "BOOLEAN DEFAULT FALSE"),
  ("users", "updated_at", "DATETIME"),
  ("tournaments", "created_at", "DATETIME"),
  ("tournaments", "updated_at", "DATETIME"),
  ("matches", "created_at", "DATETIME"),
  ("matches", "updated_at", "DATETIME"),
  ("prediction_questions", "correct_answer", "VARCHAR(255)"),
  ("prediction_questions", "created_at", "DATETIME"),
  ("prediction_questions", "updated_at", "DATETIME"),
  ("predictions", "updated_at", "DATETIME"),
  ("predictions", "awarded_points", "INTEGER DEFAULT 0"),
]


def _column_exists(inspector, table, column):
  if table not in inspector.get_table_names():
    return False
  return column in {c["name"] for c in inspector.get_columns(table)}


def _index_exists(inspector, index_name):
  for table in inspector.get_table_names():
    if index_name in {idx["name"] for idx in inspector.get_indexes(table)}:
      return True
  return False


def _add_column(table, column, col_type):
  db.session.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
  db.session.commit()
  logger.info("Added column %s.%s", table, column)


def _migrate_pin_code_to_hash():
  inspector = inspect(db.engine)
  if not _column_exists(inspector, "users", "pin_code"):
    return
  if not _column_exists(inspector, "users", "pin_hash"):
    return

  rows = db.session.execute(
    text("SELECT id, pin_code, pin_hash FROM users WHERE pin_code IS NOT NULL")
  ).fetchall()

  for row in rows:
    if row.pin_hash:
      continue
    db.session.execute(
      text("UPDATE users SET pin_hash = :pin_hash WHERE id = :id"),
      {"pin_hash": hash_pin(row.pin_code), "id": row.id},
    )
  db.session.commit()
  logger.info("Migrated plaintext PINs to hashes")

  try:
    db.session.execute(text("UPDATE users SET pin_code = NULL"))
    db.session.commit()
  except Exception:
    rollback = db.session.rollback
    rollback()


def _backfill_display_name_lower():
  inspector = inspect(db.engine)
  if not _column_exists(inspector, "users", "display_name_lower"):
    return

  rows = db.session.execute(
    text("SELECT id, display_name, display_name_lower FROM users")
  ).fetchall()

  for row in rows:
    if row.display_name_lower:
      continue
    db.session.execute(
      text("UPDATE users SET display_name_lower = :lower WHERE id = :id"),
      {"lower": row.display_name.lower(), "id": row.id},
    )
  db.session.commit()


def _ensure_unique_display_name_index():
  inspector = inspect(db.engine)
  if not _column_exists(inspector, "users", "display_name_lower"):
    return
  if _index_exists(inspector, "ix_users_display_name_lower"):
    return
  try:
    db.session.execute(
      text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_display_name_lower ON users (display_name_lower)")
    )
    db.session.commit()
    logger.info("Created unique index on users.display_name_lower")
  except Exception as exc:
    db.session.rollback()
    logger.warning("Could not create unique index on display_name_lower: %s", exc)


def run_migrations():
  db.create_all()
  inspector = inspect(db.engine)

  for table, column, col_type in MIGRATIONS:
    if _column_exists(inspector, table, column):
      continue
    if table not in inspector.get_table_names():
      continue
    _add_column(table, column, col_type)
    inspector = inspect(db.engine)

  _migrate_pin_code_to_hash()
  _backfill_display_name_lower()
  _ensure_unique_display_name_index()
