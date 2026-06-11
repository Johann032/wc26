from app.api.auth import auth_bp
from app.api.tournaments import tournaments_bp
from app.api.users import users_bp
from app.api.matches import matches_bp
from app.api.questions import questions_bp
from app.api.predictions import predictions_bp
from app.api.leaderboard import leaderboard_bp
from app.api.admin import admin_bp


def register_blueprints(app):
  app.register_blueprint(auth_bp, url_prefix="/api/auth")
  app.register_blueprint(tournaments_bp, url_prefix="/api/tournaments")
  app.register_blueprint(users_bp, url_prefix="/api/users")
  app.register_blueprint(matches_bp, url_prefix="/api/matches")
  app.register_blueprint(questions_bp, url_prefix="/api/questions")
  app.register_blueprint(predictions_bp, url_prefix="/api/predictions")
  app.register_blueprint(leaderboard_bp, url_prefix="/api/leaderboard")
  app.register_blueprint(admin_bp, url_prefix="/api/admin")
