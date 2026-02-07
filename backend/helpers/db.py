import sqlite3
from pathlib import Path
from flask import g

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR.parent / "database" / "MediLink.db"



def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
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

    table = table_map.get(role)
    id_column = ROLE_ID_COLUMN.get(role)

    user = db.execute(
        f"SELECT * FROM {table} WHERE {id_column} = ?", (userID,)
    ).fetchone()

    if not user and isinstance(userID, str) and "@" in userID:
        user = db.execute(
            f"SELECT * FROM {table} WHERE Email = ?", (userID,)
        ).fetchone()

    if not user:
        return None

    safe_user = {k:v for k, v in dict(user).items() if k != "PasswordHash"}

    return dict(safe_user)


UPDATEABLE_COLUMNS = {
    "Patients": {"Name", "Email", "PasswordHash", "PatientHistory"},
    "Doctors": {"Name", "Email", "PasswordHash", "Specialisation"},
    "Phamacies": {"Name", "Email", "PasswordHash"}
}

from typing import Any, Dict
def update_by_id(table: str, userID: str, updates: Dict[str,Any]):
    if table not in UPDATEABLE_COLUMNS:
        raise ValueError("Invalid table name") 
    
    allowed_columns = UPDATEABLE_COLUMNS[table]
    clean_update = {k:v for k,v in updates.items() if k in allowed_columns}
    
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

    return cur.rowcount


def is_doctor_enrolled(doctorID: str, patientID: str) -> bool:
    db = get_db()
    row = db.execute(
        """
        SELECT 1
        FROM DPEnrole
        WHERE doctorID = ? AND patientID = ?
        LIMIT 1
        """,
        (doctorID, patientID),
    ).fetchone()
    return row is not None
