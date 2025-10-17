package heat.main.users.controller;

import heat.main.users.dto.CreateRiskPredictionRequestDto;
import heat.main.users.dto.RiskPredictionViewDto;
import heat.main.users.service.RiskPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class RiskPredictionController {

    private final RiskPredictionService service;

    /** POST /api/predictions — создать новое предсказание */
    @PostMapping
    public ResponseEntity<Long> create(@Valid @RequestBody CreateRiskPredictionRequestDto req) {
        Long id = service.create(req);
        return ResponseEntity.ok(id);
    }

    /** GET /api/predictions/user/{userId} — список предсказаний пользователя (пагинация) */
    @GetMapping("/user/{userId}")
    public Page<RiskPredictionViewDto> listByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.getUserPredictions(userId, page, size);
    }

    /** GET /api/predictions/{predictionId}/user/{userId} — одно предсказание пользователя */
    @GetMapping("/{predictionId}/user/{userId}")
    public RiskPredictionViewDto getOne(
            @PathVariable Long userId,
            @PathVariable Long predictionId
    ) {
        return service.getUserPredictionById(userId, predictionId);
    }
}
