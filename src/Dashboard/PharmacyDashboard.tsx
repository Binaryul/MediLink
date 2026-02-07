import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import PrescriptionsPanel, {
  type Prescription,
} from "../components/PrescriptionsPanel";
import styles from "./PharmacyDashboard.module.css";

interface PharmacyDashboardProps {
  pharmacistName: string;
  pharmId: string | null;
  onLogout: () => void;
}

function PharmacyDashboard({
  pharmacistName,
  pharmId,
  onLogout,
}: PharmacyDashboardProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionsError, setPrescriptionsError] = useState("");
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<
    "MedicineName" | "patientID" | "prescriptionID"
  >("MedicineName");
  const [collectionCode, setCollectionCode] = useState("");
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<
    string | null
  >(null);
  const [collectError, setCollectError] = useState("");
  const [collectStatus, setCollectStatus] = useState("");
  const [isCollecting, setIsCollecting] = useState(false);

  async function fetchPrescriptions() {
    try {
      setIsLoadingPrescriptions(true);
      const response = await fetch("/api/prescriptions", {
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        setPrescriptions(result.prescriptions || []);
        setPrescriptionsError("");
      } else {
        setPrescriptionsError(result.error || "Unable to load prescriptions.");
      }
    } catch {
      setPrescriptionsError("Unable to load prescriptions.");
    } finally {
      setIsLoadingPrescriptions(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function load() {
      if (!isActive) {
        return;
      }
      await fetchPrescriptions();
    }

    load();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredPrescriptions = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return prescriptions;
    }
    const fuse = new Fuse(prescriptions, {
      keys: [searchField],
      includeScore: true,
      threshold: 0.4,
    });
    return fuse.search(trimmed).map((result) => result.item);
  }, [prescriptions, searchQuery, searchField]);

  const emptyMessage = isLoadingPrescriptions
    ? "Loading prescriptions..."
    : prescriptionsError || "No prescriptions assigned yet.";

  const isCodeValid = /^\d{6}$/.test(collectionCode);
  const canCollect = isCodeValid && !!selectedPrescriptionId && !isCollecting;

  function handleCodeChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6); // Remove non-digit characters and limit to 6 digits
    setCollectionCode(digitsOnly);
    if (collectError) {
      setCollectError("");
    }
    if (collectStatus) {
      setCollectStatus("");
    }
  }

  async function handleCollect() {
    if (!selectedPrescriptionId) { // Added but maybe not needed since button is disabled when !selectedPrescriptionId
      setCollectError("Select a prescription first.");
      return;
    }
    if (!isCodeValid) {
      setCollectError("Enter a valid 6 digit collection code.");
      return;
    }
    setIsCollecting(true);
    setCollectError("");
    setCollectStatus("");
    try {
      const response = await fetch(
        `/api/prescriptions/${selectedPrescriptionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ CollectionCode: collectionCode }),
        },
      );
      const result = await response.json();
      if (response.ok) {
        setCollectStatus(result.status || "Collection verified."); // Show success message from backend or default message
        setCollectionCode("");
        setSelectedPrescriptionId(null);
        await fetchPrescriptions();
      } else {
        setCollectError(result.error || "Unable to verify collection code.");
      }
    } catch {
      setCollectError("Unable to verify collection code.");
    } finally {
      setIsCollecting(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.userMeta}>
          <div className={styles.greeting}>{pharmacistName}</div>
          <div className={styles.userId}>ID: {pharmId || "Unavailable"}</div>
        </div>
        <button className={styles.logoutButton} type="button" onClick={onLogout}>
          Log out
        </button>
      </header>
      <main className={styles.main}>
        <section className={styles.collectBar}>
          <div className={styles.collectInputGroup}>
            <label className={styles.collectLabel} htmlFor="collection-code">
              Collection code
            </label>
            <input
              id="collection-code"
              className={styles.collectInput}
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="Enter 6 digit code"
              value={collectionCode}
              onChange={(event) => handleCodeChange(event.target.value)}
              maxLength={6}
            />
          </div>
          <button
            className={styles.collectButton}
            type="button"
            onClick={handleCollect}
            disabled={!canCollect}
          >
            {isCollecting ? "Verifying..." : "Verify collection"}
          </button>
        </section>
        {(collectError || collectStatus) && (
          <div className={styles.collectMessage}>
            {collectError || collectStatus}
          </div>
        )}
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
              setSearchField(
                event.target.value as
                  | "MedicineName"
                  | "patientID"
                  | "prescriptionID",
              )
            }
          >
            <option value="MedicineName">Medicine</option>
            <option value="patientID">Patient ID</option>
            <option value="prescriptionID">Prescription ID</option>
          </select>
        </section>
        <PrescriptionsPanel
          title="Assigned Prescriptions"
          prescriptions={filteredPrescriptions}
          emptyMessage={emptyMessage}
          onSelect={(prescription) =>
            setSelectedPrescriptionId(prescription.prescriptionID || null)
          }
          selectedPrescriptionId={selectedPrescriptionId}
        />
      </main>
    </div>
  );
}

export default PharmacyDashboard;
