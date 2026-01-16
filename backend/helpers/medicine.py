from typing import Any, Dict, Optional

from helpers.db import get_db


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
        SELECT m.*, p.*
        FROM Medicines m
        INNER JOIN Prescriptions p ON m.prescriptionID = p.prescriptionID
        WHERE p.prescriptionID = ? AND p.{role_column} = ?
        """,
        (prescription_id, user_id),
    ).fetchone()

    if row is None:
        return None

    result = dict(row)
    # Remove sensitive fields based on role
    if role in {"patient", "doctor"}:
        result.pop("CollectionCode", None)
    elif role == "pharmacist":
        result.pop("patientID", None)
        result.pop("doctorID", None)

    return result
