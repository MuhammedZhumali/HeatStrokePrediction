package heat.main.prediction.repository;

import heat.main.domain.RiskPrediction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiskPredictionRepository extends JpaRepository<RiskPrediction, Long> { }

