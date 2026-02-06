import { useEffect, useState } from "react";
import MessagePanel, { type MessagePanelItem } from "../components/MessagePanel";
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
  const [messages, setMessages] = useState<MessagePanelItem[]>([]);
  const [messagesError, setMessagesError] = useState("");

  function formatTimestamp(date: Date) {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds(),
    )}`;
  }

  async function loadMessages() {
    try {
      const response = await fetch("/api/messages/me", {
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        const mapped = (result.messages || []).map(
          (message: {
            sender?: string;
            message?: string;
            timestamp?: string;
          }) => ({
            id: `${message.sender || "unknown"}-${message.timestamp || ""}`,
            sender:
              patientId && message.sender === patientId ? "You" : "Doctor",
            body: message.message || "",
            time: message.timestamp || "",
            side:
              patientId && message.sender === patientId ? "right" : "left", // Align patient's messages to the right and doctor's to the left
          }),
        );
        setMessages(mapped);
        setMessagesError("");
      } else {
        setMessagesError(result.error || "Unable to load messages.");
      }
    } catch {
      setMessagesError("Unable to load messages.");
    }
  }

  useEffect(() => {
    let isActive = true;

    async function fetchDoctor() {
      try {
        const response = await fetch("/api/patient/doctor", {
          credentials: "include",
        });
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

    async function fetchMessages() {
      try {
        await loadMessages();
        if (!isActive) {
          return;
        }
      } catch {
        if (!isActive) {
          return;
        }
        setMessagesError("Unable to load messages.");
      }
    }

    fetchMessages();

    return () => {
      isActive = false;
    };
  }, [patientId]);

  async function handleSendMessage(message: string) {
    const timestamp = formatTimestamp(new Date());
    const response = await fetch("/api/messages/me", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, timestamp }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessagesError(result.error || "Unable to send message.");
      return;
    }
    await loadMessages();
  }

  useEffect(() => {
    let isActive = true;

    async function fetchPrescriptions() {
      try {
        const response = await fetch("/api/prescriptions", {
          credentials: "include",
        });
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
        <div className={styles.greeting}>Hello {patientName}</div>
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

        <MessagePanel
          title="Messages with Doctor"
          messages={messages}
          inputPlaceholder={messagesError || "Type your message..."}
          onSend={handleSendMessage}
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
