import sqlite3
import json
from werkzeug.security import generate_password_hash

conn = sqlite3.connect("database/MediLink.db")
c = conn.cursor()
c.execute("PRAGMA foreign_keys = ON;")

#------------------------ Inserting sample data into the Patients table

patientHist1 = {
    "allergies": ["N/A"],
    "past_illnesses": ["Gambling Addiction"],
    "surgeries": ["ocular surgery"],
    "family_history": {
        "diabetes": False,
        "heart_disease": True
    }
}

patientHist2 = {
    "allergies": ["N/A"],
    "past_illnesses": ["Periodic Amnesia"],
    "surgeries": ["N/A"],
    "family_history": {
        "diabetes": False,
        "heart_disease": False
    }
}

patientHist3 = {
    "allergies": ["N/A"],
    "past_illnesses": ["N/A"],
    "surgeries": ["N/A"],
    "family_history": {
        "diabetes": False,
        "heart_disease": False
    }
}

patient_data = [
    ("BM00001", "Baku \"Usogui\" Madarame", "patient1@example.com", generate_password_hash("password123"), json.dumps(patientHist1), "1970-01-01"),
    ("SK00001", "Souichi Kiruma", "patient2@example.com", generate_password_hash("password456"), json.dumps(patientHist2), "1970-02-02"),
    ("TK00001", "Takaomi Kaji", "patient3@example.com", generate_password_hash("password789"), json.dumps(patientHist3), "1970-03-03")
]


c.executemany("""
    INSERT OR IGNORE INTO Patients (patientID, Name, Email, PasswordHash, PatientHistory, DOB)
    VALUES (?, ?, ?, ?, ?, ?);
""", 
    patient_data
)


#--------------------- Inserting sample data into the Doctors table

doctor_data = [
    ("TC00001", "Dr. Shoko Ieiri", "doctor1@example.com", generate_password_hash("qwerty"), "Reversed Cursed Technique"),
    ("GH00002", "Dr. Gregory House", "doctor2@example.com", generate_password_hash("password"), None)
]

c.executemany("""
    INSERT OR IGNORE INTO Doctors (doctorID, Name, Email, PasswordHash, Specialisation)
    VALUES (?, ?, ?, ?, ?);
""", 
    doctor_data
)

#--------------------- Inserting sample data into the Pharmacies table

pharmacy_data = [
    ("MC00001", "pharmacy1@example.com", generate_password_hash("asdfghjkl;"), "MediCare Pharmacy"),
    ("PH00002", "pharmacy2@example.com", generate_password_hash("pingpong"), "HealthPlus Pharmacy")
]

c.executemany("""
    INSERT OR IGNORE INTO Pharmacies (pharmID, Email, PasswordHash, Name)
    VALUES (?, ?, ?, ?);
""", 
    pharmacy_data
)

#--------------------- Inserting sample data into the DPEnrole table

msg1 = [
    {
        "sender": "TC00001",
        "message": "43d91bbc04ed7ecfd0b92e9f2de94e7b889b7a1039aa7b402ca31ba2de0b9eccb5e3a367b7022d4cdb42714d8bc23a77077c4103bc6b68a483e1a6ac9e32007d",
        "timestamp": "2024-01-15T10:00:00"
    },
    {
        "sender": "BM00001",
        "message": "0b8f5087f4c3cc516ce06150eb74e9467042ae2b4f864f465082d8ed3099ef0a",
        "timestamp": "2024-01-15T10:05:00"
    }
]

DP_enrole_data = [
    ("TC00001", "BM00001", json.dumps(msg1)),
    ("GH00002", "SK00001", json.dumps([])),
    ("GH00002", "TK00001", json.dumps([]))
]

c.executemany("""
    INSERT OR IGNORE INTO DPEnrole (doctorID, patientID, msgHistory)
    VALUES (?, ?, ?);
""", 
    DP_enrole_data
)

#--------------------- Inserting sample data into the Prescriptions table
prescription_data = [
    ("BM00001", "RX00001", "TC00001", "MC00001"),
    ("SK00001", "RX00002", "GH00002", "PH00002")
]
c.executemany("""
    INSERT OR IGNORE INTO Prescriptions (patientID, prescriptionID, doctorID, pharmID)
    VALUES (?, ?, ?, ?);
""", 
    prescription_data
)


#--------------------- Inserting sample data into the Medicines table
medicines_data = [
    ("RX00001", "Medicine A, Medicine B", "Take twice daily after meals", "2025-12-11", "Lifetime", "123456"),
    ("RX00002", "Medicine C", "Take once daily before bed", "2025-06-30", "Temporary", "654321")
]
c.executemany("""
    INSERT OR IGNORE INTO Medicines (prescriptionID, MedicineName, Instructions, DatePrescribed, DurationType, CollectionCode)
    VALUES (?, ?, ?, ?, ?, ?);
""", 
    medicines_data
)

#---------------------- Inserting Notices Data
notices_data = [
    ("BM00001", "NT00001", "TC00001"),
]
c.executemany("""
    INSERT OR IGNORE INTO Notices (patientID, noticeID, doctorID)
    VALUES (?, ?, ?);
""", 
    notices_data
)

#---------------------- Notice Content Data
notice_content_data = [
    ("NT00001", "2025-12-11","Your appointment is scheduled for 2024-11-20 at 10:00 AM."),
]
c.executemany("""
    INSERT OR IGNORE INTO NoticeContent (noticeID, Date, Message)
    VALUES (?, ?, ?);
""", 
    notice_content_data
)

conn.commit()
conn.close()