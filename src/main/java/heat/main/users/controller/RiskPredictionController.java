package heat.main.users.controller;

import heat.main.users.dto.CreateRiskPredictionRequestDto;
import heat.main.users.dto.PredictionCreatedResponseDto;
import heat.main.users.service.RiskPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.*;
import java.net.URI;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class RiskPredictionController {

    private final RiskPredictionService service;

    @PostMapping("/add")
    public ResponseEntity<PredictionCreatedResponseDto> create(@RequestBody @Valid CreateRiskPredictionRequestDto req) {
        PredictionCreatedResponseDto resp = service.create(req);
        return ResponseEntity.created(URI.create("/api/predictions/" + resp.getId())).body(resp);
    }
}