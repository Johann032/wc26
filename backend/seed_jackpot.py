from app import create_app
from app.extensions import db
from app.models.spotlight_question import SpotlightQuestion
from app.models.tournament import Tournament
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

app = create_app()

with app.app_context():
    # Ensure description column exists in case the user hasn't migrated their database
    try:
        db.session.execute(text("SELECT description FROM spotlight_questions LIMIT 1"))
    except OperationalError:
        # Catch exception and add column safely
        db.session.execute(text("ALTER TABLE spotlight_questions ADD COLUMN description TEXT"))
        db.session.commit()
        print("Migrated spotlight_questions table to include description column.")

    # Find active tournament
    t = Tournament.query.first()
    if not t:
        print("No tournament found!")
        exit(1)
        
    # Clear existing spotlight questions for this tournament
    SpotlightQuestion.query.filter_by(tournament_id=t.id).delete()
    
    q1 = SpotlightQuestion(
        tournament_id=t.id,
        title="🏆 Who will play in the FIFA World Cup Final?",
        description="Select EXACTLY 2 teams.",
        question_type="standard",
        num_selections=2,
        options_json=["Argentina", "Brazil", "France", "England", "Spain", "Germany", "Portugal", "Netherlands", "Italy", "Belgium", "Uruguay", "Croatia", "Morocco", "USA", "Colombia"],
        max_points=15,
        locked=False,
        lock_time=datetime(2026, 7, 1)
    )
    
    q2 = SpotlightQuestion(
        tournament_id=t.id,
        title="🌟 Which FOUR teams will qualify for the Semi-Finals?",
        description="Select EXACTLY 4 teams.",
        question_type="standard",
        num_selections=4,
        options_json=["Argentina", "Brazil", "France", "England", "Spain", "Germany", "Portugal", "Netherlands", "Italy", "Belgium", "Uruguay", "Croatia", "Morocco", "USA", "Colombia"],
        max_points=15,
        locked=False,
        lock_time=datetime(2026, 7, 1)
    )
    
    q3 = SpotlightQuestion(
        tournament_id=t.id,
        title="👑 Predict ALL THREE",
        description="* FIFA World Cup Winner\n* Golden Boot Winner\n* Golden Ball Winner",
        question_type="categorical",
        num_selections=3,
        options_json={
            "FIFA World Cup Winner": ["Argentina", "Brazil", "France", "England", "Spain", "Germany", "Portugal", "Netherlands"],
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
    
    print("Seeded World Cup Jackpot questions successfully!")
