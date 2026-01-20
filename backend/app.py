from flask import Flask, jsonify, request, session
from flask_cors import CORS
from datetime import timedelta
from functools import wraps
import json
# --- Helper Imports ---
from helpers.db import (
    get_db,
    close_db,
    user_info,
    update_by_id,
    is_doctor_enrolled,
)
from helpers.auth import login_user, register_user
from helpers.msg import get_patient_msg_history, append_message_history
from helpers.medicine import (
    fetch_prescription_details,
    create_prescription,
    delete_prescription_if_collectable,
)
from helpers.audit import append_audit_log

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
    append_audit_log(session.get("Role"), session.get("UserID"), request.path, True)
    return jsonify({'message': 'pong'})

@app.route('/api/db_test', methods=['GET'])
def db_test():
    try:
        db = get_db()
        c = db.execute("SELECT 1;")
        result = c.fetchone()[0]

        append_audit_log(session.get("Role"), session.get("UserID"), request.path, True)
        return jsonify({
            'status': 'success',
            'result': result
        })
    except Exception as e:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
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
        append_audit_log(role, None, request.path, False)
        return jsonify({"error" : "Missing Credentials"}), 400
    user = login_user(email, password, role)
    if user is None:
        append_audit_log(role, None, request.path, False)
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

    append_audit_log(role, session.get("UserID"), request.path, True)
    return jsonify({
        "status": "success",
        "user": safe_user,
        "role": role
    })


@app.route('/api/register/<role>', methods=['POST'])
def register(role):
    data = request.get_json() or {}
    user, error, status = register_user(data, role)
    if error:
        append_audit_log(role, None, request.path, False)
        return jsonify({"error": error}), status
    append_audit_log(
        role,
        user.get("patientID") or user.get("doctorID") or user.get("pharmID"),
        request.path,
        True,
    )
    return jsonify({
        "status": "success",
        "user": user,
        "role": role
    }), status


@app.route('/api/logout', methods=['GET', 'POST'])
@require_login()
def logout():
    append_audit_log(session.get("Role"), session.get("UserID"), request.path, True)
    session.clear()
    return jsonify({"status": "logged out"})


# --- User Info Route ---


@app.route('/api/me', methods=['GET'])
@require_login()
def me():
    safe_user = user_info(session["UserID"], session["Role"])
    if safe_user is None:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": "User not found"}), 404
    append_audit_log(session.get("Role"), session.get("UserID"), request.path, True)
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
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": "Unauthorized"}), 403
    if TargetRole == "doctor" and requestor_role != "patient":
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": "Unauthorized"}), 403
    if TargetRole not in ["patient", "doctor"]:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": "Invalid Target Role"}), 400

    safe_user = user_info(userID, TargetRole)
    if safe_user is None:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": "User not found"}), 404
    append_audit_log(session.get("Role"), session.get("UserID"), request.path, True)
    return safe_user


# --- Patient History Update Route ---
@app.route('/api/profile/patient/<patientID>', methods=['PUT'])
@require_login(roles=["doctor"]) # Only doctors can update patient history
def update_patient_history(patientID):
    data = request.get_json() or {} # Ensure data is a dict even if no JSON is sent and to avoid crash

    if "PatientHistory" not in data:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": "No Patient History provided"}), 400
    
    try:
        updated = update_by_id(
            table = "Patients",
            user_id = patientID,
            updates = {"PatientHistory": json.dumps(data["PatientHistory"])}
        )
    except ValueError as ve:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": str(ve)}), 400
    
    if updated == 0:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": "Patient not found"}), 404
    
    append_audit_log(session.get("Role"), session.get("UserID"), request.path, True)
    return jsonify({"status": "success", "message": "Patient history updated"})


# --- Messaging Routes ---
@app.route('/api/messages/<patientID>', methods=['GET'])
@require_login(roles=["patient", "doctor"])
def get_messages(patientID):
    user_role = session["Role"]
    if user_role == "patient":
        patientID = session["UserID"]
    else:
        if not is_doctor_enrolled(session["UserID"], patientID):
            append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
            return jsonify({"error": "Unauthorized"}), 403

    histories = get_patient_msg_history(patientID)
    append_audit_log(session.get("Role"), session.get("UserID"), request.path, True)
    return jsonify({"status": "success", "messages": histories})


@app.route('/api/messages/<patientID>', methods=['POST'])
@require_login(roles=["patient", "doctor"])
def send_message(patientID):
    data = request.get_json() or {}
    message = data.get("message")
    timestamp = data.get("timestamp")
    if not message or not timestamp:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": "Missing message or timestamp"}), 400

    user_role = session["Role"]
    senderID = session["UserID"]

    if user_role == "patient":
        patientID = senderID
    else:
        if not is_doctor_enrolled(senderID, patientID):
            append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
            return jsonify({"error": "Unauthorized"}), 403

    updated = append_message_history(patientID, senderID, message, timestamp)
    if updated <= 0:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": "Message history not found"}), 404

    append_audit_log(session.get("Role"), session.get("UserID"), request.path, True)
    return jsonify({"status": "success"})


@app.route('/api/prescriptions/<prescriptionID>', methods=['GET'])
@require_login()
def get_prescription(prescriptionID):
    try:
        prescription = fetch_prescription_details(session["UserID"], session["Role"], prescriptionID)
    except ValueError as exc:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": str(exc)}), 400

    if prescription is None:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": "Prescription not found"}), 404

    append_audit_log(session.get("Role"), session.get("UserID"), request.path, True)
    return jsonify({"status": "success", "prescription": prescription})


@app.route('/api/prescriptions', methods=['POST'])
@require_login(roles=["doctor"])
def create_prescription_route():
    data = request.get_json() or {}
    try:
        create_prescription(data)
    except Exception:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": "Failed to create prescription"}), 400

    append_audit_log(session.get("Role"), session.get("UserID"), request.path, True)
    return jsonify({"status": "success"}), 201


@app.route('/api/prescriptions/<prescriptionID>', methods=['DELETE'])
@require_login(roles=["pharmacist"])
def delete_prescription_route(prescriptionID):
    data = request.get_json() or {}
    collection_code = data.get("CollectionCode")
    if not collection_code:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, False)
        return jsonify({"error": "Missing CollectionCode"}), 400

    deleted = delete_prescription_if_collectable(
        prescriptionID,
        session["UserID"],
        collection_code,
    )
    if not deleted:
        append_audit_log(session.get("Role"), session.get("UserID"), request.path, True)
        return jsonify({"status": "success code changed"})

    append_audit_log(session.get("Role"), session.get("UserID"), request.path, True)
    return jsonify({"status": "success prescription deleted"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5173, debug=True) # sending the app through the same port the frontend is served on
