from app.repositories.match_repository import MatchRepository
from app.repositories.question_repository import QuestionRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.leaderboard_repository import LeaderboardRepository
from app.repositories.user_repository import UserRepository
from app.models.prediction import Prediction
from app.models.prediction_question import PredictionQuestion
from app.extensions import db


class MatchBreakdownService:
    def __init__(self, match_repository=None):
        self.match_repository = match_repository or MatchRepository()
        self.question_repository = QuestionRepository()
        self.prediction_repository = PredictionRepository()
        self.leaderboard_repository = LeaderboardRepository()

    def get_breakdown(self, match_id):
        match = self.match_repository.get_by_id(match_id)
        if not match:
            return None, "Match not found"

        if match.computed_status != "finished":
            return None, "Breakdown only available for finished matches"

        questions = self.question_repository.get_by_match(match_id)
        community_stats = []
        most_popular_pick = ""
        highest_pick_pct = 0
        biggest_upset = ""
        lowest_winning_pct = 100

        total_participants_set = set()
        user_points_map = {}

        for q in questions:
            predictions = self.prediction_repository.get_by_question(q.id)
            total = len(predictions)
            counts = {}

            for p in predictions:
                total_participants_set.add(p.user_id)
                ans = p.answer
                counts[ans] = counts.get(ans, 0) + 1

                # Track user points across all questions in the match
                if p.user_id not in user_points_map:
                    user_points_map[p.user_id] = 0
                if p.awarded_points:
                    user_points_map[p.user_id] += p.awarded_points

            percentages = {}
            if total > 0:
                for ans, count in counts.items():
                    pct = round((count / total) * 100)
                    percentages[ans] = pct

                    # Check for most popular pick overall
                    if pct > highest_pick_pct:
                        highest_pick_pct = pct
                        most_popular_pick = f"{ans} ({pct}%)"

                    # Check for biggest upset (lowest pct on a correct answer)
                    if q.correct_answer and ans.lower() == q.correct_answer.lower():
                        if pct < lowest_winning_pct:
                            lowest_winning_pct = pct
                            biggest_upset = f"{ans} ({pct}%)"

            community_stats.append({
                "question_id": q.id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "correct_answer": q.correct_answer,
                "total_participants": total,
                "percentages": percentages,
                "counts": counts
            })

        if lowest_winning_pct == 100:
            biggest_upset = "None"

        # Match Masters (Top 3 for this match specifically)
        # Find all active users
        users = UserRepository.get_all()
        user_map = {u.id: u.display_name for u in users}

        match_masters = []
        perfect_predictions_count = 0

        # Calculate max possible points for this match
        max_possible_points = 0
        if questions:
            # Assuming getting all correct is perfect
            # Actually, we can just find users who got everything right
            for uid, pts in user_points_map.items():
                if pts > 0:
                    match_masters.append({
                        "user_id": uid,
                        "display_name": user_map.get(uid, f"User {uid}"),
                        "points": pts
                    })
        
        # Sort match masters descending by points
        match_masters.sort(key=lambda x: -x["points"])
        
        # Identify perfect predictions (people who got > 0 points on all questions? Or just max points achieved?)
        if match_masters:
            max_points_achieved = match_masters[0]["points"]
            perfect_predictions_count = sum(1 for m in match_masters if m["points"] == max_points_achieved and max_points_achieved > 0)
            
        top_match_masters = match_masters[:3]

        # Fetch their actual predictions for UI display
        for master in top_match_masters:
            user_preds = self.prediction_repository.get_by_user_and_match(master["user_id"], match_id)
            master["predictions"] = [p.to_dict() for p in user_preds]

        # Biggest Movers
        leaderboard = self.leaderboard_repository.get_leaderboard(match.tournament_id)
        biggest_movers = []
        if leaderboard:
            valid_movers = [l for l in leaderboard if isinstance(l.get("movement"), int) and l["movement"] != 0]
            valid_movers.sort(key=lambda x: abs(x["movement"]), reverse=True)
            biggest_movers = [{"user_id": m["user_id"], "display_name": m["display_name"], "movement": m["movement"]} for m in valid_movers[:5]]

        match_facts = {
            "most_popular_pick": most_popular_pick or "N/A",
            "biggest_upset": biggest_upset or "N/A",
            "perfect_predictions": perfect_predictions_count,
            "total_participants": len(total_participants_set)
        }

        return {
            "community": community_stats,
            "match_masters": top_match_masters,
            "biggest_movers": biggest_movers,
            "match_facts": match_facts
        }, None
