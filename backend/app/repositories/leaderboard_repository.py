from datetime import datetime

from app.extensions import db
from app.models.match import Match
from app.models.prediction import Prediction
from app.models.prediction_question import PredictionQuestion
from app.models.user import User


class LeaderboardRepository:
    @staticmethod
    def get_leaderboard(tournament_id):
        users = User.query.filter_by(active=True).all()
        entries = []

        for user in users:
            stats = LeaderboardRepository._user_stats(user.id, tournament_id)

            entries.append({
                "user_id": user.id,
                "display_name": user.display_name,
                "total_points": stats["total_points"],
                "exact_predictions": stats["exact_predictions"],
                "correct_predictions": stats["correct_predictions"],
                "earliest_submission": stats["earliest_submission"],
            })

        entries.sort(
            key=lambda e: (
                -e["total_points"],
                -e["exact_predictions"],
                -e["correct_predictions"],
                e["earliest_submission"] or datetime.max,
            )
        )

        for index, entry in enumerate(entries):
            entry["rank"] = index + 1
            entry.pop("earliest_submission", None)

        return entries

    @staticmethod
    def _user_stats(user_id, tournament_id):
        predictions = (
            db.session.query(Prediction, PredictionQuestion)
            .join(
                PredictionQuestion,
                Prediction.question_id == PredictionQuestion.id,
            )
            .join(
                Match,
                PredictionQuestion.match_id == Match.id,
            )
            .filter(
                Prediction.user_id == user_id,
                Match.tournament_id == tournament_id,
            )
            .all()
        )

        total_points = 0
        exact_predictions = 0
        correct_predictions = 0
        earliest = None

        for prediction, question in predictions:
            total_points += prediction.awarded_points or 0

            if (
                prediction.awarded_points == question.point_value
                and question.point_value > 0
            ):
                correct_predictions += 1

                if question.question_type == "exact_score":
                    exact_predictions += 1

            if prediction.submitted_at:
                if earliest is None or prediction.submitted_at < earliest:
                    earliest = prediction.submitted_at

        return {
            "total_points": total_points,
            "exact_predictions": exact_predictions,
            "correct_predictions": correct_predictions,
            "earliest_submission": earliest,
        }