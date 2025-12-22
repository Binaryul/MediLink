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