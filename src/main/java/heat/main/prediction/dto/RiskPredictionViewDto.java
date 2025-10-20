package heat.main.prediction.dto;

import heat.main.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskPredictionViewDto {
    private Long id;
    private Long userId;

    // входные
    private BigDecimal temperature;
    private BigDecimal humidity;
    private BigDecimal pulse;
    private BigDecimal dehydrationLevel;
    private BigDecimal heatIndex;
    private BigDecimal bmi;

    // выход модели
    private BigDecimal predictedProbability;
    private RiskLevel predictedRiskLevel;
    private String modelVersion;

    // мета
    private LocalDateTime assessmentTimestamp;
    private String notes;
}
