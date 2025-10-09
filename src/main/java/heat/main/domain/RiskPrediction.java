package heat.main.domain;

import heat.main.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "heatstroke_risk_predictions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor


public class RiskPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "temperature")
    private BigDecimal temperature;

    @Column(name = "humidity")
    private BigDecimal humidity;

    @Column(name = "pulse")
    private BigDecimal pulse;

    @Column(name = "dehydration_level")
    private BigDecimal dehydrationLevel;

    @Column(name = "heat_index")
    private BigDecimal heatIndex;

    @Column(name = "bmi")
    private BigDecimal bmi;

    @Column(name = "predicted_probability")
    private BigDecimal predictedProbability;

    @Enumerated(EnumType.STRING)
    @Column(name = "predicted_risk_level")
    private RiskLevel predictedRiskLevel;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "assessment_timestamp")
    private LocalDateTime assessmentTimestamp;

    @Column(name = "notes")
    private String notes;

}
