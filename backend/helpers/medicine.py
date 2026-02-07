from typing import Any, Dict, Optional
import random
import string

from helpers.db import get_db


def _name_prefix(_: str) -> str:
    return "".join(random.choice(string.ascii_uppercase) for _ in range(2))


def _next_prescription_id(prefix: str) -> str:
    db = get_db()
    row = db.execute(
        """
        SELECT MAX(CAST(SUBSTR(prescriptionID, 3) AS INTEGER)) AS max_num
        FROM Prescriptions
        WHERE prescriptionID LIKE ?
        """,
        (f"{prefix}%",),
    ).fetchone()
    next_num = (row["max_num"] or 0) + 1
    return f"{prefix}{next_num:05d}"


def fetch_prescription_details(user_id: str, role: str, prescription_id: str) -> Optional[Dict[str, Any]]:
    db = get_db()
    # Get correct column based on role
    if role == "patient":
        role_column = "patientID"
    elif role == "doctor":
        role_column = "doctorID"
    elif role == "pharmacist":
        role_column = "pharmID"
    else:
        raise ValueError("Invalid role")

    row = db.execute(
        f"""
        SELECT *
        FROM Prescriptions
        WHERE prescriptionID = ? AND {role_column} = ?
        """,
        (prescription_id, user_id),
    ).fetchone()

    if row is None:
        return None

    result = dict(row)
    # Remove sensitive fields based on role
    if role == "doctor":
        result.pop("CollectionCode", None)
    elif role == "pharmacist":
        result.pop("patientID", None)
        result.pop("doctorID", None)

    return result


def create_prescription(data: Dict[str, Any]) -> None:
    prescription_id = data.get("prescriptionID")
    if not prescription_id:
        name_seed = data.get("MedicineName") or "RX"
        prefix = _name_prefix(name_seed)
        prescription_id = _next_prescription_id(prefix)

    collection_code = data.get("CollectionCode")
    if not collection_code:
        collection_code = f"{random.randint(0, 999999):06d}"

    db = get_db()
    db.execute(
        """
        INSERT INTO Prescriptions (
            patientID,
            prescriptionID,
            doctorID,
            pharmID,
            MedicineName,
            Instructions,
            DatePrescribed,
            DurationType,
            CollectionCode
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data.get("patientID"),
            prescription_id,
            data.get("doctorID"),
            data.get("pharmID"),
            data.get("MedicineName"),
            data.get("Instructions"),
            data.get("DatePrescribed"),
            data.get("DurationType"),
            collection_code,
        ),
    )
    db.commit()


def delete_prescription_if_collectable(prescription_id: str, pharm_id: str, collection_code: str) -> bool:
    db = get_db()
    row = db.execute(
        """
        SELECT DurationType, CollectionCode
        FROM Prescriptions
        WHERE prescriptionID = ? AND pharmID = ?
        """,
        (prescription_id, pharm_id),
    ).fetchone()

    if row is None:
        return False

    if row["CollectionCode"] != collection_code:
        return False

    if row["DurationType"] != "Temporary":
        new_code = f"{random.randint(0, 999999):06d}"
        db.execute(
            "UPDATE Prescriptions SET CollectionCode = ? WHERE prescriptionID = ?",
            (new_code, prescription_id),
        )
        db.commit()
        return False

    db.execute("DELETE FROM Prescriptions WHERE prescriptionID = ?", (prescription_id,))
    db.commit()
    return True
