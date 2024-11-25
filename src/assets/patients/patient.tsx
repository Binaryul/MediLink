import PropTypes from 'prop-types';
import styles from './patient.module.css';


function Patient({ patientData }: { patientData: PatientInfo }) {
  return (
    <div className={styles.patientCard}>
      <h2>Patient Information</h2>
      <p><strong>Name:</strong> {patientData.name}</p>
      <p><strong>Age:</strong> {patientData.age}</p>
      <p><strong>Diagnosis:</strong> {patientData.diagnosis}</p>
      <p><strong>Contact:</strong> {patientData.contact}</p>
    </div>
  );
}

Patient.propTypes = {
  patientData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
    diagnosis: PropTypes.string.isRequired,
    contact: PropTypes.string.isRequired
  }).isRequired
};

Patient.defaultProps = {
  name: "Not Real",
  age: "Infinite",
  diagnosis: "death",
  contact: "fax machine"
};

export default Patient;
