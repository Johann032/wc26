import os
from sqlalchemy import create_engine, inspect, text

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(BASE_DIR, 'instance', 'tournament.db')
engine = create_engine(f"sqlite:///{db_path}")

inspector = inspect(engine)
tables = inspector.get_table_names()

print("--- SQLite Verification Report ---")
print(f"Total Tables: {len(tables)}")

total_counts = {}

with engine.connect() as conn:
    for table in tables:
        count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
        total_counts[table] = count
        print(f"Table '{table}': {count} rows")

print("----------------------------------")
print(f"Total Users: {total_counts.get('users', 0)}")
print(f"Total Tournaments: {total_counts.get('tournaments', 0)}")
print(f"Total Matches: {total_counts.get('matches', 0)}")
print(f"Total Questions: {total_counts.get('prediction_questions', 0)}")
print(f"Total Predictions: {total_counts.get('predictions', 0)}")
