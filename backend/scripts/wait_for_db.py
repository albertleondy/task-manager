import os
import sys
import time
import psycopg2


def wait_for_postgres(url: str, max_retries: int = 30, delay: int = 1) -> bool:
    print("Checking PostgreSQL database connectivity...")
    for attempt in range(1, max_retries + 1):
        try:
            conn = psycopg2.connect(url)
            conn.close()
            print(f"Successfully connected to PostgreSQL on attempt {attempt}!")
            return True
        except Exception as exc:
            print(f"Waiting for database (attempt {attempt}/{max_retries}): {exc}")
            time.sleep(delay)
    return False


def main():
    raw_url = os.environ.get("DATABASE_URL", "")
    # Normalize SQLAlchemy driver URLs (e.g. postgresql+psycopg2://) for libpq/psycopg2
    db_url = raw_url
    if "+psycopg2" in db_url:
        db_url = db_url.replace("+psycopg2", "")
    elif "+psycopg" in db_url:
        db_url = db_url.replace("+psycopg", "")

    if db_url.startswith("postgresql://") or db_url.startswith("postgres://"):
        if not wait_for_postgres(db_url):
            print("Database connection failed after maximum retries.", file=sys.stderr)
            sys.exit(1)
    else:
        print("Non-PostgreSQL database configured; skipping connectivity check.")


if __name__ == "__main__":
    main()
