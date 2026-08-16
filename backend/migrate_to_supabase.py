"""
One-time migration script: SQLite (mental_wellness.db) → Supabase PostgreSQL.

Usage:
    cd backend
    python migrate_to_supabase.py

This script reads all data from the local SQLite database and inserts it into
the Supabase PostgreSQL database configured via PG* environment variables.
Tables are created automatically by create_all() if they don't exist.
"""

import os
import sys
import sqlite3
from dotenv import load_dotenv

# Load .env from backend/ directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, '.env'))

# Verify PG* vars are set
pghost = os.environ.get('PGHOST')
if not pghost:
    print("ERROR: PGHOST not set in environment. Configure .env with Supabase credentials.")
    sys.exit(1)

from app import create_app
from app.models import db

app = create_app()

SQLITE_DB = os.path.join(backend_dir, 'mental_wellness.db')

if not os.path.exists(SQLITE_DB):
    print(f"ERROR: SQLite database not found at {SQLITE_DB}")
    sys.exit(1)

# Tables to migrate, in dependency order (parents before children)
TABLES = [
    'user',
    'friend_request',
    'friendships',
    'doctor',
    'doctor_patients',
    'mood_entry',
    'article',
    'article_like',
    'article_comment',
    'article_read',
    'journal',
    'journal_heart',
    'journal_comment',
    'clinic_review',
    'booking',
    'chat_request',
    'chat_thread',
    'message',
    'notification',
    'donation',
]


def get_sqlite_tables(sqlite_conn):
    """Get list of tables that actually exist in the SQLite database."""
    cursor = sqlite_conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    return [row[0] for row in cursor.fetchall()]


def get_columns(sqlite_conn, table_name):
    """Get column names for a SQLite table."""
    cursor = sqlite_conn.execute(f"PRAGMA table_info('{table_name}')")
    return [row[1] for row in cursor.fetchall()]


def get_pg_columns(pg_engine, table_name):
    """Get column names for a PostgreSQL table."""
    from sqlalchemy import text
    with pg_engine.connect() as conn:
        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            f"WHERE table_name = :table_name"
        ), {"table_name": table_name})
        return [row[0] for row in result.fetchall()]


def migrate_table(sqlite_conn, pg_engine, table_name):
    """Migrate a single table from SQLite to PostgreSQL."""
    from sqlalchemy import text

    # Get columns present in both databases
    sqlite_cols = get_columns(sqlite_conn, table_name)
    try:
        pg_cols = get_pg_columns(pg_engine, table_name)
    except Exception:
        print(f"  ⚠ Table '{table_name}' does not exist in PostgreSQL, skipping")
        return 0

    # Only migrate columns that exist in both
    common_cols = [c for c in sqlite_cols if c in pg_cols]
    if not common_cols:
        print(f"  ⚠ No common columns for '{table_name}', skipping")
        return 0

    # Read all rows from SQLite
    cols_str = ', '.join(common_cols)
    cursor = sqlite_conn.execute(f"SELECT {cols_str} FROM {table_name}")
    rows = cursor.fetchall()

    if not rows:
        print(f"  ⊘ '{table_name}' is empty, nothing to migrate")
        return 0

    # Insert into PostgreSQL
    placeholders = ', '.join(f":{c}" for c in common_cols)
    insert_sql = text(f"INSERT INTO {table_name} ({cols_str}) VALUES ({placeholders})")

    inserted = 0
    with pg_engine.connect() as conn:
        for row in rows:
            row_dict = dict(zip(common_cols, row))
            try:
                conn.execute(insert_sql, row_dict)
                inserted += 1
            except Exception as e:
                # Skip duplicates (e.g., if re-running migration)
                if 'duplicate' in str(e).lower() or 'unique' in str(e).lower():
                    continue
                else:
                    print(f"  ⚠ Error inserting row into '{table_name}': {e}")
                    continue
        conn.commit()

    return inserted


def reset_sequence(pg_engine, table_name):
    """Reset the auto-increment sequence for a PostgreSQL table after data import."""
    from sqlalchemy import text
    try:
        with pg_engine.connect() as conn:
            # Check if the table has an 'id' column with a sequence
            result = conn.execute(text(
                f"SELECT pg_get_serial_sequence('{table_name}', 'id')"
            ))
            seq = result.scalar()
            if seq:
                conn.execute(text(
                    f"SELECT setval('{seq}', COALESCE((SELECT MAX(id) FROM {table_name}), 1))"
                ))
                conn.commit()
    except Exception:
        pass  # Table may not have a serial 'id' column


def main():
    print("=" * 60)
    print("SQLite → Supabase PostgreSQL Migration")
    print("=" * 60)
    print(f"\nSource:  {SQLITE_DB}")
    print(f"Target:  postgresql://{os.environ.get('PGUSER')}@{pghost}:{os.environ.get('PGPORT', '5432')}/{os.environ.get('PGDATABASE', 'postgres')}")
    print()

    # Connect to SQLite
    sqlite_conn = sqlite3.connect(SQLITE_DB)
    existing_tables = get_sqlite_tables(sqlite_conn)
    print(f"SQLite tables found: {', '.join(existing_tables)}\n")

    with app.app_context():
        # Ensure all tables exist in PostgreSQL
        print("Creating PostgreSQL tables (if not exist)...")
        db.create_all()
        print("Done.\n")

        engine = db.get_engine()

        total_migrated = 0
        for table_name in TABLES:
            if table_name not in existing_tables:
                print(f"  ⊘ '{table_name}' not in SQLite, skipping")
                continue

            count = migrate_table(sqlite_conn, engine, table_name)
            if count > 0:
                print(f"  ✓ '{table_name}': {count} rows migrated")
                reset_sequence(engine, table_name)
                total_migrated += count

    sqlite_conn.close()

    print(f"\n{'=' * 60}")
    print(f"Migration complete! Total rows migrated: {total_migrated}")
    print(f"{'=' * 60}")
    print("\nNext steps:")
    print("  1. Check Supabase Dashboard → Table Editor to verify data")
    print("  2. Run: python run.py")
    print("  3. Test endpoints against http://localhost:5060/api")


if __name__ == '__main__':
    main()
