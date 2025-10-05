package heat.main.users.controller;

import heat.main.domain.User;
import heat.main.enums.RoleType;
import heat.main.users.service.UserSerivce;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
        return userSerivce.findUserByPhoneAndRole(phone, roleType);
    }
}
