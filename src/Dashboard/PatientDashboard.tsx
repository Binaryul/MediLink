import { useEffect, useState } from "react";
import { MessagePanelContainer } from "../components/MessagePanel";
import styles from "./PatientDashboard.module.css";

interface Prescription {
  prescriptionID?: string;
  MedicineName?: string;
  Instructions?: string;
  DatePrescribed?: string;
  DurationType?: string;
  CollectionCode?: string;
}


interface PatientDashboardProps {
  patientName: string;
  patientId: string | null;
  onLogout: () => void;
}

function PatientDashboard({
  patientName,
  patientId,
  onLogout,
}: PatientDashboardProps) {
  const [doctorInfo, setDoctorInfo] = useState<
    Record<string, string | number> | null
  >(null);
  const [doctorError, setDoctorError] = useState("");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionError, setPrescriptionError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function fetchDoctor() {
      try {
        const response = await fetch("/api/patient/doctor");
        const result = await response.json();
        if (!isActive) {
          return;
        }
        if (response.ok) {
          setDoctorInfo(result.doctor || null);
        } else {
          setDoctorError(result.error || "Unable to load doctor info.");
        }
      } catch {
        if (!isActive) {
          return;
        }
        setDoctorError("Unable to load doctor info.");
      }
    }

    fetchDoctor();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function fetchPrescriptions() {
      try {
        const response = await fetch("/api/prescriptions");
        const result = await response.json();
        if (!isActive) {
          return;
        }
        if (response.ok) {
          setPrescriptions(result.prescriptions || []);
        } else {
          setPrescriptionError(
            result.error || "Unable to load prescriptions.",
          );
        }
      } catch {
        if (!isActive) {
          return;
        }
        setPrescriptionError("Unable to load prescriptions.");
      }
    }

    fetchPrescriptions();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.userMeta}>
          <div className={styles.greeting}>Hello {patientName}</div>
          <div className={styles.userId}>
            ID: {patientId || "Unavailable"}
          </div>
        </div>
        <button className={styles.logoutButton} type="button" onClick={onLogout}>
          Log out
        </button>
      </header>
      <main className={styles.main}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Prescriptions</h2>
          </div>
          <ul className={styles.prescriptionList}>
            {prescriptions.length > 0 ? (
              prescriptions.map((prescription, index) => (
                <li
                  key={prescription.prescriptionID || `${index}`}
                  className={styles.prescriptionItem}
                >
                  <div className={styles.prescriptionMain}>
                    <div className={styles.listTitle}>
                      {prescription.MedicineName || "Prescription"}
                    </div>
                    <div className={styles.listSub}>
                      {prescription.Instructions || "No instructions provided"}
                    </div>
                    <div className={styles.listMeta}>
                      {prescription.DatePrescribed
                        ? `Prescribed on ${prescription.DatePrescribed}`
                        : "Prescription date unavailable"}
                    </div>
                  </div>
                  <div className={styles.prescriptionMeta}>
                    <span
                      className={`${styles.statusPill} ${
                        prescription.DurationType === "Temporary"
                          ? styles.statusExpired
                          : styles.statusActive
                      }`}
                    >
                      {prescription.DurationType || "Active"}
                    </span>
                    {prescription.CollectionCode && (
                      <span className={styles.refills}>
                        Code: {prescription.CollectionCode}
                      </span>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className={styles.prescriptionItem}>
                <div className={styles.listSub}>
                  {prescriptionError || "No prescriptions available."}
                </div>
              </li>
            )}
          </ul>
        </section>

        <MessagePanelContainer
          title="Messages with Doctor"
          fetchUrl={`/api/messages/${patientId || "me"}`}
          postUrl={`/api/messages/${patientId || "me"}`}
          currentUserId={patientId}
          otherLabel="Doctor"
        />

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Your Doctor</h2>
          </div>
          <div className={styles.doctorInfo}>
            {doctorInfo ? (
              Object.entries(doctorInfo).map(([key, value]) => (
                <div key={key} className={styles.doctorDetail}>
                  <span className={styles.doctorLabel}>{key}:</span>{" "}
                  <span className={styles.doctorValue}>
                    {String(value ?? "")}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.doctorDetail}>
                {doctorError || "Loading doctor information..."} 
              </div> /* Fail safe to make sure something is shown even if there is an error */
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default PatientDashboard;
