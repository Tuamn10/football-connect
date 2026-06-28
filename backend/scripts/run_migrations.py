import os
import sys
from sqlalchemy import text
from app.db.session import SessionLocal

def run_migration():
    db = SessionLocal()
    scripts_dir = os.path.dirname(__file__)
    
    sql_files = [f for f in os.listdir(scripts_dir) if f.endswith('.sql')]
    sql_files.sort() # Ensure deterministic order if numbering is used
    
    try:
        for sql_file in sql_files:
            file_path = os.path.join(scripts_dir, sql_file)
            print(f"Applying migration: {sql_file}")
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            print(f"Executing: {sql_file}")
            db.execute(text(content))
                
        db.commit()
        print("All migrations applied successfully.")
    except Exception as e:
        db.rollback()
        print("Error applying migration:", e)
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
