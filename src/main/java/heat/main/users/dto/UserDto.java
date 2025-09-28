package heat.main.users.dto;

import lombok.*;

import javax.validation.constraints.Positive;
import javax.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    @NotNull
    @Positive
    private Integer id;

    private String name;

    private String phone;

    private char gender;

    private String email;

    private double height;

    private double weight;

    private double bmi;
}
