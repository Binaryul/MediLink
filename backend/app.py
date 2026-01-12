from flask import Flask, jsonify, request, session
from flask_cors import CORS
from datetime import timedelta
from functools import wraps
import json
# --- Helper Imports ---
from helpers.db import get_db, close_db, user_info, update_by_id
from helpers.auth import login_user

# --- Flask App Setup ---

app = Flask(__name__)
CORS(app)

app.teardown_appcontext(close_db) # Close DB connection after each request
app.secret_key = "ThisIsASecretKey" # In production, use a secure key from environment variables

# --- Route Protection Decorator ---

def require_login(roles=None): # Gives me the option to use role or not
    def decorator(f): 
        @wraps(f) # used to keep Flask happy just a techincal requirment
        def wrapper(*args, **kwargs):
            if "UserID" not in session:
                return jsonify({"error": "Not logged in"}), 401
            if roles is not None:
                if session["Role"] not in roles:
                    return jsonify({"error": "Unauthorized"}), 403
            return f(*args, **kwargs) # Call the actual route function
        return wrapper
    return decorator


# --- Route Configurations ---


# - Test Routes -

@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({'message': 'pong'})

@app.route('/api/db_test', methods=['GET'])
def db_test():
    try:
        db = get_db()
        c = db.execute("SELECT 1;")
        result = c.fetchone()[0]

        return jsonify({
            'status': 'success',
            'result': result
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

# --- Authentication Routes ---

@app.route('/api/login/<role>', methods=['POST'])
def login(role):
    data = request.get_json()
    email = data.get("Email")
    password = data.get("Password")

    if not email or not password:
        return jsonify({"error" : "Missing Credentials"}), 400
    user = login_user(email, password, role)
    if user is None:
        return jsonify({"error": "Invalid Credentials"}), 401
    
    # Remove sensitive information before sending response
    safe_user = {k:v for k, v in user.items() if k != "PasswordHash"}

    session.permanent = True
    role_id_map = {
        "patient": "patientID",
        "doctor": "doctorID",
        "pharmacist": "pharmID"
    }
    session["UserID"] = safe_user[role_id_map[role]]
    session["Email"] = safe_user["Email"]
    session["Role"] = role

    return jsonify({
        "status": "success",
        "user": safe_user,
        "role": role
    })


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"status": "logged out"})


# --- User Info Route ---


@app.route('/api/me', methods=['GET'])
@require_login()
def me():
    safe_user = user_info(session["UserID"], session["Role"])
    if safe_user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "status": "success",
        "user": safe_user,
        "role": session["Role"]
    })


# --- User Profile Routes ---
@app.route('/api/profile/<TargetRole>/<userID>', methods=['GET'])
@require_login() # Only doctors can access patient profiles since patients should only access their own profile via /api/me
def get_profile(TargetRole, userID):
    requestor_role = session["Role"]
    if TargetRole == "patient" and requestor_role != "doctor":
        return jsonify({"error": "Unauthorized"}), 403
    if TargetRole == "doctor" and requestor_role != "patient":
        return jsonify({"error": "Unauthorized"}), 403
    if TargetRole not in ["patient", "doctor"]:
        return jsonify({"error": "Invalid Target Role"}), 400

    safe_user = user_info(userID, TargetRole)
    if safe_user is None:
        return jsonify({"error": "User not found"}), 404
    return safe_user


# --- Patient History Update Route ---
@app.route('/api/profile/patient/<patientID>', methods=['PUT'])
@require_login(roles=["doctor"]) # Only doctors can update patient history
def update_patient_history(patientID):
    data = request.get_json() or {} # Ensure data is a dict even if no JSON is sent and to avoid crash

    if "PatientHistory" not in data:
        return jsonify({"error": "No Patient History provided"}), 400
    
    try:
        updated = update_by_id(
            table = "Patients",
            userID = patientID,
            updates = {"PatientHistory": json.dumps(data["PatientHistory"])}
        )
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    
    if updated == 0:
        return jsonify({"error": "Patient not found"}), 404
    
    return jsonify({"status": "success", "message": "Patient history updated"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5173, debug=True) # sending the app through the same port the frontend is served on
