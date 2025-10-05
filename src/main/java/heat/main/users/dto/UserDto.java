package heat.main.users.dto;

import heat.main.enums.RoleType;
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
    private Long id;

    private String name;

    private String phoneNumber;

    private char gender;

    private String email;

    private double height;

    private double weight;

    private double bmi;

    private RoleType roleType;

}
