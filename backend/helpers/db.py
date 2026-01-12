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


ROLE_ID_COLUMN = {
    "patient": "patientID",
    "doctor": "doctorID",
    "pharmacist": "pharmID"
}

TABLE_ID_COLUMN = {
    "Patients": "patientID",
    "Doctors": "doctorID",
    "Pharmacies": "pharmID"
}


def user_info(userID, role):
    db = get_db()

    table_map = {
        "patient": "Patients",
        "doctor": "Doctors",
        "pharmacist": "Pharmacies"
    }

    table = table_map.get(role) # No need to check for invalid role here since it's handled upstream
    id_column = ROLE_ID_COLUMN.get(role)

    user = db.execute(
        f"SELECT * FROM {table} WHERE {id_column} = ?", (userID,)
    ).fetchone()

    if not user and isinstance(userID, str) and "@" in userID: # Fallback to email lookup
        user = db.execute(
            f"SELECT * FROM {table} WHERE Email = ?", (userID,)
        ).fetchone()

    if not user:
        return None

    safe_user = {k:v for k, v in dict(user).items() if k != "PasswordHash"}

    # No need to recheck for password here since this function is called only after successful login

    return dict(safe_user)


UPDATEABLE_COLUMNS = {
    "Patients": {"Name", "Email", "PasswordHash", "PatientHistory"},
    "Doctors": {"Name", "Email", "PasswordHash", "Specialisation"},
    "Phamacies": {"Name", "Email", "PasswordHash"}
}

from typing import Any, Dict, Iterable
def update_by_id(table: str, userID: str, updates: Dict[str,Any]): # Force types on the inputs of the function
    if table not in UPDATEABLE_COLUMNS:
        raise ValueError("Invalid table name") 
    
    allowed_columns = UPDATEABLE_COLUMNS[table]
    clean_update = {k:v for k,v in updates.items() if k in allowed_columns} # Filter only allowed columns (array comprehension I also dont fully understand the syntax for)
    
    if not clean_update:
        raise ValueError("No valid columns to update")
    
    set_clause = ", ".join([f"{col} = ?" for col in clean_update.keys()])
    values = list(clean_update.values()) + [userID]

    db = get_db()
    id_column = TABLE_ID_COLUMN.get(table)
    if not id_column:
        raise ValueError("Invalid table name") 

    cur = db.execute(
        f"UPDATE {table} SET {set_clause} WHERE {id_column} = ?", values
    )
    db.commit()

    return cur.rowcount # Return number of rows updated and so I can detect "not found"


def update_by_email(table: str, email: str, updates: Dict[str,Any]): # Force types on the inputs of the function
    if table not in UPDATEABLE_COLUMNS:
        raise ValueError("Invalid table name") 
    
    allowed_columns = UPDATEABLE_COLUMNS[table]
    clean_update = {k:v for k,v in updates.items() if k in allowed_columns} # Filter only allowed columns (array comprehension I also dont fully understand the syntax for)
    
    if not clean_update:
        raise ValueError("No valid columns to update")
    
    set_clause = ", ".join([f"{col} = ?" for col in clean_update.keys()])
    values = list(clean_update.values()) + [email]

    db = get_db()
    cur = db.execute(
        f"UPDATE {table} SET {set_clause} WHERE Email = ?", values
    )
    db.commit()

    return cur.rowcount # Return number of rows updated and so I can detect "not found"