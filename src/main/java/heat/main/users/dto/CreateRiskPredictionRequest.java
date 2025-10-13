package heat.main.users.dto;


import heat.main.enums.RiskLevel;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateRiskPredictionRequest{
        @NotNull
        @Id
        public Long patientId;         // ID пациента (User.id)

        // --- примеры входных признаков (оставь только свои реально используемые) ---
        @NotNull
        public BigDecimal temperature;
        @NotNull
        public BigDecimal humidity;
        @NotNull
        public BigDecimal pulse;
        public BigDecimal dehydrationLevel;
        public BigDecimal heatIndex;
        public BigDecimal bmi;

        // --- выход модели ---
        @NotNull @DecimalMin("0.0") @DecimalMax("1.0")
        public BigDecimal predictedProbability;

        @NotNull
        public RiskLevel predictedRiskLevel;

        // --- метаданные ---
        public String modelVersion;
        public String notes;
}
