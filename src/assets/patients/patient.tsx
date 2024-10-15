import styles from './patient.module.css'


function Patients(props:any){
    return(
        <div >
            <p className={styles.stop}>Name: {props.name}</p>
        </div>
    )
}

export default Patients