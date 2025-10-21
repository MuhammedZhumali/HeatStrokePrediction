package heat.main.prediction.service;

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

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RiskPredictionService {

    private final RiskPredictionRepository predictionRepo;
    private final UserRepository userRepository;

    public PredictionCreatedResponseDto create(CreateRiskPredictionRequestDto req) {
        // Get patient reference
        User patientRef = userRepository.getReferenceById(req.getPatientId());

        // Build and save entity
        RiskPrediction entity = RiskPrediction.builder()
                .user(patientRef)
                .temperature(req.getTemperature())
                .humidity(req.getHumidity())
                .pulse(req.getPulse())
                .dehydrationLevel(req.getDehydrationLevel())
                .heatIndex(req.getHeatIndex())
                .predictedRiskLevel(req.getPredictedRiskLevel())
                .predictedProbability(req.getPredictedProbability())
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
