import styles from "./LoginBox.module.css";
import { useState } from 'react';
import PatientLogin from "./PatientLogin"
import DrLogin from "./DrLogin"
import PharLogin from "./PharLogin"


function LoginBox(){
  const [activeTab, setActiveTab] = useState("Patient");

  function handleTabClick(tab:string) {
    setActiveTab(tab);
  }


  return (
    <div className={styles.loginBox}>
      <div className={styles.tabContainer}>
        <button className={`${styles.tabButton} ${activeTab === "Patient" ? styles.active : ""}`} onClick={() => handleTabClick("Patient")}>
          Patient
        </button>
        <button className={`${styles.tabButton} ${activeTab === "Doctor" ? styles.active : ""}`} onClick={() => handleTabClick("Doctor")}>
          Doctor
        </button>
        <button className={`${styles.tabButton} ${activeTab === "Pharma" ? styles.active : ""}`} onClick={() => handleTabClick("Pharma")}>
          Pharma
        </button>
      </div>
      <div className={styles.formContainer}>
        {activeTab == "Patient" && <PatientLogin />}
        {activeTab == "Doctor" && <DrLogin/>}
        {activeTab == "Pharma" && <PharLogin/>}
      </div>
    </div>
  )

}

export default LoginBox