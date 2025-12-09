import sqlite3

conn = sqlite3.connect("database/MediLink.db")
c = conn.cursor()
c.execute("PRAGMA foreign_keys = ON;")
print(conn.total_changes)

#---------------------- Start of Independant tables

c.execute("""
	CREATE TABLE IF NOT EXISTS Doctors(
		doctorID TEXT NOT NULL PRIMARY KEY,
		Name TEXT NOT NULL,
		Email TEXT UNIQUE NOT NULL,
		Specialisation TEXT
		);
""")

c.execute("""
	CREATE TABLE IF NOT EXISTS Patient(
		patientID TEXT NOT NULL PRIMARY KEY,
		Name TEXT NOT NULL,
		Email TEXT UNIQUE NOT NULL,
		PatientHistory TEXT,
		DOB DATE NOT NULL 
		);
""")

c.execute("""
	CREATE TABLE IF NOT EXISTS Pharmacies(
		pharmID TEXT NOT NULL PRIMARY KEY,
		Name TEXT NOT NULL
	);
""") 

#---------------------- End of Independant tables



# Connecting doctors and patients with a table

c.execute("""
    CREATE TABLE IF NOT EXISTS DPEnrole(
          doctorID TEXT NOT NULL,
          patientID TEXT NOT NULL,
          PRIMARY KEY (doctorID, patientID)
          FOREIGN KEY (doctorID)
          	REFERENCES Doctors (doctorID)
          FOREIGN KEY (patientID)
			REFERENCES Patient (patientID) 
	);
""")


# Messaging Table

c.execute("""
	CREATE TABLE IF NOT EXISTS Messaging(
          patientID TEXT NOT NULL,
          doctorID TEXT NOT NULL,
          msgHistory TEXT,
          PRIMARY KEY (doctorID, patientID)
          FOREIGN KEY (doctorID)
          	REFERENCES Doctors (doctorID)
          FOREIGN KEY (patientID)
			REFERENCES Patient (patientID) 
    );
""")


#--------------------- Presctipions

c.execute(""" 
	CREATE TABLE IF NOT EXISTS Prescriptions(
          patientID TEXT NOT NULL PRIMARY KEY,
          prescriptionID TEXT UNIQUE NOT NULL,
          doctorID TEXT NOT NULL,
          pharmID TEXT NOT NULL,
          FOREIGN KEY (patientID)
          	REFERENCES Patients (patientID)
          FOREIGN KEY (doctorID)
          	REFERENCES Doctors (doctorID)
          FOREIGN KEY (pharmID)
          	REFERENCES Pharmacies (pharmID)
    );
""")

c.execute(""" 
	CREATE TABLE IF NOT EXISTS Medicines(
          prescriptionID TEXT NOT NULL PRIMARY KEY,
          MedicineName TEXT NOT NULL,
          Instructions TEXT,
          DatePrescribed DATE NOT NULL,
          DurationType TEXT NOT NULL,
          CollectionCode TEXT NOT NULL,
          FOREIGN KEY (prescriptionID)
			REFERENCES Prescriptions (prescriptionID)
    );
""")

#---------------------------------------------------------

#--------------------------------------------------------- Notices

c.execute("""
	CREATE TABLE IF NOT EXISTS Notices(
          patientID TEXT NOT NULL PRIMARY KEY,
          noticeID TEXT UNIQUE NOT NULL,
          doctorID TEXT NOT NULL,
          FOREIGN KEY (patientID)
			REFERENCES Patients (patientID)
          FOREIGN KEY (doctorID)
			REFERENCES Doctors (doctorID)
    );
""")


c.execute("""
	CREATE TABLE IF NOT EXISTS NoticeContent(
          noticeID TEXT NOT NULL PRIMARY KEY,
          Date DATE NOT NULL,
          Message TEXT NOT NULL,
          FOREIGN KEY (noticeID)
			REFERENCES Notices (noticeID)
    );
""")

conn.commit()
conn.close()
    


