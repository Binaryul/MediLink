from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


_BASE_DIR = Path(__file__).resolve().parent.parent
_AUDIT_DIR = _BASE_DIR.parent / "database" / "audit-logs"
_AUDIT_FILES = {
    "patient": _AUDIT_DIR / "patientLog.json",
    "doctor": _AUDIT_DIR / "doctorLog.json",
    "pharmacist": _AUDIT_DIR / "pharmacyLog.json",
}


def append_audit_log(role: Optional[str], user_id: Optional[str], route: str, success: bool) -> bool:
    if not role or not user_id or not route:
        return False

    path = _AUDIT_FILES.get(role)
    if path is None:
        return False

    entry = (
        "{"
        f"\"route\":\"{route}\","
        f"\"userID\":\"{user_id}\","
        f"\"success\":{str(bool(success)).lower()},"
        f"\"time\":\"{datetime.now(timezone.utc).isoformat()}\""
        "}"
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(entry)
        handle.write("\n")
    return True
