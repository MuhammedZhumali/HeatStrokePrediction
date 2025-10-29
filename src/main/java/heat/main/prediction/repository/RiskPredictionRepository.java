package heat.main.prediction.repository;

import heat.main.domain.RiskPrediction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RiskPredictionRepository extends JpaRepository<RiskPrediction, Long> {

    Page<RiskPrediction> findAllByUser_IdOrderByAssessmentTimestampDesc(Long userId, Pageable pageable);

    Page<RiskPrediction> findAllByOrderByAssessmentTimestampDesc(Pageable pageable);

    Optional<RiskPrediction> findByIdAndUser_Id(Long id, Long userId);
}
