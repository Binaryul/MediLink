import Patient from './assets/patients/patient.tsx';

// Define the App function
function App() {
  // Sample patient data to pass as props
  const samplePatient = {
    name: "John Doe",
    age: 45,
    diagnosis: "Hypertension",
    contact: "123-456-7890"
  };

  return (
    <div className="App">
      {/* Pass the patientData object to the Patient component */}
      <Patient patientData={samplePatient} />
    </div>
  );
}

export default App;
