package heat.main.users.repository;

import heat.main.domain.RiskPrediction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiskPredictionRepository extends JpaRepository<RiskPrediction, Long> { }

