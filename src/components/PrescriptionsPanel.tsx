import { useEffect, useState } from "react";
import styles from "./PrescriptionsPanel.module.css";

export interface Prescription {
  prescriptionID?: string;
  patientID?: string;
  MedicineName?: string;
  Instructions?: string;
  DatePrescribed?: string;
  DurationType?: string;
  CollectionCode?: string;
}

interface PrescriptionsPanelProps {
  title: string;
  prescriptions: Prescription[];
  emptyMessage?: string;
  onSelect?: (prescription: Prescription) => void;
  selectedPrescriptionId?: string | null;
}

interface PrescriptionsPanelContainerProps {
  title: string;
  fetchUrl: string;
  filterPatientId?: string | null;
  emptyMessage?: string;
  reloadToken?: number;
}

function PrescriptionsPanel({
  title,
  prescriptions,
  emptyMessage = "No prescriptions available.",
  onSelect,
  selectedPrescriptionId,
}: PrescriptionsPanelProps) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
      </div>
      <ul className={styles.prescriptionList}>
        {prescriptions.length > 0 ? (
          prescriptions.map((prescription, index) => (
            <li
              key={prescription.prescriptionID || `${index}`}
              className={`${styles.prescriptionItem} ${
                onSelect ? styles.prescriptionSelectable : ""
              } ${
                prescription.prescriptionID &&
                prescription.prescriptionID === selectedPrescriptionId
                  ? styles.prescriptionSelected
                  : ""
              }`}
              onClick={
                onSelect ? () => onSelect(prescription) : undefined
              }
              onKeyDown={
                onSelect
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(prescription);
                      }
                    }
                  : undefined
              }
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
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
            <div className={styles.listSub}>{emptyMessage}</div>
          </li>
        )}
      </ul>
    </section>
  );
}

export function PrescriptionsPanelContainer({
  title,
  fetchUrl,
  filterPatientId,
  emptyMessage,
  reloadToken,
}: PrescriptionsPanelContainerProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function fetchPrescriptions() {
      try {
        setIsLoading(true);
        const response = await fetch(fetchUrl, { credentials: "include" });
        const result = await response.json();
        if (!isActive) {
          return;
        }
        if (response.ok) {
          const allPrescriptions = result.prescriptions || [];
          const filtered = filterPatientId
            ? allPrescriptions.filter(
                (prescription: Prescription) =>
                  prescription.patientID === filterPatientId,
              )
            : allPrescriptions;
          setPrescriptions(filtered);
          setError("");
        } else {
          setError(result.error || "Unable to load prescriptions.");
        }
      } catch {
        if (!isActive) {
          return;
        }
        setError("Unable to load prescriptions.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchPrescriptions();

    return () => {
      isActive = false;
    };
  }, [fetchUrl, filterPatientId, reloadToken]);

  const message =
    isLoading ? "Loading prescriptions..." : error || emptyMessage;

  return (
    <PrescriptionsPanel
      title={title}
      prescriptions={prescriptions}
      emptyMessage={message}
    />
  );
}

export default PrescriptionsPanel;
