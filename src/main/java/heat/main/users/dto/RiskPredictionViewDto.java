package heat.main.users.dto;

import heat.main.enums.RiskLevel;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RiskPredictionViewDto {

    // идентификаторы
    private Long id;
    private Long userId;

    // входные данные (что прислал/что посчитали)
    private BigDecimal temperature;
    private BigDecimal humidity;
    private BigDecimal pulse;
    private BigDecimal dehydrationLevel;
    private BigDecimal heatIndex;
    private BigDecimal bmi;

    // результат модели
    private BigDecimal predictedProbability;
    private RiskLevel predictedRiskLevel;
    private String modelVersion;

    // мета
    private LocalDateTime assessmentTimestamp;
    private String notes;

    // геттеры/сеттеры (можно сгенерировать Lombok'ом, если уже используете)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public BigDecimal getTemperature() { return temperature; }
    public void setTemperature(BigDecimal temperature) { this.temperature = temperature; }
    public BigDecimal getHumidity() { return humidity; }
    public void setHumidity(BigDecimal humidity) { this.humidity = humidity; }
    public BigDecimal getPulse() { return pulse; }
    public void setPulse(BigDecimal pulse) { this.pulse = pulse; }
    public BigDecimal getDehydrationLevel() { return dehydrationLevel; }
    public void setDehydrationLevel(BigDecimal dehydrationLevel) { this.dehydrationLevel = dehydrationLevel; }
    public BigDecimal getHeatIndex() { return heatIndex; }
    public void setHeatIndex(BigDecimal heatIndex) { this.heatIndex = heatIndex; }
    public BigDecimal getBmi() { return bmi; }
    public void setBmi(BigDecimal bmi) { this.bmi = bmi; }

    public BigDecimal getPredictedProbability() { return predictedProbability; }
    public void setPredictedProbability(BigDecimal predictedProbability) { this.predictedProbability = predictedProbability; }
    public RiskLevel getPredictedRiskLevel() { return predictedRiskLevel; }
    public void setPredictedRiskLevel(RiskLevel predictedRiskLevel) { this.predictedRiskLevel = predictedRiskLevel; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public LocalDateTime getAssessmentTimestamp() { return assessmentTimestamp; }
    public void setAssessmentTimestamp(LocalDateTime assessmentTimestamp) { this.assessmentTimestamp = assessmentTimestamp; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
