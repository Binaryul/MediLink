from flask import Flask, jsonify, request
from flask_cors import CORS
from helpers.db import get_db, close_db
from helpers.auth import login_user

app = Flask(__name__)
CORS(app)

app.teardown_appcontext(close_db)

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

    return jsonify({
        "status": "success",
        "user": safe_user,
        "role": role
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5173, debug=True)