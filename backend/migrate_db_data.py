import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.tournament import Tournament
from app.models.match import Match
from app.models.prediction_question import PredictionQuestion
from app.models.prediction import Prediction

def migrate_data():
    app = create_app()
    with app.app_context():
        # Source Database (SQLite)
        BASE_DIR = os.path.abspath(os.path.dirname(__file__))
        sqlite_db_path = os.path.join(BASE_DIR, 'instance', 'tournament.db')
        sqlite_engine = create_engine(f"sqlite:///{sqlite_db_path}")
        
        # Target Database (PostgreSQL) - uses app.config['SQLALCHEMY_DATABASE_URI']
        target_engine = db.engine
        
        if "sqlite" in str(target_engine.url):
            print("ERROR: Target database is still SQLite. Please set DATABASE_URL to a PostgreSQL connection string before running this script.")
            return

        print("Creating tables in PostgreSQL...")
        db.create_all()

        print("Starting data migration...")
        
        # Table insertion order to respect foreign keys
        tables_order = [
            ("users", User),
            ("tournaments", Tournament),
            ("matches", Match),
            ("prediction_questions", PredictionQuestion),
            ("predictions", Prediction)
        ]

        SessionSource = sessionmaker(bind=sqlite_engine)
        SessionTarget = sessionmaker(bind=target_engine)

        source_session = SessionSource()
        target_session = SessionTarget()

        try:
            for table_name, model_class in tables_order:
                print(f"Migrating table {table_name}...")
                
                # Fetch all records from source
                records = source_session.query(model_class).all()
                
                # Make instances transient so they can be added to new session
                from sqlalchemy.orm import make_transient
                for record in records:
                    make_transient(record)
                    # We might need to ensure relationships aren't eagerly loaded and attached,
                    # but simple models usually copy over fine this way.
                    target_session.add(record)
                    
                target_session.commit()
                print(f"  -> Migrated {len(records)} records for {table_name}.")

            print("Migration completed successfully!")
            
            # Update Postgres sequences for auto-incrementing primary keys
            print("Updating PostgreSQL sequences...")
            with target_engine.connect() as conn:
                for table_name, _ in tables_order:
                    # In Postgres, sequence name is usually table_id_seq
                    try:
                        conn.execute(text(f"SELECT setval('{table_name}_id_seq', (SELECT MAX(id) FROM {table_name}));"))
                        conn.commit()
                    except Exception as e:
                        print(f"  -> Note: Could not update sequence for {table_name} (might not be an integer PK). Error: {e}")
                        
            print("PostgreSQL sequences updated.")

        except Exception as e:
            target_session.rollback()
            print(f"An error occurred during migration: {e}")
        finally:
            source_session.close()
            target_session.close()

if __name__ == "__main__":
    migrate_data()
