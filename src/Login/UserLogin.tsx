import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import styles from "./UserLogin.module.css";

interface UserLoginProps {
  activeTab: string;
  userType: "Patient" | "Doctor" | "Pharma";
  onLoginSuccess?: (
    user: {
      Name?: string;
      patientID?: string;
      doctorID?: string;
      pharmID?: string;
    },
    role: string,
  ) => void;
}

function UserLogin({ activeTab, userType, onLoginSuccess }: UserLoginProps) {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeTab === userType) {
      setEmail("");
      setIsValid(true);
      setPassword("");
      setPasswordVisible(false);
      setError("");
      setIsLoading(false);
    }
  }, [activeTab, userType]);

  function togglePasswordVisibility() {
    setPasswordVisible((prev) => !prev); // Toggle the state each time the function is called
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
      setError("Please enter a valid email address.");
    } else if (error) {
      setError("");
    }
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    if (error) {
      setError("");
    }
  }

  function handleEmailKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }

  function handlePasswordKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && loginButtonRef.current) {
      loginButtonRef.current.click();
    }
  }

  async function handleSubmit() { 
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isValid) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setIsLoading(true);

    const role = userType === "Pharma" ? "pharmacist" : userType.toLowerCase();
    const endpoint = `/api/login/${role}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email: email, Password: password }),
      });
      const result = await response.json();
      if (response.ok) {
        onLoginSuccess?.(result.user, role);
      } else {
        setError(result.error || result.message || "Login failed.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.loginForm}>
      <h2 className="userType">{userType} Login</h2>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={handleEmailChange}
        onKeyDown={handleEmailKeyDown}
        className={`${styles.input} ${!isValid ? styles.invalid : ""}`}
        maxLength={50}
      />
      <div className={styles.passwordContainer}>
        <input
          type={passwordVisible ? "text" : "password"} // Change the type based on visibility state (password type has it hidden)
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          onKeyDown={handlePasswordKeyDown}
          ref={passwordInputRef}
          className={styles.input}
          maxLength={50}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={styles.togglePasswordButton}
        >
          {passwordVisible ? "Shown" : "Hidden"} {/* Switch the button text based on visibility state */}
        </button>
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
      <button
        className={styles.submitButton}
        disabled={!isValid || isLoading}
        onClick={handleSubmit}
        ref={loginButtonRef}
      >
        {isLoading ? "Loading..." : "Login"}
      </button>
    </div>
  );
}

export default UserLogin;
