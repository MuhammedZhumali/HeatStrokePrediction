package heat.main.users.service;

import heat.main.domain.RiskPrediction;
import heat.main.domain.User;
import heat.main.users.dto.CreateRiskPredictionRequestDto;
import heat.main.users.dto.PredictionCreatedResponseDto;
import heat.main.users.repository.RiskPredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional; // <— spring-транзакции

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class RiskPredictionService {

    private final RiskPredictionRepository predictionRepo;

    @PersistenceContext                                   // <— так корректно инжектить EM в SB2
    private EntityManager em;


    @Transactional
    public PredictionCreatedResponseDto create(CreateRiskPredictionRequestDto req) {
        User patientRef = em.getReference(User.class, req.getPatientId());

        RiskPrediction entity = RiskPrediction.builder()
                .user(patientRef)    // хз че здесь надо было поставить если честно, user попробовал, но все равно не помогло
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

        RiskPrediction saved = predictionRepo.save(entity);

        return new PredictionCreatedResponseDto(
                saved.getId(),
                patientRef.getId(),
                patientRef.getName()
        );
    }
}
