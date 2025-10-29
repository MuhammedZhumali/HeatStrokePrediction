package heat.main;

import heat.main.enums.RiskLevel;
import org.jpmml.evaluator.*;
import org.jpmml.model.PMMLException;
import org.xml.sax.SAXException;
import lombok.extern.slf4j.Slf4j;

import jakarta.xml.bind.JAXBException;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class ModelRunner {

    private static ModelEvaluator<?> evaluator;
    private static boolean initialized = false;
    private static int predictionCounter = 0;

    static {
        initializeModel();
    }

    private static void initializeModel() {
        String resourcePath = "model/corrected_model.pmml";

        try (InputStream is = Thread.currentThread()
                .getContextClassLoader()
                .getResourceAsStream(resourcePath)) {

            if (is == null) {
                throw new IllegalStateException("PMML file not found on classpath: " + resourcePath);
            }

            evaluator = new LoadingModelEvaluatorBuilder()
                    .load(is)
                    .build();
            evaluator.verify();
            initialized = true;

            log.info("Model loaded successfully!");
            
            // Log input fields for debugging
            log.info("=== Model Input Fields ===");
            for (InputField f : evaluator.getInputFields()) {
                log.info("Input Field: {} | Type: {}", f.getName(), f.getDataType());
            }

            // Log output fields for debugging
            log.info("=== Model Output Fields ===");
            for (OutputField f : evaluator.getOutputFields()) {
                log.info("Output Field: {} | Type: {}", f.getName(), f.getDataType());
            }

        } catch (ParserConfigurationException | SAXException | PMMLException | IOException | JAXBException e) {
            e.printStackTrace();
            throw new IllegalStateException("Failed to load/verify PMML model", e);
        }
    }

    public static PredictionResult predictRisk(PredictionInput input) {
        if (!initialized) {
            throw new IllegalStateException("Model not initialized");
        }

        predictionCounter++;
        int currentPredictionId = predictionCounter;

        try {
            // Prepare input data for the model
            Map<String, Object> inputData = new HashMap<>();
            
            // Map our input fields to model fields
            inputData.put("Age", input.getAge());
            inputData.put("Sex", input.getSex());
            inputData.put("Weight (kg)", input.getWeight());
            inputData.put("BMI", input.getBmi());
            inputData.put("Dehydration", input.getDehydrationLevel());
            inputData.put("Heat Index (HI)", input.getHeatIndex());
            inputData.put("Environmental temperature (C)", input.getTemperature());
            inputData.put("Relative Humidity", input.getHumidity());
            inputData.put("Heart / Pulse rate (b/min)", input.getPulse());
            inputData.put("Patient temperature", input.getPatientTemperature());
            inputData.put("Sweating", input.getSweating());
            inputData.put("Hot/dry skin", input.getHotDrySkin());

            // Log detailed patient properties
            log.info("=== Prediction #{} ===", currentPredictionId);
            log.info("Patient {}:", currentPredictionId);
            log.info("  Properties: {}", inputData);

            // Create input vector
            Map<String, FieldValue> arguments = new HashMap<>();
            for (InputField inputField : evaluator.getInputFields()) {
                String inputName = inputField.getName();
                Object rawValue = inputData.get(inputName);
                
                if (rawValue != null) {
                    FieldValue inputValue = inputField.prepare(rawValue);
                    arguments.put(inputName, inputValue);
                }
            }

            // Evaluate the model
            Map<String, ?> results = evaluator.evaluate(arguments);

            // Extract results
            Map<String, Object> resultMap = new HashMap<>();
            for (Map.Entry<String, ?> entry : results.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();
                resultMap.put(key, value);
            }

            // Get probabilities
            // CORRECTED MAPPING: sklearn LabelEncoder sorts alphabetically
            // 0 = "High", 1 = "Moderate", 2 = "No"
            Double probHigh = (Double) resultMap.get("probability(0)");
            Double probModerate = (Double) resultMap.get("probability(1)");
            Double probNo = (Double) resultMap.get("probability(2)");

            // Log raw probabilities for debugging
            log.debug("Raw probabilities - High: {}, Moderate: {}, No: {}", probHigh, probModerate, probNo);

            // Determine risk level based on highest probability
            RiskLevel riskLevel;
            Double maxProbability;
            
            if (probHigh != null && probHigh >= probModerate && probHigh >= probNo) {
                riskLevel = RiskLevel.HIGH;
                maxProbability = probHigh;
            } else if (probModerate != null && probModerate >= probNo) {
                riskLevel = RiskLevel.MEDIUM;
                maxProbability = probModerate;
            } else {
                riskLevel = RiskLevel.LOW;
                maxProbability = probNo != null ? probNo : 0.0;
            }

            // Log detailed prediction results
            log.info("  Predicted Risk Label: {}", riskLevel);
            log.info("  Predicted Probabilities: High:{}, Moderate:{}, No:{}", 
                    String.format("%.3f", probHigh != null ? probHigh * 100 : 0.0),
                    String.format("%.3f", probModerate != null ? probModerate * 100 : 0.0),
                    String.format("%.3f", probNo != null ? probNo * 100 : 0.0));
            log.info("  Confidence: {}%", String.format("%.1f", maxProbability * 100));
            log.info("=== End Prediction #{} ===", currentPredictionId);

            return new PredictionResult(
                BigDecimal.valueOf(maxProbability),
                riskLevel,
                BigDecimal.valueOf(probNo != null ? probNo : 0.0),
                BigDecimal.valueOf(probModerate != null ? probModerate : 0.0),
                BigDecimal.valueOf(probHigh != null ? probHigh : 0.0)
            );

        } catch (Exception e) {
            log.error("Error during model prediction for Patient {}: {}", currentPredictionId, e.getMessage(), e);
            throw new RuntimeException("Error during model prediction", e);
        }
    }

    public static boolean isInitialized() {
        return initialized;
    }

    public static int getPredictionCount() {
        return predictionCounter;
    }

    public static void resetPredictionCounter() {
        predictionCounter = 0;
        log.info("Prediction counter reset to 0");
    }

    // Input class for prediction
    public static class PredictionInput {
        private double age;
        private double sex; // 0 for female, 1 for male
        private double weight;
        private double bmi;
        private double dehydrationLevel;
        private double heatIndex;
        private double temperature;
        private double humidity;
        private double pulse;
        private double patientTemperature;
        private double sweating;
        private double hotDrySkin;

        // Constructors
        public PredictionInput() {}

        public PredictionInput(double age, double sex, double weight, double bmi, 
                             double dehydrationLevel, double heatIndex, double temperature, 
                             double humidity, double pulse, double patientTemperature, 
                             double sweating, double hotDrySkin) {
            this.age = age;
            this.sex = sex;
            this.weight = weight;
            this.bmi = bmi;
            this.dehydrationLevel = dehydrationLevel;
            this.heatIndex = heatIndex;
            this.temperature = temperature;
            this.humidity = humidity;
            this.pulse = pulse;
            this.patientTemperature = patientTemperature;
            this.sweating = sweating;
            this.hotDrySkin = hotDrySkin;
        }

        // Getters and setters
        public double getAge() { return age; }
        public void setAge(double age) { this.age = age; }

        public double getSex() { return sex; }
        public void setSex(double sex) { this.sex = sex; }

        public double getWeight() { return weight; }
        public void setWeight(double weight) { this.weight = weight; }

        public double getBmi() { return bmi; }
        public void setBmi(double bmi) { this.bmi = bmi; }

        public double getDehydrationLevel() { return dehydrationLevel; }
        public void setDehydrationLevel(double dehydrationLevel) { this.dehydrationLevel = dehydrationLevel; }

        public double getHeatIndex() { return heatIndex; }
        public void setHeatIndex(double heatIndex) { this.heatIndex = heatIndex; }

        public double getTemperature() { return temperature; }
        public void setTemperature(double temperature) { this.temperature = temperature; }

        public double getHumidity() { return humidity; }
        public void setHumidity(double humidity) { this.humidity = humidity; }

        public double getPulse() { return pulse; }
        public void setPulse(double pulse) { this.pulse = pulse; }

        public double getPatientTemperature() { return patientTemperature; }
        public void setPatientTemperature(double patientTemperature) { this.patientTemperature = patientTemperature; }

        public double getSweating() { return sweating; }
        public void setSweating(double sweating) { this.sweating = sweating; }

        public double getHotDrySkin() { return hotDrySkin; }
        public void setHotDrySkin(double hotDrySkin) { this.hotDrySkin = hotDrySkin; }
    }

    // Result class for prediction
    public static class PredictionResult {
        private BigDecimal predictedProbability;
        private RiskLevel predictedRiskLevel;
        private BigDecimal lowRiskProbability;
        private BigDecimal moderateRiskProbability;
        private BigDecimal highRiskProbability;

        public PredictionResult(BigDecimal predictedProbability, RiskLevel predictedRiskLevel,
                               BigDecimal lowRiskProbability, BigDecimal moderateRiskProbability, 
                               BigDecimal highRiskProbability) {
            this.predictedProbability = predictedProbability;
            this.predictedRiskLevel = predictedRiskLevel;
            this.lowRiskProbability = lowRiskProbability;
            this.moderateRiskProbability = moderateRiskProbability;
            this.highRiskProbability = highRiskProbability;
        }

        // Getters
        public BigDecimal getPredictedProbability() { return predictedProbability; }
        public RiskLevel getPredictedRiskLevel() { return predictedRiskLevel; }
        public BigDecimal getLowRiskProbability() { return lowRiskProbability; }
        public BigDecimal getModerateRiskProbability() { return moderateRiskProbability; }
        public BigDecimal getHighRiskProbability() { return highRiskProbability; }
    }
}
