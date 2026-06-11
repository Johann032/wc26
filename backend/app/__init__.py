from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.config import Config
from app.extensions import db
from app.api import register_blueprints
from app.utils.db_errors import is_unique_violation, rollback


def create_app(config_class=Config):
  app = Flask(__name__)
  app.config.from_object(config_class)

  CORS(
    app,
    resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
    supports_credentials=True,
  )

  db.init_app(app)
  register_blueprints(app)

  with app.app_context():
    from app.migrate import run_migrations
    run_migrations()

  @app.route("/api/health")
  def health():
    return {"status": "ok"}

  @app.errorhandler(IntegrityError)
  def handle_integrity_error(exc):
    rollback()
    if is_unique_violation(exc):
      return jsonify({"error": "A record with that value already exists"}), 400
    return jsonify({"error": "Database constraint violation"}), 400

  @app.errorhandler(SQLAlchemyError)
  def handle_db_error(exc):
    rollback()
    return jsonify({"error": "Database error"}), 500

  @app.errorhandler(Exception)
  def handle_unexpected_error(exc):
    if app.debug:
      raise exc
    return jsonify({"error": "Internal server error"}), 500

  return app
