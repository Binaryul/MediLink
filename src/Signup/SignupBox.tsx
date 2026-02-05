import styles from "./SignupBox.module.css";
import { useState } from "react";
import type { CSSProperties } from "react";
import UserSignup from "./UserSignup";

interface SignupBoxProps {
  onSwitchToLogin?: () => void;
}

function SignupBox({ onSwitchToLogin }: SignupBoxProps) {
  const [activeTab, setActiveTab] = useState("Patient");

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
      <div className={styles.signupBox}>
        <div className={styles.tabContainer}>
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
            <div className={styles.slide}>
              <UserSignup activeTab={activeTab} userType="Patient" />
            </div>
            <div className={styles.slide}>
              <UserSignup activeTab={activeTab} userType="Doctor" />
            </div>
            <div className={styles.slide}>
              <UserSignup activeTab={activeTab} userType="Pharma" />
            </div>
          </div>
        </div>
        <div className={styles.footerRow}>
          <span className={styles.footerText}>Already have an account?</span>
          <button
            type="button"
            className={styles.linkButton}
            onClick={onSwitchToLogin}
            disabled={!onSwitchToLogin}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupBox;
