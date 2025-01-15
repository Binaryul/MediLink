import styles from "./LoginBox.module.css";
import { useState } from "react";
import PatientLogin from "./PatientLogin";
import DrLogin from "./DrLogin";
import PharLogin from "./PharLogin";

function LoginBox() {
  const [activeTab, setActiveTab] = useState("Patient");

  function handleTabClick(tab:any) {
    setActiveTab(tab);
  }

  return (
    <div className={styles.centerWrapper}>
      <div className={styles.loginBox}>
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
              transform: `translateX(${
                activeTab === "Patient" ? "0%" : activeTab === "Doctor" ? "-33.333%" : "-66.666%"
              })`,
            }}
          >
            <div className={styles.slide}>
              <PatientLogin activeTab={activeTab}/>
            </div>
            <div className={styles.slide}>
              <DrLogin activeTab={activeTab}/>
            </div>
            <div className={styles.slide}>
              <PharLogin activeTab={activeTab}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginBox;
