import styles from "./LoginBox.module.css";
import { useState } from "react";
import type { CSSProperties } from "react";
import UserLogin from "./UserLogin";

function LoginBox() {
  const [activeTab, setActiveTab] = useState("Patient"); // Default to Patient tab

  function handleTabClick(tab: string) {
    setActiveTab(tab);
  }

  const themeVars: CSSProperties =
    activeTab === "Patient"
      ? ({ "--accent": "#1e6fd9", "--accent_dark": "#1552a3" } as CSSProperties)
      : activeTab === "Doctor"
        ? ({ "--accent": "#2f8a3a", "--accent_dark": "#1f5b26" } as CSSProperties)
        : ({ "--accent": "#8a2be2", "--accent_dark": "#621ba4" } as CSSProperties);

  return (
    <div className={styles.centerWrapper} style={themeVars}>
      <div className={styles.loginBox}>
        <div className={styles.tabContainer}>
          {/* Just buttons to decide which tab is active and call the function to set the active tab */}
          <button
            className={`${styles.tabButton} ${
              activeTab === "Patient" ? styles.active : ""
            }`}
            onClick={() => handleTabClick("Patient")}
          >
            Patient
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "Doctor" ? styles.active : ""
            }`}
            onClick={() => handleTabClick("Doctor")}
          >
            Doctor
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "Pharma" ? styles.active : ""
            }`}
            onClick={() => handleTabClick("Pharma")}
          >
            Pharma
          </button>
        </div>
        <div className={styles.sliderContainer}>
          <div
            className={styles.slider}
            style={{
              transform: `translateX(${activeTab === "Patient" ? "0%" : activeTab === "Doctor" ? "-33.333%" : "-66.666%"})`,
            }}
          >
            {/* Decide what text to show based on the active tab */}
            <div className={styles.slide}>
              <UserLogin activeTab={activeTab} userType="Patient" />
            </div>
            <div className={styles.slide}>
              <UserLogin activeTab={activeTab} userType="Doctor" />
            </div>
            <div className={styles.slide}>
              <UserLogin activeTab={activeTab} userType="Pharma" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginBox;
