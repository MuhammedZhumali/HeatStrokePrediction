package heat.main.users.service;

import heat.main.domain.RiskPrediction;
import heat.main.domain.User;
import heat.main.enums.RiskLevel;
import heat.main.users.dto.CreateRiskPredictionRequestDto;
import heat.main.users.repository.RiskPredictionRepository;
import heat.main.users.repository.UserRepository;
import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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
}
