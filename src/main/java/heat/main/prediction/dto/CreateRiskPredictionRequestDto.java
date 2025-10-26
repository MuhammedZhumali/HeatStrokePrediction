package heat.main.prediction.dto;

import lombok.*;

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

    // дополнительные поля для модели (опциональные)
    private BigDecimal age;
    private BigDecimal patientTemperature;
    private BigDecimal sweating;
    private BigDecimal hotDrySkin;

    private String notes;
}