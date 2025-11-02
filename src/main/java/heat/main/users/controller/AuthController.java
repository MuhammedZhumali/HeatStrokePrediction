package heat.main.users.controller;

import heat.main.domain.User;
import heat.main.enums.RoleType;
import heat.main.users.dto.AuthUserDto;
import heat.main.users.service.UserSerivce; // да, именно Serivce (как у тебя в проекте)
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserSerivce userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthUserDto> login(@RequestBody AuthUserDto dto) {
        try {
            var userOpt = userService.findByNameOrEmail(dto.getUsername());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            var user = userOpt.get();
            if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            var resp = new AuthUserDto();
            resp.setUsername(user.getName());
            resp.setEmail(user.getEmail());
            resp.setRole(user.getRoleType().name());
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            log.error("Error during login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/sign_up")
    public ResponseEntity<?> signUp(@RequestBody AuthUserDto dto) {
        try {
            // простые проверки
            if (isBlank(dto.getUsername()) || isBlank(dto.getPassword()) || isBlank(dto.getEmail())) {
                return ResponseEntity.badRequest().body("username, password, email are required");
            }
            // gender/height/weight — опционально, если у тебя это обязательно, раскомментируй
            // if (dto.getGender() == '\u0000') return ResponseEntity.badRequest().body("gender is required");
            // if (dto.getHeight() == null || dto.getHeight().signum() <= 0) return ResponseEntity.badRequest().body("height must be > 0");
            // if (dto.getWeight() == null || dto.getWeight().signum() <= 0) return ResponseEntity.badRequest().body("weight must be > 0");

            // создаём пользователя — пароль передаём СЫРОЙ, сервис сам его захеширует
            var newUser = User.builder()
                    .name(dto.getUsername().trim())
                    .password(dto.getPassword()) // raw; в сервисе зашифруется BCrypt'ом
                    .email(dto.getEmail().trim())
                    .gender(dto.getGender())
                    .height(dto.getHeight())
                    .weight(dto.getWeight())
                    .roleType(RoleType.PATIENT) // роль по умолчанию
                    .build();

            var saved = userService.addUser(newUser);

            var resp = new AuthUserDto();
            resp.setUsername(saved.getName());
            resp.setEmail(saved.getEmail());
            resp.setRole(saved.getRoleType().name());
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);

        } catch (IllegalArgumentException dup) {
            // из сервиса могут прилетать ошибки "email/username already in use"
            return ResponseEntity.status(HttpStatus.CONFLICT).body(dup.getMessage());
        } catch (Exception e) {
            log.error("Error during sign up", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
