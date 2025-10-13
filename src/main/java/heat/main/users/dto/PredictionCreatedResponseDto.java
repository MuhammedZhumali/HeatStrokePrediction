package heat.main.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class PredictionCreatedResponseDto {
    private Long id;           // id созданного предсказания
    private Long patientId;    // пользователь
    private String patientName;
}