from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from users.doctor_users import doctor_users
from users.pharma_users import pharma_users
from users.patient_users import patient_users

app = Flask(__name__) # Create the Flask app
bcrypt = Bcrypt(app) # Create a Bcrypt object
CORS(app) # This will enable CORS for all routes

def verify_user(users, email, password):
    for hashed_email, hashed_password in users.items():
        if bcrypt.check_password_hash(hashed_email, email) and bcrypt.check_password_hash(hashed_password, password):
            return True
    return False

@app.route('/login/doctor', methods=['POST'])
def login_doctor():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    print(f"Received doctor login request: email={email}, password={password}")
    if not email or not password:
        return jsonify({"status": "fail", "message": "Email and password are required"}), 400
    if verify_user(doctor_users, email, password):
        return jsonify({"status": "success", "message": "Login successful"}), 200 
    else:
        print("Invalid email or password")
        return jsonify({"status": "fail", "message": "Invalid email or password"}), 401

@app.route('/login/pharma', methods=['POST'])
def login_pharma():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    print(f"Received pharma login request: email={email}, password={password}")
    if not email or not password:
        return jsonify({"status": "fail", "message": "Email and password are required"}), 400
    if verify_user(pharma_users, email, password):
        return jsonify({"status": "success", "message": "Login successful"}), 200 
    else:
        print("Invalid email or password")
        return jsonify({"status": "fail", "message": "Invalid email or password"}), 401

@app.route('/login/patient', methods=['POST'])
def login_patient():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    print(f"Received patient login request: email={email}, password={password}")
    if not email or not password:
        return jsonify({"status": "fail", "message": "Email and password are required"}), 400
    if verify_user(patient_users, email, password):
        return jsonify({"status": "success", "message": "Login successful"}), 200 
    else:
        print("Invalid email or password")
        return jsonify({"status": "fail", "message": "Invalid email or password"}), 401

if __name__ == '__main__': # This is to ensure that the app is run directly
    print("Starting server on port 5000") # Log server start
    app.run(debug=True, port=5000) # Ensure the server runs on port 5000