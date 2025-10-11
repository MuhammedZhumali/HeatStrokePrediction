package heat.main.users.controller;

import heat.main.users.service.RiskPredictionService;
import heat.main.users.dto.CreateRiskPredictionRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class RiskPredictionController {

    private final RiskPredictionService service;

    @PostMapping
    public ResponseEntity<Long> create(@RequestBody @Valid CreateRiskPredictionRequest req) {
        Long id = service.create(req);
        return ResponseEntity.ok(id);
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