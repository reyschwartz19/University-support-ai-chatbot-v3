import os
from app import create_app, db

def run_migration():
    """Create the new database tables without dropping existing ones."""
    print("Starting migration to create StudentRequest and BlockedDate tables...")
    app = create_app()
    with app.app_context():
        # create_all only creates tables that don't exist yet
        db.create_all()
        print("Migration complete. Tables created successfully.")

if __name__ == '__main__':
    run_migration()
