import os
from sqlalchemy import text
from app import create_app
from app.extensions import db

def fix_schema():
    app = create_app()
    with app.app_context():
        try:
            print("Checking schema...")
            # Check if Postgres or SQLite
            is_postgres = "postgresql" in str(db.engine.url)
            
            # Execute the ALTER TABLE statement
            if is_postgres:
                db.session.execute(text("ALTER TABLE spotlight_questions ADD COLUMN description TEXT;"))
            else:
                # SQLite syntax
                db.session.execute(text("ALTER TABLE spotlight_questions ADD COLUMN description TEXT;"))
                
            db.session.commit()
            print("Successfully added 'description' column to spotlight_questions table!")
        except Exception as e:
            db.session.rollback()
            if "already exists" in str(e) or "duplicate column name" in str(e):
                print("Column 'description' already exists. No action needed.")
            else:
                print(f"Error executing schema fix: {e}")

if __name__ == "__main__":
    fix_schema()
