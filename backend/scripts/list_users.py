"""List users from the database configured in .env (for login testing)."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine, text
from app.core.config import settings


def main():
    db_label = settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else settings.DATABASE_URL
    print(f"Database: {db_label}")

    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT id, full_name, email FROM user_contexts ORDER BY id")
        ).fetchall()

    if not rows:
        print("No users found.")
        return

    print(f"\n{len(rows)} user(s):\n")
    for user_id, name, email in rows:
        print(f"  [{user_id}] {name} <{email}>")


if __name__ == "__main__":
    main()
