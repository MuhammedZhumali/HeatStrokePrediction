package heat.main.users.dto;

import heat.main.enums.RiskLevel;
import lombok.*;

import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateRiskPredictionRequestDto {

    /** ID пациента (User.id). В DTO не ставим @Id — это только для Entity. */
    @NotNull
    private Long patientId;

    // входные признаки
    @NotNull private BigDecimal temperature;
    @NotNull private BigDecimal humidity;
    @NotNull private BigDecimal pulse;
    private BigDecimal dehydrationLevel;
    private BigDecimal heatIndex;
    private BigDecimal bmi;

    // выход модели
    @NotNull
    @DecimalMin("0.0") @DecimalMax("1.0")
    private BigDecimal predictedProbability;

    @NotNull
    private RiskLevel predictedRiskLevel;

    // метаданные (опционально)
    private String modelVersion;
    private String notes;
}