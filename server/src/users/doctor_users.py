from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

doctor_users = {
    bcrypt.generate_password_hash("doctor@example.com").decode('utf-8'): bcrypt.generate_password_hash("password123").decode('utf-8'),
}
