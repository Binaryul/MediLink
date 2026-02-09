import "./App.css";
import { useEffect, useState } from "react";
import Header from "./assets/Header";
import LoginBox from "./Login/LoginBox";
import SignupBox from "./Signup/SignupBox";
import PatientDashboard from "./Dashboard/PatientDashboard";
import DoctorDashboard from "./Dashboard/DoctorDashboard";
import PharmacyDashboard from "./Dashboard/PharmacyDashboard";

type AppView = "login" | "signup" | "dashboard";

function App() {
  const [authView, setAuthView] = useState<AppView>("login");
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/me");
        const result = await response.json();
        if (!isActive) {
          return;
        }
        if (response.ok && result.role) {
          setUserName(result.user?.Name || "User");
          setUserRole(result.role);
          setUserId(
            result.user?.patientID ||
              result.user?.doctorID ||
              result.user?.pharmID ||
              null,
          );
          setAuthView("dashboard");
        } else {
          setAuthView("login");
          setUserName("User");
          setUserRole(null);
          setUserId(null);
        }
      } catch {
        if (!isActive) {
          return;
        }
        setAuthView("login");
      } finally {
        if (isActive) {
          setIsCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      setAuthView("login");
      setUserName("User");
      setUserRole(null);
      setUserId(null);
    }
  }

  if (isCheckingSession) {
    return null;
  }

  if (authView === "dashboard") {
    if (userRole === "patient") {
      return (
        <PatientDashboard
          patientName={userName}
          patientId={userId}
          onLogout={handleLogout}
        />
      );
    }
    if (userRole === "doctor") {
      return (
        <DoctorDashboard
          doctorName={userName}
          doctorId={userId}
          onLogout={handleLogout}
        />
      );
    }
    if (userRole === "pharmacist") {
      return (
        <PharmacyDashboard
          pharmacistName={userName}
          pharmId={userId}
          onLogout={handleLogout}
        />
      );
    }
  }

  return (
    <>
      <Header />
      <div className="withHeader">
        {authView === "login" ? (
          <LoginBox
            onSwitchToSignup={() => setAuthView("signup")}
            onPatientLogin={(user) => {
              setUserName(user.Name || "User");
              setUserRole("patient");
              setUserId(user.patientID || null);
              setAuthView("dashboard");
            }}
            onDoctorLogin={(user) => {
              setUserName(user.Name || "User");
              setUserRole("doctor");
              setUserId(user.doctorID || null);
              setAuthView("dashboard");
            }}
            onPharmaLogin={(user) => {
              setUserName(user.Name || "User");
              setUserRole("pharmacist");
              setUserId(user.pharmID || null);
              setAuthView("dashboard");
            }}
          />
        ) : (
          <SignupBox onSwitchToLogin={() => setAuthView("login")} />
        )}
      </div>
    </>
  );
}

export default App;
