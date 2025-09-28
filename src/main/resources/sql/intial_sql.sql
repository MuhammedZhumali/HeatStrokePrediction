-- Main users table (patients)
CREATE TABLE patients (
                          patient_id INT AUTO_INCREMENT PRIMARY KEY,
                          name VARCHAR(100) NOT NULL,
                          email VARCHAR(255) UNIQUE NOT NULL,
                          phone VARCHAR(20),
                          dob DATE,
                          gender ENUM('Male', 'Female'),
                          height DOUBLE NOT NULL, -- cm
                          weight DOUBLE NOT NULL, -- kg
                          role ENUM('patient', 'admin') DEFAULT 'patient',
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin users (separate for security)
CREATE TABLE admins (
                        admin_id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        role ENUM('super_admin', 'support_admin') DEFAULT 'support_admin',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE heatstroke_risk_predictions (
                                             prediction_id INT AUTO_INCREMENT PRIMARY KEY,
                                             patient_id INT NOT NULL,
    -- Input features
                                             age DOUBLE NOT NULL,
                                             sex DOUBLE NOT NULL,
                                             weight DOUBLE NOT NULL,
                                             height DOUBLE NOT NULL,
                                             bmi DOUBLE NOT NULL,
                                             dehydration DOUBLE NOT NULL,
                                             heat_index DOUBLE NOT NULL,
                                             environmental_temperature DOUBLE NOT NULL,
                                             relative_humidity DOUBLE NOT NULL,
                                             heart_rate DOUBLE NOT NULL,
                                             patient_temperature DOUBLE NOT NULL,
                                             sweating DOUBLE NOT NULL,
                                             hot_dry_skin DOUBLE NOT NULL,
                                             heat_stroke DOUBLE NOT NULL,
    -- Model outputs
                                             probability_0 DOUBLE NOT NULL, -- Low risk
                                             probability_1 DOUBLE NOT NULL, -- Medium risk
                                             probability_2 DOUBLE NOT NULL, -- High risk
    -- Risk assessment
                                             risk_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
                                             confidence_score DOUBLE, -- Model confidence
    -- Metadata
                                             model_version VARCHAR(20),
                                             prediction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                             FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
                                             INDEX idx_patient_risk_time (patient_id, risk_level, prediction_timestamp)
);

