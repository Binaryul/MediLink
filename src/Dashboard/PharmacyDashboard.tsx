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
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.userMeta}>
          <div className={styles.greeting}>Welcome {pharmacistName}</div>
          <div className={styles.userId}>ID: {pharmId || "Unavailable"}</div>
        </div>
        <button className={styles.logoutButton} type="button" onClick={onLogout}>
          Log out
        </button>
      </header>
    </div>
  );
}

export default PharmacyDashboard;
