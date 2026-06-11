import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


class Config:
  SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
  db_url = os.environ.get(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'tournament.db')}",
  )
  if db_url.startswith("postgres://"):
      db_url = db_url.replace("postgres://", "postgresql://", 1)
  SQLALCHEMY_DATABASE_URI = db_url
  SQLALCHEMY_TRACK_MODIFICATIONS = False
  CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
  PERMANENT_SESSION_LIFETIME = timedelta(days=7)
  SESSION_COOKIE_SAMESITE = "None"
  SESSION_COOKIE_SECURE = True
  SESSION_COOKIE_HTTPONLY = True
