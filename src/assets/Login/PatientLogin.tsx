import styles from "./UserLogin.module.css"
import { useState } from "react"

function PatientLogin(){

    const [email, setEmail] = useState<string>(""); 
    const [isValid, setIsValid] = useState<boolean>(true);


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
            <input type="password" placeholder="Password" className={styles.input} />
            <button className={styles.submitButton} disabled={!isValid}>Login</button>
        </div>
    )
}

export default PatientLogin