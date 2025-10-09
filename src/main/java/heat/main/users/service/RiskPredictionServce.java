package heat.main.users.service;

import heat.main.domain.RiskPrediction;
import heat.main.domain.User;
import heat.main.enums.RiskLevel;
import heat.main.users.repository.RiskPredictionRepository;
import heat.main.users.repository.UserRepository;
import heat.main.users.dto.CreateRiskPredictionRequest;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RiskPredictionService {

    private final RiskPredictionRepository predictionRepo;
    private final EntityManager em;

    @Transactional
    public Long create(CreateRiskPredictionRequest req) {
        User patientRef = em.getReference(User.class, req.patientId());

        RiskPrediction entity = RiskPrediction.builder()
                .patient(patientRef)    // хз че здесь надо было поставить если честно, user попробовал, но все равно не помогло
                .temperature(req.temperature())
                .humidity(req.humidity())
                .pulse(req.pulse())
                .dehydrationLevel(req.dehydrationLevel())
                .heatIndex(req.heatIndex())
                .bmi(req.bmi())
                .predictedProbability(req.predictedProbability())
                .predictedRiskLevel(req.predictedRiskLevel())
                .modelVersion(req.modelVersion())
                .assessmentTimestamp(LocalDateTime.now())
                .notes(req.notes())
                .build();

        return predictionRepo.save(entity).getId();
    }
}
