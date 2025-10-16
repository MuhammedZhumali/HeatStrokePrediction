package heat.main.prediction.controller;

import heat.main.prediction.dto.CreateRiskPredictionRequestDto;
import heat.main.prediction.dto.PredictionCreatedResponseDto;
import heat.main.prediction.repository.RiskPredictionRepository;
import heat.main.prediction.service.RiskPredictionService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class RiskPredictionController {

    private final RiskPredictionService service;
    private final RiskPredictionRepository repository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PredictionCreatedResponseDto> create(@RequestBody @Valid CreateRiskPredictionRequestDto req) {
        PredictionCreatedResponseDto response = service.create(req);
        return ResponseEntity.ok(response);
    }
}

/* json example
{
  "patientId": 1,
  "temperature": 38.2,
  "humidity": 0.65,
  "pulse": 92,
  "dehydrationLevel": 0.3,
  "heatIndex": 41.5,
  "bmi": 26.8,
  "predictedProbability": 0.82,
  "predictedRiskLevel": "HIGH",
  "modelVersion": "v1.0.0",
  "notes": "wearable batch #2025-10-09"
}
 */