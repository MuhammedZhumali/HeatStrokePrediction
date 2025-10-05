package heat.main.users.service;

import heat.main.domain.User;
import heat.main.enums.RoleType;
import heat.main.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserSerivce {
    
    private final UserRepository userRepository;

    @Override
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    @Override
    public List<User> getAllUsersByRole(RoleType roleType) {
        return userRepository.findByRoleType(roleType);
    }

    @Override
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<User> findUserByPhoneAndRole(String phone, RoleType roleType) {
        return userRepository.findByPhoneNumberAndRoleType(phone, roleType);
    }

}
