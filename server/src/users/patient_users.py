from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

patient_users = {
    bcrypt.generate_password_hash("patient@example.com").decode('utf-8'): bcrypt.generate_password_hash("password123").decode('utf-8'),
    bcrypt.generate_password_hash("himpusc73@gmail.com").decode('utf-8'): bcrypt.generate_password_hash("Grozo123!").decode('utf-8'),
    bcrypt.generate_password_hash("19zwoolhouse@cheneyschool.org").decode('utf-8'): bcrypt.generate_password_hash("Ineedgutmeds_789").decode('utf-8'),
    bcrypt.generate_password_hash("mgandhi@aol.com").decode('utf-8'): bcrypt.generate_password_hash("satyagraha7681").decode('utf-8'),
}
