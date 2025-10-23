package heat.main.users.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthUserDto {
    private String username;
    private String password;
    private String email;
    private char gender;
    private BigDecimal height;
    private BigDecimal weight;
    private String role;
}
