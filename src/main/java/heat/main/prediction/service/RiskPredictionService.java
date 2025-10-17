package heat.main.users.service;

import heat.main.domain.RiskPrediction;
import heat.main.domain.User;

import heat.main.users.dto.RiskPredictionViewDto;
import heat.main.users.dto.CreateRiskPredictionRequestDto;
import heat.main.users.repository.UserRepository;
import heat.main.users.repository.RiskPredictionRepository;

import lombok.RequiredArgsConstructor;
import javax.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RiskPredictionService {

    private final RiskPredictionRepository predictionRepo;
    private final UserRepository userRepository;

    @Transactional
    public Long create(CreateRiskPredictionRequestDto req) {
        User patientRef = userRepository.findById(req.getPatientId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + req.getPatientId()));

        RiskPrediction entity = RiskPrediction.builder()
                .user(patientRef)
                .temperature(req.getTemperature())
                .humidity(req.getHumidity())
                .pulse(req.getPulse())
                .dehydrationLevel(req.getDehydrationLevel())
                .heatIndex(req.getHeatIndex())
                .bmi(req.getBmi())
                .predictedRiskLevel(req.getPredictedRiskLevel())
                .predictedProbability(req.getPredictedProbability())
                .assessmentTimestamp(LocalDateTime.now())
                .build();

        return predictionRepo.save(entity).getId();
    }
        public Page<RiskPredictionViewDto> getUserPredictions(Long userId, int page, int size) {
            var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 200));
            var entities = predictionRepo.findAllByUser_IdOrderByAssessmentTimestampDesc(userId, pageable);
            var dtoList = entities.getContent().stream()
                    .map(this::toViewDto)
                    .collect(Collectors.toList());
            return new PageImpl<>(dtoList, pageable, entities.getTotalElements());
        }

        public RiskPredictionViewDto getUserPredictionById(Long userId, Long predictionId) {
            var entity = predictionRepo.findByIdAndUser_Id(predictionId, userId)
                    .orElseThrow(() -> new IllegalArgumentException("Prediction not found or access denied"));
            return toViewDto(entity);
        }

        private RiskPredictionViewDto toViewDto(RiskPrediction e) {
            return RiskPredictionViewDto.builder()
                    .id(e.getId())
                    .userId(e.getUser().getId())
                    .temperature(e.getTemperature())
                    .humidity(e.getHumidity())
                    .pulse(e.getPulse())
                    .dehydrationLevel(e.getDehydrationLevel())
                    .heatIndex(e.getHeatIndex())
                    .bmi(e.getBmi())
                    .predictedProbability(e.getPredictedProbability())
                    .predictedRiskLevel(e.getPredictedRiskLevel())
                    .modelVersion(e.getModelVersion())
                    .assessmentTimestamp(e.getAssessmentTimestamp())
                    .notes(e.getNotes())
                    .build();
        }
    }
