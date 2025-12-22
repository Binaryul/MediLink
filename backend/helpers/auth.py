from werkzeug.security import check_password_hash
from helpers.db import get_db

def login_user(email:str, password:str, role: str): # enforce types and get the needed database connection info
    db = get_db()

    table_map = {
        "patient": "Patients",
        "doctor": "Doctors",
        "pharmacist": "Pharmacies"
    }

    table = table_map.get(role)
    if not table:
        return None  # Invalid role
    
    user = db.execute(
        f"SELECT * FROM {table} WHERE email = ?", (email,)
    ).fetchone()

    if user and check_password_hash(user["PasswordHash"], password):
        return dict(user) # Convert Row object to dictionary
    return None