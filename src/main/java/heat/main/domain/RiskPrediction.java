package heat.main.domain;

import heat.main.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Id;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity
@Table(name = "core_prediction")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskPrediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User user;

    @Column(name = "temperature", nullable = false, precision = 5, scale = 2)
    private BigDecimal temperature;

    @Column(name = "humidity", nullable = false, precision = 5, scale = 2)
    private BigDecimal humidity;

    @Column(name = "pulse", nullable = false, precision = 5, scale = 2)
    private BigDecimal pulse;

    @Column(name = "dehydration_level", nullable = false, precision = 5, scale = 2)
    private BigDecimal dehydrationLevel;

    @Column(name = "heat_index", nullable = false)
    private BigDecimal heatIndex;

    @Column(name = "predicted_probability", nullable = false, precision = 6, scale = 4)
    private BigDecimal predictedProbability;

    @Enumerated(EnumType.STRING)
    @Column(name = "predicted_risk_level", nullable = false, length = 16)
    private RiskLevel predictedRiskLevel;

    @Column(name = "assessment_timestamp", nullable = false)
    private LocalDateTime assessmentTimestamp;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}