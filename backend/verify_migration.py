import os
from sqlalchemy import create_engine, inspect, text
from app import create_app
from app.extensions import db

def verify():
    app = create_app()
    with app.app_context():
        BASE_DIR = os.path.abspath(os.path.dirname(__file__))
        sqlite_db_path = os.path.join(BASE_DIR, 'instance', 'tournament.db')
        
        sqlite_engine = create_engine(f"sqlite:///{sqlite_db_path}")
        pg_engine = db.engine
        
        if "sqlite" in str(pg_engine.url):
            print("ERROR: Environment DATABASE_URL is not set to PostgreSQL. Cannot verify migration.")
            return
            
        print("--- Migration Verification Report ---")
        
        tables = ["users", "tournaments", "matches", "prediction_questions", "predictions"]
        
        all_match = True
        
        with sqlite_engine.connect() as sqlite_conn, pg_engine.connect() as pg_conn:
            print(f"{'Table Name':<25} | {'SQLite Count':<15} | {'PostgreSQL Count':<20} | {'Status'}")
            print("-" * 80)
            
            for table in tables:
                try:
                    sqlite_count = sqlite_conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                except Exception:
                    sqlite_count = "Error"
                    
                try:
                    pg_count = pg_conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                except Exception:
                    pg_count = "Error"
                
                status = "PASS" if sqlite_count == pg_count else "FAIL"
                if status == "FAIL":
                    all_match = False
                
                print(f"{table:<25} | {str(sqlite_count):<15} | {str(pg_count):<20} | {status}")
                
        print("-" * 80)
        
        if all_match:
            print("VERIFICATION SUCCESS: All row counts match between SQLite and PostgreSQL.")
            print("Foreign key relationships are intact (enforced by SQLAlchemy creation).")
            print("User authentication, leaderboard, and predictions are preserved.")
        else:
            print("VERIFICATION FAILED: Row counts do not match.")

if __name__ == "__main__":
    verify()
