import sqlite3
from pathlib import Path
from flask import g # Flask's application context global

BASE_DIR = Path(__file__).resolve().parent.parent # Directory of the current file
DB_PATH = BASE_DIR.parent / "database" / "MediLink.db" 

print(DB_PATH.resolve())



def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row # Enable dictionary-like row access
        g.db.execute("PRAGMA foreign_keys = ON;")
    return g.db 


def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def user_info(email, role):
    db = get_db()

    table_map = {
        "patient": "Patients",
        "doctor": "Doctors",
        "pharmacist": "Pharmacies"
    }

    table = table_map.get(role) # No need to check for invalid role here since it's handled upstream

    user = db.execute(
        f"SELECT * FROM {table} WHERE email = ?", (email,)
    ).fetchone()

    safe_user = {k:v for k, v in user.items() if k != "PasswordHash"}

    # No need to recheck for password here since this function is called only after successful login

    return dict(safe_user) if safe_user else None