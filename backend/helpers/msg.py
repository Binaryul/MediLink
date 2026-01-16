import json
from typing import Any, Dict, List

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

from helpers.db import get_db

# Matches the fixed AES-256 test settings used when populating the database. Should be replaced with secure key management in production.
KEY = b"0123456789abcdef0123456789abcdef"
IV = b"abcdef0123456789"


def _safe_json_loads(raw: Any) -> Any: # Safely load JSON, returning empty list on failure
    if raw is None:
        return []
    if isinstance(raw, (list, dict)):
        return raw
    if not isinstance(raw, str) or not raw.strip():
        return []
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return []


def _decrypt_message(ciphertext_hex: str) -> str:
    ciphertext = bytes.fromhex(ciphertext_hex)
    cipher = AES.new(KEY, AES.MODE_CBC, iv=IV) # Just using the library
    plaintext = unpad(cipher.decrypt(ciphertext), AES.block_size)
    return plaintext.decode("utf-8")


def _encrypt_message(plaintext: str) -> str:
    cipher = AES.new(KEY, AES.MODE_CBC, iv=IV)
    ciphertext = cipher.encrypt(pad(plaintext.encode("utf-8"), AES.block_size))
    return ciphertext.hex()


def _decrypt_history(msg_history: Any) -> List[Dict[str, Any]]:
    items = _safe_json_loads(msg_history)
    if not isinstance(items, list):
        return []

    decrypted: List[Dict[str, Any]] = [] # an empty list to hold decrypted messages enforced types so it looks different
    for item in items:
        if not isinstance(item, dict):
            continue
        msg = item.get("message")
        if isinstance(msg, str):
            try:
                item = dict(item)
                item["message"] = _decrypt_message(msg)
            except Exception:
                # Keep the original message if it's already plaintext or malformed.
                pass
        decrypted.append(item)
    return decrypted


def get_patient_msg_history(patientID: str, decrypt: bool = True) -> List[Dict[str, Any]]:
    db = get_db()
    rows = db.execute(
        """
        SELECT doctorID, patientID, msgHistory
        FROM DPEnrole
        WHERE patientID = ?
        """,
        (patientID,),
    ).fetchall()

    results: List[Dict[str, Any]] = []
    for row in rows:
        if decrypt:
            results.extend(_decrypt_history(row["msgHistory"]))
        else:
            results.extend(_safe_json_loads(row["msgHistory"]))
    return results


def append_message_history(patientID: str, senderID: str, message: str, timestamp: str) -> int:
    new_item = {
        "sender": senderID,
        "message": _encrypt_message(message),
        "timestamp": timestamp,
    }
    items = get_patient_msg_history(patientID, decrypt=False)
    if not isinstance(items, list):
        items = []
    items.extend([new_item])
    new_history = json.dumps(items)

    db = get_db()
    cur = db.execute(
        """
        UPDATE DPEnrole
        SET msgHistory = ?
        WHERE patientID = ?
        """,
        (new_history, patientID),
    )
    db.commit()
    return cur.rowcount
