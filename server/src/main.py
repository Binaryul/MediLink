from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS 


app = Flask(__name__) # Create the Flask app
bcrypt = Bcrypt(app) # Create a Bcrypt object
CORS(app) # This will enable CORS for all routes

# Separate in-memory stores for different user types
doctor_users = {
    "doctor@example.com": bcrypt.generate_password_hash("password123").decode('utf-8'),
}

pharma_users = {
    "pharma@example.com": bcrypt.generate_password_hash("password123").decode('utf-8'),
}

patient_users = {
    "patient@example.com": bcrypt.generate_password_hash("password123").decode('utf-8'),
}

@app.route('/login/doctor', methods=['POST'])
def login_doctor():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    print(f"Received doctor login request: email={email}, password={password}")
    if not email or not password:
        return jsonify({"status": "fail", "message": "Email and password are required"}), 400
    if email in doctor_users:
        if bcrypt.check_password_hash(doctor_users[email], password):
            return jsonify({"status": "success", "message": "Login successful"}), 200 
        else: 
            print("Incorrect password")
            return jsonify({"status": "fail", "message": "Incorrect password"}), 401
    else:
        print("Email not found")
        return jsonify({"status": "fail", "message": "Email not found"}), 404

@app.route('/login/pharma', methods=['POST'])
def login_pharma():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    print(f"Received pharma login request: email={email}, password={password}")
    if not email or not password:
        return jsonify({"status": "fail", "message": "Email and password are required"}), 400
    if email in pharma_users:
        if bcrypt.check_password_hash(pharma_users[email], password):
            return jsonify({"status": "success", "message": "Login successful"}), 200 
        else: 
            print("Incorrect password")
            return jsonify({"status": "fail", "message": "Incorrect password"}), 401
    else:
        print("Email not found")
        return jsonify({"status": "fail", "message": "Email not found"}), 404

@app.route('/login/patient', methods=['POST'])
def login_patient():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    print(f"Received patient login request: email={email}, password={password}")
    if not email or not password:
        return jsonify({"status": "fail", "message": "Email and password are required"}), 400
    if email in patient_users:
        if bcrypt.check_password_hash(patient_users[email], password):
            return jsonify({"status": "success", "message": "Login successful"}), 200 
        else: 
            print("Incorrect password")
            return jsonify({"status": "fail", "message": "Incorrect password"}), 401
    else:
        print("Email not found")
        return jsonify({"status": "fail", "message": "Email not found"}), 404

if __name__ == '__main__': # This is to ensure that the app is run directly
    print("Starting server on port 5000") # Log server start
    app.run(debug=True, port=5000) # Ensure the server runs on port 5000