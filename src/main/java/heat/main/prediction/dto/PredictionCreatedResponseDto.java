package heat.main.prediction.dto;

import heat.main.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PredictionCreatedResponseDto {
    private Long id;                    // Prediction ID
    private Long patientId;
    private String patientName;
    private BigDecimal predictedProbability;
    private RiskLevel predictedRiskLevel;
    private LocalDateTime assessmentTimestamp;
    private String notes;
}