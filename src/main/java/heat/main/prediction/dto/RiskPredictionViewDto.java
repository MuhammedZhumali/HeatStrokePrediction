package heat.main.users.dto;

import heat.main.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Возврат для GET: и вводные, и результат модели. */
@Data                   // включает getter/setter/toString/equals/hashCode
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
