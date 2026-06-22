from app import create_app
from app.extensions import db
from app.models.spotlight_question import SpotlightQuestion
from app.models.tournament import Tournament
from datetime import datetime

app = create_app()

with app.app_context():
    # Find active tournament
    t = Tournament.query.first()
    if not t:
        print("No tournament found!")
        exit(1)
        
    # Clear existing spotlight questions for this tournament
    SpotlightQuestion.query.filter_by(tournament_id=t.id).delete()
    
    q1 = SpotlightQuestion(
        tournament_id=t.id,
        title="🏆 Predict The World Cup Final",
        description="Predict the exact TWO teams that will play in the final.\n\nSelect EXACTLY 2 teams.",
        question_type="standard",
        num_selections=2,
        options_json=["Argentina", "Brazil", "France", "England", "Spain", "Germany", "Portugal", "Netherlands", "Italy", "Belgium", "Uruguay", "Croatia", "Morocco", "USA", "Colombia"],
        max_points=15,
        locked=False,
        lock_time=datetime(2026, 7, 1)
    )
    
    q2 = SpotlightQuestion(
        tournament_id=t.id,
        title="🌟 THE ORACLE'S PROPHECY",
        description="Predict the exact four semi-finalists.\n\nSelect EXACTLY 4 teams.",
        question_type="standard",
        num_selections=4,
        options_json=["Argentina", "Brazil", "France", "England", "Spain", "Germany", "Portugal", "Netherlands", "Italy", "Belgium", "Uruguay", "Croatia", "Morocco", "USA", "Colombia"],
        max_points=15,
        locked=False,
        lock_time=datetime(2026, 7, 1)
    )
    
    q3 = SpotlightQuestion(
        tournament_id=t.id,
        title="👑 THE CROWN OF PROPHECY",
        description="Predict ALL THREE of the following:\n1. FIFA World Cup Champion\n2. Golden Boot Winner\n3. Golden Ball Winner\n\nSelect exactly one answer for each category.",
        question_type="categorical",
        num_selections=3,
        options_json={
            "FIFA World Cup Champion": ["Argentina", "Brazil", "France", "England", "Spain", "Germany", "Portugal", "Netherlands"],
            "Golden Boot Winner": ["Messi", "Mbappe", "Kane", "Vinicius Jr", "Bellingham", "Gakpo", "Morata", "Haaland"],
            "Golden Ball Winner": ["Messi", "Mbappe", "De Bruyne", "Rodri", "Bellingham", "Pedri", "Musiala", "Neymar"]
        },
        max_points=15,
        locked=False,
        lock_time=datetime(2026, 7, 1)
    )
    
    db.session.add(q1)
    db.session.add(q2)
    db.session.add(q3)
    db.session.commit()
    
    print("Seeded Oracle questions successfully!")
