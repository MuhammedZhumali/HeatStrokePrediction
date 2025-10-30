package heat.main.prediction.service;

import heat.main.ModelRunner;
import heat.main.domain.RiskPrediction;
import heat.main.domain.User;
import heat.main.prediction.dto.CreateRiskPredictionRequestDto;
import heat.main.prediction.dto.PredictionCreatedResponseDto;
import heat.main.prediction.dto.RiskPredictionViewDto;
import heat.main.prediction.repository.RiskPredictionRepository;
import heat.main.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class RiskPredictionService {

    private final RiskPredictionRepository predictionRepo;
    private final UserRepository userRepository;

    public PredictionCreatedResponseDto create(CreateRiskPredictionRequestDto req) {
        log.info("Creating risk prediction for patient ID: {}", req.getPatientId());
        
        // Get patient reference
        User patientRef = userRepository.getReferenceById(req.getPatientId());
        log.debug("Retrieved patient: {} (Gender: {}, Weight: {}, BMI: {})", 
                patientRef.getName(), patientRef.getGender(), patientRef.getWeight(), patientRef.getBmi());

        // Use the model to predict risk level and probability
        ModelRunner.PredictionResult modelResult = predictRiskLevel(req, patientRef);

        // Build and save entity with model predictions
        RiskPrediction entity = RiskPrediction.builder()
                .user(patientRef)
                .temperature(req.getTemperature())
                .humidity(req.getHumidity())
                .pulse(req.getPulse())
                .dehydrationLevel(req.getDehydrationLevel())
                .heatIndex(req.getHeatIndex())
                .predictedRiskLevel(modelResult.getPredictedRiskLevel())
                .predictedProbability(modelResult.getPredictedProbability())
                .assessmentTimestamp(LocalDateTime.now())
                .notes(req.getNotes())
                .build();

        RiskPrediction savedPrediction = predictionRepo.save(entity);
        
        log.info("Successfully saved prediction with ID: {} for patient: {} - Risk Level: {}, Confidence: {:.1f}%", 
                savedPrediction.getId(), 
                savedPrediction.getUser().getName(),
                savedPrediction.getPredictedRiskLevel(),
                savedPrediction.getPredictedProbability().multiply(BigDecimal.valueOf(100)).doubleValue());

        return new PredictionCreatedResponseDto(
                savedPrediction.getId(),
                savedPrediction.getUser().getId(),
                savedPrediction.getUser().getName(),
                savedPrediction.getPredictedProbability(),
                savedPrediction.getPredictedRiskLevel(),
                savedPrediction.getAssessmentTimestamp(),
                savedPrediction.getNotes()
        );
    }

    private ModelRunner.PredictionResult predictRiskLevel(CreateRiskPredictionRequestDto req, User user) {
        double age = req.getAge() != null ? req.getAge().doubleValue() : 30.0;
        
        // Convert gender to numeric (0 for female, 1 for male)
        double sex = user.getGender() == 'M' ? 1.0 : 0.0;
        
        // Get user's weight and BMI
        double weight = user.getWeight() != null ? user.getWeight().doubleValue() : 70.0;
        double bmi = user.getBmi() != null ? user.getBmi().doubleValue() : 25.0;
        
        // Get environmental and physiological factors from request
        double temperature = req.getTemperature().doubleValue();
        // Normalize humidity: accept either [0,1] fraction or [0,100] percentage
        double humidity = req.getHumidity().doubleValue();
        if (humidity > 1.0) {
            humidity = humidity / 100.0;
        }
        // Clamp to [0,1] to avoid invalid values reaching the model
        if (humidity < 0.0) {
            humidity = 0.0;
        } else if (humidity > 1.0) {
            humidity = 1.0;
        }
        double pulse = req.getPulse().doubleValue();
        double dehydrationLevel = req.getDehydrationLevel() != null ? req.getDehydrationLevel().doubleValue() : 0.5;
        double heatIndex = req.getHeatIndex() != null ? req.getHeatIndex().doubleValue() : temperature;

        double patientTemperature;
        double sweating;
        double hotDrySkin;
        
        if (req.getPatientTemperature() != null) {
            patientTemperature = req.getPatientTemperature().doubleValue();
        } else {
            // Patient temp is usually 0.5-2°C higher than environmental in heat stress
            double tempIncrease = Math.min(2.0, Math.max(0.5, (temperature - 25.0) * 0.1));
            patientTemperature = temperature + tempIncrease;
        }
        
        if (req.getSweating() != null) {
            sweating = req.getSweating().doubleValue();
        } else {
            if (dehydrationLevel > 0.8) {
                sweating = 0.0; // No sweating when severely dehydrated
            } else if (dehydrationLevel > 0.5) {
                sweating = 0.3; // Reduced sweating when moderately dehydrated
            } else if (temperature > 35.0) {
                sweating = 1.0; // Full sweating in hot conditions
            } else {
                sweating = 0.7; // Normal sweating
            }
        }
        
        if (req.getHotDrySkin() != null) {
            hotDrySkin = req.getHotDrySkin().doubleValue();
        } else {
            // Hot/dry skin occurs with high dehydration and high temperature
            if (dehydrationLevel > 0.7 && temperature > 32.0) {
                hotDrySkin = 1.0; // Hot/dry skin likely
            } else if (dehydrationLevel > 0.5 && temperature > 35.0) {
                hotDrySkin = 0.5; // Partially hot/dry skin
            } else {
                hotDrySkin = 0.0; // Normal skin
            }
        }

        // Create prediction input
        ModelRunner.PredictionInput input = new ModelRunner.PredictionInput(
                age, sex, weight, bmi, dehydrationLevel, heatIndex,
                temperature, humidity, pulse, patientTemperature, sweating, hotDrySkin
        );

        // Get model prediction
        return ModelRunner.predictRisk(input);
    }

    public Page<RiskPredictionViewDto> getUserPredictions(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RiskPrediction> predictions = predictionRepo.findAllByUser_IdOrderByAssessmentTimestampDesc(userId, pageable);
        return predictions.map(this::convertToViewDto);
    }

    public RiskPredictionViewDto getUserPredictionById(Long userId, Long predictionId) {
        return predictionRepo.findByIdAndUser_Id(predictionId, userId)
                .map(this::convertToViewDto)
                .orElseThrow(() -> new RuntimeException("Prediction not found for user"));
    }

    public Page<RiskPredictionViewDto> getAllPredictions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RiskPrediction> predictions = predictionRepo.findAllByOrderByAssessmentTimestampDesc(pageable);
        return predictions.map(this::convertToViewDto);
    }

    public RiskPredictionViewDto convertToViewDto(RiskPrediction prediction) {
        return RiskPredictionViewDto.builder()
                .id(prediction.getId())
                .userId(prediction.getUser().getId())
                .temperature(prediction.getTemperature())
                .humidity(prediction.getHumidity())
                .pulse(prediction.getPulse())
                .dehydrationLevel(prediction.getDehydrationLevel())
                .heatIndex(prediction.getHeatIndex())
                .predictedProbability(prediction.getPredictedProbability())
                .predictedRiskLevel(prediction.getPredictedRiskLevel())
                .assessmentTimestamp(prediction.getAssessmentTimestamp())
                .notes(prediction.getNotes())
                .build();
    }
}
