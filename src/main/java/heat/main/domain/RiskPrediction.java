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
@Table(
        name = "risk_prediction",
        indexes = {
                @Index(name = "idx_rp_patient", columnList = "patient_id"),
                @Index(name = "idx_rp_risk_level", columnList = "predicted_risk_level"),
                @Index(name = "idx_rp_assessed_at", columnList = "assessment_timestamp")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskPrediction {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        // 🔗 связь с пользователем (пациентом)
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "patient_id", nullable = false)
        private User user;

        // 🔢 входные признаки
        @Column(name = "temperature", nullable = false)
        private BigDecimal temperature;

        @Column(name = "humidity", nullable = false)
        private BigDecimal humidity;

        @Column(name = "pulse", nullable = false)
        private BigDecimal pulse;

        @Column(name = "dehydration_level")
        private BigDecimal dehydrationLevel;

        @Column(name = "heat_index")
        private BigDecimal heatIndex;

        @Column(name = "bmi")
        private BigDecimal bmi;

        // 🧠 выход модели
        @Column(name = "predicted_probability", nullable = false, precision = 6, scale = 4)
        private BigDecimal predictedProbability;

        @Enumerated(EnumType.STRING)
        @Column(name = "predicted_risk_level", nullable = false, length = 16)
        private RiskLevel predictedRiskLevel;

        // 🧾 метаданные
        @Column(name = "model_version", length = 64)
        private String modelVersion;

        @Column(name = "assessment_timestamp", nullable = false)
        private LocalDateTime assessmentTimestamp;

        @Column(name = "notes", columnDefinition = "text")
        private String notes;
}
