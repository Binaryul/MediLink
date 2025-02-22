from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

pharma_users = {
    bcrypt.generate_password_hash("pharma@example.com").decode('utf-8'): bcrypt.generate_password_hash("password123").decode('utf-8'),
    bcrypt.generate_password_hash("binamradad@pharmaco.ch").decode('utf-8'): bcrypt.generate_password_hash("RobbieBlundelFan500").decode('utf-8'),
    bcrypt.generate_password_hash("alphafold@deepmind.google.com").decode('utf-8'): bcrypt.generate_password_hash("computerbrain>:]").decode('utf-8'),
}
