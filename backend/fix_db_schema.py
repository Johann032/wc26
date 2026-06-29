import os
import json
from sqlalchemy import text
from app import create_app
from app.extensions import db

def fix_schema():
    app = create_app()
    with app.app_context():
        try:
            print("--- CURRENT PRODUCTION SCHEMA ---")
            is_postgres = "postgresql" in str(db.engine.url)
            
            if is_postgres:
                # Execute the exact requested query
                result = db.session.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'spotlight_questions';"))
                columns = [dict(row._mapping) for row in result]
                print(json.dumps(columns, indent=2))
            else:
                print("Not connected to Postgres. Connected to: ", db.engine.url)
            
            print("\n--- APPLYING FIX ---")
            if is_postgres:
                db.session.execute(text("ALTER TABLE spotlight_questions ADD COLUMN description TEXT;"))
                db.session.commit()
                print("Successfully added 'description' column!")
            else:
                print("Skipping fix on non-postgres db.")
        except Exception as e:
            db.session.rollback()
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("Column 'description' already exists. No action needed.")
            else:
                print(f"Error executing schema fix: {e}")

if __name__ == "__main__":
    fix_schema()
