package heat.main.domain;

import heat.main.enums.RoleType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "core_user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "user_name")
    private String name;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "email")
    private String email;

    @Column(name = "gender")
    private char gender;

    @Column(name = "height")
    private BigDecimal height;

    @Column(name = "weight")
    private BigDecimal weight;

    @Column(name = "bmi")
    private BigDecimal bmi;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private RoleType roleType;


}

