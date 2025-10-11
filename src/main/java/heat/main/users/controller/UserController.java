package heat.main.users.controller;

import heat.main.domain.User;
import heat.main.enums.RoleType;
import heat.main.users.service.UserSerivce;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    
    private final UserSerivce userSerivce;
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> findAll() {
        return userSerivce.getAllUsers();
    }

    @GetMapping("/role/{roleType}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> findByRole(@PathVariable RoleType roleType) {
        return userSerivce.getAllUsersByRole(roleType);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Optional<User> findById(@PathVariable Long id) {
        return userSerivce.findUserById(id);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> findByPhoneAndRole(@RequestParam String phone, @RequestParam RoleType roleType) {
        String decodedPhone = URLDecoder.decode(phone, StandardCharsets.UTF_8);

        System.out.println("Received phone: " + decodedPhone);
        System.out.println("Received roleType: " + roleType);
        return userSerivce.findUserByPhoneAndRole(decodedPhone, roleType);
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public User addUser(@RequestBody User user) {
        return userSerivce.addUser(user);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userSerivce.updateUser(id, user);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Long id) {
        userSerivce.deleteUser(id);
    }
}
