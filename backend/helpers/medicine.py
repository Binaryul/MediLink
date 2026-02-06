from typing import Any, Dict, Optional
import random

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
    if role == "doctor":
        result.pop("CollectionCode", None)
    elif role == "pharmacist":
        result.pop("patientID", None)
        result.pop("doctorID", None)

    return result


def create_prescription(data: Dict[str, Any]) -> None:
    db = get_db()
    db.execute(
        """
        INSERT INTO Prescriptions (patientID, prescriptionID, doctorID, pharmID)
        VALUES (?, ?, ?, ?)
        """,
        (
            data.get("patientID"),
            data.get("prescriptionID"),
            data.get("doctorID"),
            data.get("pharmID"),
        ),
    )
    db.execute(
        """
        INSERT INTO Medicines (
            prescriptionID,
            MedicineName,
            Instructions,
            DatePrescribed,
            DurationType,
            CollectionCode
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            data.get("prescriptionID"),
            data.get("MedicineName"),
            data.get("Instructions"),
            data.get("DatePrescribed"),
            data.get("DurationType"),
            data.get("CollectionCode"),
        ),
    )
    db.commit()


def delete_prescription_if_collectable(prescription_id: str, pharm_id: str, collection_code: str) -> bool:
    db = get_db()
    row = db.execute(
        """
        SELECT m.DurationType, m.CollectionCode
        FROM Prescriptions p
        JOIN Medicines m ON m.prescriptionID = p.prescriptionID
        WHERE p.prescriptionID = ? AND p.pharmID = ?
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
            "UPDATE Medicines SET CollectionCode = ? WHERE prescriptionID = ?",
            (new_code, prescription_id),
        )
        db.commit()
        return False

    db.execute("DELETE FROM Medicines WHERE prescriptionID = ?", (prescription_id,))
    db.execute("DELETE FROM Prescriptions WHERE prescriptionID = ?", (prescription_id,))
    db.commit()
    return True
