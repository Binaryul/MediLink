import { useEffect, useState } from "react";
import { MessagePanelContainer } from "../components/MessagePanel";
import { PrescriptionsPanelContainer } from "../components/PrescriptionsPanel";
import styles from "./PatientDashboard.module.css";

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
        <PrescriptionsPanelContainer
          title="My Prescriptions"
          fetchUrl="/api/prescriptions"
        />

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
