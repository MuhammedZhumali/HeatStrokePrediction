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
        Page<RiskPrediction> entities = predictionRepo.findAllByUser_IdOrderByAssessmentTimestampDesc(userId, pageable);
        return entities.map(this::toViewDto);
    }

    public RiskPredictionViewDto getUserPredictionById(Long userId, Long predictionId) {
        RiskPrediction entity = predictionRepo.findByIdAndUser_Id(predictionId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Prediction not found for user"));
        return toViewDto(entity);
    }

    private RiskPredictionViewDto toViewDto(RiskPrediction entity) {
        return RiskPredictionViewDto.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .temperature(entity.getTemperature())
                .humidity(entity.getHumidity())
                .pulse(entity.getPulse())
                .dehydrationLevel(entity.getDehydrationLevel())
                .heatIndex(entity.getHeatIndex())
                .predictedProbability(entity.getPredictedProbability())
                .predictedRiskLevel(entity.getPredictedRiskLevel())
                .modelVersion(null)
                .assessmentTimestamp(entity.getAssessmentTimestamp())
                .notes(entity.getNotes())
                .build();
    }
}
