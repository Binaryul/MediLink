import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { MessagePanelContainer } from "../components/MessagePanel";
import { PrescriptionsPanelContainer } from "../components/PrescriptionsPanel";
import styles from "./DoctorDashboard.module.css";

interface DoctorDashboardProps {
  doctorName: string;
  doctorId: string | null;
  onLogout: () => void;
}

interface PatientListItem {
  patientID?: string;
  Name?: string;
}

type PatientProfile = Record<string, string | number | null>;

function tryParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function normalizeHistoryValue(raw: unknown) {
  if (typeof raw !== "string") {
    return { parsed: raw, draft: raw ? JSON.stringify(raw, null, 2) : "" };
  }
  const first = tryParseJson(raw);
  if (first === null) {
    return { parsed: raw, draft: raw };
  }
  if (typeof first === "string") {
    const second = tryParseJson(first);
    if (second !== null) {
      return { parsed: second, draft: JSON.stringify(second, null, 2) };
    }
    return { parsed: first, draft: first };
  }
  return { parsed: first, draft: JSON.stringify(first, null, 2) };
}

function DoctorDashboard({
  doctorName,
  doctorId,
  onLogout,
}: DoctorDashboardProps) {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [patientsError, setPatientsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"Name" | "patientID">("Name");
  const [activePatientProfile, setActivePatientProfile] =
    useState<PatientProfile | null>(null);
  const [activePatientError, setActivePatientError] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [historyDraft, setHistoryDraft] = useState("");
  const [historySaveError, setHistorySaveError] = useState("");
  const [isSavingHistory, setIsSavingHistory] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messagePatientId, setMessagePatientId] = useState<string | null>(null);
  const [messagePatientName, setMessagePatientName] = useState<string>("Patient");
  const [isPrescriptionsOpen, setIsPrescriptionsOpen] = useState(false);
  const [prescriptionsPatientId, setPrescriptionsPatientId] =
    useState<string | null>(null);
  const [prescriptionsPatientName, setPrescriptionsPatientName] =
    useState<string>("Patient");
  const [isCreatePrescriptionOpen, setIsCreatePrescriptionOpen] =
    useState(false);
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newDurationType, setNewDurationType] = useState<
    "Lifetime" | "Temporary"
  >("Lifetime");
  const [newPharmId, setNewPharmId] = useState("");
  const [createPrescriptionError, setCreatePrescriptionError] = useState("");
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false);
  const [prescriptionsReloadToken, setPrescriptionsReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function fetchPatients() {
      try {
        const response = await fetch("/api/doctor/patients");
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

  useEffect(() => {
    const isModalOpen =
      isProfileLoading ||
      !!activePatientProfile ||
      isMessageOpen ||
      isPrescriptionsOpen;
    if (!isModalOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activePatientProfile, isProfileLoading, isMessageOpen]);

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

  async function handleExpandPatient(patientId?: string) {
    if (!patientId) {
      setActivePatientError("Patient ID not available.");
      setActivePatientProfile(null);
      setActivePatientId(null);
      return;
    }
    setIsProfileLoading(true);
    setActivePatientError("");
    setHistorySaveError("");
    setIsEditingHistory(false);
    try {
      const response = await fetch(`/api/profile/patient/${patientId}`);
      const result = await response.json();
      if (response.ok) {
        setActivePatientProfile(result);
        setActivePatientId(patientId);
        const { draft } = normalizeHistoryValue(result?.PatientHistory);
        setHistoryDraft(draft);
      } else {
        setActivePatientError(result.error || "Unable to load patient.");
        setActivePatientProfile(null);
        setActivePatientId(null);
      }
    } catch {
      setActivePatientError("Unable to load patient.");
      setActivePatientProfile(null);
      setActivePatientId(null);
    } finally {
      setIsProfileLoading(false);
    }
  }

  function handleCloseProfile() {
    setActivePatientProfile(null);
    setActivePatientError("");
    setIsProfileLoading(false);
    setActivePatientId(null);
    setIsEditingHistory(false);
    setHistoryDraft("");
    setHistorySaveError("");
    setIsSavingHistory(false);
  }

  async function handleOpenMessages(patient: PatientListItem) {
    if (!patient.patientID) {
      setIsMessageOpen(true);
      return;
    }
    setMessagePatientId(patient.patientID);
    setMessagePatientName(patient.Name || "Patient");
    setIsMessageOpen(true);
  }

  function handleCloseMessages() {
    setIsMessageOpen(false);
    setMessagePatientId(null);
    setMessagePatientName("Patient");
  }

  function handleOpenPrescriptions(patient: PatientListItem) {
    if (!patient.patientID) {
      setIsPrescriptionsOpen(true);
      return;
    }
    setPrescriptionsPatientId(patient.patientID);
    setPrescriptionsPatientName(patient.Name || "Patient");
    setIsPrescriptionsOpen(true);
    setIsCreatePrescriptionOpen(false);
    setNewMedicineName("");
    setNewInstructions("");
    setNewDurationType("Lifetime");
    setNewPharmId("");
    setCreatePrescriptionError("");
  }

  function handleClosePrescriptions() {
    setIsPrescriptionsOpen(false);
    setPrescriptionsPatientId(null);
    setPrescriptionsPatientName("Patient");
    setIsCreatePrescriptionOpen(false);
    setNewMedicineName("");
    setNewInstructions("");
    setNewDurationType("Lifetime");
    setNewPharmId("");
    setCreatePrescriptionError("");
    setIsCreatingPrescription(false);
  }

  function formatDate(date: Date) {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}`;
  }

  async function handleCreatePrescription() {
    if (!prescriptionsPatientId) {
      setCreatePrescriptionError("Patient ID not available.");
      return;
    }
    if (!newMedicineName.trim() || !newInstructions.trim() || !newPharmId.trim()) { // Basic validation to ensure required fields are filled
      setCreatePrescriptionError("Please fill in all fields.");
      return;
    }
    setIsCreatingPrescription(true);
    setCreatePrescriptionError("");
    try {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ // Send the necessary data to create a prescription
          patientID: prescriptionsPatientId,
          pharmID: newPharmId.trim(),
          MedicineName: newMedicineName.trim(),
          Instructions: newInstructions.trim(),
          DurationType: newDurationType,
          DatePrescribed: formatDate(new Date()),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setCreatePrescriptionError(
          result.error || "Unable to create prescription.",
        );
        return;
      }
      // Reset form and reload prescriptions after successful creation
      setNewMedicineName("");
      setNewInstructions("");
      setNewDurationType("Lifetime");
      setNewPharmId("");
      setIsCreatePrescriptionOpen(false);
      setPrescriptionsReloadToken((prev) => prev + 1);
    } catch {
      setCreatePrescriptionError("Unable to create prescription.");
    } finally {
      setIsCreatingPrescription(false);
    }
  }

  async function handleSaveHistory() {
    if (!activePatientId) {
      setHistorySaveError("Patient ID not available.");
      return;
    }
    setIsSavingHistory(true);
    setHistorySaveError("");
    try {
      const parsed = tryParseJson(historyDraft); // Try to parse the draft, but if it fails, we'll just send the raw string
      const response = await fetch(`/api/profile/patient/${activePatientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          PatientHistory: parsed !== null ? parsed : historyDraft, // Send the parsed value if it's valid JSON, otherwise send the raw string
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setHistorySaveError(result.error || "Unable to save history.");
        return;
      }
      setActivePatientProfile((prev) => prev ? { ...prev, PatientHistory: historyDraft } : prev);
      setIsEditingHistory(false);
    } catch (error) {
      setHistorySaveError("Unable to save history.");
    } finally {
      setIsSavingHistory(false);
    }
  }

  function renderProfileValue(
    key: string,
    value: PatientProfile[keyof PatientProfile],
  ) {
    if (key === "PatientHistory" && typeof value === "string") {
      if (isEditingHistory) {
        return (
          <div className={styles.historyEditor}>
            <textarea
              className={styles.historyTextarea}
              value={historyDraft}
              onChange={(event) => setHistoryDraft(event.target.value)}
              placeholder="Enter patient history..."
              rows={8}
            />
            {historySaveError && (
              <div className={styles.historyError}>{historySaveError}</div>
            )}
            <div className={styles.historyActions}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => {
                  setIsEditingHistory(false);
                  setHistorySaveError("");
                  setHistoryDraft(
                    typeof value === "string" ? value : historyDraft,
                  );
                }}
                disabled={isSavingHistory}
              >
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={handleSaveHistory}
                disabled={isSavingHistory}
              >
                {isSavingHistory ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        );
      }
      const { parsed } = normalizeHistoryValue(value);
      try {
        if (parsed === null || typeof parsed === "string") {
          return parsed ?? value;
        }
        if (Array.isArray(parsed)) { // Assuming it's an array of history entries
          return (
            <div className={styles.profileHistory}>
              {parsed.map((item, index) => ( // Render each history entry, which could be a string or an object
                <div key={`${key}-${index}`} className={styles.profileHistoryItem}>
                  {typeof item === "string" ? item : JSON.stringify(item)}
                </div>
              ))}
            </div>
          );
        }
        if (parsed && typeof parsed === "object") { // Assuming it's an object with history details
          return (
            <div className={styles.profileHistory}>
              {Object.entries(parsed).map(([entryKey, entryValue]) => ( // Render each key-value pair in the history object
                <div key={`${key}-${entryKey}`} className={styles.profileHistoryItem}>
                  {entryKey}:{" "}
                  {typeof entryValue === "string"
                    ? entryValue
                    : JSON.stringify(entryValue)}
                </div>
              ))}
            </div>
          );
        }
      } catch {
        return value;
      }
    }
    return value ?? "";
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.userMeta}>
          <div className={styles.greeting}>Hello {doctorName}</div>
          <div className={styles.userId}>
            ID: {doctorId || "Unavailable"}
          </div>
        </div>
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
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => handleExpandPatient(patient.patientID)}
                    >
                      Expand
                    </button>
                    <button
                      className={styles.primaryButton}
                      type="button"
                      onClick={() => handleOpenMessages(patient)}
                    >
                      Message
                    </button>
                    <button
                      className={styles.secondaryActionButton}
                      type="button"
                      onClick={() => handleOpenPrescriptions(patient)}
                    >
                      Prescriptions
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
      {(activePatientProfile || activePatientError || isProfileLoading) && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Patient Details</h2>
              <button
                className={styles.modalClose}
                type="button"
                onClick={handleCloseProfile}
              >
                Close
              </button>
            </div>
            {isProfileLoading ? (
              <div className={styles.modalBody}>Loading patient...</div>
            ) : activePatientError ? (
              <div className={styles.modalBody}>{activePatientError}</div>
            ) : (
              <div className={styles.modalBody}>
                {activePatientProfile &&
                  Object.entries(activePatientProfile).map(([key, value]) => (
                    <div key={key} className={styles.profileRow}>
                      <span className={styles.profileLabel}>{key}:</span>{" "}
                      <span className={styles.profileValue}>
                        {renderProfileValue(key, value)}
                      </span>
                      {key === "PatientHistory" && !isEditingHistory && (
                        <button
                          className={styles.secondaryButton}
                          type="button"
                        onClick={() => {
                            const { draft } = normalizeHistoryValue(value); // Prepare the draft for editing
                            setHistoryDraft(draft);
                            setHistorySaveError("");
                            setIsEditingHistory(true);
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
      {isMessageOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Messages with {messagePatientName}
              </h2>
              <button
                className={styles.modalClose}
                type="button"
                onClick={handleCloseMessages}
              >
                Close
              </button>
            </div>
            <div className={styles.modalBody}>
              {messagePatientId ? (
                <MessagePanelContainer
                  title="Conversation"
                  fetchUrl={`/api/messages/${messagePatientId}`}
                  postUrl={`/api/messages/${messagePatientId}`}
                  currentUserId={doctorId}
                  otherLabel="Patient"
                />
              ) : (
                <div>Patient ID not available.</div>
              )}
            </div>
          </div>
        </div>
      )}
      {isPrescriptionsOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Prescriptions for {prescriptionsPatientName}
              </h2>
              <div className={styles.modalActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => {
                    const nextOpen = !isCreatePrescriptionOpen;
                    setIsCreatePrescriptionOpen(nextOpen);
                    if (!nextOpen) {
                      setNewMedicineName("");
                      setNewInstructions("");
                      setNewDurationType("Lifetime");
                      setNewPharmId("");
                      setCreatePrescriptionError("");
                      setIsCreatingPrescription(false);
                    }
                  }}
                >
                  {isCreatePrescriptionOpen ? "Hide Form" : "Create"}
                </button>
                <button
                  className={styles.modalClose}
                  type="button"
                  onClick={handleClosePrescriptions}
                >
                  Close
                </button>
              </div>
            </div>
            <div className={styles.modalBody}>
              {prescriptionsPatientId ? (
                <>
                  {isCreatePrescriptionOpen && (
                    <div className={styles.createSection}>
                      <div className={styles.formRow}>
                        <label className={styles.formLabel} htmlFor="med-name">
                          Medicine Name
                        </label>
                        <input
                          id="med-name"
                          className={styles.formInput}
                          type="text"
                          value={newMedicineName}
                          onChange={(event) => setNewMedicineName(event.target.value)}
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label className={styles.formLabel} htmlFor="med-instructions">
                          Instructions
                        </label>
                        <input
                          id="med-instructions"
                          className={styles.formInput}
                          type="text"
                          value={newInstructions}
                          onChange={(event) => setNewInstructions(event.target.value)}
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label className={styles.formLabel} htmlFor="pharm-id">
                          Pharmacy ID
                        </label>
                        <input
                          id="pharm-id"
                          className={styles.formInput}
                          type="text"
                          value={newPharmId}
                          onChange={(event) => setNewPharmId(event.target.value)}
                        />
                      </div>
                      <div className={styles.formRow}>
                        <span className={styles.formLabel}>Duration</span>
                        <div className={styles.toggleGroup}>
                          <button
                            className={`${styles.toggleButton} ${
                              newDurationType === "Lifetime"
                                ? styles.toggleButtonActive
                                : ""
                            }`}
                            type="button"
                            onClick={() => setNewDurationType("Lifetime")}
                          >
                            Lifetime
                          </button>
                          <button
                            className={`${styles.toggleButton} ${
                              newDurationType === "Temporary"
                                ? styles.toggleButtonActive
                                : ""
                            }`}
                            type="button"
                            onClick={() => setNewDurationType("Temporary")}
                          >
                            Temporary
                          </button>
                        </div>
                      </div>
                      {createPrescriptionError && (
                        <div className={styles.formError}>
                          {createPrescriptionError}
                        </div>
                      )}
                      <div className={styles.formActions}>
                        <button
                          className={styles.primaryButton}
                          type="button"
                          onClick={handleCreatePrescription}
                          disabled={isCreatingPrescription}
                        >
                          {isCreatingPrescription ? "Creating..." : "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                  <PrescriptionsPanelContainer
                    title="Prescriptions"
                    fetchUrl="/api/prescriptions"
                    filterPatientId={prescriptionsPatientId}
                    emptyMessage="No prescriptions for this patient."
                    reloadToken={prescriptionsReloadToken}
                  />
                </>
              ) : (
                <div>Patient ID not available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
