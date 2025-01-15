import React from "react"; // Add this import
import styles from "./UserLogin.module.css";
import { useEffect, useState } from "react";

interface PharLoginProps {
  activeTab: string; // will check what the active tab is currently
}

function PharLogin({ activeTab }: PharLoginProps) {
  const [email, setEmail] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false); // Tracks password visibility
  const [password, setPassword] = useState<string>(""); // Tracks password value
  const [error, setError] = useState<string>(""); // Tracks login errors
  const [isLoading, setIsLoading] = useState<boolean>(false); // Tracks loading state

  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const loginButtonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Reset state whenever the activeTab changes to "Doctor"
    if (activeTab === "Pharma") {
      setEmail("");
      setIsValid(true);
      setPassword("");
      setPasswordVisible(false);
      setError("");
    }
  }, [activeTab]);

  // when email changes this catches the change in useState and passes it through validation
  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target.value;
    setEmail(input);
    setIsValid(isValidEmail(input));
  }

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function togglePasswordVisibility() {
    setPasswordVisible(!passwordVisible);
  }

  async function handleSumbit() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5000/login/pharma", {
        // Updated URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      console.log("Response:", result); // Log the response
      setIsLoading(false);
      if (response.ok) {
        alert(result.message); // Replace with proper navigation or state updates
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Error:", error); // Log the error
      setIsLoading(false);
      setError("An error occurred. Please try again.");
    }
  }

  function handleEmailKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }

  function handlePasswordKeyPress(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter" && loginButtonRef.current) {
      loginButtonRef.current.click();
    }
  }

  return (
    <div className={styles.loginForm}>
      <h2>Pharmacy Login</h2>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={handleEmailChange}
        onKeyPress={handleEmailKeyPress} // Add key press handler
        className={`${styles.input} ${!isValid ? styles.invalid : ""}`}
        // changes style depending on if isValid is True or not
      />
      {!isValid && (
        <p className={styles.errorText}>Please enter a valid email address.</p>
      )}
      <div className={styles.passwordContainer}>
        <input
          type={passwordVisible ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handlePasswordKeyPress} // Add key press handler
          ref={passwordInputRef} // Add ref to password input
          className={styles.input}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={styles.togglePasswordButton}
        >
          {passwordVisible ? "Shown" : "Hidden"}
        </button>
      </div>
      {error && <p className={styles.errorText}>{error}</p>}{" "}
      {/* if error is true then display error message */}
      <button
        className={styles.submitButton}
        disabled={!isValid || isLoading}
        onClick={handleSumbit}
        ref={loginButtonRef} // Add ref to login button
      >
        {isLoading ? "Loading..." : "Login"}
      </button>
    </div>
  );
}

export default PharLogin;
