import { useEffect, useState, type ChangeEvent } from "react";
import styles from "./UserSignup.module.css";

interface UserSignupProps {
  activeTab: string;
  userType: "Patient" | "Doctor" | "Pharma";
}

function UserSignup({ activeTab, userType }: UserSignupProps) {
  const [name, setName] = useState(""); // Coundn't find a better way to do it other than declare them all here
  const [email, setEmail] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [dob, setDob] = useState("");
  const [patientHistory, setPatientHistory] = useState("");
  const [specialisation, setSpecialisation] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === userType) { // Set all fields to default states
      setName("");
      setEmail("");
      setDoctorId("");
      setDob("");
      setPatientHistory("");
      setSpecialisation("");
      setPassword("");
      setPasswordVisible(false);
      setIsValid(true);
      setStatusMessage("");
      setIsError(false);
      setIsLoading(false);
    }
  }, [activeTab, userType]);

  function togglePasswordVisibility() {
    setPasswordVisible((prev) => !prev);
  }

  function isValidEmail(value: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setEmail(value);
    const valid = value === "" ? true : isValidEmail(value);
    setIsValid(valid);
    if (!valid) {
      setStatusMessage("Please enter a valid email address.");
      setIsError(true);
    } else if (isError) {
      setStatusMessage("");
      setIsError(false);
    }
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    if (isError) {
      setStatusMessage("");
      setIsError(false);
    }
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
    if (isError) {
      setStatusMessage("");
      setIsError(false);
    }
  }

  function requiresDoctorFields() {
    return userType === "Patient";
  }

  async function handleSubmit() {
    if (!name || !email || !password) {
      setStatusMessage("Please fill in all required fields.");
      setIsError(true);
      return;
    }

    if (!isValid) {
      setStatusMessage("Please enter a valid email address.");
      setIsError(true);
      return;
    }

    if (requiresDoctorFields() && (!doctorId || !dob)) {
      setStatusMessage("Please enter doctor ID and date of birth.");
      setIsError(true);
      return;
    }

    setStatusMessage("");
    setIsError(false);
    setIsLoading(true);
    // Changes the user type to the correct format for the backend 
    const role = userType === "Pharma" ? "pharmacist" : userType.toLowerCase(); // if Pharma, change to pharmacist, else just lowercase the userType
    const endpoint = `/api/register/${role}`;
    const payload: Record<string, string | null> = {
      Name: name,
      Email: email,
      Password: password,
    };

    if (userType === "Patient") {
      payload.doctorID = doctorId;
      payload.DOB = dob;
      payload.PatientHistory = patientHistory.trim()
        ? patientHistory.trim()
        : null; // Only include patient history if it's not just whitespace, otherwise set it to null
    }

    if (userType === "Doctor" && specialisation.trim()) {
      payload.Specialisation = specialisation.trim()
        ? specialisation.trim()
        : null;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        setStatusMessage(result.message || "Account created successfully.");
        setIsError(false);
      } else {
        setStatusMessage(result.error || result.message || "Signup failed.");
        setIsError(true);
      }
    } catch {
      setStatusMessage("An error occurred. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.signupForm}>
      <h2 className="userType">{userType} Signup</h2>
      <input
        type="text"
        placeholder="Full name"
        value={name}
        onChange={handleNameChange}
        className={styles.input}
        maxLength={60}
      />
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={handleEmailChange}
        className={`${styles.input} ${!isValid ? styles.invalid : ""}`}
        maxLength={50}
      />
      {requiresDoctorFields() ? (
        <>
          <input
            type="text"
            placeholder="Doctor ID"
            value={doctorId}
            onChange={(event) => setDoctorId(event.target.value)}
            className={styles.input}
            maxLength={20}
          />
          <input
            type="date"
            placeholder="Date of birth"
            value={dob}
            onChange={(event) => setDob(event.target.value)}
            className={styles.input}
          />
          <textarea
            placeholder="Patient history (optional)"
            value={patientHistory}
            onChange={(event) => setPatientHistory(event.target.value)}
            className={styles.textarea}
            rows={3}
          />
        </>
      ) : null}
      {userType === "Doctor" ? (
        <>
          <input
            type="text"
            placeholder="Specialisation (optional)"
            value={specialisation}
            onChange={(event) => setSpecialisation(event.target.value)}
            className={styles.input}
            maxLength={60}
          />
          <p className={styles.helperText}>Optional</p>
        </>
      ) : null}
      <div className={styles.passwordContainer}>
        <input
          type={passwordVisible ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          className={styles.input}
          maxLength={50}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={styles.togglePasswordButton}
        >
          {passwordVisible ? "Shown" : "Hidden"}
        </button>
      </div>
      {statusMessage && (
        <p className={isError ? styles.errorText : styles.successText}>
          {statusMessage}
        </p>
      )}
      <button
        className={styles.submitButton}
        disabled={!isValid || isLoading}
        onClick={handleSubmit}
      >
        {isLoading ? "Creating..." : "Create account"}
      </button>
    </div>
  );
}

export default UserSignup;
