from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

doctor_users = {
    bcrypt.generate_password_hash("doctor@example.com").decode('utf-8'): bcrypt.generate_password_hash("password123").decode('utf-8'),
      bcrypt.generate_password_hash("mike.ahnt.operate@hospital.nhs.uk").decode('utf-8'): bcrypt.generate_password_hash("icup5318008").decode('utf-8'),
      bcrypt.generate_password_hash("jekyll.henry@gmail.com").decode('utf-8'): bcrypt.generate_password_hash("SWB%:;Vak[Pqb4]p").decode('utf-8'),
      bcrypt.generate_password_hash("eddyhyde@yahoo.com").decode('utf-8'): bcrypt.generate_password_hash("password").decode('utf-8'),
}
