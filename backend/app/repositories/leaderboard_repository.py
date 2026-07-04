from datetime import datetime

from app.extensions import db
from app.models.match import Match
from app.models.prediction import Prediction
from app.models.prediction_question import PredictionQuestion
from app.models.user import User


class LeaderboardRepository:
    @staticmethod
    def get_leaderboard(tournament_id):
        # Find the latest scored match's kickoff time
        latest_match = (
            db.session.query(Match)
            .join(PredictionQuestion)
            .filter(
                Match.tournament_id == tournament_id,
                PredictionQuestion.correct_answer.isnot(None),
                PredictionQuestion.correct_answer != ""
            )
            .order_by(Match.kickoff_time.desc())
            .first()
        )
        latest_kickoff_time = latest_match.kickoff_time if latest_match else None

        users = User.query.filter_by(active=True).all()
        entries = []

        for user in users:
            stats = LeaderboardRepository._user_stats(user.id, tournament_id, latest_kickoff_time)

            entries.append({
                "user_id": user.id,
                "display_name": user.display_name,
                "total_points": stats["total_points"],
                "exact_predictions": stats["exact_predictions"],
                "correct_predictions": stats["correct_predictions"],
                "incorrect_predictions": stats["incorrect_predictions"],
                "negative_predictions": stats["negative_predictions"],
                "earliest_submission": stats["earliest_submission"],
                "previous_total_points": stats["previous_total_points"],
                "previous_exact_predictions": stats["previous_exact_predictions"],
                "previous_correct_predictions": stats["previous_correct_predictions"],
                "previous_incorrect_predictions": stats["previous_incorrect_predictions"],
                "previous_negative_predictions": stats["previous_negative_predictions"],
                "previous_earliest_submission": stats["previous_earliest_submission"],
            })

        # Sort for previous rank
        entries.sort(
            key=lambda e: (
                -e["previous_total_points"],
                -e["previous_exact_predictions"],
                -e["previous_correct_predictions"],
                e["previous_earliest_submission"] or datetime.max,
            )
        )
        for index, entry in enumerate(entries):
            entry["previous_rank"] = index + 1

        # Sort for current rank
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
            entry["movement"] = entry["previous_rank"] - entry["rank"] if latest_kickoff_time else None
            # Cleanup internal fields
            entry.pop("earliest_submission", None)
            entry.pop("previous_total_points", None)
            entry.pop("previous_exact_predictions", None)
            entry.pop("previous_correct_predictions", None)
            entry.pop("previous_incorrect_predictions", None)
            entry.pop("previous_negative_predictions", None)
            entry.pop("previous_earliest_submission", None)
            entry.pop("previous_rank", None)

        return entries

    @staticmethod
    def _user_stats(user_id, tournament_id, latest_kickoff_time=None):
        predictions = (
            db.session.query(Prediction, PredictionQuestion, Match)
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

        stats = {
            "total_points": 0,
            "exact_predictions": 0,
            "correct_predictions": 0,
            "incorrect_predictions": 0,
            "negative_predictions": 0,
            "earliest_submission": None,
            "previous_total_points": 0,
            "previous_exact_predictions": 0,
            "previous_correct_predictions": 0,
            "previous_incorrect_predictions": 0,
            "previous_negative_predictions": 0,
            "previous_earliest_submission": None,
        }

        from app.services.scoring_service import ScoringService
        scoring_service = ScoringService()

        for prediction, question, match in predictions:
            pts = prediction.awarded_points or 0
            
            # Ensure it is properly evaluated and answered
            is_evaluated = bool(question.correct_answer and str(question.correct_answer).strip())
            is_answered = bool(prediction.answer and str(prediction.answer).strip())
            
            is_correct = False
            is_incorrect = False
            
            if is_evaluated and is_answered:
                max_pts = scoring_service.calculate_points(question, question.correct_answer)
                # Correct: Evaluated as fully correct (scored the maximum possible points)
                if max_pts > 0 and pts >= max_pts:
                    is_correct = True
                # Incorrect: Evaluated, incorrect (did not get max points), and received non-positive result
                elif pts <= 0:
                    is_incorrect = True
                    
            is_negative = pts < 0
            
            # Exact score is technically a subset of exactly matching the result
            is_exact = is_correct and question.question_type == "exact_score"
            sub_time = prediction.submitted_at

            # Current stats
            stats["total_points"] += pts
            if is_correct:
                stats["correct_predictions"] += 1
            if is_incorrect:
                stats["incorrect_predictions"] += 1
            if is_negative:
                stats["negative_predictions"] += 1
            if is_exact:
                stats["exact_predictions"] += 1
            if sub_time:
                if stats["earliest_submission"] is None or sub_time < stats["earliest_submission"]:
                    stats["earliest_submission"] = sub_time

            # Previous stats (exclude latest_kickoff_time)
            if latest_kickoff_time is None or match.kickoff_time != latest_kickoff_time:
                stats["previous_total_points"] += pts
                if is_correct:
                    stats["previous_correct_predictions"] += 1
                if is_incorrect:
                    stats["previous_incorrect_predictions"] += 1
                if is_negative:
                    stats["previous_negative_predictions"] += 1
                if is_exact:
                    stats["previous_exact_predictions"] += 1
                if sub_time:
                    if stats["previous_earliest_submission"] is None or sub_time < stats["previous_earliest_submission"]:
                        stats["previous_earliest_submission"] = sub_time

        return stats