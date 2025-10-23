package heat.main.users.controller;

import heat.main.domain.User;
import heat.main.enums.RoleType;
import heat.main.users.dto.AuthUserDto;
import heat.main.users.service.UserSerivce;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.math.BigDecimal;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserSerivce userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthUserDto> login(@RequestBody AuthUserDto authUserDto) {
        try {
            Optional<User> userOptional = userService.getAllUsers().stream()
                    .filter(user -> user.getName().equals(authUserDto.getUsername()) || 
                                   user.getEmail().equals(authUserDto.getUsername()))
                    .findFirst();

            if (!userOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            User user = userOptional.get();

            // Check if password is properly BCrypt encoded
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                log.warn("User {} has null or empty password", user.getName());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Check if password is BCrypt encoded (starts with $2a$)
            if (!user.getPassword().startsWith("$2a$")) {
                log.warn("User {} has password that is not BCrypt encoded", user.getName());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            if (passwordEncoder.matches(authUserDto.getPassword(), user.getPassword())) {
                AuthUserDto responseDto = new AuthUserDto();
                responseDto.setUsername(user.getName());
                responseDto.setRole(user.getRoleType().name());
                return ResponseEntity.ok(responseDto);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } catch (Exception e) {
            log.error("Error during login", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/sign_up")
    public ResponseEntity<AuthUserDto> signUp(@RequestBody AuthUserDto authUserDto) {
        try {
            if (authUserDto.getUsername() == null || authUserDto.getUsername().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            if (authUserDto.getPassword() == null || authUserDto.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            if (authUserDto.getEmail() == null || authUserDto.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            if (authUserDto.getGender() == ' ') {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            if (authUserDto.getHeight() == null || authUserDto.getHeight().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            if (authUserDto.getWeight() == null || authUserDto.getWeight().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            if (authUserDto.getUsername().contains("\u0000")) {
                log.warn("Username contains null byte, sanitizing: {}", authUserDto.getUsername());
            }
            if (authUserDto.getEmail().contains("\u0000")) {
                log.warn("Email contains null byte, sanitizing: {}", authUserDto.getEmail());
            }

            boolean userExists = userService.getAllUsers().stream()
                    .anyMatch(user -> user.getName().equals(authUserDto.getUsername()));

            if (userExists) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            String hashedPassword = passwordEncoder.encode(authUserDto.getPassword());

            String sanitizedUsername = authUserDto.getUsername().replaceAll("\u0000", "");
            String sanitizedEmail = authUserDto.getEmail().replaceAll("\u0000", "");
            
            // Calculate BMI: weight(kg) / height(m)²
            // Height is in cm, so we convert to meters by dividing by 100
            BigDecimal heightInMeters = authUserDto.getHeight().divide(new java.math.BigDecimal("100"));
            BigDecimal bmi = authUserDto.getWeight().divide(heightInMeters.multiply(heightInMeters), 2, java.math.RoundingMode.HALF_UP);
            
            log.info("Creating user with data: username={}, email={}, gender={}, height={}, weight={}, bmi={}", 
                    sanitizedUsername, sanitizedEmail, authUserDto.getGender(), 
                    authUserDto.getHeight(), authUserDto.getWeight(), bmi);

            User newUser = User.builder()
                    .name(sanitizedUsername)
                    .password(hashedPassword)
                    .roleType(RoleType.PATIENT) // Default role
                    .email(sanitizedEmail)
                    .gender(authUserDto.getGender())
                    .height(authUserDto.getHeight())
                    .weight(authUserDto.getWeight())
                    .bmi(bmi)
                    .build();

            User savedUser = userService.addUser(newUser);

            AuthUserDto responseDto = new AuthUserDto();
            responseDto.setUsername(savedUser.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);

        } catch (Exception e) {
            log.error("Error during sign up", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
