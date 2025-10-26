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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RiskPredictionService {

    private final RiskPredictionRepository predictionRepo;
    private final UserRepository userRepository;

    public PredictionCreatedResponseDto create(CreateRiskPredictionRequestDto req) {
        // Get patient reference
        User patientRef = userRepository.getReferenceById(req.getPatientId());

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
        // Calculate age (assuming we have birth date or age field)
        // For now, we'll use a default age of 30 if not available
        double age = 30.0; // TODO: Calculate actual age from user data
        
        // Convert gender to numeric (0 for female, 1 for male)
        double sex = user.getGender() == 'M' ? 1.0 : 0.0;
        
        // Get user's weight and BMI
        double weight = user.getWeight() != null ? user.getWeight().doubleValue() : 70.0;
        double bmi = user.getBmi() != null ? user.getBmi().doubleValue() : 25.0;
        
        // Get environmental and physiological factors from request
        double temperature = req.getTemperature().doubleValue();
        double humidity = req.getHumidity().doubleValue();
        double pulse = req.getPulse().doubleValue();
        double dehydrationLevel = req.getDehydrationLevel() != null ? req.getDehydrationLevel().doubleValue() : 0.5;
        double heatIndex = req.getHeatIndex() != null ? req.getHeatIndex().doubleValue() : temperature;
        
        // Additional factors (can be enhanced based on available data)
        double patientTemperature = temperature + 1.0; // Assume patient temp is slightly higher than environmental
        double sweating = dehydrationLevel > 0.7 ? 1.0 : 0.5; // More dehydration = less sweating
        double hotDrySkin = dehydrationLevel > 0.8 ? 1.0 : 0.0; // High dehydration = hot/dry skin

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
