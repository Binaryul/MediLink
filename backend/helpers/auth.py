import json
import random
import string

from werkzeug.security import check_password_hash, generate_password_hash
from helpers.db import get_db, ROLE_ID_COLUMN

def login_user(email:str, password:str, role: str):
    db = get_db()

    table_map = {
        "patient": "Patients",
        "doctor": "Doctors",
        "pharmacist": "Pharmacies"
    }

    table = table_map.get(role)
    if not table:
        return None
    
    user = db.execute(
        f"SELECT * FROM {table} WHERE email = ?", (email,)
    ).fetchone()

    if user and check_password_hash(user["PasswordHash"], password):
        return dict(user)
    return None


def _name_prefix(_: str) -> str:
    return "".join(random.choice(string.ascii_uppercase) for _ in range(2))


def _next_user_id(table: str, id_column: str, prefix: str) -> str:
    db = get_db()
    row = db.execute(
        f"""
        SELECT MAX(CAST(SUBSTR({id_column}, 3) AS INTEGER)) AS max_num
        FROM {table}
        WHERE {id_column} LIKE ?
        """,
        (f"{prefix}%",),
    ).fetchone()
    next_num = (row["max_num"] or 0) + 1
    return f"{prefix}{next_num:05d}"


def _doctor_exists(doctor_id: str) -> bool:
    db = get_db()
    row = db.execute(
        "SELECT 1 FROM Doctors WHERE doctorID = ? LIMIT 1",
        (doctor_id,),
    ).fetchone()
    return row is not None


def register_user(data: dict, role: str):
    table_map = {
        "patient": "Patients",
        "doctor": "Doctors",
        "pharmacist": "Pharmacies",
    }
    table = table_map.get(role)
    if not table:
        return None, "Invalid role", 400

    name = data.get("Name")
    email = data.get("Email")
    password = data.get("Password")

    if role == "patient":
        if not _doctor_exists(data.get("doctorID")):
            return None, "Invalid doctorID", 400

    db = get_db()
    existing = db.execute(
        f"SELECT 1 FROM {table} WHERE Email = ? LIMIT 1",
        (email,),
    ).fetchone()
    if existing:
        return None, "Email already registered", 409

    prefix = _name_prefix(name)
    id_column = ROLE_ID_COLUMN[role]
    user_id = _next_user_id(table, id_column, prefix)
    password_hash = generate_password_hash(password)

    if role == "patient":
        patient_history = data.get("PatientHistory")
        if patient_history is None:
            patient_history = json.dumps({})
        elif not isinstance(patient_history, str):
            patient_history = json.dumps(patient_history)
        insert_columns = ["patientID", "Name", "Email", "PasswordHash", "PatientHistory", "DOB"]
        insert_values = [
            user_id,
            name,
            email,
            password_hash,
            patient_history,
            data.get("DOB"),
        ]
    elif role == "doctor":
        insert_columns = ["doctorID", "Name", "Email", "PasswordHash", "Specialisation"]
        insert_values = [
            user_id,
            name,
            email,
            password_hash,
            data.get("Specialisation"),
        ]
    else:
        insert_columns = ["pharmID", "Email", "PasswordHash", "Name"]
        insert_values = [
            user_id,
            email,
            password_hash,
            name,
        ]

    placeholders = ", ".join(["?"] * len(insert_columns))
    try:
        db.execute(
            f"INSERT INTO {table} ({', '.join(insert_columns)}) VALUES ({placeholders})",
            insert_values,
        )
        if role == "patient":
            db.execute(
                """
                INSERT INTO DPEnrole (doctorID, patientID, msgHistory)
                VALUES (?, ?, ?)
                """,
                (data.get("doctorID"), user_id, json.dumps([])),
            )
        db.commit()
    except Exception:
        db.rollback()
        return None, "Registration failed", 500

    safe_user = {k: v for k, v in zip(insert_columns, insert_values) if k != "PasswordHash"}
    return safe_user, None, 201
