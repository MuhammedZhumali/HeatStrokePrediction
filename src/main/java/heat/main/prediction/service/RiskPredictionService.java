package heat.main.prediction.service;

import heat.main.domain.RiskPrediction;
import heat.main.domain.User;
import heat.main.enums.RiskLevel;
import heat.main.prediction.repository.RiskPredictionRepository;
import heat.main.prediction.dto.CreateRiskPredictionRequestDto;
import heat.main.prediction.dto.RiskPredictionViewDto;
import heat.main.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RiskPredictionService {

    private final RiskPredictionRepository predictionRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long create(CreateRiskPredictionRequestDto req) {
        User user = userRepository.findById(req.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + req.getPatientId()));

        LocalDateTime assessedAt = LocalDateTime.now();

        BigDecimal bmi = req.getBmi() != null ? req.getBmi() : user.getBmi();
        BigDecimal heatIndex = req.getHeatIndex();

        RiskPrediction entity = RiskPrediction.builder()
                .user(user)

                // входные параметры
                .temperature(req.getTemperature())
                .humidity(req.getHumidity())
                .pulse(req.getPulse())
                .dehydrationLevel(req.getDehydrationLevel())
                .heatIndex(heatIndex)
                .bmi(bmi)

                // выход модели
                .predictedProbability(req.getPredictedProbability())
                .predictedRiskLevel(req.getPredictedRiskLevel() != null ? req.getPredictedRiskLevel() : RiskLevel.LOW)

                // метаданные
                .assessmentTimestamp(assessedAt)
                .notes(req.getNotes())
                .build();

        RiskPrediction saved = predictionRepository.save(entity);
        return saved.getId();
    }

    @Transactional
    public Page<RiskPredictionViewDto> getUserPredictions(Long userId, int page, int size) {
        Page<RiskPrediction> predictions = predictionRepository
                .findAllByUser_IdOrderByAssessmentTimestampDesc(userId, PageRequest.of(page, size));

        return predictions.map(this::toViewDto);
    }

    @Transactional
    public RiskPredictionViewDto getUserPredictionById(Long userId, Long predictionId) {
        RiskPrediction e = predictionRepository.findByIdAndUser_Id(predictionId, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Prediction not found by id=" + predictionId + " for userId=" + userId));

        return toViewDto(e);
    }

    private RiskPredictionViewDto toViewDto(RiskPrediction e) {
        return RiskPredictionViewDto.builder()
                .id(e.getId())
                .userId(e.getUser() != null ? e.getUser().getId() : null)

                // входные
                .temperature(e.getTemperature())
                .humidity(e.getHumidity())
                .pulse(e.getPulse())
                .dehydrationLevel(e.getDehydrationLevel())
                .heatIndex(e.getHeatIndex())
                .bmi(e.getBmi())

                // выход модели
                .predictedProbability(e.getPredictedProbability())
                .predictedRiskLevel(e.getPredictedRiskLevel())

                // мета
                .assessmentTimestamp(e.getAssessmentTimestamp())
                .notes(e.getNotes())
                .build();
    }
}
