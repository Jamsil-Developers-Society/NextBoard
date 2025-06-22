import sqlite3
from typing import Optional

DB_FILE = "server_database.db"

def initialize_database():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login_id TEXT NOT NULL UNIQUE,
        login_password TEXT NOT NULL,
        name TEXT NOT NULL UNIQUE
    )
    """)

    try:
        cursor.execute("""
            INSERT INTO users (login_id, login_password, name)
            VALUES (?, ?, ?)
        """, ("test", "asdf", "name"))
    except sqlite3.IntegrityError:
        pass

    conn.commit()
    conn.close()

def insert_user(login_id: str, login_password: str, name: str) -> bool:
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (login_id, login_password, name)
            VALUES (?, ?, ?)
        """, (login_id, login_password, name))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_user_by_login_id(login_id: str) -> Optional[dict]:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE login_id = ?", (login_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"id": row[0], "login_id": row[1], "login_password": row[2], "name": row[3]}
    return None