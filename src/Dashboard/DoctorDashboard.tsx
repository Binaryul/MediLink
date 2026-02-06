import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import styles from "./DoctorDashboard.module.css";

interface DoctorDashboardProps {
  doctorName: string;
  onLogout: () => void;
}

interface PatientListItem {
  patientID?: string;
  Name?: string;
}

function DoctorDashboard({ doctorName, onLogout }: DoctorDashboardProps) {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [patientsError, setPatientsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"Name" | "patientID">("Name");

  useEffect(() => {
    let isActive = true;

    async function fetchPatients() {
      try {
        const response = await fetch("/api/doctor/patients", {
          credentials: "include",
        });
        const result = await response.json();
        if (!isActive) {
          return;
        }
        if (response.ok) {
          setPatients(result.patients || []);
          setPatientsError("");
        } else {
          setPatientsError(result.error || "Unable to load patients.");
        }
      } catch {
        if (!isActive) {
          return;
        }
        setPatientsError("Unable to load patients.");
      }
    }

    fetchPatients();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredPatients = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return patients;
    }
    const fuse = new Fuse(patients, {
      keys: [searchField],
      includeScore: true,
      threshold: 0.4,
    });
    return fuse.search(trimmed).map((result) => result.item);
  }, [patients, searchQuery, searchField]);

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.greeting}>Hello {doctorName}</div>
        <button className={styles.logoutButton} type="button" onClick={onLogout}>
          Log out
        </button>
      </header>
      <main className={styles.main}>
        <section className={styles.searchBar}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={`Search by ${searchField}`}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <select
            className={styles.searchSelect}
            value={searchField}
            onChange={(event) =>
              setSearchField(event.target.value as "Name" | "patientID")
            }
          >
            <option value="Name">Name</option>
            <option value="patientID">Patient ID</option>
          </select>
        </section>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Assigned Patients</h2>
          </div>
          <ul className={styles.patientList}>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient, index) => (
                <li
                  key={patient.patientID || `${index}`}
                  className={styles.patientItem}
                >
                  <div className={styles.patientMain}>
                    <div className={styles.listTitle}>
                      {patient.Name || "Patient"}
                    </div>
                    <div className={styles.listSub}>
                      ID: {patient.patientID || "Unavailable"}
                    </div>
                  </div>
                  <div className={styles.patientActions}>
                    <button className={styles.secondaryButton} type="button">
                      Expand
                    </button>
                    <button className={styles.primaryButton} type="button">
                      Message
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className={styles.patientItem}>
                <div className={styles.listSub}>
                  {patientsError || "No patients assigned."}
                </div>
              </li>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default DoctorDashboard;
