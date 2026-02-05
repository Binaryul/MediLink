import "./App.css";
import Header from "./assets/Header";
import { useState } from "react";
import LoginBox from "./Login/LoginBox";
import SignupBox from "./Signup/SignupBox";

function App() {
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  return (
    <>
      <Header />
      {authView === "login" ? (
        <LoginBox onSwitchToSignup={() => setAuthView("signup")} />
      ) : (
        <SignupBox onSwitchToLogin={() => setAuthView("login")} />
      )}
    </>
  );
}

export default App;
