import PropTypes from 'prop-types';
import styles from './patient.module.css';


/*type PatientInfo ={
  name: string;
  age: number;
  diagnosis: string;
  contact: string;
};*/

const defaultPatientData: PatientInfo = {
  name: "Not Real",
  age: 0,
  diagnosis: "death",
  contact: "fax machine",
};

function Patient({ patientData }: { patientData: Partial<PatientInfo>; }) {
  const sanitizedData: PatientInfo = {
    name: typeof patientData.name === "string" ? patientData.name : defaultPatientData.name,
    age: typeof patientData.age === "number" ? patientData.age : defaultPatientData.age,
    diagnosis: typeof patientData.diagnosis === "string" ? patientData.diagnosis : defaultPatientData.diagnosis,
    contact: typeof patientData.contact === "string" ? patientData.contact : defaultPatientData.contact,
  };


  return (
    <div className={styles.patientCard}>
      <h2><strong>Name:</strong> {sanitizedData.name}</h2>
      <p><strong>Age:</strong> {sanitizedData.age}</p>
      <p><strong>Diagnosis:</strong> {sanitizedData.diagnosis}</p>
      <p><strong>Contact:</strong> {sanitizedData.contact}</p>
    </div>
  );
}

Patient.propTypes = {
  patientData: PropTypes.shape({
    name: PropTypes.string,
    age: PropTypes.number,
    diagnosis: PropTypes.string,
    contact: PropTypes.string,
  }),
};

Patient.defaultProps = {
  patientData: defaultPatientData,
};

export default Patient;
