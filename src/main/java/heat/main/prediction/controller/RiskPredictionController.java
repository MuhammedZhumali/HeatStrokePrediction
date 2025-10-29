package heat.main.prediction.controller;

import heat.main.prediction.dto.CreateRiskPredictionRequestDto;
import heat.main.prediction.dto.PredictionCreatedResponseDto;
import heat.main.prediction.dto.RiskPredictionViewDto;
import heat.main.prediction.service.RiskPredictionService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class RiskPredictionController {

    private final RiskPredictionService service;


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PredictionCreatedResponseDto> create(@RequestBody @Valid CreateRiskPredictionRequestDto req) {
        PredictionCreatedResponseDto response = service.create(req);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public Page<RiskPredictionViewDto> listByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.getUserPredictions(userId, page, size);
    }

    @GetMapping("/{predictionId}/user/{userId}")
    public RiskPredictionViewDto getOne(
            @PathVariable Long userId,
            @PathVariable Long predictionId
    ) {
        return service.getUserPredictionById(userId, predictionId);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<RiskPredictionViewDto> getAllPredictions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.getAllPredictions(page, size);
    }
}