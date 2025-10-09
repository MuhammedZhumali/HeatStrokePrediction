package heat.main.users.dto;


import heat.main.enums.RiskLevel;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreateRiskPredictionRequest(
        @NotNull Long patientId,             // ID пациента (User.id)

        // --- примеры входных признаков (оставь только свои реально используемые) ---
        @NotNull BigDecimal temperature,
        @NotNull BigDecimal humidity,
        @NotNull BigDecimal pulse,
        BigDecimal dehydrationLevel,
        BigDecimal heatIndex,
        BigDecimal bmi,

        // --- выход модели ---
        @NotNull @DecimalMin("0.0") @DecimalMax("1.0")
        BigDecimal predictedProbability,

        @NotNull RiskLevel predictedRiskLevel,

        // --- метаданные ---
        String modelVersion,
        String notes
) { }
