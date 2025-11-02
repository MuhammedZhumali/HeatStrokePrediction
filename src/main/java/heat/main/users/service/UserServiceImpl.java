package heat.main.users.service;

import heat.main.domain.User;
import heat.main.enums.RoleType;
import heat.main.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserSerivce {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // ← нужен бин BCrypt (см. ниже п.4)

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers(){ return userRepository.findAll(); }


    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsersByRole(RoleType roleType) {
        return userRepository.findByRoleType(roleType);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> findUserByPhoneAndRole(String phone, RoleType roleType) {
        return userRepository.findByPhoneNumberAndRoleType(phone, roleType);
    }

    // ↓↓↓ единый поиск по email ИЛИ username, без учёта регистра/пробелов
    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByNameOrEmail(String input) {      // ← имя как в интерфейсе
        if (input == null) return Optional.empty();
        String key = input.trim();
        return userRepository.findByEmailIgnoreCaseOrNameIgnoreCase(key, key);
    }


    @Override
    public User addUser(User user) {
        // нормализация
        if (user.getEmail() != null) user.setEmail(user.getEmail().trim().toLowerCase());
        if (user.getName() != null)  user.setName(user.getName().trim());

        // защита от дублей (опционально, но полезно)
        if (user.getEmail() != null && userRepository.existsByEmailIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (user.getName() != null && userRepository.existsByNameIgnoreCase(user.getName())) {
            throw new IllegalArgumentException("Username already in use");
        }

        // шифрование пароля (если пришёл в открытом виде)
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        // роль по умолчанию
        if (user.getRoleType() == null) {
            user.setRoleType(RoleType.PATIENT);
        }

        // bmi (если есть рост/вес)
        if (user.getHeight() != null && user.getWeight() != null) {
            BigDecimal hM = user.getHeight().divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);
            BigDecimal bmi = user.getWeight().divide(hM.multiply(hM), 2, RoundingMode.HALF_UP);
            user.setBmi(bmi);
        }

        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User user) {
        User updatedUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));

        if (user.getName() != null) {
            updatedUser.setName(user.getName().trim());
        }
        if (user.getPhoneNumber() != null) {
            updatedUser.setPhoneNumber(user.getPhoneNumber());
        }
        if (user.getRoleType() != null) {
            updatedUser.setRoleType(user.getRoleType());
        }
        if (user.getEmail() != null) {
            updatedUser.setEmail(user.getEmail().trim().toLowerCase());
        }
        if (user.getWeight() != null) {
            updatedUser.setWeight(user.getWeight());
        }
        if (user.getHeight() != null) {
            updatedUser.setHeight(user.getHeight());
        }
        if (user.getBmi() != null) {
            updatedUser.setBmi(user.getBmi());
        }

        return userRepository.save(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findUserByEmail(String email) {
        if (email == null) return Optional.empty();
        return userRepository.findByEmailIgnoreCase(email.trim().toLowerCase());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findUserByName(String name) {
        if (name == null) return Optional.empty();
        return userRepository.findByNameIgnoreCase(name.trim());
    }

    @Override
    public User updateOwnProfile(Long id, User user) {
        User updatedUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));

        if (user.getName() != null) {
            updatedUser.setName(user.getName().trim());
        }
        if (user.getPhoneNumber() != null) {
            updatedUser.setPhoneNumber(user.getPhoneNumber());
        }
        if (user.getEmail() != null) {
            updatedUser.setEmail(user.getEmail().trim().toLowerCase());
        }
        if (user.getGender() != '\u0000') {
            updatedUser.setGender(user.getGender());
        }
        if (user.getWeight() != null) {
            updatedUser.setWeight(user.getWeight());
        }
        if (user.getHeight() != null) {
            updatedUser.setHeight(user.getHeight());
        }

        if (updatedUser.getHeight() != null && updatedUser.getWeight() != null) {
            BigDecimal hM = updatedUser.getHeight().divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);
            BigDecimal bmi = updatedUser.getWeight().divide(hM.multiply(hM), 2, RoundingMode.HALF_UP);
            updatedUser.setBmi(bmi);
        }

        return userRepository.save(updatedUser);
    }
}
