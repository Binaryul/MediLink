import styles from "./UserLogin.module.css"
import { useState } from "react"

function PatientLogin(){
    const [email, setEmail] = useState<string>(""); 
    const [isValid, setIsValid] = useState<boolean>(true);
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false); // Tracks password visibility
    const [password, setPassword] = useState<string>(""); // Tracks password value


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

    return (
        <div className={styles.loginForm}>
            <h2>Patient Login</h2>
            <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className={`${styles.input} ${!isValid ? styles.invalid : ""}`} 
                // changes style depending on if isValid is True or not
            />
            {!isValid && <p className={styles.errorText}>Please enter a valid email address.</p>}
            <div className={styles.passwordContainer}>
                <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                />
                <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.togglePassword}
                >
                {passwordVisible ? "Hide" : "Show"}
                </button>
            </div>
            <button className={styles.submitButton} disabled={!isValid}>Login</button>
        </div>
    )
}

export default PatientLogin